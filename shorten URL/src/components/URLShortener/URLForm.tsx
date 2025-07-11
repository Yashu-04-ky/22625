import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Collapse,
  Alert,
  InputAdornment,
  FormHelperText
} from '@mui/material';
import { Add, Remove, Link, Timer, Code } from '@mui/icons-material';
import { URLFormData, ValidationError } from '../../types';
import { logger } from '../../services/LoggingService';

interface URLFormProps {
  onSubmit: (urls: URLFormData[]) => void;
  isLoading?: boolean;
}

const URLForm: React.FC<URLFormProps> = ({ onSubmit, isLoading = false }) => {
  const MODULE_NAME = 'URLForm';
  const [forms, setForms] = useState<URLFormData[]>([
    { originalUrl: '', validityMinutes: 30, customShortCode: '' }
  ]);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});

  const addForm = () => {
    if (forms.length < 5) {
      setForms([...forms, { originalUrl: '', validityMinutes: 30, customShortCode: '' }]);
      logger.info('Added new URL form', { totalForms: forms.length + 1 }, MODULE_NAME);
    }
  };

  const removeForm = (index: number) => {
    if (forms.length > 1) {
      const newForms = forms.filter((_, i) => i !== index);
      setForms(newForms);
      
      // Remove errors for this form
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
      
      logger.info('Removed URL form', { 
        removedIndex: index, 
        totalForms: newForms.length 
      }, MODULE_NAME);
    }
  };

  const updateForm = (index: number, field: keyof URLFormData, value: string | number) => {
    const newForms = [...forms];
    newForms[index] = { ...newForms[index], [field]: value };
    setForms(newForms);

    // Clear error for this field
    if (errors[index]?.[field]) {
      const newErrors = { ...errors };
      delete newErrors[index][field];
      setErrors(newErrors);
    }

    logger.debug('Updated form field', { 
      index, 
      field, 
      value: typeof value === 'string' ? value.substring(0, 50) : value 
    }, MODULE_NAME);
  };

  const validateForm = (formData: URLFormData, index: number): ValidationError[] => {
    const validationErrors: ValidationError[] = [];

    // Validate URL
    if (!formData.originalUrl.trim()) {
      validationErrors.push({ field: 'originalUrl', message: 'URL is required' });
    } else {
      try {
        new URL(formData.originalUrl);
      } catch {
        validationErrors.push({ field: 'originalUrl', message: 'Please enter a valid URL' });
      }
    }

    // Validate validity minutes
    if (formData.validityMinutes < 1 || formData.validityMinutes > 43200) {
      validationErrors.push({ 
        field: 'validityMinutes', 
        message: 'Validity must be between 1 and 43200 minutes' 
      });
    }

    // Validate custom short code if provided
    if (formData.customShortCode.trim()) {
      const shortCodeRegex = /^[a-zA-Z0-9]{3,20}$/;
      if (!shortCodeRegex.test(formData.customShortCode)) {
        validationErrors.push({ 
          field: 'customShortCode', 
          message: 'Short code must be 3-20 alphanumeric characters' 
        });
      }
    }

    return validationErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logger.info('Form submission started', { formsCount: forms.length }, MODULE_NAME);

    const newErrors: Record<number, Record<string, string>> = {};
    let hasErrors = false;

    // Validate all forms
    forms.forEach((form, index) => {
      const validationErrors = validateForm(form, index);
      if (validationErrors.length > 0) {
        newErrors[index] = {};
        validationErrors.forEach(error => {
          newErrors[index][error.field] = error.message;
        });
        hasErrors = true;
      }
    });

    // Check for duplicate custom short codes
    const customShortCodes = forms
      .map((form, index) => ({ code: form.customShortCode.trim(), index }))
      .filter(item => item.code);

    const duplicates = customShortCodes.filter((item, index) => 
      customShortCodes.findIndex(other => other.code === item.code) !== index
    );

    duplicates.forEach(({ index }) => {
      if (!newErrors[index]) newErrors[index] = {};
      newErrors[index].customShortCode = 'Duplicate short code in form';
      hasErrors = true;
    });

    setErrors(newErrors);

    if (hasErrors) {
      logger.warn('Form validation failed', { errorCount: Object.keys(newErrors).length }, MODULE_NAME);
      return;
    }

    // Filter out empty forms
    const validForms = forms.filter(form => form.originalUrl.trim());
    
    if (validForms.length === 0) {
      logger.warn('No valid forms to submit', {}, MODULE_NAME);
      return;
    }

    logger.info('Form validation passed, submitting', { validForms: validForms.length }, MODULE_NAME);
    onSubmit(validForms);
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Link sx={{ mr: 1 }} />
          URL Shortener
        </Typography>

        <form onSubmit={handleSubmit}>
          {forms.map((form, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Collapse in={true}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="primary">
                      URL #{index + 1}
                    </Typography>
                    {forms.length > 1 && (
                      <IconButton
                        onClick={() => removeForm(index)}
                        color="error"
                        size="small"
                      >
                        <Remove />
                      </IconButton>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Original URL"
                      placeholder="https://example.com"
                      value={form.originalUrl}
                      onChange={(e) => updateForm(index, 'originalUrl', e.target.value)}
                      error={!!errors[index]?.originalUrl}
                      helperText={errors[index]?.originalUrl}
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Link />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <TextField
                        label="Validity (minutes)"
                        type="number"
                        value={form.validityMinutes}
                        onChange={(e) => updateForm(index, 'validityMinutes', parseInt(e.target.value) || 30)}
                        error={!!errors[index]?.validityMinutes}
                        helperText={errors[index]?.validityMinutes || "Default: 30 minutes"}
                        sx={{ minWidth: 200 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Timer />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        label="Custom Short Code (optional)"
                        placeholder="mycode123"
                        value={form.customShortCode}
                        onChange={(e) => updateForm(index, 'customShortCode', e.target.value)}
                        error={!!errors[index]?.customShortCode}
                        helperText={errors[index]?.customShortCode || "3-20 alphanumeric characters"}
                        sx={{ minWidth: 200 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Code />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  </Box>
                </Card>
              </Collapse>
            </Box>
          ))}

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 3 }}>
            {forms.length < 5 && (
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={addForm}
                disabled={isLoading}
              >
                Add URL ({forms.length}/5)
              </Button>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ ml: 'auto' }}
            >
              {isLoading ? 'Shortening...' : 'Shorten URLs'}
            </Button>
          </Box>
        </form>

        {forms.length === 5 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Maximum of 5 URLs can be shortened at once.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default URLForm;