// Security utilities for input validation and sanitization

// Input sanitization function to prevent XSS attacks
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove potentially dangerous characters and HTML tags
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .replace(/data:/gi, '') // Remove data: protocol
    .trim();
};

// Validate text content with length limits
export const validateTextContent = (
  input: string, 
  maxLength: number = 500,
  fieldName: string = 'Input'
): { isValid: boolean; error?: string; sanitized: string } => {
  if (!input) {
    return { isValid: false, error: `${fieldName} is required`, sanitized: '' };
  }
  
  const sanitized = sanitizeInput(input);
  
  if (sanitized.length === 0) {
    return { isValid: false, error: `${fieldName} cannot be empty after sanitization`, sanitized };
  }
  
  if (sanitized.length > maxLength) {
    return { 
      isValid: false, 
      error: `${fieldName} must be ${maxLength} characters or less`, 
      sanitized 
    };
  }
  
  return { isValid: true, sanitized };
};

// Validate email format
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

// Validate user names (bride/groom names)
export const validateName = (name: string): { isValid: boolean; error?: string; sanitized: string } => {
  return validateTextContent(name, 100, 'Name');
};

// Validate venue text
export const validateVenue = (venue: string): { isValid: boolean; error?: string; sanitized: string } => {
  return validateTextContent(venue, 200, 'Venue');
};

// Validate message content
export const validateMessage = (message: string): { isValid: boolean; error?: string; sanitized: string } => {
  return validateTextContent(message, 1000, 'Message');
};

// Validate wedding date format
export const validateWeddingDate = (date: string): { isValid: boolean; error?: string } => {
  if (!date) {
    return { isValid: false, error: 'Wedding date is required' };
  }
  
  // Check if it's a valid date format
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }
  
  // Check if date is not in the past (optional, you might want future dates)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (dateObj < today) {
    return { isValid: false, error: 'Wedding date cannot be in the past' };
  }
  
  return { isValid: true };
};

// Validate file uploads (basic MIME type checking)
export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Only JPEG, PNG, and WebP images are allowed' 
    };
  }
  
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: 'File size must be less than 5MB' 
    };
  }
  
  return { isValid: true };
};

// Secure display function to safely render user content
export const secureDisplay = (content: string): string => {
  return sanitizeInput(content);
};