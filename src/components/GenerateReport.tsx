
import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import type { ScriptForm } from '../types';

interface GenerateReportProps {
  script: string;
  form: ScriptForm;
}

export function GenerateReport({ script, form }: GenerateReportProps) {
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Script Generator Report', 20, 20);
    
    // Add metadata
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 35);
    
    // Add script details
    doc.setFontSize(16);
    doc.text('Script Details', 20, 50);
    
    doc.setFontSize(12);
    doc.text(`Name: ${form.name}`, 20, 65);
    doc.text('Description:', 20, 80);
    
    // Handle description text wrapping
    const splitDescription = doc.splitTextToSize(form.description, 170);
    doc.text(splitDescription, 20, 90);
    
    // Add generated script
    doc.setFontSize(16);
    doc.text('Generated Script', 20, 120);
    
    doc.setFontSize(10);
    const splitScript = doc.splitTextToSize(script || 'No script generated', 170);
    doc.text(splitScript, 20, 130);
    
    // Save the PDF
    doc.save('script-generator-report.pdf');
  };

  return (
    <button
      onClick={generatePDF}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition"
    >
      <FileDown className="w-5 h-5" />
      Download Report
    </button>
  );
}