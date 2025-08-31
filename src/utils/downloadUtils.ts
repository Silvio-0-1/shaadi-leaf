
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Wait for fonts to load
const waitForFonts = async (timeout: number = 5000): Promise<void> => {
  if (!document.fonts) return;
  
  try {
    await Promise.race([
      document.fonts.ready,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Font loading timeout')), timeout)
      )
    ]);
  } catch (error) {
    console.warn('Font loading timeout, proceeding with capture');
  }
};

// Wait for images to load
const waitForImages = async (element: HTMLElement, timeout: number = 10000): Promise<void> => {
  const images = element.querySelectorAll('img');
  if (images.length === 0) return;

  const imagePromises = Array.from(images).map(img => {
    return new Promise((resolve, reject) => {
      if (img.complete) {
        resolve(img);
      } else {
        const timeoutId = setTimeout(() => {
          reject(new Error('Image loading timeout'));
        }, timeout);
        
        img.onload = () => {
          clearTimeout(timeoutId);
          resolve(img);
        };
        
        img.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error('Image loading failed'));
        };
      }
    });
  });

  try {
    await Promise.all(imagePromises);
  } catch (error) {
    console.warn('Some images failed to load, proceeding with capture');
  }
};

// Force reflow and ensure all styles are applied
const forceReflow = (element: HTMLElement): void => {
  // Force reflow by reading offsetHeight
  element.offsetHeight;
  
  // Ensure all animations and transitions are complete
  const allElements = element.querySelectorAll('*');
  allElements.forEach(el => {
    const htmlEl = el as HTMLElement;
    htmlEl.offsetHeight; // Force reflow for each element
  });
};

