
import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import type { ScriptForm } from '../types';

interface GenerateReportProps {
  script: string;
  form: ScriptForm;
}

export function GenerateReport({ script, form }: GenerateReportProps) {
  const extractScriptInfo = (script: string) => {
    const urlMatch = script.match(/const Url = "([^"]+)"/)?.[1] || 'Non spécifié';
    const actionsMatch = script.match(/for \(let i = 0; i < (\d+)/)?.[1] || '0';
    const hasErrorHandling = script.includes('try') && script.includes('catch');

    return {
      url: urlMatch,
      actions: parseInt(actionsMatch),
      errorHandling: hasErrorHandling
    };
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const scriptInfo = extractScriptInfo(script);
    
    // En-tête du rapport
    doc.setFontSize(24);
    doc.setTextColor(41, 128, 185);
    doc.text('Script Generator Report', 20, 20);
    
    // Métadonnées
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Généré le : ${new Date().toLocaleString()}`, 20, 35);
    
    // Détails du script
    doc.setFontSize(18);
    doc.setTextColor(52, 73, 94);
    doc.text('Détails du Script', 20, 50);
    
    // Informations du script
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text([
      `Nom : ${form.name}`,
      `URL cible : ${scriptInfo.url}`,
      `Nombre d'actions : ${scriptInfo.actions}`,
      `Temps d'attente : 3-5 secondes`,
      `Gestion d'erreurs : ${scriptInfo.errorHandling ? 'Oui' : 'Non'}`
    ].join('\n'), 20, 65);
    
    // Description
    doc.text('Description :', 20, 110);
    const splitDescription = doc.splitTextToSize(form.description, 170);
    doc.text(splitDescription, 20, 120);
    
    // Section du code
    doc.setFontSize(18);
    doc.setTextColor(52, 73, 94);
    doc.text('Code Généré', 20, 150);
    
    // Formatage du code
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont('Courier');
    
    // Arrière-plan gris clair pour le code
    doc.setFillColor(245, 245, 245);
    doc.rect(15, 155, 180, 100, 'F');
    
    // Formatage du script
    const formattedScript = script
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
    
    const splitScript = doc.splitTextToSize(formattedScript, 165);
    doc.text(splitScript, 20, 160);
    
    // Sauvegarde avec horodatage
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
    doc.save(`${form.name}-script-${timestamp}.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      title="Générer et télécharger un rapport PDF du script"
    >
      <FileDown className="w-4 h-4" />
      Télécharger le rapport
    </button>
  );
}