"""
Form Generation Service
Orchestrates PDF and XML generation
"""

from pathlib import Path
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import GeneratedForm, FormType, FormStatus
from app.services.forms.pdf_generator import PDFGenerator
from app.services.forms.xml_generator import XMLGenerator


class FormService:
    """Service for generating tax forms"""
    
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.pdf_generator = PDFGenerator()
        self.xml_generator = XMLGenerator()
    
    async def generate_pdf(self, form_id: int) -> dict:
        """Generate PDF for a tax form"""
        stmt = select(GeneratedForm).where(GeneratedForm.id == form_id)
        result = await self.db.execute(stmt)
        form = result.scalar_one_or_none()
        
        if not form:
            return {"success": False, "error": "Form not found"}
        
        if form.pdf_file:
            return {"success": True, "pdf_path": form.pdf_file, "status": "exists"}
        
        # Generate PDF
        pdf_path = self.pdf_generator.generate(
            form_type=form.form_type.value,
            form_data=form.form_data or {},
        )
        
        form.pdf_file = pdf_path
        return {"success": True, "pdf_path": pdf_path, "status": "generated"}
    
    async def generate_xml(self, form_id: int) -> dict:
        """Generate IRS e-file XML for a tax form"""
        stmt = select(GeneratedForm).where(GeneratedForm.id == form_id)
        result = await self.db.execute(stmt)
        form = result.scalar_one_or_none()
        
        if not form:
            return {"success": False, "error": "Form not found"}
        
        if form.xml_content:
            return {"success": True, "xml": form.xml_content, "status": "exists"}
        
        # Generate XML
        xml_content = self.xml_generator.generate(
            form_type=form.form_type,
            form_data=form.form_data or {},
        )
        
        form.xml_content = xml_content
        return {"success": True, "xml": xml_content, "status": "generated"}
    
    async def preview_form(self, form_type: FormType, form_data: dict) -> dict:
        """Preview a tax form without saving"""
        pdf_path = self.pdf_generator.generate(
            form_type=form_type.value,
            form_data=form_data,
            preview=True,
        )
        
        return {
            "success": True,
            "preview_url": pdf_path,
            "expires_in": 3600,  # 1 hour
        }
    
    async def review_form(self, form_id: int, user_id: int, notes: Optional[str] = None) -> dict:
        """Mark a form as reviewed"""
        stmt = select(GeneratedForm).where(GeneratedForm.id == form_id)
        result = await self.db.execute(stmt)
        form = result.scalar_one_or_none()
        
        if not form:
            return {"success": False, "error": "Form not found"}
        
        form.status = FormStatus.REVIEWED
        form.reviewed_by = user_id
        form.review_notes = notes
        
        return {"success": True, "form_id": form_id, "status": "reviewed"}
    
    async def approve_form(self, form_id: int) -> dict:
        """Mark a form as approved for filing"""
        stmt = select(GeneratedForm).where(GeneratedForm.id == form_id)
        result = await self.db.execute(stmt)
        form = result.scalar_one_or_none()
        
        if not form:
            return {"success": False, "error": "Form not found"}
        
        form.status = FormStatus.APPROVED
        return {"success": True, "form_id": form_id, "status": "approved"}
