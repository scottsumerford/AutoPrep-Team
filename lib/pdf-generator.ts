import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

/**
 * Generate a PDF from report content
 * Returns a Buffer containing the PDF data
 */
export async function generatePdfFromContent(
  reportContent: string,
  title: string = 'Pre-Sales Report'
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const chunks: Buffer[] = [];

      // Collect PDF data
      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });

      doc.on('error', (err: Error) => {
        reject(err);
      });

      // Add title
      doc.fontSize(24).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.moveDown();

      // Add timestamp
      doc.fontSize(10).font('Helvetica').fillColor('#666666');
      doc.text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown();

      // Add horizontal line
      doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // Add content
      doc.fontSize(11).font('Helvetica').fillColor('#000000');
      
      // Split content into paragraphs and add to PDF
      const paragraphs = reportContent.split('\n\n');
      paragraphs.forEach((paragraph, index) => {
        if (paragraph.trim()) {
          // Check if this looks like a heading (all caps or short line)
          if (paragraph.trim().length < 100 && paragraph.trim() === paragraph.trim().toUpperCase()) {
            doc.fontSize(13).font('Helvetica-Bold').text(paragraph.trim());
          } else {
            doc.fontSize(11).font('Helvetica').text(paragraph.trim(), {
              align: 'left',
              width: 445,
            });
          }
          
          if (index < paragraphs.length - 1) {
            doc.moveDown(0.5);
          }
        }
      });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Convert a Buffer to a data URL for storage
 */
export function bufferToDataUrl(buffer: Buffer, mimeType: string = 'application/pdf'): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

/**
 * Convert a data URL back to a Buffer
 */
export function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64Data = dataUrl.split(',')[1];
  return Buffer.from(base64Data, 'base64');
}
