"""
Classification Service
Orchestrates transaction classification
"""

from typing import Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Transaction,
    ClassificationStatus,
    ClassificationFeedback,
)
from app.services.classification.classifier import TransactionClassifier


class ClassificationService:
    """Service for classifying transactions"""
    
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.classifier = TransactionClassifier()
    
    async def classify_transaction(self, transaction_id: int) -> dict:
        """Classify a single transaction"""
        stmt = select(Transaction).where(Transaction.id == transaction_id)
        result = await self.db.execute(stmt)
        transaction = result.scalar_one_or_none()
        
        if not transaction:
            return {"success": False, "error": "Transaction not found"}
        
        # Get classification
        classification = await self.classifier.classify(
            description=transaction.raw_description or "",
            amount=transaction.amount,
            direction=transaction.direction.value,
        )
        
        # Update transaction
        transaction.category = classification.get("category")
        transaction.tax_category = classification.get("tax_category")
        transaction.confidence_score = classification.get("confidence", 0)
        transaction.classification_reasoning = classification.get("reasoning")
        
        if classification.get("confidence", 0) >= 0.7:
            transaction.classification_status = ClassificationStatus.CLASSIFIED
        else:
            transaction.classification_status = ClassificationStatus.REVIEW_REQUIRED
        
        return {
            "success": True,
            "transaction_id": transaction_id,
            "category": transaction.category,
            "tax_category": transaction.tax_category,
            "confidence": transaction.confidence_score,
            "status": transaction.classification_status.value,
        }
    
    async def classify_pending(self, limit: int = 100) -> dict:
        """Classify all pending transactions"""
        stmt = (
            select(Transaction)
            .where(Transaction.classification_status == ClassificationStatus.PENDING)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        transactions = result.scalars().all()
        
        classified = 0
        review_required = 0
        
        for txn in transactions:
            classification = await self.classifier.classify(
                description=txn.raw_description or "",
                amount=txn.amount,
                direction=txn.direction.value,
            )
            
            txn.category = classification.get("category")
            txn.tax_category = classification.get("tax_category")
            txn.confidence_score = classification.get("confidence", 0)
            txn.classification_reasoning = classification.get("reasoning")
            
            if classification.get("confidence", 0) >= 0.7:
                txn.classification_status = ClassificationStatus.CLASSIFIED
                classified += 1
            else:
                txn.classification_status = ClassificationStatus.REVIEW_REQUIRED
                review_required += 1
        
        return {
            "success": True,
            "total": len(transactions),
            "classified": classified,
            "review_required": review_required,
        }
    
    async def reclassify_with_feedback(
        self,
        transaction_id: int,
        correct_category: str,
        correct_tax_category: str,
    ) -> dict:
        """Reclassify with user feedback for learning"""
        stmt = select(Transaction).where(Transaction.id == transaction_id)
        result = await self.db.execute(stmt)
        transaction = result.scalar_one_or_none()
        
        if not transaction:
            return {"success": False, "error": "Transaction not found"}
        
        # Store feedback
        feedback = ClassificationFeedback(
            transaction_id=transaction_id,
            original_category=transaction.category,
            original_tax_category=transaction.tax_category,
            corrected_category=correct_category,
            corrected_tax_category=correct_tax_category,
            description=transaction.raw_description,
            amount=transaction.amount,
        )
        self.db.add(feedback)
        
        # Update transaction
        transaction.category = correct_category
        transaction.tax_category = correct_tax_category
        transaction.confidence_score = 1.0
        transaction.classification_status = ClassificationStatus.CONFIRMED
        transaction.user_corrected = True
        
        return {
            "success": True,
            "transaction_id": transaction_id,
            "category": correct_category,
            "tax_category": correct_tax_category,
        }
