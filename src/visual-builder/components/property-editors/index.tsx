import React from 'react';
import { PropSchema, PropertyEditorProps } from '../../core/types';
import { StringEditor } from './StringEditor';
import { NumberEditor } from './NumberEditor';
import { BooleanEditor } from './BooleanEditor';
import { SelectEditor } from './SelectEditor';
import { ColorEditor } from './ColorEditor';
import { SpacingEditor } from './SpacingEditor';
import { ActionEditor } from './ActionEditor';

const editors = {
  string: StringEditor,
  number: NumberEditor,
  boolean: BooleanEditor,
  select: SelectEditor,
  color: ColorEditor,
  spacing: SpacingEditor,
  action: ActionEditor,
  // Add more editors as needed
};

interface PropertyEditorWrapperProps extends PropertyEditorProps {
  schema: PropSchema;
}

export function PropertyEditor({
  schema,
  value,
  onChange,
  componentProps
}: PropertyEditorWrapperProps) {
  const EditorComponent = editors[schema.type] || StringEditor;

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {schema.label}
        {schema.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <EditorComponent
        value={value}
        onChange={onChange}
        schema={schema}
        componentProps={componentProps}
      />
      
      {schema.helperText && (
        <p className="text-xs text-gray-500 mt-1">{schema.helperText}</p>
      )}
    </div>
  );
}