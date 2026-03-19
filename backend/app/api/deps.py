"""
API Dependencies
"""

from collections.abc import AsyncGenerator
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import Entity

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> dict:
    """Get current user from JWT token"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    # TODO: Implement actual JWT validation
    # For now, return a mock user
    return {
        "id": 1,
        "email": "user@example.com",
        "name": "Demo User",
    }


async def get_current_entity(
    entity_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> Entity:
    """Get entity and verify user has access"""
    stmt = select(Entity).where(Entity.id == entity_id)
    result = await db.execute(stmt)
    entity = result.scalar_one_or_none()
    
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entity not found",
        )
    
    # TODO: Add ownership check
    return entity
