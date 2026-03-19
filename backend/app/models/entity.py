"""
Tax Entity Model
Represents a business entity for tax purposes
"""

from datetime import date, datetime
from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Date, Enum as SQLEnum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.transaction import Transaction
    from app.models.form import GeneratedForm


class EntityType(str, Enum):
    """Business entity types"""
    SOLE_PROPRIETORSHIP = "sole_proprietorship"
    SINGLE_MEMBER_LLC = "single_member_llc"
    PARTNERSHIP = "partnership"
    S_CORP = "s_corp"
    C_CORP = "c_corp"
    LLC_PARTNERSHIP = "llc_partnership"
    LLC_S_CORP = "llc_s_corp"
    LLC_C_CORP = "llc_c_corp"


class FilingStatus(str, Enum):
    """Tax filing status for individuals"""
    SINGLE = "single"
    MARRIED_FILING_JOINTLY = "married_filing_jointly"
    MARRIED_FILING_SEPARATELY = "married_filing_separately"
    HEAD_OF_HOUSEHOLD = "head_of_household"
    QUALIFYING_WIDOWER = "qualifying_widower"


class AccountingMethod(str, Enum):
    """Accounting method"""
    CASH = "cash"
    ACCRUAL = "accrual"
    OTHER = "other"


class Entity(Base):
    """Tax entity representing a business"""
    
    __tablename__ = "entities"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Basic info
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    entity_type: Mapped[EntityType] = mapped_column(
        SQLEnum(EntityType), 
        nullable=False, 
        default=EntityType.SOLE_PROPRIETORSHIP
    )
    ein: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    tax_year: Mapped[int] = mapped_column(Integer, nullable=False, default=2024)
    
    # Business details
    business_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    business_code: Mapped[Optional[str]] = mapped_column(String(6), nullable=True)  # NAICS code
    
    # Address
    address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    zip_code: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    country: Mapped[str] = mapped_column(String(100), nullable=False, default="United States")
    
    # Tax settings
    filing_status: Mapped[Optional[FilingStatus]] = mapped_column(
        SQLEnum(FilingStatus), 
        nullable=True
    )
    accounting_method: Mapped[AccountingMethod] = mapped_column(
        SQLEnum(AccountingMethod),
        nullable=False,
        default=AccountingMethod.CASH
    )
    
    # Inventory
    has_inventory: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    inventory_beginning: Mapped[Optional[float]] = mapped_column(Integer, nullable=True)
    inventory_ending: Mapped[Optional[float]] = mapped_column(Integer, nullable=True)
    
    # Settings
    ai_classification_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    auto_sync_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction", 
        back_populates="entity",
        cascade="all, delete-orphan"
    )
    generated_forms: Mapped[list["GeneratedForm"]] = relationship(
        "GeneratedForm",
        back_populates="entity",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Entity(id={self.id}, name='{self.name}', type={self.entity_type})>"
    
    @property
    def default_tax_form(self) -> str:
        """Get default tax form based on entity type"""
        form_map = {
            EntityType.SOLE_PROPRIETORSHIP: "Schedule C",
            EntityType.SINGLE_MEMBER_LLC: "Schedule C",
            EntityType.PARTNERSHIP: "Form 1065",
            EntityType.S_CORP: "Form 1120-S",
            EntityType.C_CORP: "Form 1120",
            EntityType.LLC_PARTNERSHIP: "Form 1065",
            EntityType.LLC_S_CORP: "Form 1120-S",
            EntityType.LLC_C_CORP: "Form 1120",
        }
        return form_map.get(self.entity_type, "Schedule C")
