import React, { useState } from 'react';
import { PropertyEditorProps } from '../../core/types';

export function ImageEditor({ value, onChange, schema }: PropertyEditorProps) {
  const [showUpload, setShowUpload] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would upload to a server
      // For demo, we'll use a data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter image URL..."
        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
      />
      
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowUpload(!showUpload)}
          className="px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200"
        >
          Upload Image
        </button>
        
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700"
          >
            Clear
          </button>
        )}
      </div>

      {showUpload && (
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="w-full text-sm"
        />
      )}

      {value && (
        <div className="mt-2">
          <img
            src={value}
            alt="Preview"
            className="w-full h-32 object-cover rounded border border-gray-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Invalid+Image';
            }}
          />
        </div>
      )}
    </div>
  );
}