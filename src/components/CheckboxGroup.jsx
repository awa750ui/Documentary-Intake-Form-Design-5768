import React from 'react';
import FormField from './FormField';

const CheckboxGroup = ({ 
  label, 
  required, 
  options, 
  values, 
  onChange, 
  otherValue, 
  onOtherChange, 
  error 
}) => {
  const handleCheckboxChange = (option) => {
    if (values.includes(option)) {
      onChange(values.filter(v => v !== option));
    } else {
      onChange([...values, option]);
    }
  };

  const isOtherSelected = values.includes('Other');

  return (
    <FormField label={label} required={required} error={error}>
      <div className="space-y-3">
        {options.map((option) => (
          <label key={option} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={values.includes(option)}
              onChange={() => handleCheckboxChange(option)}
              className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-400 focus:ring-2"
            />
            <span className="text-gray-200">{option}</span>
          </label>
        ))}
        {isOtherSelected && (
          <div className="ml-7 mt-2">
            <input
              type="text"
              value={otherValue}
              onChange={(e) => onOtherChange(e.target.value)}
              placeholder="Please specify..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
            />
          </div>
        )}
      </div>
    </FormField>
  );
};

export default CheckboxGroup;