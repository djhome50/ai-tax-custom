"""
Tax API Routes
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models import GeneratedForm, FormType
from app.services.tax.tax_service import TaxService
from app.services.forms.form_service import FormService

router = APIRouter(prefix="/tax", tags=["Tax"])


# Schemas
class TaxCalculationResponse(BaseModel):
    id: int
    entity_id: int
    tax_year: int
    gross_income: float
    total_expenses: float
    net_income: float
    taxable_income: float
    estimated_tax: float
    self_employment_tax: float
    effective_rate: float

    class Config:
        from_attributes = True


class FormResponse(BaseModel):
    id: int
    entity_id: int
    form_type: str
    tax_year: int
    status: str
    form_data: Optional[dict]

    class Config:
        from_attributes = True


@router.post("/calculate/{entity_id}", response_model=TaxCalculationResponse)
async def calculate_tax(
    entity_id: int,
    tax_year: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> dict:
    """Calculate tax liability for an entity"""
    service = TaxService(db)
    result = await service.calculate_tax(entity_id, tax_year or 2024)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Calculation failed"),
        )
    
    # Get the stored calculation
    stmt = select(GeneratedForm).where(GeneratedForm.id == result.get("calculation_id"))
    # Actually get TaxCalculation
    from app.models import TaxCalculation
    stmt = select(TaxCalculation).where(TaxCalculation.id == result.get("calculation_id"))
    result = await db.execute(stmt)
    return result.scalar_one()


@router.post("/forms/generate/{entity_id}", response_model=FormResponse)
async def generate_form(
    entity_id: int,
    tax_year: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> dict:
    """Generate a tax form for an entity"""
    service = TaxService(db)
    result = await service.generate_form(entity_id, tax_year or 2024)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Form generation failed"),
        )
    
    # Return the form
    stmt = select(GeneratedForm).where(GeneratedForm.id == result.get("form_id"))
    result = await db.execute(stmt)
    return result.scalar_one()


@router.get("/forms/{form_id}", response_model=FormResponse)
async def get_form(
    form_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> GeneratedForm:
    """Get a generated form by ID"""
    stmt = select(GeneratedForm).where(GeneratedForm.id == form_id)
    result = await db.execute(stmt)
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found",
        )
    
    return form


@router.post("/forms/{form_id}/pdf")
async def generate_pdf(
    form_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> dict:
    """Generate PDF for a form"""
    service = FormService(db)
    result = await service.generate_pdf(form_id)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "PDF generation failed"),
        )
    
    return result


@router.post("/forms/{form_id}/xml")
async def generate_xml(
    form_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> dict:
    """Generate IRS e-file XML for a form"""
    service = FormService(db)
    result = await service.generate_xml(form_id)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "XML generation failed"),
        )
    
    return result


@router.post("/forms/{form_id}/review")
async def review_form(
    form_id: int,
    notes: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> dict:
    """Mark a form as reviewed"""
    service = FormService(db)
    result = await service.review_form(
        form_id=form_id,
        user_id=user.get("id"),
        notes=notes,
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Review failed"),
        )
    
    return result


@router.post("/forms/{form_id}/approve")
async def approve_form(
    form_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> dict:
    """Approve a form for filing"""
    service = FormService(db)
    result = await service.approve_form(form_id)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Approval failed"),
        )
    
    return result
