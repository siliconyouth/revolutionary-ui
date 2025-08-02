import React from 'react';
import { PropertyEditorProps } from '../../core/types';

export function StringEditor({ value, onChange, schema }: PropertyEditorProps) {
  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={schema.placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    />
  );
}