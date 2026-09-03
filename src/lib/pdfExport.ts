import { jsPDF } from 'jspdf';
import { Fact } from '../types';

export interface StudySheetExportData {
  dateString: string;
  facts: Fact[];
  vocabulary?: Array<{ english: string; hindi: string; context: string }>;
  mcqs?: Array<{ question: string; options: string[]; answer: string }>;
}

export function exportStudySheetToPdf(data: StudySheetExportData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Helper to add new page if needed
  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 20) {
      doc.addPage();
      cursorY = margin;
    }
  };

  // 1. Header Banner
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 14, 11);
  doc.text('FACTHUB DAILY REVISION SHEET', margin, cursorY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Verified Daily Educational Capsules & Competitive Exam Static GK', margin, cursorY + 11);

  // Right-aligned Date & Domain
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text(data.dateString, pageWidth - margin, cursorY + 6, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 130, 20); // Gold tone
  doc.text('https://facthub.in', pageWidth - margin, cursorY + 11, { align: 'right' });

  cursorY += 15;

  // Header dividing line
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(0.6);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 6;

  // 2. Section A: Core Historical & Scientific Milestones
  doc.setFillColor(245, 243, 237); // Paper-like accent
  doc.rect(margin, cursorY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text('SECTION A: CORE HISTORICAL & SCIENTIFIC MILESTONES', margin + 3, cursorY + 4.2);
  cursorY += 10;

  const factsToInclude = data.facts.slice(0, 5);
  factsToInclude.forEach((fact, idx) => {
    checkPageBreak(30);

    // Fact Title & Category
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    const titleText = `${idx + 1}. ${fact.title}`;
    doc.text(titleText, margin, cursorY);

    const metaText = `[${fact.cat.toUpperCase()} • YEAR ${fact.year || 'EVENT'}]`;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(metaText, pageWidth - margin, cursorY, { align: 'right' });

    cursorY += 5;

    // Fact Excerpt
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    const splitExcerpt = doc.splitTextToSize(fact.excerpt, contentWidth);
    doc.text(splitExcerpt, margin, cursorY);
    cursorY += splitExcerpt.length * 4.2 + 2;

    // Exam Relevance (if available)
    if (fact.examRelevance) {
      checkPageBreak(12);
      doc.setFillColor(248, 248, 248);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      const splitExam = doc.splitTextToSize(`Exam Focus: ${fact.examRelevance}`, contentWidth - 6);
      const boxHeight = splitExam.length * 3.8 + 4;
      doc.roundedRect(margin, cursorY, contentWidth, boxHeight, 1.5, 1.5, 'FD');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      doc.text(splitExam, margin + 3, cursorY + 4);
      cursorY += boxHeight + 4;
    } else {
      cursorY += 3;
    }

    // Divider
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.2);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 5;
  });

  // 3. Section B: Bilingual Exam Terminology
  checkPageBreak(40);
  cursorY += 2;
  doc.setFillColor(245, 243, 237);
  doc.rect(margin, cursorY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text('SECTION B: BILINGUAL EXAM TERMINOLOGY & CONCEPTS', margin + 3, cursorY + 4.2);
  cursorY += 9;

  const vocabList = data.vocabulary || [
    { english: 'Satyagraha', hindi: 'सत्याग्रह', context: 'Insistence on truth; non-violent resistance pioneered by Gandhi.' },
    { english: 'Diwani Rights', hindi: 'दीवानी अधिकार', context: 'Right to collect land revenue granted via Treaty of Allahabad (1765).' },
    { english: 'Cryogenic Engine', hindi: 'क्रायोजेनिक इंजन', context: 'Rocket engine utilizing liquid hydrogen (-253°C) and liquid oxygen.' }
  ];

  vocabList.forEach((v) => {
    checkPageBreak(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text(`• ${v.english} (${v.hindi}):`, margin, cursorY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const textWidth = doc.getTextWidth(`• ${v.english} (${v.hindi}): `);
    const splitContext = doc.splitTextToSize(v.context, contentWidth - textWidth);
    doc.text(splitContext, margin + textWidth, cursorY);
    cursorY += Math.max(splitContext.length * 4.2, 5.5);
  });

  // 4. Section C: Daily Practice Questions
  checkPageBreak(50);
  cursorY += 4;
  doc.setFillColor(245, 243, 237);
  doc.rect(margin, cursorY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text('SECTION C: DAILY PRACTICE QUESTIONS (SELF-ASSESSMENT)', margin + 3, cursorY + 4.2);
  cursorY += 9;

  const mcqs = data.mcqs || [
    {
      question: 'Q1. In which year was Sir C.V. Raman awarded the Nobel Prize in Physics for light scattering?',
      options: ['(A) 1928', '(B) 1930', '(C) 1935', '(D) 1942'],
      answer: 'B'
    },
    {
      question: 'Q2. Which Treaty concluded the Battle of Buxar (1764) conferring Diwani Rights to the EIC?',
      options: ['(A) Treaty of Purandar', '(B) Treaty of Allahabad', '(C) Treaty of Salbai', '(D) Treaty of Madras'],
      answer: 'B'
    }
  ];

  mcqs.forEach((mcq) => {
    checkPageBreak(18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    const splitQ = doc.splitTextToSize(mcq.question, contentWidth);
    doc.text(splitQ, margin, cursorY);
    cursorY += splitQ.length * 4 + 1;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(70, 70, 70);
    doc.text(`${mcq.options[0]}     ${mcq.options[1]}     ${mcq.options[2]}     ${mcq.options[3]}`, margin + 4, cursorY);
    cursorY += 6;
  });

  // Answer Key
  checkPageBreak(12);
  cursorY += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Answer Key: Q1-(B), Q2-(B)', margin, cursorY);
  cursorY += 8;

  // 5. Apply Page Numbers and facthub.in Watermarks to ALL Pages
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Diagonal subtle background watermark in center
    doc.setFont('times', 'bold');
    doc.setFontSize(54);
    doc.setTextColor(240, 238, 230); // Very light subtle watermark tone
    doc.text('facthub.in', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45,
    });

    // Mandatory Bottom Page Watermark & Brand Footer
    const footerY = pageHeight - 10;

    // Footer divider line
    doc.setDrawColor(210, 208, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

    // Left watermark text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(180, 130, 20); // Gold accent
    doc.text('facthub.in', margin, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(' • Verified Educational Archive & Daily Study Capsule', margin + 14, footerY);

    // Right page number
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
  }

  // Save the PDF
  const sanitizedDate = data.dateString.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  doc.save(`facthub-daily-study-sheet-${sanitizedDate}.pdf`);
}
