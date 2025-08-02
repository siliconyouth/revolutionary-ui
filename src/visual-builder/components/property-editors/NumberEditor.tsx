import React from 'react';
import { PropertyEditorProps } from '../../core/types';

export function NumberEditor({ value, onChange, schema }: PropertyEditorProps) {
  return (
    <input
      type="number"
      value={value || 0}
      onChange={(e) => onChange(Number(e.target.value))}
      min={schema.min}
      max={schema.max}
      step={schema.step}
      placeholder={schema.placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    />
  );
}