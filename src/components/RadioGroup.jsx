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
          <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative">
              <input
                type="radio"
                name={label}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                className="w-4 h-4 text-blue-500 bg-gray-700/80 border-gray-600/80 focus:ring-blue-400 focus:ring-2"
              />
              <div className={`absolute -inset-1 rounded-full ${value === option.value ? 'bg-blue-400/20' : 'bg-transparent'} transition-all duration-200`}></div>
            </div>
            <span className="text-gray-200 group-hover:text-blue-300 transition-colors duration-200">{option.label}</span>
          </label>
        ))}
      </div>
    </FormField>
  );
};

export default RadioGroup;