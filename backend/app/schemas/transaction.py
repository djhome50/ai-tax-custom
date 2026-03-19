"""
Transaction Schemas
"""

from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.transaction import ClassificationStatus, TransactionDirection


class TransactionBase(BaseModel):
    """Base transaction schema"""
    date: date
    amount: Decimal = Field(..., decimal_places=2)
    description: str
    direction: TransactionDirection
    category: Optional[str] = None
    subcategory: Optional[str] = None
    memo: Optional[str] = None
    reference: Optional[str] = None


class TransactionCreate(TransactionBase):
    """Schema for creating a transaction"""
    entity_id: int


class TransactionUpdate(BaseModel):
    """Schema for updating a transaction"""
    date: Optional[date] = None
    amount: Optional[Decimal] = Field(None, decimal_places=2)
    description: Optional[str] = None
    direction: Optional[TransactionDirection] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    memo: Optional[str] = None
    reference: Optional[str] = None


class TransactionResponse(TransactionBase):
    """Schema for transaction response"""
    id: int
    entity_id: int
    classification_status: ClassificationStatus
    classification_confidence: Optional[Decimal] = None
    tax_category: Optional[str] = None
    source: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TransactionListResponse(BaseModel):
    """Schema for list of transactions"""
    items: List[TransactionResponse]
    total: int


class TransactionImportResponse(BaseModel):
    """Schema for transaction import response"""
    import_id: int
    total_transactions: int
    classified_count: int
    pending_count: int
    status: str


class ClassificationRequest(BaseModel):
    """Schema for classification request"""
    pass  # No body needed, uses transaction from path


class ClassificationResponse(BaseModel):
    """Schema for classification response"""
    transaction_id: int
    category: str
    subcategory: Optional[str]
    tax_category: str
    confidence: Decimal
    status: ClassificationStatus
