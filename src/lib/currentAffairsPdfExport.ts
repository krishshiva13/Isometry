import { jsPDF } from 'jspdf';

export interface CapsuleMcq {
  id: string;
  category: string;
  targetExam: string;
  tagClass?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  examTrap: string;
}

export interface CapsuleCurrentAffair {
  id: string;
  num: string;
  title: string;
  summary: string;
  exams: Array<{ name: string; tagClass?: string; examCode: string }>;
  examAngle: string;
  keyTakeaway: string;
  source: string;
  category: string;
}

export interface DailyCapsuleData {
  dateKey: string;
  displayDate: string;
  dayBadge: string;
  themeTitle: string;
  pdfFileName: string;
  pdfFileSize?: string;
  pdfPageCount?: number;
  quickPointers: string[];
  mcqs: CapsuleMcq[];
  currentAffairs: CapsuleCurrentAffair[];
}

/**
 * Generates a high-quality 2-page A4 PDF document using jsPDF
 * Page 1: 5 Daily Practice MCQs + Explanations & Exam Traps
 * Page 2: Curated Current Affairs Digest + Exam Angles & 60s Summary
 */
export function generateCurrentAffairsPdfDoc(capsule: DailyCapsuleData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // ═════════════════════════════════════════════════════════════════════════
  // PAGE 1: 5 PRACTICE MCQS WITH EXPLANATION & TRAPS
  // ═════════════════════════════════════════════════════════════════════════
  let cursorY = margin;

  // Top Institutional Header
  doc.setFillColor(9, 20, 42); // Deep Navy (#09142A)
  doc.rect(margin, cursorY, contentWidth, 18, 'F');

  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('FACTHUB DAILY EXAM CAPSULE', margin + 5, cursorY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(217, 173, 66); // Gold tone
  doc.text('STEP 1: 5 HIGH-YIELD PRACTICE MCQS & QUESTION SETTER TRAPS', margin + 5, cursorY + 14);

  // Date and Page Stamp
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(capsule.displayDate, pageWidth - margin - 5, cursorY + 8, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 210, 230);
  doc.text('Page 1 of 2 • A4 Handout', pageWidth - margin - 5, cursorY + 14, { align: 'right' });

  cursorY += 23;

  // Subheader banner
  doc.setFillColor(245, 243, 237);
  doc.roundedRect(margin, cursorY, contentWidth, 7, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(20, 30, 50);
  doc.text('TEST YOUR RETENTION FIRST: Solve before reading today’s news digest on Page 2', margin + 3, cursorY + 4.8);
  cursorY += 10;

  // Loop over questions
  capsule.mcqs.forEach((q, idx) => {
    // Check if we need to conserve height
    const qNum = `Q${idx + 1}.`;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);

    const examBadge = `[${q.targetExam}] `;
    const qLines = doc.splitTextToSize(`${qNum} ${examBadge}${q.question}`, contentWidth - 4);
    doc.text(qLines, margin + 2, cursorY);
    cursorY += qLines.length * 4.2 + 1;

    // 4 Options (2x2 grid)
    const optWidth = (contentWidth - 6) / 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    q.options.forEach((opt, oIdx) => {
      const col = oIdx % 2;
      const row = Math.floor(oIdx / 2);
      const posX = margin + 2 + col * (optWidth + 2);
      const posY = cursorY + row * 4.5;
      const isCorrect = oIdx === q.correctAnswer;

      if (isCorrect) {
        doc.setFillColor(230, 246, 235);
        doc.roundedRect(posX, posY - 3.2, optWidth, 4.2, 0.8, 0.8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(13, 101, 45);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
      }

      const letter = String.fromCharCode(65 + oIdx);
      const mark = isCorrect ? ' ✓' : '';
      doc.text(`(${letter}) ${opt}${mark}`, posX + 1.5, posY);
    });

    cursorY += 11;

    // Explanation & Trap Box
    doc.setFillColor(254, 251, 235); // Light amber
    doc.setDrawColor(220, 190, 100);
    doc.setLineWidth(0.2);

    const expText = `• Fact: ${q.explanation}\n• Trap Alert: ${q.examTrap}`;
    const expLines = doc.splitTextToSize(expText, contentWidth - 8);
    const boxH = expLines.length * 3.6 + 3;

    doc.roundedRect(margin + 1, cursorY, contentWidth - 2, boxH, 1, 1, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(50, 45, 30);
    doc.text(expLines, margin + 3, cursorY + 3.2);

    cursorY += boxH + 4;
  });

  // Page 1 Footer
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text('FactHub Daily Educational Initiative • UPSC | SSC CGL | Banking | Railway | State PSC', margin, pageHeight - 8);
  doc.text('Turn page for Today\'s Curated Current Affairs Digest ➔', pageWidth - margin, pageHeight - 8, { align: 'right' });


  // ═════════════════════════════════════════════════════════════════════════
  // PAGE 2: DAILY CURRENT AFFAIRS DIGEST & EXAM ANGLES
  // ═════════════════════════════════════════════════════════════════════════
  doc.addPage();
  cursorY = margin;

  // Header Banner
  doc.setFillColor(9, 20, 42);
  doc.rect(margin, cursorY, contentWidth, 18, 'F');

  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('FACTHUB DAILY EXAM CAPSULE', margin + 5, cursorY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(217, 173, 66);
  doc.text('STEP 2: CURATED CURRENT AFFAIRS DIGEST & PRELIMS FOCUS ANGLES', margin + 5, cursorY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(capsule.displayDate, pageWidth - margin - 5, cursorY + 8, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 210, 230);
  doc.text('Page 2 of 2 • Core News Digest', pageWidth - margin - 5, cursorY + 14, { align: 'right' });

  cursorY += 23;

  // 60-Second Revision Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(26, 86, 219);
  doc.setLineWidth(0.4);
  const ptrsText = capsule.quickPointers.map(p => `• ${p}`).join('\n');
  const ptrsLines = doc.splitTextToSize(ptrsText, contentWidth - 8);
  const ptrsH = ptrsLines.length * 3.8 + 7;

  doc.roundedRect(margin, cursorY, contentWidth, ptrsH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(26, 86, 219);
  doc.text('TODAY’S 60-SECOND HIGH-YIELD MEMORY CAPSULE:', margin + 3, cursorY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(40, 50, 70);
  doc.text(ptrsLines, margin + 3, cursorY + 8.5);

  cursorY += ptrsH + 6;

  // Current Affairs Stories
  capsule.currentAffairs.slice(0, 4).forEach((ca, idx) => {
    // Title
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(9, 20, 42);
    const titleLines = doc.splitTextToSize(`0${idx + 1}. ${ca.title}`, contentWidth);
    doc.text(titleLines, margin, cursorY);
    cursorY += titleLines.length * 4.2 + 1;

    // Summary
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(50, 50, 50);
    const sumLines = doc.splitTextToSize(ca.summary, contentWidth);
    doc.text(sumLines, margin, cursorY);
    cursorY += sumLines.length * 3.6 + 2;

    // Exam Angle Box
    doc.setFillColor(243, 247, 254); // Light blue
    doc.setDrawColor(200, 220, 245);
    doc.setLineWidth(0.2);

    const angleText = `🎯 Prelims Focus: ${ca.examAngle}\n📌 Key Takeaway: ${ca.keyTakeaway}  [Source: ${ca.source}]`;
    const angleLines = doc.splitTextToSize(angleText, contentWidth - 8);
    const boxH = angleLines.length * 3.4 + 3;

    doc.roundedRect(margin, cursorY, contentWidth, boxH, 1, 1, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(20, 40, 80);
    doc.text(angleLines, margin + 3, cursorY + 3.2);

    cursorY += boxH + 4.5;
  });

  // Page 2 Footer
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text('FactHub Daily Current Affairs • Practice online at facthub.com/exam-prep', margin, pageHeight - 8);
  doc.text('End of Daily Capsule • Verified & Peer-Reviewed', pageWidth - margin, pageHeight - 8, { align: 'right' });

  return doc;
}

/**
 * Downloads the generated PDF directly to the user's computer
 */
export function downloadCurrentAffairsPdf(capsule: DailyCapsuleData): void {
  const doc = generateCurrentAffairsPdfDoc(capsule);
  doc.save(capsule.pdfFileName || `FactHub-Daily-Current-Affairs-${capsule.dateKey}.pdf`);
}

/**
 * Returns a Blob URL for previewing the PDF inside an iframe or viewer
 */
export function getCurrentAffairsPdfBlobUrl(capsule: DailyCapsuleData): string {
  const doc = generateCurrentAffairsPdfDoc(capsule);
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}
