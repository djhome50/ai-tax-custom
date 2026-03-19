"""
API v1 Router
"""

from fastapi import APIRouter

from app.api.v1.entities import router as entities_router
from app.api.v1.transactions import router as transactions_router
from app.api.v1.tax import router as tax_router

api_router = APIRouter()

api_router.include_router(entities_router)
api_router.include_router(transactions_router)
api_router.include_router(tax_router)