export const downloadAsImage = async (
  elementId: string, 
  fileName: string = 'wedding-card', 
  quality: 'low' | 'high' = 'high'
) => {
  console.log('Starting enhanced image download for element:', elementId);
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error('Element not found for download:', elementId);
    throw new Error('Card preview not found');
  }

  try {
    // Wait for fonts to load
    console.log('Waiting for fonts to load...');
    await waitForFonts();
    
    // Wait for images to load
    console.log('Waiting for images to load...');
    await waitForImages(element);
    
    // Force reflow to ensure all styles are applied
    console.log('Forcing reflow...');
    forceReflow(element);
    
    // Additional delay to ensure everything is rendered
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const scale = quality === 'high' ? 4 : 2; // Increased scale for better quality
    const pixelRatio = window.devicePixelRatio || 1;
    const finalScale = scale * pixelRatio;
    
    console.log('Capturing element with html2canvas...', { scale: finalScale });
    
    const canvas = await html2canvas(element, {
      backgroundColor: null, // Allow transparent backgrounds
      scale: finalScale,
      logging: false,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
      imageTimeout: 30000,
      width: element.offsetWidth,
      height: element.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.offsetWidth,
      windowHeight: element.offsetHeight,
      x: 0,
      y: 0,
      onclone: (clonedDoc, clonedElement) => {
        console.log('Cloning document for capture...');
        
        // Copy CSS variables from original document to cloned document
        const originalRoot = document.documentElement;
        const clonedRoot = clonedDoc.documentElement;
        const originalStyles = window.getComputedStyle(originalRoot);
        
        // Copy all CSS custom properties (variables)
        for (let i = 0; i < originalStyles.length; i++) {
          const property = originalStyles[i];
          if (property.startsWith('--')) {
            const value = originalStyles.getPropertyValue(property);
            clonedRoot.style.setProperty(property, value);
          }
        }
        
        // Copy color scheme and theme
        const theme = originalRoot.classList.contains('dark') ? 'dark' : 'light';
        if (theme === 'dark') {
          clonedRoot.classList.add('dark');
        }
        
        // Hide scrollbars
        clonedDoc.body.style.overflow = 'hidden';
        clonedDoc.documentElement.style.overflow = 'hidden';
        
        // Ensure proper color space and rendering
        clonedDoc.body.style.colorScheme = theme;
        clonedDoc.body.style.backgroundColor = theme === 'dark' ? 'hsl(240 10% 3.9%)' : 'hsl(0 0% 100%)';
        
        // Ensure the cloned element is properly positioned
        clonedElement.style.position = 'relative';
        clonedElement.style.display = 'block';
        clonedElement.style.visibility = 'visible';
        clonedElement.style.opacity = '1';
        clonedElement.style.transform = 'none';
        clonedElement.style.margin = '0';
        clonedElement.style.padding = '0';
        
        // ALWAYS hide gridlines during capture (regardless of toggle state)
        const gridOverlay = clonedElement.querySelector('.grid-overlay');
        if (gridOverlay) {
          (gridOverlay as HTMLElement).style.display = 'none';
        }
        
        // Hide all grid-related elements
        clonedElement.querySelectorAll('[class*="grid-overlay"], [class*="Grid"], .grid-overlay').forEach(el => {
          (el as HTMLElement).style.display = 'none';
        });

        // Enhanced style copying function
        const copyStyles = (original: Element, cloned: Element) => {
          const originalStyles = window.getComputedStyle(original);
          const clonedEl = cloned as HTMLElement;
          
          // Comprehensive style properties to copy
          const criticalStyles = [
            'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight',
            'color', 'backgroundColor', 'background', 'backgroundImage',
            'backgroundSize', 'backgroundPosition', 'backgroundRepeat',
            'backgroundClip', 'backgroundOrigin', 'backgroundAttachment',
            'padding', 'margin', 'border', 'borderRadius', 'textAlign',
            'display', 'position', 'top', 'left', 'right', 'bottom',
            'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
            'zIndex', 'opacity', 'transform', 'transformOrigin', 'transformStyle',
            'boxShadow', 'textShadow', 'filter', 'backdropFilter',
            'letterSpacing', 'wordSpacing', 'textDecoration', 'textTransform',
            'overflow', 'overflowX', 'overflowY', 'visibility',
            'clipPath', 'mask', 'mixBlendMode', 'isolation'
          ];
          
          criticalStyles.forEach(prop => {
            try {
              const value = originalStyles.getPropertyValue(prop);
              if (value && value !== 'normal' && value !== 'initial') {
                // Resolve CSS variables in the value
                if (value.includes('var(--')) {
                  const resolvedValue = value.replace(/var\(([^)]+)\)/g, (match, varName) => {
                    const cleanVarName = varName.split(',')[0].trim();
                    return originalStyles.getPropertyValue(cleanVarName) || match;
                  });
                  clonedEl.style.setProperty(prop, resolvedValue);
                } else {
                  clonedEl.style.setProperty(prop, value);
                }
              }
            } catch (e) {
              // Ignore errors for read-only properties
            }
          });
          
          // Special handling for background gradients
          const bgImage = originalStyles.backgroundImage;
          if (bgImage && bgImage !== 'none') {
            clonedEl.style.backgroundImage = bgImage;
            clonedEl.style.backgroundSize = originalStyles.backgroundSize;
            clonedEl.style.backgroundPosition = originalStyles.backgroundPosition;
            clonedEl.style.backgroundRepeat = originalStyles.backgroundRepeat;
          }
          
          // Handle absolute positioning specifically
          if (originalStyles.position === 'absolute') {
            clonedEl.style.position = 'absolute';
            clonedEl.style.top = originalStyles.top;
            clonedEl.style.left = originalStyles.left;
            clonedEl.style.right = originalStyles.right;
            clonedEl.style.bottom = originalStyles.bottom;
            clonedEl.style.zIndex = originalStyles.zIndex;
            clonedEl.style.transform = originalStyles.transform;
          }
        };
        
        // Copy styles for the main element and all children
        const originalElements = element.querySelectorAll('*');
        const clonedElements = clonedElement.querySelectorAll('*');
        
        copyStyles(element, clonedElement);
        
        originalElements.forEach((original, index) => {
          if (clonedElements[index]) {
            copyStyles(original, clonedElements[index]);
          }
        });
        
        // Force all images to be visible and properly loaded
        clonedElement.querySelectorAll('img').forEach(img => {
          img.style.display = 'block';
          img.style.visibility = 'visible';
          img.style.opacity = '1';
          img.style.filter = 'none'; // Remove any filters that might darken
        });
        
        // Ensure text is properly visible
        clonedElement.querySelectorAll('*').forEach(el => {
          const htmlEl = el as HTMLElement;
          const computedStyle = window.getComputedStyle(el);
          if (computedStyle.color.includes('var(--')) {
            // Resolve color variables
            const resolvedColor = computedStyle.color.replace(/var\(([^)]+)\)/g, (match, varName) => {
              const cleanVarName = varName.split(',')[0].trim();
              return originalStyles.getPropertyValue(cleanVarName) || match;
            });
            htmlEl.style.color = resolvedColor;
          }
        });
        
        // Wait for the clone to settle
        return new Promise(resolve => setTimeout(resolve, 200));
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
    link.href = canvas.toDataURL('image/png', 1.0);
    
    // Ensure link is properly handled
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Enhanced image download completed successfully');
  } catch (error) {
    console.error('Error generating enhanced image:', error);
    throw new Error('Failed to generate high-quality image');
  }
};

