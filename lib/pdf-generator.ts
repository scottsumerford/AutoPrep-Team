import PDFDocument from 'pdfkit';

/**
 * Generate a PDF from text content
 * @param content - The text content to include in the PDF
 * @param title - The title of the PDF document
 * @returns Buffer containing the PDF data
 */
export async function generatePdfFromContent(content: string, title: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

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
      doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.moveDown();

      // Add content
      doc.fontSize(12).font('Helvetica').text(content, {
        align: 'left',
        width: 500,
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Convert a buffer to a data URL
 * @param buffer - The buffer to convert
 * @param mimeType - The MIME type of the data
 * @returns Data URL string
 */
export function bufferToDataUrl(buffer: Buffer, mimeType: string = 'application/octet-stream'): string {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Convert a data URL back to a buffer
 * @param dataUrl - The data URL string
 * @returns Buffer containing the decoded data
 */
export function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64Data = dataUrl.split(',')[1];
  if (!base64Data) {
    throw new Error('Invalid data URL format');
  }
  return Buffer.from(base64Data, 'base64');
}
