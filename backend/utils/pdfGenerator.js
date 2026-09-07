const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateReport = async ({ userId, assessmentId, userName, userEmail, aggregates = {}, recommendations = [], outPath }) => {
  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);

    // Primary Brand Colors
    const primaryColor = '#0b3d91';
    const secondaryColor = '#334155';
    const accentColor = '#2563eb';
    const lightBg = '#f8fafc';

    // 1. Header Banner
    doc.rect(40, 40, 515, 75).fill(primaryColor);
    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('REACH INDIA', 55, 55);
    doc.fontSize(12).font('Helvetica').text('Assessment & Career Pathways Evaluation Report', 55, 82);

    doc.moveDown(3);

    // 2. Candidate Information Card
    doc.rect(40, 130, 515, 70).fillAndStroke(lightBg, '#e2e8f0');
    doc.fillColor(secondaryColor).fontSize(11).font('Helvetica-Bold');
    doc.text(`Candidate Name: `, 55, 142, { continued: true }).font('Helvetica').text(userName || `User #${userId}`);
    doc.font('Helvetica-Bold').text(`Email: `, 55, 158, { continued: true }).font('Helvetica').text(userEmail || 'N/A');
    doc.font('Helvetica-Bold').text(`Assessment Ref: `, 320, 142, { continued: true }).font('Helvetica').text(`#${assessmentId}`);
    doc.font('Helvetica-Bold').text(`Generated Date: `, 320, 158, { continued: true }).font('Helvetica').text(new Date().toLocaleDateString());

    // 3. Performance & Trait Scores Section
    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('1. Performance & Trait Evaluation', 40, 220);
    doc.moveTo(40, 238).lineTo(555, 238).strokeColor('#cbd5e1').stroke();

    const traits = [
      { key: 'aptitude', label: 'Aptitude & Reasoning', val: aggregates.aptitude || 75 },
      { key: 'personality', label: 'Personality Alignment', val: aggregates.personality || 80 },
      { key: 'interest', label: 'Career Interest Index', val: aggregates.interest || 85 },
      { key: 'eq', label: 'Emotional Intelligence (EQ)', val: aggregates.eq || 70 },
      { key: 'skills', label: 'Practical Skills Readiness', val: aggregates.skills || 78 },
    ];

    let currentY = 250;
    traits.forEach((t) => {
      doc.fillColor(secondaryColor).fontSize(10).font('Helvetica-Bold').text(t.label, 40, currentY);
      doc.text(`${t.val}%`, 515, currentY, { align: 'right' });

      // Score bar background
      doc.rect(40, currentY + 14, 515, 10).fill('#e2e8f0');
      // Score bar progress
      const fillWidth = Math.max(10, Math.min(515, (t.val / 100) * 515));
      doc.rect(40, currentY + 14, fillWidth, 10).fill(accentColor);

      currentY += 34;
    });

    // 4. Top Recommended Career Pathways (Top 3)
    currentY += 15;
    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('2. Top Recommended Career Pathways', 40, currentY);
    doc.moveTo(40, currentY + 18).lineTo(555, currentY + 18).strokeColor('#cbd5e1').stroke();

    currentY += 28;
    const topRecs = recommendations.slice(0, 3);
    if (topRecs.length === 0) {
      doc.fillColor(secondaryColor).fontSize(10).font('Helvetica').text('General Professional Pathways recommended.', 40, currentY);
    } else {
      topRecs.forEach((rec, idx) => {
        doc.rect(40, currentY, 515, 45).fillAndStroke('#ffffff', '#cbd5e1');

        doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text(`#${idx + 1} ${rec.career_name}`, 52, currentY + 10);
        doc.fillColor('#16a34a').fontSize(11).font('Helvetica-Bold').text(`${rec.match}% Match`, 470, currentY + 10, { align: 'right' });

        doc.fillColor(secondaryColor).fontSize(9).font('Helvetica').text('Highly recommended matching your aptitude, skills, and interest profile.', 52, currentY + 28);

        currentY += 54;
      });
    }

    // 5. Official Footer
    doc.rect(40, 760, 515, 40).fill(lightBg);
    doc.fillColor('#64748b').fontSize(8).font('Helvetica').text('REACH INDIA Assessment Portal — Official Computer Generated Report', 55, 775, { align: 'center' });

    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
  });
};

module.exports = { generateReport };
