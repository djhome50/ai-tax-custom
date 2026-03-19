"""
Entity Schemas
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.entity import EntityType, FilingStatus, AccountingMethod


class EntityBase(BaseModel):
    """Base entity schema"""
    name: str = Field(..., min_length=1, max_length=255)
    entity_type: EntityType
    ein: Optional[str] = Field(None, max_length=20)
    filing_status: FilingStatus = FilingStatus.SINGLE
    accounting_method: AccountingMethod = AccountingMethod.CASH
    tax_year: int = Field(default=2024, ge=2020, le=2030)
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None


class EntityCreate(EntityBase):
    """Schema for creating an entity"""
    pass


class EntityUpdate(BaseModel):
    """Schema for updating an entity"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    entity_type: Optional[EntityType] = None
    ein: Optional[str] = Field(None, max_length=20)
    filing_status: Optional[FilingStatus] = None
    accounting_method: Optional[AccountingMethod] = None
    tax_year: Optional[int] = Field(None, ge=2020, le=2030)
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None


class EntityResponse(EntityBase):
    """Schema for entity response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class EntityListResponse(BaseModel):
    """Schema for list of entities"""
    items: List[EntityResponse]
    total: int
