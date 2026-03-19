"""
Transaction API Routes
"""

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_entity, get_current_user, get_db
from app.models import (
    Entity,
    Transaction,
    TransactionImport,
    TransactionSource,
    ClassificationStatus,
)
from app.services.ingestion.ingestion_service import IngestionService
from app.services.classification.classification_service import ClassificationService

router = APIRouter(prefix="/transactions", tags=["Transactions"])


# Schemas
class TransactionResponse(BaseModel):
    id: int
    transaction_date: date
    amount: float
    direction: str
    raw_description: Optional[str]
    category: Optional[str]
    tax_category: Optional[str]
    classification_status: str
    confidence_score: Optional[float]

    class Config:
        from_attributes = True


class ImportResponse(BaseModel):
    id: int
    source: str
    status: str
    transactions_imported: int
    import_summary: Optional[dict]

    class Config:
        from_attributes = True


class ReclassifyRequest(BaseModel):
    category: str
    tax_category: str


@router.post("/import/file", response_model=ImportResponse)
async def import_from_file(
    entity_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> TransactionImport:
    """Import transactions from a file (CSV, XLSX, PDF)"""
    # Save uploaded file
    import os
    from pathlib import Path
    
    upload_dir = Path("uploads") / str(entity_id)
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = upload_dir / file.filename
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Determine source type
    ext = Path(file.filename).suffix.lower()
    source_map = {
        ".csv": TransactionSource.CSV,
        ".xlsx": TransactionSource.XLSX,
        ".xls": TransactionSource.XLSX,
        ".pdf": TransactionSource.PDF,
    }
    source = source_map.get(ext, TransactionSource.CSV)
    
    # Import
    service = IngestionService(db)
    result = await service.import_from_file(
        entity_id=entity_id,
        file_path=str(file_path),
        source=source,
    )
    
    return result


@router.post("/import/data", response_model=ImportResponse)
async def import_from_data(
    entity_id: int,
    data: dict | list,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> TransactionImport:
    """Import transactions from raw data (AI will parse any format)"""
    service = IngestionService(db)
    result = await service.import_from_data(
        entity_id=entity_id,
        data=data,
        source=TransactionSource.API,
    )
    return result


@router.get("/", response_model=list[TransactionResponse])
async def list_transactions(
    entity_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> list[Transaction]:
    """List transactions for an entity"""
    stmt = select(Transaction).where(Transaction.entity_id == entity_id)
    
    if start_date:
        stmt = stmt.where(Transaction.transaction_date >= start_date)
    if end_date:
        stmt = stmt.where(Transaction.transaction_date <= end_date)
    if category:
        stmt = stmt.where(Transaction.category == category)
    if status:
        stmt = stmt.where(Transaction.classification_status == status)
    
    stmt = stmt.order_by(Transaction.transaction_date.desc()).offset(offset).limit(limit)
    
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> Transaction:
    """Get transaction by ID"""
    stmt = select(Transaction).where(Transaction.id == transaction_id)
    result = await db.execute(stmt)
    txn = result.scalar_one_or_none()
    
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )
    
    return txn


@router.post("/{transaction_id}/classify", response_model=TransactionResponse)
async def classify_transaction(
    transaction_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> Transaction:
    """Classify a single transaction"""
    service = ClassificationService(db)
    result = await service.classify_transaction(transaction_id)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Classification failed"),
        )
    
    # Return updated transaction
    stmt = select(Transaction).where(Transaction.id == transaction_id)
    result = await db.execute(stmt)
    return result.scalar_one()


@router.post("/classify/pending")
async def classify_pending(
    entity_id: int,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> dict:
    """Classify all pending transactions for an entity"""
    service = ClassificationService(db)
    result = await service.classify_pending(limit=limit)
    return result


@router.post("/{transaction_id}/reclassify", response_model=TransactionResponse)
async def reclassify_transaction(
    transaction_id: int,
    data: ReclassifyRequest,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> Transaction:
    """Reclassify a transaction with user feedback"""
    service = ClassificationService(db)
    result = await service.reclassify_with_feedback(
        transaction_id=transaction_id,
        correct_category=data.category,
        correct_tax_category=data.tax_category,
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Reclassification failed"),
        )
    
    # Return updated transaction
    stmt = select(Transaction).where(Transaction.id == transaction_id)
    result = await db.execute(stmt)
    return result.scalar_one()


@router.get("/summary/{entity_id}")
async def get_transaction_summary(
    entity_id: int,
    tax_year: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> dict:
    """Get transaction summary for an entity"""
    stmt = select(Transaction).where(Transaction.entity_id == entity_id)
    
    if tax_year:
        stmt = stmt.where(func.extract("year", Transaction.transaction_date) == tax_year)
    
    result = await db.execute(stmt)
    transactions = list(result.scalars().all())
    
    gross_income = sum(t.amount for t in transactions if t.direction.value == "income")
    total_expenses = sum(t.amount for t in transactions if t.direction.value == "expense")
    
    # Group by category
    category_totals = {}
    for t in transactions:
        if t.direction.value == "expense":
            cat = t.category or "uncategorized"
            category_totals[cat] = category_totals.get(cat, 0) + t.amount
    
    return {
        "entity_id": entity_id,
        "tax_year": tax_year,
        "gross_income": gross_income,
        "total_expenses": total_expenses,
        "net_income": gross_income - total_expenses,
        "transaction_count": len(transactions),
        "by_category": category_totals,
    }
