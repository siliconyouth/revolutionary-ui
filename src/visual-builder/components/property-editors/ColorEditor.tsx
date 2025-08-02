import React from 'react';
import { PropertyEditorProps } from '../../core/types';

export function ColorEditor({ value, onChange }: PropertyEditorProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
      />
      <input
        type="text"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
      />
    </div>
  );
}