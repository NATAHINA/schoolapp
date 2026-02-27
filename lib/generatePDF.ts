import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateStudentReport = (report: any, schoolInfo: any) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString('fr-FR');

  // --- EN-TÊTE ÉCOLE ---
  if (schoolInfo?.logo) {
    try { doc.addImage(schoolInfo.logo, 'PNG', 14, 10, 25, 25); } catch (e) {}
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(schoolInfo?.name?.toUpperCase() || "ÉTABLISSEMENT SCOLAIRE", 45, 18);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${schoolInfo?.address || ''}`, 45, 24);
  doc.text(`Tél: ${schoolInfo?.phone || '--'} | Email: ${schoolInfo?.email || '--'}`, 45, 29);

  doc.line(14, 38, 196, 38);

  // --- TITRE & INFOS ÉLÈVE ---
  doc.setFontSize(16);
  doc.text("BULLETIN DE NOTES", 105, 48, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Nom et prénom(s) : ${report.studentName.toUpperCase()}`, 14, 60);
  
  // CORRECTION AFFICHAGE ANNÉE SCOLAIRE
  doc.setFont('helvetica', 'normal');
  const anneeLabel = `Année Scolaire : ${report.academicYearName || 'N/A'}`;
  doc.text(anneeLabel, 196 - doc.getTextWidth(anneeLabel), 60);

  doc.text(`Classe : ${report.className || 'N/A'}`, 14, 66);

  // --- TABLEAU DES NOTES (THEME SOMBRE) ---
  autoTable(doc, {
    startY: 72,
    head: [['MATIÈRE', 'NOTE / 20', 'COEFF.', 'TOTAL', 'OBSERVATION']],
    body: report.grades.map((g: any) => [
      g.subjectName.toUpperCase(),
      { content: g.value.toFixed(2), styles: { halign: 'center', fontStyle: 'bold' } },
      { content: g.coefficient, styles: { halign: 'center' } },
      { content: (g.value * g.coefficient).toFixed(2), styles: { halign: 'center' } },
      g.comment || '-'
    ]),
    theme: 'grid',
    headStyles: { 
      fillColor: [33, 37, 41], // Noir Anthracite
      textColor: [255, 255, 255], 
      halign: 'center'
    },
    styles: { fontSize: 9 }
  });

  // --- RÉSUMÉ AVEC RANG ---
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFillColor(33, 37, 41); // Fond sombre pour le résumé
  doc.rect(14, finalY, 182, 12, 'F');
  
  doc.setTextColor(255, 255, 255); // Texte blanc
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`MOYENNE : ${report.average} / 20`, 20, finalY + 8);
  
  // Affichage du rang (ex: 1er / 25)
  const rangText = `RANG : ${report.rank}${report.rank === 1 ? 'er' : 'e'} sur ${report.classSize || '?'}`;
  doc.text(rangText, 190 - doc.getTextWidth(rangText), finalY + 8);

  // --- SIGNATURES ---
  doc.setTextColor(0, 0, 0); // Retour au noir
  const sigY = finalY + 30;
  doc.text("Signature des Parents", 30, sigY);
  doc.text("Le Directeur", 150, sigY);

  doc.save(`Bulletin_${report.studentName.replace(/\s+/g, '_')}.pdf`);
};

