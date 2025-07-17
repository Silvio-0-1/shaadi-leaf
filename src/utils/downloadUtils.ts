
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const downloadAsImage = async (elementId: string, fileName: string = 'wedding-card', quality: 'low' | 'high' = 'high') => {
  console.log('Starting image download for element:', elementId);
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for download:', elementId);
    throw new Error('Card preview not found');
  }

  try {
    // Wait for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const scale = quality === 'high' ? 3 : 2;
    
    console.log('Capturing element with html2canvas...');
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale,
      logging: true,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
      imageTimeout: 15000,
      width: element.offsetWidth,
      height: element.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        console.log('Cloning document for capture...');
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          // Force visibility and positioning
          clonedElement.style.position = 'relative';
          clonedElement.style.display = 'block';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.opacity = '1';
          
          // Copy all computed styles
          const originalStyles = window.getComputedStyle(element);
          Array.from(originalStyles).forEach(key => {
            try {
              clonedElement.style.setProperty(key, originalStyles.getPropertyValue(key));
            } catch (e) {
              // Ignore errors for read-only properties
            }
          });
          
          // Ensure all child elements are properly styled
          const allElements = clonedElement.querySelectorAll('*');
          const originalElements = element.querySelectorAll('*');
          
          allElements.forEach((el, index) => {
            if (originalElements[index]) {
              const originalStyle = window.getComputedStyle(originalElements[index]);
              const htmlEl = el as HTMLElement;
              
              // Copy critical styles
              htmlEl.style.fontFamily = originalStyle.fontFamily;
              htmlEl.style.fontSize = originalStyle.fontSize;
              htmlEl.style.fontWeight = originalStyle.fontWeight;
              htmlEl.style.color = originalStyle.color;
              htmlEl.style.backgroundColor = originalStyle.backgroundColor;
              htmlEl.style.background = originalStyle.background;
              htmlEl.style.backgroundImage = originalStyle.backgroundImage;
              htmlEl.style.padding = originalStyle.padding;
              htmlEl.style.margin = originalStyle.margin;
              htmlEl.style.textAlign = originalStyle.textAlign;
              htmlEl.style.lineHeight = originalStyle.lineHeight;
              htmlEl.style.display = originalStyle.display;
              htmlEl.style.position = originalStyle.position;
              htmlEl.style.borderRadius = originalStyle.borderRadius;
              htmlEl.style.border = originalStyle.border;
            }
          });
        }
      }
    });

    console.log('Canvas created, size:', canvas.width, 'x', canvas.height);
    
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Generated canvas is empty');
    }

    // Create download link
    const link = document.createElement('a');
    const qualitySuffix = quality === 'high' ? '-hd' : '';
    link.download = `${fileName}${qualitySuffix}.png`;
    link.href = canvas.toDataURL('image/png', quality === 'high' ? 1.0 : 0.8);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Image download completed successfully');
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate image');
  }
};

export const downloadAsPDF = async (elementId: string, fileName: string = 'wedding-card') => {
  console.log('Starting PDF download for element:', elementId);
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for download:', elementId);
    throw new Error('Card preview not found');
  }

  try {
    // Wait for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Capturing element for PDF with html2canvas...');
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 3,
      logging: true,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
      imageTimeout: 15000,
      width: element.offsetWidth,
      height: element.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        console.log('Cloning document for PDF capture...');
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          // Force visibility and positioning
          clonedElement.style.position = 'relative';
          clonedElement.style.display = 'block';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.opacity = '1';
          
          // Copy all computed styles
          const originalStyles = window.getComputedStyle(element);
          Array.from(originalStyles).forEach(key => {
            try {
              clonedElement.style.setProperty(key, originalStyles.getPropertyValue(key));
            } catch (e) {
              // Ignore errors for read-only properties
            }
          });
          
          // Ensure all child elements are properly styled
          const allElements = clonedElement.querySelectorAll('*');
          const originalElements = element.querySelectorAll('*');
          
          allElements.forEach((el, index) => {
            if (originalElements[index]) {
              const originalStyle = window.getComputedStyle(originalElements[index]);
              const htmlEl = el as HTMLElement;
              
              // Copy critical styles
              htmlEl.style.fontFamily = originalStyle.fontFamily;
              htmlEl.style.fontSize = originalStyle.fontSize;
              htmlEl.style.fontWeight = originalStyle.fontWeight;
              htmlEl.style.color = originalStyle.color;
              htmlEl.style.backgroundColor = originalStyle.backgroundColor;
              htmlEl.style.background = originalStyle.background;
              htmlEl.style.backgroundImage = originalStyle.backgroundImage;
              htmlEl.style.padding = originalStyle.padding;
              htmlEl.style.margin = originalStyle.margin;
              htmlEl.style.textAlign = originalStyle.textAlign;
              htmlEl.style.lineHeight = originalStyle.lineHeight;
              htmlEl.style.display = originalStyle.display;
              htmlEl.style.position = originalStyle.position;
              htmlEl.style.borderRadius = originalStyle.borderRadius;
              htmlEl.style.border = originalStyle.border;
            }
          });
        }
      }
    });

    console.log('Canvas created for PDF, size:', canvas.width, 'x', canvas.height);
    
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Generated canvas is empty');
    }

    // Create PDF
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
    const maxHeight = pageHeight - (margin * 2) - 20;

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
    console.log('PDF download completed successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
