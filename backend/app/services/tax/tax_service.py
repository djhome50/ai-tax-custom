"""
Tax Calculation Service
Orchestrates tax calculations for different entity types
"""

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Entity, EntityType, TaxCalculation, GeneratedForm, FormType, FormStatus
from app.services.tax.schedule_c import ScheduleCCalculator


class TaxService:
    """Service for tax calculations"""
    
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.schedule_c = ScheduleCCalculator(db)
    
    async def calculate_tax(self, entity_id: int, tax_year: int) -> dict:
        """Calculate tax liability for an entity"""
        # Get entity
        stmt = select(Entity).where(Entity.id == entity_id)
        result = await self.db.execute(stmt)
        entity = result.scalar_one_or_none()
        
        if not entity:
            return {"success": False, "error": "Entity not found"}
        
        # Get calculator based on entity type
        if entity.entity_type in [EntityType.SOLE_PROPRIETORSHIP, EntityType.SINGLE_MEMBER_LLC]:
            calc_result = await self.schedule_c.calculate(entity_id, tax_year)
        elif entity.entity_type in [EntityType.C_CORP, EntityType.LLC_C_CORP]:
            calc_result = await self._calculate_form_1120(entity_id, tax_year)
        elif entity.entity_type in [EntityType.PARTNERSHIP, EntityType.LLC_PARTNERSHIP]:
            calc_result = await self._calculate_form_1065(entity_id, tax_year)
        elif entity.entity_type in [EntityType.S_CORP, EntityType.LLC_S_CORP]:
            calc_result = await self._calculate_form_1120s(entity_id, tax_year)
        else:
            calc_result = await self.schedule_c.calculate(entity_id, tax_year)
        
        # Store calculation
        tax_calc = TaxCalculation(
            entity_id=entity_id,
            tax_year=tax_year,
            entity_type=entity.entity_type.value,
            gross_income=calc_result.get("gross_income", 0),
            total_expenses=calc_result.get("total_expenses", 0),
            net_income=calc_result.get("net_profit", 0),
            taxable_income=calc_result.get("taxable_income", 0),
            estimated_tax=calc_result.get("estimated_tax", 0),
            self_employment_tax=calc_result.get("self_employment_tax", 0),
            effective_rate=calc_result.get("effective_rate", 0),
            calculation_data=calc_result,
        )
        self.db.add(tax_calc)
        
        return {"success": True, **calc_result, "calculation_id": tax_calc.id}
    
    async def generate_form(self, entity_id: int, tax_year: int) -> dict:
        """Generate a tax form for an entity"""
        # Get entity
        stmt = select(Entity).where(Entity.id == entity_id)
        result = await self.db.execute(stmt)
        entity = result.scalar_one_or_none()
        
        if not entity:
            return {"success": False, "error": "Entity not found"}
        
        # Determine form type
        form_type = self._get_form_type(entity.entity_type)
        
        # Check if form already exists
        stmt = select(GeneratedForm).where(
            GeneratedForm.entity_id == entity_id,
            GeneratedForm.form_type == form_type,
            GeneratedForm.tax_year == tax_year,
        )
        result = await self.db.execute(stmt)
        existing = result.scalar_one_or_none()
        
        if existing:
            return {
                "success": True,
                "form_id": existing.id,
                "status": "exists",
                "form_data": existing.form_data,
            }
        
        # Generate form
        if form_type == FormType.SCHEDULE_C:
            form_result = await self.schedule_c.generate_form(entity_id, tax_year)
        else:
            form_result = {"success": False, "error": f"Form type {form_type} not yet implemented"}
        
        if not form_result.get("success"):
            return form_result
        
        # Store form
        generated_form = GeneratedForm(
            entity_id=entity_id,
            form_type=form_type,
            tax_year=tax_year,
            status=FormStatus.GENERATED,
            form_data=form_result.get("form"),
        )
        self.db.add(generated_form)
        await self.db.flush()
        
        return {
            "success": True,
            "form_id": generated_form.id,
            "status": "generated",
            "form_data": form_result.get("form"),
        }
    
    def _get_form_type(self, entity_type: EntityType) -> FormType:
        """Get form type for entity type"""
        form_map = {
            EntityType.SOLE_PROPRIETORSHIP: FormType.SCHEDULE_C,
            EntityType.SINGLE_MEMBER_LLC: FormType.SCHEDULE_C,
            EntityType.PARTNERSHIP: FormType.FORM_1065,
            EntityType.S_CORP: FormType.FORM_1120_S,
            EntityType.C_CORP: FormType.FORM_1120,
            EntityType.LLC_PARTNERSHIP: FormType.FORM_1065,
            EntityType.LLC_S_CORP: FormType.FORM_1120_S,
            EntityType.LLC_C_CORP: FormType.FORM_1120,
        }
        return form_map.get(entity_type, FormType.SCHEDULE_C)
    
    async def _calculate_form_1120(self, entity_id: int, tax_year: int) -> dict:
        """Calculate Form 1120 (C-Corp)"""
        # TODO: Implement
        return {
            "form_type": "Form 1120",
            "tax_year": tax_year,
            "entity_id": entity_id,
            "gross_income": 0,
            "total_expenses": 0,
            "net_profit": 0,
            "taxable_income": 0,
            "estimated_tax": 0,
            "effective_rate": 0,
        }
    
    async def _calculate_form_1120s(self, entity_id: int, tax_year: int) -> dict:
        """Calculate Form 1120-S (S-Corp)"""
        # TODO: Implement
        return {
            "form_type": "Form 1120-S",
            "tax_year": tax_year,
            "entity_id": entity_id,
            "gross_income": 0,
            "total_expenses": 0,
            "net_profit": 0,
            "taxable_income": 0,
            "estimated_tax": 0,
            "effective_rate": 0,
        }
    
    async def _calculate_form_1065(self, entity_id: int, tax_year: int) -> dict:
        """Calculate Form 1065 (Partnership)"""
        # TODO: Implement
        return {
            "form_type": "Form 1065",
            "tax_year": tax_year,
            "entity_id": entity_id,
            "gross_income": 0,
            "total_expenses": 0,
            "net_profit": 0,
            "taxable_income": 0,
            "estimated_tax": 0,
            "effective_rate": 0,
        }
