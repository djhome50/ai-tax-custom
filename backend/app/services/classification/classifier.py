"""
AI Transaction Classifier
Classifies transactions using rules + AI
"""

import json
import re
from decimal import Decimal
from typing import Optional

from openai import AsyncOpenAI
from anthropic import AsyncAnthropic

from app.core.config import settings


class TransactionClassifier:
    """
    Hybrid classification engine combining rules and AI
    """
    
    # Rule-based category mappings
    CATEGORY_RULES = {
        # Revenue patterns
        "revenue": [
            r"stripe.*payout", r"paypal.*payment", r"square.*deposit",
            r"invoice.*payment", r"payment received", r"deposit.*from",
        ],
        # Software/SaaS
        "software_expense": [
            r"aws", r"google cloud", r"azure", r"openai", r"anthropic",
            r"github", r"gitlab", r"vercel", r"heroku", r"digitalocean",
            r"slack", r"zoom", r"notion", r"linear", r"figma", r"adobe",
            r"microsoft 365", r"google workspace", r"dropbox",
        ],
        # Office supplies
        "office_supplies": [
            r"staples", r"office depot", r"amazon.*office", r"costco.*supplies",
            r"paper", r"printer", r"ink", r"toner",
        ],
        # Advertising/Marketing
        "advertising": [
            r"facebook ads", r"google ads", r"meta ads", r"linkedin ads",
            r"twitter ads", r"tiktok ads", r"advertising", r"marketing",
            r"promoted", r"sponsored",
        ],
        # Professional services
        "professional_services": [
            r"legal", r"attorney", r"lawyer", r"accounting", r"cpa",
            r"consulting", r"consultant", r"advisor",
        ],
        # Travel
        "travel_expense": [
            r"uber", r"lyft", r"airline", r"delta", r"united", r"american airlines",
            r"hotel", r"marriott", r"hilton", r"airbnb", r"expedia",
            r"parking", r"toll", r"gas station", r"fuel",
        ],
        # Meals/Entertainment
        "meals_entertainment": [
            r"restaurant", r"grubhub", r"doordash", r"ubereats", r"postmates",
            r"coffee", r"starbucks", r"dunkin", r"catering",
        ],
        # Utilities
        "utilities": [
            r"electric", r"gas bill", r"water", r"internet", r"phone",
            r"comcast", r"verizon", r"at&t", r"spectrum",
        ],
        # Rent
        "rent_expense": [
            r"rent", r"lease payment", r"office space",
        ],
        # Insurance
        "insurance": [
            r"insurance", r"geico", r"state farm", r"allstate", r"health insurance",
        ],
        # Payroll
        "payroll": [
            r"gusto", r"adp", r"paychex", r"payroll", r"salary", r"wages",
        ],
        # Bank fees
        "bank_fees": [
            r"bank fee", r"wire fee", r"overdraft", r"monthly fee", r"atm fee",
        ],
    }
    
    # Tax category mappings (for Schedule C)
    TAX_CATEGORY_MAP = {
        "revenue": "gross_receipts",
        "software_expense": "other_expenses",
        "office_supplies": "office_expense",
        "advertising": "advertising_expense",
        "professional_services": "legal_professional_services",
        "travel_expense": "travel_expense",
        "meals_entertainment": "meals_expense",  # 50% deductible
        "utilities": "utilities_expense",
        "rent_expense": "rent_lease_expense",
        "insurance": "insurance_expense",
        "payroll": "wages_expense",
        "bank_fees": "bank_charges",
    }
    
    def __init__(self) -> None:
        self._init_client()
    
    def _init_client(self) -> None:
        """Initialize AI client"""
        if settings.ai_provider == "openai":
            self.openai_client = AsyncOpenAI(api_key=settings.openai_api_key)
            self.anthropic_client = None
        else:
            self.openai_client = None
            self.anthropic_client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    
    async def classify(
        self,
        description: str,
        amount: float,
        direction: str,
        context: Optional[dict] = None,
    ) -> dict:
        """
        Classify a transaction
        
        Args:
            description: Transaction description
            amount: Transaction amount
            direction: 'income' or 'expense'
            context: Additional context (entity_type, date, etc.)
        
        Returns:
            Dict with category, tax_category, confidence, reasoning
        """
        # First try rule-based classification
        rule_result = self._classify_by_rules(description, direction)
        
        if rule_result["confidence"] >= 0.9:
            return rule_result
        
        # Fall back to AI classification
        ai_result = await self._classify_by_ai(description, amount, direction, context)
        
        # Use higher confidence result
        if ai_result["confidence"] > rule_result["confidence"]:
            return ai_result
        
        return rule_result
    
    def _classify_by_rules(self, description: str, direction: str) -> dict:
        """Rule-based classification using regex patterns"""
        desc_lower = description.lower()
        
        for category, patterns in self.CATEGORY_RULES.items():
            for pattern in patterns:
                if re.search(pattern, desc_lower):
                    tax_category = self.TAX_CATEGORY_MAP.get(category, "other_expenses")
                    return {
                        "category": category,
                        "tax_category": tax_category,
                        "confidence": 0.95,
                        "reasoning": f"Matched rule pattern: {pattern}",
                        "method": "rules",
                    }
        
        # No match - return default
        default_category = "uncategorized_income" if direction == "income" else "uncategorized_expense"
        return {
            "category": default_category,
            "tax_category": "other_expenses",
            "confidence": 0.3,
            "reasoning": "No rule match found - requires AI classification",
            "method": "rules",
        }
    
    async def _classify_by_ai(
        self,
        description: str,
        amount: float,
        direction: str,
        context: Optional[dict] = None,
    ) -> dict:
        """AI-powered classification using LLM"""
        entity_type = context.get("entity_type", "sole_proprietorship") if context else "sole_proprietorship"
        
        prompt = f"""Classify this transaction for tax purposes.

Description: {description}
Amount: ${amount:.2f}
Type: {direction}
Entity Type: {entity_type}

Available categories:
- revenue (income)
- software_expense (SaaS, cloud services, subscriptions)
- office_supplies (physical supplies, equipment)
- advertising (marketing, ads, promotions)
- professional_services (legal, accounting, consulting)
- travel_expense (flights, hotels, rides, mileage)
- meals_entertainment (client meals, business entertainment)
- utilities (internet, phone, electric)
- rent_expense (office rent, equipment lease)
- insurance (business insurance)
- payroll (wages, benefits)
- bank_fees (bank charges, wire fees)
- cost_of_goods_sold (inventory, materials)
- other_expense

Respond in JSON format:
{{
    "category": "category_name",
    "tax_category": "schedule_c_line_item",
    "confidence": 0.0-1.0,
    "reasoning": "brief explanation"
}}"""
        
        try:
            if settings.ai_provider == "openai":
                response = await self.openai_client.chat.completions.create(
                    model=settings.openai_model,
                    messages=[{"role": "user", "content": prompt}],
                    response_format={"type": "json_object"},
                    temperature=0.1,
                )
                result_text = response.choices[0].message.content
            else:
                response = await self.anthropic_client.messages.create(
                    model=settings.anthropic_model,
                    max_tokens=500,
                    messages=[{"role": "user", "content": prompt}],
                )
                result_text = response.content[0].text
            
            result = json.loads(result_text)
            result["method"] = "ai"
            return result
            
        except Exception as e:
            return {
                "category": "uncategorized_expense",
                "tax_category": "other_expenses",
                "confidence": 0.0,
                "reasoning": f"AI error: {str(e)}",
                "method": "ai_error",
            }
    
    async def batch_classify(self, transactions: list[dict]) -> list[dict]:
        """Classify multiple transactions"""
        results = []
        for txn in transactions:
            result = await self.classify(
                description=txn.get("description", ""),
                amount=txn.get("amount", 0),
                direction=txn.get("direction", "expense"),
                context=txn.get("context"),
            )
            result["transaction_id"] = txn.get("id")
            results.append(result)
        return results
