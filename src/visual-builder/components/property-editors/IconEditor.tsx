import React, { useState } from 'react';
import { PropertyEditorProps } from '../../core/types';

const popularIcons = [
  '🏠', '⚙️', '📧', '📱', '💬', '🔔', '⭐', '❤️', '👤', '🔍',
  '📷', '🎵', '🎮', '✈️', '🚗', '⚡', '🔥', '💡', '🎯', '🚀',
  '📊', '📈', '💰', '🛒', '🎁', '📅', '⏰', '🌍', '🔒', '✅',
];

export function IconEditor({ value, onChange, schema }: PropertyEditorProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = searchTerm
    ? popularIcons.filter(icon => 
        icon.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : popularIcons;

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          <span className="text-xl">{value || '🎨'}</span>
          <span>Choose icon</span>
        </button>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter emoji or icon"
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {showPicker && (
        <div className="absolute z-10 mt-2 p-3 bg-white rounded-lg shadow-lg border border-gray-200 w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search icons..."
            className="w-full px-2 py-1 mb-3 text-sm border border-gray-300 rounded"
          />
          <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
            {filteredIcons.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => {
                  onChange(icon);
                  setShowPicker(false);
                }}
                className="p-2 text-2xl hover:bg-gray-100 rounded"
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}