export const downloadAsPDF = async (
  elementId: string, 
  fileName: string = 'wedding-card'
) => {
  console.log('Starting enhanced PDF download for element:', elementId);
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error('Element not found for download:', elementId);
    throw new Error('Card preview not found');
  }

  try {
    // Wait for fonts to load
    console.log('Waiting for fonts to load...');
    await waitForFonts();
    
    // Wait for images to load
    console.log('Waiting for images to load...');
    await waitForImages(element);
    
    // Force reflow to ensure all styles are applied
    console.log('Forcing reflow...');
    forceReflow(element);
    
    // Additional delay to ensure everything is rendered
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Use high scale for PDF quality (300 DPI equivalent)
    const scale = 4;
    const pixelRatio = window.devicePixelRatio || 1;
    const finalScale = scale * pixelRatio;
    
    console.log('Capturing element for PDF with html2canvas...', { scale: finalScale });
    
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff', // White background for PDF
      scale: finalScale,
      logging: false,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
      imageTimeout: 30000,
      width: element.offsetWidth,
      height: element.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.offsetWidth,
      windowHeight: element.offsetHeight,
      x: 0,
      y: 0,
      onclone: (clonedDoc, clonedElement) => {
        console.log('Cloning document for PDF capture...');
        
        // Hide scrollbars
        clonedDoc.body.style.overflow = 'hidden';
        clonedDoc.documentElement.style.overflow = 'hidden';
        
        // Ensure the cloned element is properly positioned
        clonedElement.style.position = 'relative';
        clonedElement.style.display = 'block';
        clonedElement.style.visibility = 'visible';
        clonedElement.style.opacity = '1';
        clonedElement.style.transform = 'none';
        clonedElement.style.margin = '0';
        clonedElement.style.padding = '0';
        
        // ALWAYS hide gridlines during PDF capture (regardless of toggle state)
        const gridOverlay = clonedElement.querySelector('.grid-overlay');
        if (gridOverlay) {
          (gridOverlay as HTMLElement).style.display = 'none';
        }
        
        // Hide all grid-related elements
        clonedElement.querySelectorAll('[class*="grid-overlay"], [class*="Grid"], .grid-overlay').forEach(el => {
          (el as HTMLElement).style.display = 'none';
        });

        // Copy computed styles more comprehensively
        const copyStyles = (original: Element, cloned: Element) => {
          const originalStyles = window.getComputedStyle(original);
          const clonedEl = cloned as HTMLElement;
          
          // Important style properties to copy
          const criticalStyles = [
            'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight',
            'color', 'backgroundColor', 'background', 'backgroundImage',
            'backgroundSize', 'backgroundPosition', 'backgroundRepeat',
            'padding', 'margin', 'border', 'borderRadius', 'textAlign',
            'display', 'position', 'top', 'left', 'right', 'bottom',
            'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
            'zIndex', 'opacity', 'transform', 'boxShadow', 'textShadow',
            'letterSpacing', 'wordSpacing', 'textDecoration', 'textTransform'
          ];
          
          criticalStyles.forEach(prop => {
            try {
              const value = originalStyles.getPropertyValue(prop);
              if (value) {
                clonedEl.style.setProperty(prop, value);
              }
            } catch (e) {
              // Ignore errors for read-only properties
            }
          });
          
          // Handle absolute positioning specifically
          if (originalStyles.position === 'absolute') {
            clonedEl.style.position = 'absolute';
            clonedEl.style.top = originalStyles.top;
            clonedEl.style.left = originalStyles.left;
            clonedEl.style.right = originalStyles.right;
            clonedEl.style.bottom = originalStyles.bottom;
            clonedEl.style.zIndex = originalStyles.zIndex;
            clonedEl.style.transform = originalStyles.transform;
          }
        };
        
        // Copy styles for the main element and all children
        const originalElements = element.querySelectorAll('*');
        const clonedElements = clonedElement.querySelectorAll('*');
        
        copyStyles(element, clonedElement);
        
        originalElements.forEach((original, index) => {
          if (clonedElements[index]) {
            copyStyles(original, clonedElements[index]);
          }
        });
        
        // Force all images to be visible
        clonedElement.querySelectorAll('img').forEach(img => {
          img.style.display = 'block';
          img.style.visibility = 'visible';
          img.style.opacity = '1';
        });
        
        // Wait a bit more for the clone to settle
        return new Promise(resolve => setTimeout(resolve, 100));
      }
    });

    console.log('Canvas created for PDF, size:', canvas.width, 'x', canvas.height);
    
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Generated canvas is empty');
    }

    // Create high-quality PDF
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Calculate card dimensions (assuming card is 3:4 aspect ratio)
    const cardAspectRatio = 3 / 4;
    const canvasAspectRatio = canvas.width / canvas.height;
    
    // Create PDF with custom dimensions that match the card
    const cardWidth = 210; // A4 width in mm
    const cardHeight = cardWidth / cardAspectRatio;
    
    const pdf = new jsPDF({
      orientation: cardHeight > cardWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: [cardWidth, cardHeight],
      compress: true,
      putOnlyUsedFonts: true
    });

    // Set PDF metadata
    pdf.setProperties({
      title: `${fileName} - Wedding Invitation`,
      subject: 'Wedding Invitation Card',
      author: 'Digital Wedding Cards',
      creator: 'Digital Wedding Cards Platform',
      keywords: 'wedding, invitation, card, digital'
    });

    // Calculate image dimensions to fill the page without borders
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    let imgWidth, imgHeight;
    
    if (canvasAspectRatio > pageWidth / pageHeight) {
      // Canvas is wider than page ratio
      imgWidth = pageWidth;
      imgHeight = pageWidth / canvasAspectRatio;
    } else {
      // Canvas is taller than page ratio
      imgHeight = pageHeight;
      imgWidth = pageHeight * canvasAspectRatio;
    }
    
    // Center the image on the page
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    // Add the image to fill the entire page
    pdf.addImage(
      imgData, 
      'PNG', 
      x, 
      y, 
      imgWidth, 
      imgHeight, 
      undefined, 
      'FAST'
    );

    // Save the PDF
    pdf.save(`${fileName}.pdf`);
    console.log('Enhanced PDF download completed successfully');
  } catch (error) {
    console.error('Error generating enhanced PDF:', error);
    throw new Error('Failed to generate high-quality PDF');
  }
};
