// Security utilities for input validation and sanitization

// Enhanced input sanitization function to prevent XSS attacks
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  console.log('Input before sanitization:', JSON.stringify(input));
  
  let sanitized = input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/script:/gi, '')
    .replace(/&lt;script/gi, '')
    .replace(/&gt;/gi, '');
  
  const result = sanitized.replace(/^\s+|\s+$/g, '');
  console.log('Output after sanitization:', JSON.stringify(result));
  
  return result;
};

// Enhanced sanitization for rich text content
export const sanitizeRichText = (input: string): string => {
  if (!input) return '';
  
  // More aggressive sanitization for rich text areas
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embed tags
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '') // Remove event handlers
    .replace(/on\w+\s*=\s*'[^']*'/gi, '') // Remove event handlers with single quotes
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
};

// Rate limiting validation
export const validateRateLimit = (
  operationType: string,
  maxOperations: number = 10,
  timeWindowMinutes: number = 60
): { isValid: boolean; error?: string } => {
  const storageKey = `rate_limit_${operationType}`;
  const now = Date.now();
  const timeWindow = timeWindowMinutes * 60 * 1000; // Convert to milliseconds
  
  try {
    const storedData = localStorage.getItem(storageKey);
    const operations = storedData ? JSON.parse(storedData) : [];
    
    // Filter out operations outside the time window
    const recentOperations = operations.filter((timestamp: number) => 
      now - timestamp < timeWindow
    );
    
    if (recentOperations.length >= maxOperations) {
      return {
        isValid: false,
        error: `Too many ${operationType} operations. Please wait before trying again.`
      };
    }
    
    // Add current operation and store
    recentOperations.push(now);
    localStorage.setItem(storageKey, JSON.stringify(recentOperations));
    
    return { isValid: true };
  } catch (error) {
    // If localStorage fails, allow the operation but log the error
    console.warn('Rate limiting storage failed:', error);
    return { isValid: true };
  }
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

// Comprehensive form validation with security checks
export const validateFormData = (data: Record<string, any>): { 
  isValid: boolean; 
  errors: Record<string, string>; 
  sanitizedData: Record<string, any> 
} => {
  const errors: Record<string, string> = {};
  const sanitizedData: Record<string, any> = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (typeof value === 'string') {
      // Apply appropriate sanitization based on field type
      if (key.includes('message') || key.includes('description')) {
        sanitizedData[key] = sanitizeRichText(value);
      } else {
        sanitizedData[key] = sanitizeInput(value);
      }
      
      // Check for suspicious patterns
      if (value.match(/<script|javascript:|vbscript:|data:|file:/i)) {
        errors[key] = `${key} contains potentially harmful content`;
      }
      
      // Check for excessive length (basic DoS prevention)
      if (value.length > 10000) {
        errors[key] = `${key} is too long (maximum 10,000 characters)`;
      }
    } else {
      sanitizedData[key] = value;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
};

// Enhanced credit operation validation
export const validateCreditOperation = (
  amount: number,
  operationType: string
): { isValid: boolean; error?: string } => {
  // Validate amount
  if (!Number.isInteger(amount) || amount <= 0) {
    return {
      isValid: false,
      error: 'Credit amount must be a positive integer'
    };
  }
  
  if (amount > 1000) {
    return {
      isValid: false,
      error: 'Credit amount cannot exceed 1000 per operation'
    };
  }
  
  // Rate limiting for credit operations
  return validateRateLimit(`credit_${operationType}`, 20, 60);
};