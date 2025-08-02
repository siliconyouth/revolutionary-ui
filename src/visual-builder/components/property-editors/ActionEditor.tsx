import React, { useState } from 'react';
import { PropertyEditorProps } from '../../core/types';

const actionTypes = [
  { value: 'navigate', label: 'Navigate to URL' },
  { value: 'alert', label: 'Show Alert' },
  { value: 'console', label: 'Console Log' },
  { value: 'custom', label: 'Custom Function' },
];

export function ActionEditor({ value, onChange, schema }: PropertyEditorProps) {
  const [actionType, setActionType] = useState(value?.type || 'navigate');
  const [actionValue, setActionValue] = useState(value?.value || '');

  const handleUpdate = (type: string, val: string) => {
    onChange({ type, value: val });
  };

  return (
    <div className="space-y-2">
      <select
        value={actionType}
        onChange={(e) => {
          setActionType(e.target.value);
          handleUpdate(e.target.value, actionValue);
        }}
        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
      >
        {actionTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>

      {actionType === 'navigate' && (
        <input
          type="text"
          value={actionValue}
          onChange={(e) => {
            setActionValue(e.target.value);
            handleUpdate(actionType, e.target.value);
          }}
          placeholder="Enter URL..."
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
        />
      )}

      {actionType === 'alert' && (
        <input
          type="text"
          value={actionValue}
          onChange={(e) => {
            setActionValue(e.target.value);
            handleUpdate(actionType, e.target.value);
          }}
          placeholder="Alert message..."
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
        />
      )}

      {actionType === 'console' && (
        <input
          type="text"
          value={actionValue}
          onChange={(e) => {
            setActionValue(e.target.value);
            handleUpdate(actionType, e.target.value);
          }}
          placeholder="Log message..."
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
        />
      )}

      {actionType === 'custom' && (
        <textarea
          value={actionValue}
          onChange={(e) => {
            setActionValue(e.target.value);
            handleUpdate(actionType, e.target.value);
          }}
          placeholder="() => { /* your code */ }"
          rows={3}
          className="w-full px-3 py-1.5 text-sm font-mono border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
        />
      )}
    </div>
  );
}