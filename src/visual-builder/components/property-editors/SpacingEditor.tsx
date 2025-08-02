import React, { useState } from 'react';
import { PropertyEditorProps } from '../../core/types';

export function SpacingEditor({ value, onChange }: PropertyEditorProps) {
  const [unit, setUnit] = useState('px');
  const numericValue = parseInt(value) || 0;

  const handleValueChange = (newValue: number) => {
    onChange(`${newValue}${unit}`);
  };

  const handleUnitChange = (newUnit: string) => {
    setUnit(newUnit);
    onChange(`${numericValue}${newUnit}`);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min="0"
        max="100"
        value={numericValue}
        onChange={(e) => handleValueChange(Number(e.target.value))}
        className="flex-1"
      />
      <input
        type="number"
        value={numericValue}
        onChange={(e) => handleValueChange(Number(e.target.value))}
        className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
      <select
        value={unit}
        onChange={(e) => handleUnitChange(e.target.value)}
        className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      >
        <option value="px">px</option>
        <option value="%">%</option>
        <option value="rem">rem</option>
        <option value="em">em</option>
      </select>
    </div>
  );
}