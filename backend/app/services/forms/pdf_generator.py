"""
PDF Form Generator
Generates PDF versions of tax forms
"""

import os
from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

from app.core.config import settings


class PDFGenerator:
    """Generate PDF tax forms"""
    
    def __init__(self) -> None:
        self.upload_dir = Path(settings.upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
    
    def generate(self, form_type: str, form_data: dict, preview: bool = False) -> str:
        """
        Generate PDF for a tax form
        
        Args:
            form_type: Form type (schedule_c, form_1120, etc.)
            form_data: Form field data
            preview: If True, generate temporary preview file
        
        Returns:
            Path to generated PDF
        """
        if form_type.lower() == "schedule_c":
            pdf_content = self._generate_schedule_c_pdf(form_data)
        else:
            pdf_content = self._generate_generic_pdf(form_type, form_data)
        
        # Save PDF file
        filename = self._save_pdf(pdf_content, form_type, form_data.get("tax_year"), preview)
        return filename
    
    def _generate_schedule_c_pdf(self, data: dict) -> bytes:
        """Generate Schedule C PDF"""
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # Header
        c.setFont("Helvetica-Bold", 14)
        c.drawString(1 * inch, height - 1 * inch, "SCHEDULE C")
        c.setFont("Helvetica", 10)
        c.drawString(1 * inch, height - 1.25 * inch, "(Form 1040)")
        c.drawString(1 * inch, height - 1.5 * inch, "Profit or Loss From Business")
        c.drawString(1 * inch, height - 1.75 * inch, f"Tax Year {data.get('tax_year', datetime.now().year)}")
        
        # Taxpayer info
        y = height - 2.25 * inch
        c.setFont("Helvetica-Bold", 10)
        c.drawString(1 * inch, y, "Name of proprietor")
        c.setFont("Helvetica", 10)
        c.drawString(3 * inch, y, data.get("name", ""))
        
        y -= 0.3 * inch
        c.setFont("Helvetica-Bold", 10)
        c.drawString(1 * inch, y, "Principal business")
        c.setFont("Helvetica", 10)
        c.drawString(3 * inch, y, data.get("business_name", ""))
        
        y -= 0.3 * inch
        c.setFont("Helvetica-Bold", 10)
        c.drawString(1 * inch, y, "EIN")
        c.setFont("Helvetica", 10)
        c.drawString(3 * inch, y, data.get("ein", ""))
        
        # Income section
        y -= 0.5 * inch
        c.setFont("Helvetica-Bold", 12)
        c.drawString(1 * inch, y, "Part I - Income")
        
        y -= 0.3 * inch
        c.setFont("Helvetica", 10)
        c.drawString(1 * inch, y, f"Line 1 - Gross receipts: ${data.get('line_1', 0):,.2f}")
        
        y -= 0.25 * inch
        c.drawString(1 * inch, y, f"Line 7 - Gross income: ${data.get('line_7', 0):,.2f}")
        
        # Expense section
        y -= 0.5 * inch
        c.setFont("Helvetica-Bold", 12)
        c.drawString(1 * inch, y, "Part II - Expenses")
        
        y -= 0.3 * inch
        c.setFont("Helvetica", 10)
        
        expenses = [
            ("Advertising", data.get("line_8", 0)),
            ("Car and truck", data.get("line_9", 0)),
            ("Contract labor", data.get("line_11", 0)),
            ("Insurance", data.get("line_15", 0)),
            ("Legal/professional", data.get("line_17", 0)),
            ("Office expense", data.get("line_18", 0)),
            ("Rent/lease", data.get("line_20b", 0)),
            ("Supplies", data.get("line_22", 0)),
            ("Travel", data.get("line_24a", 0)),
            ("Meals (50%)", data.get("line_24b", 0)),
            ("Utilities", data.get("line_25", 0)),
            ("Wages", data.get("line_26", 0)),
            ("Other expenses", data.get("line_27", 0)),
        ]
        
        for label, amount in expenses:
            if amount > 0:
                c.drawString(1 * inch, y, f"{label}: ${amount:,.2f}")
                y -= 0.2 * inch
        
        y -= 0.1 * inch
        c.setFont("Helvetica-Bold", 10)
        c.drawString(1 * inch, y, f"Line 28 - Total expenses: ${data.get('line_28', 0):,.2f}")
        
        # Net profit
        y -= 0.5 * inch
        c.setFont("Helvetica-Bold", 12)
        c.drawString(1 * inch, y, "Net Profit/Loss")
        
        y -= 0.3 * inch
        c.setFont("Helvetica-Bold", 11)
        net_profit = data.get("line_31", 0)
        if net_profit >= 0:
            c.drawString(1 * inch, y, f"Line 31 - Net profit: ${net_profit:,.2f}")
        else:
            c.drawString(1 * inch, y, f"Line 32 - Net loss: ${abs(net_profit):,.2f}")
        
        # Tax summary
        y -= 0.5 * inch
        c.setFont("Helvetica-Bold", 12)
        c.drawString(1 * inch, y, "Tax Summary")
        
        y -= 0.3 * inch
        c.setFont("Helvetica", 10)
        c.drawString(1 * inch, y, f"Self-employment tax: ${data.get('self_employment_tax', 0):,.2f}")
        y -= 0.25 * inch
        c.drawString(1 * inch, y, f"Taxable income: ${data.get('taxable_income', 0):,.2f}")
        
        # Footer
        y -= 0.75 * inch
        c.setFont("Helvetica-Oblique", 8)
        c.drawString(1 * inch, y, "Generated by AI Tax Engine - For review purposes only")
        
        c.save()
        return buffer.getvalue()
    
    def _generate_generic_pdf(self, form_type: str, data: dict) -> bytes:
        """Generate a generic form PDF"""
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # Header
        c.setFont("Helvetica-Bold", 14)
        c.drawString(1 * inch, height - 1 * inch, form_type.upper().replace("_", " "))
        c.setFont("Helvetica", 10)
        c.drawString(1 * inch, height - 1.25 * inch, f"Tax Year {data.get('tax_year', datetime.now().year)}")
        
        # Data fields
        y = height - 2 * inch
        c.setFont("Helvetica-Bold", 12)
        c.drawString(1 * inch, y, "Form Data")
        
        y -= 0.3 * inch
        c.setFont("Helvetica", 10)
        
        for key, value in sorted(data.items()):
            if value and not key.startswith("_"):
                c.drawString(1 * inch, y, f"{key.replace('_', ' ').title()}: {value}")
                y -= 0.25 * inch
                
                if y < 1.5 * inch:
                    c.showPage()
                    y = height - 1 * inch
        
        # Footer
        y -= 0.5 * inch
        c.setFont("Helvetica-Oblique", 8)
        c.drawString(1 * inch, y, "Generated by AI Tax Engine - For review purposes only")
        
        c.save()
        return buffer.getvalue()
    
    def _save_pdf(self, pdf_content: bytes, form_type: str, tax_year: int, preview: bool) -> str:
        """Save PDF to file system and return path"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{form_type}_{tax_year}_{timestamp}.pdf"
        
        folder = "temp" if preview else "tax_forms"
        folder_path = self.upload_dir / folder
        folder_path.mkdir(parents=True, exist_ok=True)
        
        file_path = folder_path / filename
        with open(file_path, "wb") as f:
            f.write(pdf_content)
        
        return str(file_path)
