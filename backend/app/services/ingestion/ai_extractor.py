"""
AI-Powered Data Extractor
Extracts transactions from any data format using LLMs
"""

import base64
import json
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

import pandas as pd
import pdfplumber
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic

from app.core.config import settings


class AIExtractor:
    """
    AI-powered data extraction engine.
    Handles unstructured data from any source - PDFs, CSVs, XLSX, JSON, text, images
    """
    
    EXTRACTION_PROMPT = """You are a financial data extraction expert. Extract transaction records from the provided data.

## Task
Extract ALL financial transactions from the data below. Look for:
- Date (any format - normalize to YYYY-MM-DD)
- Amount (positive for income, negative for expenses, or indicate direction)
- Description/Memo/Payee
- Category (if provided)
- Account (if provided)
- Reference/Transaction ID (if provided)

## Output Format
Return a JSON object with this structure:
{
    "success": true,
    "source_type": "bank_statement|quickbooks|xero|credit_card|receipt|general",
    "date_range": {
        "start": "YYYY-MM-DD",
        "end": "YYYY-MM-DD"
    },
    "account_info": {
        "name": "Account Name",
        "number": "Account Number",
        "currency": "USD"
    },
    "transactions": [
        {
            "date": "YYYY-MM-DD",
            "amount": 123.45,
            "direction": "income|expense",
            "description": "Transaction description",
            "category": "Category if available",
            "account": "Account name",
            "reference": "Reference number",
            "raw_line": "Original text if applicable"
        }
    ],
    "summary": {
        "total_income": 0.00,
        "total_expenses": 0.00,
        "net": 0.00,
        "transaction_count": 0
    },
    "confidence": 0.0-1.0,
    "notes": "Any observations about the data quality or issues"
}

## Important Rules
1. If amount sign is unclear, use context (debits/credits, in/out) to determine direction
2. Normalize all dates to YYYY-MM-DD format
3. If a field is missing, use null or empty string
4. Be thorough - extract ALL transactions, not just some
5. If data is unclear or ambiguous, note it in the confidence and notes fields
6. Handle different number formats (1,234.56 vs 1.234,56)
7. Look for running balances to verify extraction accuracy

## Data to Extract:
{data}
"""

    def __init__(self) -> None:
        self._init_client()

    def _init_client(self) -> None:
        """Initialize AI client based on settings"""
        if settings.ai_provider == "openai":
            self.openai_client = AsyncOpenAI(api_key=settings.openai_api_key)
            self.anthropic_client = None
        else:
            self.openai_client = None
            self.anthropic_client = AsyncAnthropic(api_key=settings.anthropic_api_key)

    async def extract(self, data: Any, source_type: str = "auto") -> dict:
        """
        Extract transactions from any data format
        
        Args:
            data: The data to extract from (text, dict, list, bytes)
            source_type: 'auto', 'csv', 'xlsx', 'pdf', 'json', 'quickbooks', 'xero', 'text'
        
        Returns:
            Dict with extracted transactions and metadata
        """
        # Prepare data for AI
        prepared_data = self._prepare_data(data, source_type)
        
        # Detect source type if auto
        if source_type == "auto":
            source_type = self._detect_source_type(prepared_data)
        
        # Call AI to extract
        result = await self._call_ai(prepared_data, source_type)
        
        return result

    def _prepare_data(self, data: Any, source_type: str) -> str:
        """Prepare data for AI processing"""
        if isinstance(data, bytes):
            # Try to decode as text
            try:
                return data.decode("utf-8")
            except UnicodeDecodeError:
                return base64.b64encode(data).decode("utf-8")
        elif isinstance(data, dict):
            return json.dumps(data, indent=2, default=str)
        elif isinstance(data, list):
            if data and isinstance(data[0], dict):
                return json.dumps(data, indent=2, default=str)
            else:
                return "\n".join(" | ".join(str(cell) for cell in row) for row in data)
        elif isinstance(data, str):
            if data.startswith("/") or data.startswith("http"):
                return self._read_file(data)
            return data
        else:
            return str(data)

    def _detect_source_type(self, data: str) -> str:
        """Detect the source type from data patterns"""
        data_lower = data.lower()
        
        if "quickbooks" in data_lower or "intuit" in data_lower:
            return "quickbooks"
        if "xero" in data_lower:
            return "xero"
        if data.count("|") > 5 or data.count(",") > 20:
            return "csv"
        if data.strip().startswith("{") or data.strip().startswith("["):
            return "json"
        
        bank_keywords = ["balance", "statement", "account", "deposit", "withdrawal"]
        if any(kw in data_lower for kw in bank_keywords):
            return "bank_statement"
        
        return "general"

    async def _call_ai(self, data: str, source_type: str) -> dict:
        """Call AI to extract transactions"""
        prompt = self.EXTRACTION_PROMPT.format(data=data[:50000])  # Limit data size
        
        try:
            if settings.ai_provider == "openai":
                model = settings.openai_extraction_model
                response = await self.openai_client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    response_format={"type": "json_object"},
                    temperature=0.1,
                    max_tokens=4000,
                )
                result_text = response.choices[0].message.content
            else:
                model = settings.anthropic_extraction_model
                response = await self.anthropic_client.messages.create(
                    model=model,
                    max_tokens=4000,
                    messages=[{"role": "user", "content": prompt}],
                )
                result_text = response.content[0].text
            
            result = json.loads(result_text)
            return self._validate_result(result)
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    def _validate_result(self, result: dict) -> dict:
        """Validate and clean extraction result"""
        if not result.get("transactions"):
            result["transactions"] = []
        
        for txn in result.get("transactions", []):
            if not txn.get("direction"):
                amount = txn.get("amount", 0)
                txn["direction"] = "income" if amount > 0 else "expense"
            
            if isinstance(txn.get("amount"), str):
                try:
                    txn["amount"] = float(txn["amount"].replace("$", "").replace(",", ""))
                except:
                    txn["amount"] = 0
            
            if txn.get("date"):
                txn["date"] = self._normalize_date(txn["date"])
        
        if not result.get("summary"):
            txns = result.get("transactions", [])
            result["summary"] = {
                "total_income": sum(t.get("amount", 0) for t in txns if t.get("direction") == "income"),
                "total_expenses": sum(abs(t.get("amount", 0)) for t in txns if t.get("direction") == "expense"),
                "net": sum(t.get("amount", 0) if t.get("direction") == "income" else -abs(t.get("amount", 0)) for t in txns),
                "transaction_count": len(txns),
            }
        
        result["success"] = True
        return result

    def _normalize_date(self, date_str: str) -> str:
        """Normalize date to YYYY-MM-DD format"""
        formats = [
            "%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%Y/%m/%d",
            "%b %d, %Y", "%d %b %Y", "%B %d, %Y",
        ]
        
        for fmt in formats:
            try:
                dt = datetime.strptime(date_str.strip(), fmt)
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                continue
        return date_str

    async def extract_from_file(self, file_path: str) -> dict:
        """Extract from a file (handles CSV, XLSX, PDF, etc.)"""
        path = Path(file_path)
        ext = path.suffix.lower()
        
        if ext == ".csv":
            return await self._extract_from_csv(file_path)
        elif ext in [".xlsx", ".xls"]:
            return await self._extract_from_xlsx(file_path)
        elif ext == ".pdf":
            return await self._extract_from_pdf(file_path)
        elif ext == ".json":
            return await self._extract_from_json(file_path)
        else:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                data = f.read()
            return await self.extract(data, source_type="auto")

    async def _extract_from_csv(self, file_path: str) -> dict:
        """Extract from CSV file"""
        try:
            df = pd.read_csv(file_path)
            data = df.to_dict(orient="records")
            return await self.extract(data, source_type="csv")
        except Exception:
            with open(file_path, "r") as f:
                data = f.read()
            return await self.extract(data, source_type="csv")

    async def _extract_from_xlsx(self, file_path: str) -> dict:
        """Extract from Excel file"""
        try:
            all_data = []
            xls = pd.ExcelFile(file_path)
            
            for sheet_name in xls.sheet_names:
                df = pd.read_excel(file_path, sheet_name=sheet_name)
                if not df.empty:
                    all_data.append({
                        "sheet": sheet_name,
                        "data": df.to_dict(orient="records")
                    })
            
            return await self.extract(all_data, source_type="xlsx")
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _extract_from_pdf(self, file_path: str) -> dict:
        """Extract from PDF file"""
        try:
            text_parts = []
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        text_parts.append(text)
            
            data = "\n\n".join(text_parts)
            return await self.extract(data, source_type="pdf")
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _extract_from_json(self, file_path: str) -> dict:
        """Extract from JSON file"""
        with open(file_path, "r") as f:
            data = json.load(f)
        return await self.extract(data, source_type="json")
