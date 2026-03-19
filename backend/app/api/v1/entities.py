"""
Entity API Routes
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models import Entity, EntityType, User

router = APIRouter(prefix="/entities", tags=["Entities"])


# Schemas
class EntityCreate(BaseModel):
    name: str
    entity_type: EntityType = EntityType.SOLE_PROPRIETORSHIP
    ein: Optional[str] = None
    tax_year: int = 2024
    business_name: Optional[str] = None
    business_code: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    filing_status: Optional[str] = None
    accounting_method: str = "cash"


class EntityUpdate(BaseModel):
    name: Optional[str] = None
    ein: Optional[str] = None
    tax_year: Optional[int] = None
    business_name: Optional[str] = None
    business_code: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None


class EntityResponse(BaseModel):
    id: int
    user_id: int
    name: str
    entity_type: str
    ein: Optional[str]
    tax_year: int
    business_name: Optional[str]
    default_tax_form: str

    class Config:
        from_attributes = True


@router.post("/", response_model=EntityResponse, status_code=status.HTTP_201_CREATED)
async def create_entity(
    data: EntityCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Entity:
    """Create a new tax entity"""
    entity = Entity(
        user_id=user.id,
        name=data.name,
        entity_type=data.entity_type,
        ein=data.ein,
        tax_year=data.tax_year,
        business_name=data.business_name,
        business_code=data.business_code,
        address=data.address,
        city=data.city,
        state=data.state,
        zip_code=data.zip_code,
    )
    db.add(entity)
    await db.commit()
    await db.refresh(entity)
    return entity


@router.get("/", response_model=list[EntityResponse])
async def list_entities(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[Entity]:
    """List all entities for current user"""
    stmt = select(Entity).where(Entity.user_id == user.id).order_by(Entity.created_at.desc())
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get("/{entity_id}", response_model=EntityResponse)
async def get_entity(
    entity_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Entity:
    """Get entity by ID"""
    stmt = select(Entity).where(Entity.id == entity_id, Entity.user_id == user.id)
    result = await db.execute(stmt)
    entity = result.scalar_one_or_none()
    
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entity not found",
        )
    
    return entity


@router.patch("/{entity_id}", response_model=EntityResponse)
async def update_entity(
    entity_id: int,
    data: EntityUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Entity:
    """Update entity"""
    stmt = select(Entity).where(Entity.id == entity_id, Entity.user_id == user.id)
    result = await db.execute(stmt)
    entity = result.scalar_one_or_none()
    
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entity not found",
        )
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(entity, key, value)
    
    await db.commit()
    await db.refresh(entity)
    return entity


@router.delete("/{entity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entity(
    entity_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    """Delete entity"""
    stmt = select(Entity).where(Entity.id == entity_id, Entity.user_id == user.id)
    result = await db.execute(stmt)
    entity = result.scalar_one_or_none()
    
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entity not found",
        )
    
    await db.delete(entity)
    await db.commit()
