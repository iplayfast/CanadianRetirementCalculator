import { useState } from 'react';

type ValidationFunction = (value: any) => boolean;

interface FormField {
  value: any;
  validate?: ValidationFunction;
  error?: string;
}

interface FormFields {
  [key: string]: FormField;
}

/**
 * Custom hook for form management
 * @param initialValues Initial form values
 * @returns Form state and handlers
 */
export const useForm = (initialValues: { [key: string]: any }) => {
  // Convert initial values to form fields
  const initialFields: FormFields = Object.keys(initialValues).reduce((acc, key) => {
    acc[key] = { value: initialValues[key] };
    return acc;
  }, {} as FormFields);

  const [fields, setFields] = useState<FormFields>(initialFields);

  // Update a field value
  const setFieldValue = (fieldName: string, value: any) => {
    setFields((prevFields) => ({
      ...prevFields,
      [fieldName]: {
        ...prevFields[fieldName],
        value,
        error: prevFields[fieldName].validate ? 
          (prevFields[fieldName].validate!(value) ? undefined : 'Invalid value') : 
          undefined,
      },
    }));
  };

  // Set field validation
  const setFieldValidation = (fieldName: string, validate: ValidationFunction, errorMessage: string = 'Invalid value') => {
    setFields((prevFields) => ({
      ...prevFields,
      [fieldName]: {
        ...prevFields[fieldName],
        validate,
        error: validate(prevFields[fieldName].value) ? undefined : errorMessage,
      },
    }));
  };

  // Validate all fields
  const validateForm = (): boolean => {
    let isValid = true;
    
    setFields((prevFields) => {
      const newFields = { ...prevFields };
      
      Object.keys(newFields).forEach((key) => {
        if (newFields[key].validate) {
          const isFieldValid = newFields[key].validate!(newFields[key].value);
          newFields[key] = {
            ...newFields[key],
            error: isFieldValid ? undefined : (newFields[key].error || 'Invalid value'),
          };
          
          if (!isFieldValid) {
            isValid = false;
          }
        }
      });
      
      return newFields;
    });
    
    return isValid;
  };

  // Get all values as an object
  const getValues = () => {
    return Object.keys(fields).reduce((acc, key) => {
      acc[key] = fields[key].value;
      return acc;
    }, {} as { [key: string]: any });
  };

  return {
    fields,
    setFieldValue,
    setFieldValidation,
    validateForm,
    getValues,
  };
};
