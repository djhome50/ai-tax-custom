"""
IRS XML Generator
Generates IRS e-file XML format for tax forms
"""

from typing import Optional

from lxml import etree
from lxml.builder import ElementMaker

from app.models import FormType


class XMLGenerator:
    """Generate IRS e-file XML for tax forms"""
    
    # IRS namespaces
    IRS_NS = "http://www.irs.gov/efile"
    XSI_NS = "http://www.w3.org/2001/XMLSchema-instance"
    
    def __init__(self) -> None:
        self.E = ElementMaker(namespace=self.IRS_NS, nsmap={
            None: self.IRS_NS,
            "xsi": self.XSI_NS,
        })
    
    def generate(self, form_type: FormType, form_data: dict) -> str:
        """
        Generate IRS e-file XML for a tax form
        
        Args:
            form_type: Form type
            form_data: Form field data
        
        Returns:
            XML string
        """
        if form_type == FormType.SCHEDULE_C:
            return self._generate_schedule_c_xml(form_data)
        elif form_type == FormType.FORM_1120:
            return self._generate_form_1120_xml(form_data)
        else:
            return self._generate_generic_xml(form_type.value, form_data)
    
    def _generate_schedule_c_xml(self, data: dict) -> str:
        """Generate Schedule C XML for IRS e-file"""
        E = self.E
        
        root = E.ScheduleC(
            E.TaxYear(str(data.get("tax_year", 2024))),
            E.ReturnType("1040"),
            
            # Taxpayer info
            E.TaxpayerName(data.get("name", "")),
            E.EIN(data.get("ein", "")),
            E.BusinessName(data.get("business_name", "")),
            E.BusinessAddress(
                E.AddressLine1(data.get("business_address", "")),
                E.City(data.get("business_city", "")),
                E.State(data.get("business_state", "")),
                E.ZIPCode(data.get("business_zip", "")),
            ),
            E.PrincipalBusinessCode(data.get("principal_business", "")),
            E.AccountingMethod(data.get("accounting_method", "Cash")),
            
            # Income
            E.Income(
                E.GrossReceiptsOrSales(str(data.get("line_1", 0))),
                E.GrossProfit(str(data.get("line_5", 0))),
                E.GrossIncome(str(data.get("line_7", 0))),
            ),
            
            # Expenses
            E.Expenses(
                E.Advertising(str(data.get("line_8", 0))),
                E.CarAndTruck(str(data.get("line_9", 0))),
                E.ContractLabor(str(data.get("line_11", 0))),
                E.Insurance(str(data.get("line_15", 0))),
                E.LegalAndProfessionalServices(str(data.get("line_17", 0))),
                E.OfficeExpense(str(data.get("line_18", 0))),
                E.RentOrLease(str(data.get("line_20b", 0))),
                E.Supplies(str(data.get("line_22", 0))),
                E.Travel(str(data.get("line_24a", 0))),
                E.DeductibleMeals(str(data.get("line_24b", 0))),
                E.Utilities(str(data.get("line_25", 0))),
                E.Wages(str(data.get("line_26", 0))),
                E.OtherExpenses(str(data.get("line_27", 0))),
                E.TotalExpenses(str(data.get("line_28", 0))),
            ),
            
            # Net profit/loss
            E.NetProfit(str(data.get("line_31", 0))),
        )
        
        return self._pretty_print(root)
    
    def _generate_form_1120_xml(self, data: dict) -> str:
        """Generate Form 1120 XML for IRS e-file"""
        E = self.E
        
        root = E.Form1120(
            E.TaxYear(str(data.get("tax_year", 2024))),
            E.CorporationName(data.get("name", "")),
            E.EIN(data.get("ein", "")),
            E.TotalReceipts(str(data.get("total_receipts", 0))),
            E.TaxableIncome(str(data.get("taxable_income", 0))),
            E.TotalTax(str(data.get("total_tax", 0))),
        )
        
        return self._pretty_print(root)
    
    def _generate_generic_xml(self, form_type: str, data: dict) -> str:
        """Generate generic XML for any form type"""
        E = self.E
        
        elements = []
        for key, value in sorted(data.items()):
            if value is not None and not key.startswith("_"):
                elem_name = key.replace("_", "").replace(" ", "")
                elements.append(getattr(E, elem_name)(str(value)))
        
        root = getattr(E, form_type.replace("_", ""))(
            E.TaxYear(str(data.get("tax_year", 2024))),
            *elements
        )
        
        return self._pretty_print(root)
    
    def _pretty_print(self, element: etree._Element) -> str:
        """Pretty print XML element"""
        return etree.tostring(
            element,
            pretty_print=True,
            xml_declaration=True,
            encoding="UTF-8",
            standalone=True,
        ).decode("utf-8")
