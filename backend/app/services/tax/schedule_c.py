"""
Schedule C Calculator
Calculates Schedule C (Profit or Loss from Business) for sole proprietors
"""

from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Entity, Transaction, TransactionDirection, EntityType


class ScheduleCCalculator:
    """
    Calculator for IRS Schedule C
    Profit or Loss From Business (Sole Proprietorship)
    """
    
    # Self-employment tax rate
    SE_TAX_RATE = Decimal("0.153")  # 15.3%
    
    # Tax category to Schedule C line mapping
    TAX_CATEGORY_TO_LINE = {
        "gross_receipts": "gross_receipts",
        "advertising_expense": "advertising",
        "car_truck_expense": "car_truck",
        "contract_labor": "contract_labor",
        "insurance_expense": "insurance",
        "interest_expense": "interest_other",
        "legal_professional_services": "legal_professional",
        "office_expense": "office",
        "rent_lease_expense": "rent_lease",
        "repairs_maintenance": "repairs",
        "supplies": "supplies",
        "taxes_licenses": "taxes_licenses",
        "travel_expense": "travel",
        "meals_expense": "meals",  # 50% deductible
        "utilities_expense": "utilities",
        "wages_expense": "wages",
        "other_expenses": "other",
        "software_expense": "other",
        "professional_services": "legal_professional",
        "bank_charges": "other",
    }
    
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
    
    async def calculate(self, entity_id: int, tax_year: int) -> dict:
        """Calculate Schedule C values for an entity"""
        # Get transactions for the tax year
        transactions = await self._get_transactions(entity_id, tax_year)
        
        # Initialize form data
        form_data = {line: Decimal("0") for line in self.TAX_CATEGORY_TO_LINE.values()}
        form_data["gross_receipts"] = Decimal("0")
        
        # Process transactions
        gross_income = Decimal("0")
        total_expenses = Decimal("0")
        
        for txn in transactions:
            amount = Decimal(str(txn.amount))
            
            if txn.direction == TransactionDirection.INCOME:
                gross_income += amount
                form_data["gross_receipts"] += amount
            else:
                # Map tax category to line
                line = self.TAX_CATEGORY_TO_LINE.get(txn.tax_category or "", "other")
                
                # Special handling for meals (50% deductible)
                if line == "meals":
                    amount = amount * Decimal("0.5")
                
                form_data[line] += amount
                total_expenses += amount
        
        # Calculate net profit
        net_profit = gross_income - total_expenses
        
        # Self-employment tax
        se_tax = self._calculate_self_employment_tax(net_profit)
        deductible_se_tax = se_tax / 2
        
        # Taxable income
        taxable_income = net_profit - deductible_se_tax
        
        return {
            "form_type": "Schedule C",
            "tax_year": tax_year,
            "entity_id": entity_id,
            
            # Income
            "gross_income": float(gross_income),
            "gross_receipts": float(form_data["gross_receipts"]),
            
            # Expenses
            "total_expenses": float(total_expenses),
            "expense_breakdown": {k: float(v) for k, v in form_data.items() if v > 0 and k != "gross_receipts"},
            
            # Bottom line
            "net_profit": float(net_profit),
            "net_loss": float(abs(net_profit)) if net_profit < 0 else 0,
            
            # Tax calculations
            "self_employment_tax": float(se_tax),
            "deductible_se_tax": float(deductible_se_tax),
            "taxable_income": float(taxable_income),
        }
    
    async def generate_form(self, entity_id: int, tax_year: int) -> dict:
        """Generate complete Schedule C form data"""
        calc = await self.calculate(entity_id, tax_year)
        
        # Get entity info
        stmt = select(Entity).where(Entity.id == entity_id)
        result = await self.db.execute(stmt)
        entity = result.scalar_one_or_none()
        
        if not entity:
            return {"success": False, "error": "Entity not found"}
        
        return {
            "success": True,
            "form": {
                # Header
                "tax_year": tax_year,
                "name": entity.business_name or entity.name,
                "ein": entity.ein,
                "business_name": entity.business_name,
                "business_address": entity.address,
                "business_city": entity.city,
                "business_state": entity.state,
                "business_zip": entity.zip_code,
                "principal_business": entity.business_code or "000000",
                "accounting_method": entity.accounting_method.value,
                
                # Income
                "line_1": calc["gross_receipts"],
                "line_3": calc["gross_receipts"],
                "line_5": calc["gross_income"],
                "line_7": calc["gross_income"],
                
                # Expenses
                "line_8": calc["expense_breakdown"].get("advertising", 0),
                "line_9": calc["expense_breakdown"].get("car_truck", 0),
                "line_11": calc["expense_breakdown"].get("contract_labor", 0),
                "line_15": calc["expense_breakdown"].get("insurance", 0),
                "line_17": calc["expense_breakdown"].get("legal_professional", 0),
                "line_18": calc["expense_breakdown"].get("office", 0),
                "line_20b": calc["expense_breakdown"].get("rent_lease", 0),
                "line_22": calc["expense_breakdown"].get("supplies", 0),
                "line_24a": calc["expense_breakdown"].get("travel", 0),
                "line_24b": calc["expense_breakdown"].get("meals", 0),
                "line_25": calc["expense_breakdown"].get("utilities", 0),
                "line_26": calc["expense_breakdown"].get("wages", 0),
                "line_27": calc["expense_breakdown"].get("other", 0),
                "line_28": calc["total_expenses"],
                
                # Net profit
                "line_31": calc["net_profit"] if calc["net_profit"] >= 0 else 0,
                "line_32": calc["net_loss"] if calc["net_profit"] < 0 else 0,
                
                # Summary
                "self_employment_tax": calc["self_employment_tax"],
                "taxable_income": calc["taxable_income"],
            },
            "calculation": calc,
        }
    
    async def _get_transactions(self, entity_id: int, tax_year: int) -> list[Transaction]:
        """Get classified transactions for entity and tax year"""
        stmt = (
            select(Transaction)
            .where(Transaction.entity_id == entity_id)
            .where(func.extract("year", Transaction.transaction_date) == tax_year)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
    
    def _calculate_self_employment_tax(self, net_profit: Decimal) -> Decimal:
        """Calculate self-employment tax"""
        if net_profit <= 0:
            return Decimal("0")
        
        # 92.35% of net profit is subject to SE tax
        taxable_base = net_profit * Decimal("0.9235")
        return taxable_base * self.SE_TAX_RATE
