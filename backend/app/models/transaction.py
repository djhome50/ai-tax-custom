"""
Transaction Models
Classified transactions and import records
"""

from datetime import date, datetime
from enum import Enum
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import Boolean, Date, Enum as SQLEnum, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.entity import Entity


class TransactionDirection(str, Enum):
    """Transaction direction"""
    INCOME = "income"
    EXPENSE = "expense"


class ClassificationStatus(str, Enum):
    """Classification status"""
    PENDING = "pending"
    CLASSIFIED = "classified"
    REVIEW_REQUIRED = "review_required"
    CONFIRMED = "confirmed"
    PRE_CLASSIFIED = "pre_classified"


class TransactionSource(str, Enum):
    """Transaction source"""
    CSV = "csv"
    XLSX = "xlsx"
    PDF = "pdf"
    PLAID = "plaid"
    QUICKBOOKS = "quickbooks"
    XERO = "xero"
    STRIPE = "stripe"
    MANUAL = "manual"
    API = "api"


class Transaction(Base):
    """Classified transaction record"""
    
    __tablename__ = "transactions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign key
    entity_id: Mapped[int] = mapped_column(Integer, ForeignKey("entities.id"), nullable=False, index=True)
    
    # Transaction details
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    direction: Mapped[TransactionDirection] = mapped_column(
        SQLEnum(TransactionDirection),
        nullable=False
    )
    
    # Description
    raw_description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    normalized_description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Source info
    source: Mapped[TransactionSource] = mapped_column(
        SQLEnum(TransactionSource),
        nullable=False,
        default=TransactionSource.MANUAL
    )
    source_transaction_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    source_file: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    reference: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    account: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Classification
    classification_status: Mapped[ClassificationStatus] = mapped_column(
        SQLEnum(ClassificationStatus),
        nullable=False,
        default=ClassificationStatus.PENDING
    )
    category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    tax_category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    classification_reasoning: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    user_corrected: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    
    # Plaid-specific
    plaid_category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Raw data
    raw_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Import reference
    import_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("transaction_imports.id"), nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    entity: Mapped["Entity"] = relationship("Entity", back_populates="transactions")
    import_record: Mapped[Optional["TransactionImport"]] = relationship(
        "TransactionImport", 
        back_populates="transactions"
    )
    
    def __repr__(self) -> str:
        return f"<Transaction(id={self.id}, date={self.transaction_date}, amount={self.amount})>"


class ImportStatus(str, Enum):
    """Import status"""
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    PARTIAL = "partial"


class TransactionImport(Base):
    """Transaction import record"""
    
    __tablename__ = "transaction_imports"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign key
    entity_id: Mapped[int] = mapped_column(Integer, ForeignKey("entities.id"), nullable=False, index=True)
    
    # Import details
    source: Mapped[TransactionSource] = mapped_column(
        SQLEnum(TransactionSource),
        nullable=False
    )
    status: Mapped[ImportStatus] = mapped_column(
        SQLEnum(ImportStatus),
        nullable=False,
        default=ImportStatus.PROCESSING
    )
    
    # Counts
    transactions_imported: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # Options and summary
    import_options: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    import_summary: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # File
    source_file: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Error
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction",
        back_populates="import_record"
    )
    
    def __repr__(self) -> str:
        return f"<TransactionImport(id={self.id}, source={self.source}, status={self.status})>"


class ClassificationFeedback(Base):
    """User feedback on classification for training"""
    
    __tablename__ = "classification_feedback"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Transaction reference
    transaction_id: Mapped[int] = mapped_column(Integer, ForeignKey("transactions.id"), nullable=False)
    
    # Original classification
    original_category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    original_tax_category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Corrected classification
    corrected_category: Mapped[str] = mapped_column(String(50), nullable=False)
    corrected_tax_category: Mapped[str] = mapped_column(String(50), nullable=False)
    
    # Context for training
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    
    def __repr__(self) -> str:
        return f"<ClassificationFeedback(id={self.id}, transaction_id={self.transaction_id})>"
