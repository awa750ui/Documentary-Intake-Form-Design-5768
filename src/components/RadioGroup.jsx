import React from 'react';
import FormField from './FormField';

const RadioGroup = ({ 
  label, 
  required, 
  options, 
  value, 
  onChange, 
  error 
}) => {
  return (
    <FormField label={label} required={required} error={error}>
      <div className="space-y-3">
        {options.map((option) => (
          <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name={label}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-400 focus:ring-2"
            />
            <span className="text-gray-200">{option.label}</span>
          </label>
        ))}
      </div>
    </FormField>
  );
};

export default RadioGroup;