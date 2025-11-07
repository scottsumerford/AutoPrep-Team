import { jsPDF } from 'jspdf';

/**
 * Generate a PDF from report content using jsPDF (works in serverless)
 * Returns a Buffer containing the PDF data
 */
export async function generatePdfFromContent(
  reportContent: string,
  title: string = 'Pre-Sales Report'
): Promise<Buffer> {
  try {
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Set up margins and page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Add timestamp
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;

    // Add horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Process content
    const paragraphs = reportContent.split('\n\n');
    
    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) continue;

      // Check if this looks like a heading (all caps or short line)
      const isHeading = paragraph.trim().length < 100 && 
                       paragraph.trim() === paragraph.trim().toUpperCase();

      if (isHeading) {
        // Add some space before heading
        yPosition += 5;
        
        // Check if we need a new page
        if (yPosition > pageHeight - margin - 20) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
      }

      // Split text into lines that fit the page width
      const lines = doc.splitTextToSize(paragraph.trim(), maxWidth);
      
      // Check if we need a new page
      const lineHeight = 7;
      const blockHeight = lines.length * lineHeight;
      
      if (yPosition + blockHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      // Add the text
      doc.text(lines, margin, yPosition);
      yPosition += blockHeight + 5;
    }

    // Get PDF as array buffer
    const pdfArrayBuffer = doc.output('arraybuffer');
    
    // Convert ArrayBuffer to Buffer
    const pdfBuffer = Buffer.from(pdfArrayBuffer);
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF with jsPDF:', error);
    throw error;
  }
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
