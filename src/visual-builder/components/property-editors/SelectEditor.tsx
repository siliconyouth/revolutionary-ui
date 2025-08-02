import React from 'react';
import { PropertyEditorProps } from '../../core/types';

export function SelectEditor({ value, onChange, schema }: PropertyEditorProps) {
  if (!schema.options) return null;

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    >
      {schema.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}