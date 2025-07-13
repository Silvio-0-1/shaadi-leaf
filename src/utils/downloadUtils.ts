
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const downloadAsImage = async (elementId: string, fileName: string = 'wedding-card') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for download');
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2, // Higher quality
      logging: false,
      useCORS: true
    });

    // Create download link
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error generating image:', error);
  }
};

export const downloadAsPDF = async (elementId: string, fileName: string = 'wedding-card') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for download');
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate dimensions to fit A4
    const imgWidth = 150;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const x = (210 - imgWidth) / 2; // Center horizontally
    const y = 20;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
