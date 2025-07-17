
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const downloadAsImage = async (elementId: string, fileName: string = 'wedding-card', quality: 'low' | 'high' = 'high') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for download');
    throw new Error('Card preview not found');
  }

  try {
    // Wait for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const scale = quality === 'high' ? 3 : 1.5; // Different scales for different qualities
    
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale,
      logging: false,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        // Ensure all styles are applied to cloned document
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          // Copy computed styles
          const originalStyles = window.getComputedStyle(element);
          clonedElement.style.cssText = originalStyles.cssText;
          
          // Ensure background gradients are preserved
          const allElements = clonedElement.querySelectorAll('*');
          const originalElements = element.querySelectorAll('*');
          
          allElements.forEach((el, index) => {
            if (originalElements[index]) {
              const originalStyle = window.getComputedStyle(originalElements[index]);
              (el as HTMLElement).style.background = originalStyle.background;
              (el as HTMLElement).style.fontFamily = originalStyle.fontFamily;
              (el as HTMLElement).style.color = originalStyle.color;
            }
          });
        }
      }
    });

    // Create download link
    const link = document.createElement('a');
    const qualitySuffix = quality === 'high' ? '-hd' : '';
    link.download = `${fileName}${qualitySuffix}.png`;
    link.href = canvas.toDataURL('image/png', quality === 'high' ? 1.0 : 0.8);
    link.click();
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate image');
  }
};

export const downloadAsPDF = async (elementId: string, fileName: string = 'wedding-card') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for download');
    throw new Error('Card preview not found');
  }

  try {
    // Wait for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 3,
      logging: false,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          const originalStyles = window.getComputedStyle(element);
          clonedElement.style.cssText = originalStyles.cssText;
          
          const allElements = clonedElement.querySelectorAll('*');
          const originalElements = element.querySelectorAll('*');
          
          allElements.forEach((el, index) => {
            if (originalElements[index]) {
              const originalStyle = window.getComputedStyle(originalElements[index]);
              (el as HTMLElement).style.background = originalStyle.background;
              (el as HTMLElement).style.fontFamily = originalStyle.fontFamily;
              (el as HTMLElement).style.color = originalStyle.color;
            }
          });
        }
      }
    });

    // Create a proper PDF with good margins and layout
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Add title and metadata
    pdf.setProperties({
      title: `${fileName} - Wedding Invitation`,
      subject: 'Wedding Invitation Card',
      author: 'Digital Wedding Cards',
      creator: 'Digital Wedding Cards Platform'
    });

    // Calculate optimal dimensions while maintaining aspect ratio
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    const maxHeight = pageHeight - (margin * 2) - 20; // Extra space for header

    const imgWidth = maxWidth;
    const imgHeight = (canvas.height * maxWidth) / canvas.width;

    // If image is too tall, scale it down
    let finalWidth = imgWidth;
    let finalHeight = imgHeight;
    
    if (imgHeight > maxHeight) {
      finalHeight = maxHeight;
      finalWidth = (canvas.width * maxHeight) / canvas.height;
    }

    // Center the image
    const x = (pageWidth - finalWidth) / 2;
    const y = margin + 10;

    // Add a subtle header
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text('Digital Wedding Cards', pageWidth / 2, margin / 2, { align: 'center' });

    // Add the main image
    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight, undefined, 'FAST');

    // Add a subtle footer
    pdf.setFontSize(6);
    pdf.setTextColor(180, 180, 180);
    const footerY = pageHeight - 10;
    pdf.text('Created with love at digitalweddingcards.com', pageWidth / 2, footerY, { align: 'center' });

    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
