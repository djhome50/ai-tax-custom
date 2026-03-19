"""
Tax Form Models
Generated tax forms and calculations
"""

from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Enum as SQLEnum, Float, ForeignKey, Integer, String, Text, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.entity import Entity


class FormType(str, Enum):
    """Tax form types"""
    SCHEDULE_C = "schedule_c"
    FORM_1120 = "form_1120"
    FORM_1120_S = "form_1120_s"
    FORM_1065 = "form_1065"


class FormStatus(str, Enum):
    """Form status"""
    GENERATED = "generated"
    REVIEWED = "reviewed"
    APPROVED = "approved"
    FILED = "filed"


class GeneratedForm(Base):
    """Generated tax form"""
    
    __tablename__ = "generated_forms"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign key
    entity_id: Mapped[int] = mapped_column(Integer, ForeignKey("entities.id"), nullable=False, index=True)
    
    # Form details
    form_type: Mapped[FormType] = mapped_column(SQLEnum(FormType), nullable=False)
    tax_year: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[FormStatus] = mapped_column(
        SQLEnum(FormStatus),
        nullable=False,
        default=FormStatus.GENERATED
    )
    
    # Generated data
    form_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Output files
    pdf_file: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    xml_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Review
    reviewed_by: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    review_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    review_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Timestamps
    generated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    entity: Mapped["Entity"] = relationship("Entity", back_populates="generated_forms")
    
    def __repr__(self) -> str:
        return f"<GeneratedForm(id={self.id}, type={self.form_type}, year={self.tax_year})>"


class TaxCalculation(Base):
    """Tax calculation record"""
    
    __tablename__ = "tax_calculations"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign key
    entity_id: Mapped[int] = mapped_column(Integer, ForeignKey("entities.id"), nullable=False, index=True)
    
    # Tax year
    tax_year: Mapped[int] = mapped_column(Integer, nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    
    # Income summary
    gross_income: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    total_expenses: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    net_income: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    taxable_income: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    
    # Tax calculations
    estimated_tax: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    self_employment_tax: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    effective_rate: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    marginal_rate: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    
    # Detailed data
    calculation_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Timestamps
    calculated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    
    def __repr__(self) -> str:
        return f"<TaxCalculation(id={self.id}, entity_id={self.entity_id}, year={self.tax_year})>"


class BankConnection(Base):
    """Bank connection via Plaid"""
    
    __tablename__ = "bank_connections"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign key
    entity_id: Mapped[int] = mapped_column(Integer, ForeignKey("entities.id"), nullable=False, index=True)
    
    # Connection details
    institution_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    institution_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    item_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Tokens (encrypted in production)
    access_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Status
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    last_sync: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Account info
    accounts: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self) -> str:
        return f"<BankConnection(id={self.id}, institution={self.institution_name})>"
