"""
Data Ingestion Service
Orchestrates data import from various sources
"""

import json
from datetime import date
from pathlib import Path
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Entity,
    Transaction,
    TransactionImport,
    TransactionSource,
    TransactionDirection,
    ClassificationStatus,
    ImportStatus,
)
from app.services.ingestion.ai_extractor import AIExtractor


class IngestionService:
    """Service for importing transactions from various sources"""
    
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.extractor = AIExtractor()
    
    async def import_from_file(
        self,
        entity_id: int,
        file_path: str,
        source: TransactionSource = TransactionSource.CSV,
        options: Optional[dict] = None,
    ) -> TransactionImport:
        """Import transactions from a file"""
        # Create import record
        import_record = TransactionImport(
            entity_id=entity_id,
            source=source,
            status=ImportStatus.PROCESSING,
            import_options=options,
            source_file=file_path,
        )
        self.db.add(import_record)
        await self.db.flush()
        
        try:
            # Extract using AI
            result = await self.extractor.extract_from_file(file_path)
            
            if not result.get("success"):
                import_record.status = ImportStatus.FAILED
                import_record.error_message = result.get("error", "Unknown error")
                return import_record
            
            # Create transaction records
            transaction_ids = []
            for txn_data in result.get("transactions", []):
                transaction = await self._create_transaction(
                    entity_id=entity_id,
                    txn_data=txn_data,
                    source=source,
                    import_id=import_record.id,
                )
                if transaction:
                    transaction_ids.append(transaction.id)
            
            # Update import record
            import_record.status = ImportStatus.COMPLETED
            import_record.transactions_imported = len(transaction_ids)
            import_record.import_summary = {
                "extracted": result.get("summary", {}),
                "confidence": result.get("confidence", 0),
                "notes": result.get("notes", ""),
            }
            
            return import_record
            
        except Exception as e:
            import_record.status = ImportStatus.FAILED
            import_record.error_message = str(e)
            return import_record
    
    async def import_from_data(
        self,
        entity_id: int,
        data: str | dict | list,
        source: TransactionSource = TransactionSource.API,
        options: Optional[dict] = None,
    ) -> TransactionImport:
        """Import transactions from raw data"""
        import_record = TransactionImport(
            entity_id=entity_id,
            source=source,
            status=ImportStatus.PROCESSING,
            import_options=options,
        )
        self.db.add(import_record)
        await self.db.flush()
        
        try:
            # Extract using AI
            result = await self.extractor.extract(data, source_type="auto")
            
            if not result.get("success"):
                import_record.status = ImportStatus.FAILED
                import_record.error_message = result.get("error", "Unknown error")
                return import_record
            
            # Create transaction records
            transaction_ids = []
            for txn_data in result.get("transactions", []):
                transaction = await self._create_transaction(
                    entity_id=entity_id,
                    txn_data=txn_data,
                    source=source,
                    import_id=import_record.id,
                )
                if transaction:
                    transaction_ids.append(transaction.id)
            
            import_record.status = ImportStatus.COMPLETED
            import_record.transactions_imported = len(transaction_ids)
            import_record.import_summary = {
                "extracted": result.get("summary", {}),
                "confidence": result.get("confidence", 0),
            }
            
            return import_record
            
        except Exception as e:
            import_record.status = ImportStatus.FAILED
            import_record.error_message = str(e)
            return import_record
    
    async def _create_transaction(
        self,
        entity_id: int,
        txn_data: dict,
        source: TransactionSource,
        import_id: int,
    ) -> Optional[Transaction]:
        """Create a transaction record from extracted data"""
        # Check for duplicates
        stmt = select(Transaction).where(
            Transaction.entity_id == entity_id,
            Transaction.transaction_date == txn_data.get("date"),
            Transaction.amount == abs(txn_data.get("amount", 0)),
            Transaction.raw_description == txn_data.get("description", ""),
        )
        result = await self.db.execute(stmt)
        if result.scalar_one_or_none():
            return None
        
        # Create transaction
        transaction = Transaction(
            entity_id=entity_id,
            transaction_date=txn_data.get("date"),
            amount=abs(txn_data.get("amount", 0)),
            direction=TransactionDirection(txn_data.get("direction", "expense")),
            raw_description=txn_data.get("description", ""),
            normalized_description=txn_data.get("description", "").lower().strip(),
            category=txn_data.get("category"),
            tax_category=txn_data.get("tax_category"),
            source=source,
            source_file=txn_data.get("source_file"),
            reference=txn_data.get("reference"),
            account=txn_data.get("account"),
            raw_data=txn_data,
            import_id=import_id,
            classification_status=ClassificationStatus.PENDING if not txn_data.get("category") else ClassificationStatus.PRE_CLASSIFIED,
        )
        
        self.db.add(transaction)
        return transaction
