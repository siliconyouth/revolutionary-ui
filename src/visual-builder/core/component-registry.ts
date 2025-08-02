import { ComponentDefinition } from './types';

export const componentRegistry: ComponentDefinition[] = [
  // Layout Components
  {
    type: 'container',
    name: 'Container',
    category: 'Layout',
    icon: '📦',
    description: 'A flexible container for grouping components',
    defaultProps: {
      padding: '16px',
      margin: '0px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      backgroundColor: 'transparent',
      borderRadius: '0px',
    },
    propSchema: [
      {
        name: 'display',
        label: 'Display',
        type: 'select',
        defaultValue: 'flex',
        options: [
          { label: 'Flex', value: 'flex' },
          { label: 'Grid', value: 'grid' },
          { label: 'Block', value: 'block' },
        ],
        category: 'Layout',
      },
      {
        name: 'flexDirection',
        label: 'Direction',
        type: 'select',
        defaultValue: 'column',
        options: [
          { label: 'Row', value: 'row' },
          { label: 'Column', value: 'column' },
        ],
        category: 'Layout',
        condition: (props) => props.display === 'flex',
      },
      {
        name: 'gap',
        label: 'Gap',
        type: 'spacing',
        defaultValue: '16px',
        category: 'Layout',
      },
      {
        name: 'padding',
        label: 'Padding',
        type: 'spacing',
        defaultValue: '16px',
        category: 'Spacing',
      },
      {
        name: 'margin',
        label: 'Margin',
        type: 'spacing',
        defaultValue: '0px',
        category: 'Spacing',
      },
      {
        name: 'backgroundColor',
        label: 'Background',
        type: 'color',
        defaultValue: 'transparent',
        category: 'Appearance',
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'spacing',
        defaultValue: '0px',
        category: 'Appearance',
      },
    ],
    acceptsChildren: true,
  },
  {
    type: 'grid',
    name: 'Grid',
    category: 'Layout',
    icon: '⚏',
    description: 'CSS Grid container for complex layouts',
    defaultProps: {
      columns: 3,
      rows: 'auto',
      gap: '16px',
      padding: '0px',
    },
    propSchema: [
      {
        name: 'columns',
        label: 'Columns',
        type: 'number',
        defaultValue: 3,
        min: 1,
        max: 12,
        category: 'Grid',
      },
      {
        name: 'rows',
        label: 'Rows',
        type: 'string',
        defaultValue: 'auto',
        placeholder: 'auto, 1fr 2fr, etc.',
        category: 'Grid',
      },
      {
        name: 'gap',
        label: 'Gap',
        type: 'spacing',
        defaultValue: '16px',
        category: 'Grid',
      },
      {
        name: 'padding',
        label: 'Padding',
        type: 'spacing',
        defaultValue: '0px',
        category: 'Spacing',
      },
    ],
    acceptsChildren: true,
  },

  // Basic Components
  {
    type: 'heading',
    name: 'Heading',
    category: 'Text',
    icon: '📝',
    description: 'Text heading (H1-H6)',
    defaultProps: {
      text: 'Heading',
      level: 2,
      color: '#000000',
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'left',
    },
    propSchema: [
      {
        name: 'text',
        label: 'Text',
        type: 'string',
        defaultValue: 'Heading',
        category: 'Content',
      },
      {
        name: 'level',
        label: 'Level',
        type: 'select',
        defaultValue: 2,
        options: [
          { label: 'H1', value: 1 },
          { label: 'H2', value: 2 },
          { label: 'H3', value: 3 },
          { label: 'H4', value: 4 },
          { label: 'H5', value: 5 },
          { label: 'H6', value: 6 },
        ],
        category: 'Content',
      },
      {
        name: 'color',
        label: 'Color',
        type: 'color',
        defaultValue: '#000000',
        category: 'Style',
      },
      {
        name: 'fontSize',
        label: 'Font Size',
        type: 'spacing',
        defaultValue: '24px',
        category: 'Style',
      },
      {
        name: 'fontWeight',
        label: 'Font Weight',
        type: 'select',
        defaultValue: 'bold',
        options: [
          { label: 'Normal', value: 'normal' },
          { label: 'Bold', value: 'bold' },
          { label: 'Light', value: '300' },
        ],
        category: 'Style',
      },
      {
        name: 'textAlign',
        label: 'Alignment',
        type: 'select',
        defaultValue: 'left',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
        category: 'Style',
      },
    ],
    acceptsChildren: false,
  },
  {
    type: 'text',
    name: 'Text',
    category: 'Text',
    icon: '📄',
    description: 'Paragraph text',
    defaultProps: {
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      color: '#333333',
      fontSize: '16px',
      lineHeight: '1.5',
    },
    propSchema: [
      {
        name: 'text',
        label: 'Text',
        type: 'string',
        defaultValue: 'Lorem ipsum...',
        category: 'Content',
      },
      {
        name: 'color',
        label: 'Color',
        type: 'color',
        defaultValue: '#333333',
        category: 'Style',
      },
      {
        name: 'fontSize',
        label: 'Font Size',
        type: 'spacing',
        defaultValue: '16px',
        category: 'Style',
      },
      {
        name: 'lineHeight',
        label: 'Line Height',
        type: 'number',
        defaultValue: 1.5,
        min: 1,
        max: 3,
        step: 0.1,
        category: 'Style',
      },
    ],
    acceptsChildren: false,
  },
  {
    type: 'button',
    name: 'Button',
    category: 'Form',
    icon: '🔘',
    description: 'Interactive button',
    defaultProps: {
      text: 'Click me',
      variant: 'primary',
      size: 'medium',
      fullWidth: false,
      disabled: false,
    },
    propSchema: [
      {
        name: 'text',
        label: 'Text',
        type: 'string',
        defaultValue: 'Click me',
        category: 'Content',
      },
      {
        name: 'variant',
        label: 'Variant',
        type: 'select',
        defaultValue: 'primary',
        options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'Outline', value: 'outline' },
          { label: 'Ghost', value: 'ghost' },
        ],
        category: 'Appearance',
      },
      {
        name: 'size',
        label: 'Size',
        type: 'select',
        defaultValue: 'medium',
        options: [
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
          { label: 'Large', value: 'large' },
        ],
        category: 'Appearance',
      },
      {
        name: 'fullWidth',
        label: 'Full Width',
        type: 'boolean',
        defaultValue: false,
        category: 'Layout',
      },
      {
        name: 'disabled',
        label: 'Disabled',
        type: 'boolean',
        defaultValue: false,
        category: 'State',
      },
      {
        name: 'onClick',
        label: 'Click Action',
        type: 'action',
        category: 'Events',
      },
    ],
    acceptsChildren: false,
  },
  {
    type: 'input',
    name: 'Input',
    category: 'Form',
    icon: '📝',
    description: 'Text input field',
    defaultProps: {
      placeholder: 'Enter text...',
      label: 'Label',
      type: 'text',
      required: false,
      disabled: false,
    },
    propSchema: [
      {
        name: 'label',
        label: 'Label',
        type: 'string',
        defaultValue: 'Label',
        category: 'Content',
      },
      {
        name: 'placeholder',
        label: 'Placeholder',
        type: 'string',
        defaultValue: 'Enter text...',
        category: 'Content',
      },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        defaultValue: 'text',
        options: [
          { label: 'Text', value: 'text' },
          { label: 'Email', value: 'email' },
          { label: 'Password', value: 'password' },
          { label: 'Number', value: 'number' },
          { label: 'Tel', value: 'tel' },
        ],
        category: 'Type',
      },
      {
        name: 'required',
        label: 'Required',
        type: 'boolean',
        defaultValue: false,
        category: 'Validation',
      },
      {
        name: 'disabled',
        label: 'Disabled',
        type: 'boolean',
        defaultValue: false,
        category: 'State',
      },
    ],
    acceptsChildren: false,
  },
  {
    type: 'image',
    name: 'Image',
    category: 'Media',
    icon: '🖼️',
    description: 'Image component',
    defaultProps: {
      src: 'https://via.placeholder.com/300x200',
      alt: 'Placeholder image',
      width: '100%',
      height: 'auto',
      objectFit: 'cover',
    },
    propSchema: [
      {
        name: 'src',
        label: 'Source',
        type: 'image',
        defaultValue: 'https://via.placeholder.com/300x200',
        category: 'Content',
      },
      {
        name: 'alt',
        label: 'Alt Text',
        type: 'string',
        defaultValue: 'Placeholder image',
        category: 'Content',
      },
      {
        name: 'width',
        label: 'Width',
        type: 'spacing',
        defaultValue: '100%',
        category: 'Size',
      },
      {
        name: 'height',
        label: 'Height',
        type: 'spacing',
        defaultValue: 'auto',
        category: 'Size',
      },
      {
        name: 'objectFit',
        label: 'Object Fit',
        type: 'select',
        defaultValue: 'cover',
        options: [
          { label: 'Cover', value: 'cover' },
          { label: 'Contain', value: 'contain' },
          { label: 'Fill', value: 'fill' },
          { label: 'None', value: 'none' },
        ],
        category: 'Size',
      },
    ],
    acceptsChildren: false,
  },

  // Complex Components
  {
    type: 'card',
    name: 'Card',
    category: 'Data Display',
    icon: '🗂️',
    description: 'Content card with header, body, and footer',
    defaultProps: {
      title: 'Card Title',
      description: 'Card description goes here',
      shadow: true,
      padding: '16px',
      borderRadius: '8px',
    },
    propSchema: [
      {
        name: 'title',
        label: 'Title',
        type: 'string',
        defaultValue: 'Card Title',
        category: 'Content',
      },
      {
        name: 'description',
        label: 'Description',
        type: 'string',
        defaultValue: 'Card description',
        category: 'Content',
      },
      {
        name: 'shadow',
        label: 'Shadow',
        type: 'boolean',
        defaultValue: true,
        category: 'Appearance',
      },
      {
        name: 'padding',
        label: 'Padding',
        type: 'spacing',
        defaultValue: '16px',
        category: 'Spacing',
      },
      {
        name: 'borderRadius',
        label: 'Border Radius',
        type: 'spacing',
        defaultValue: '8px',
        category: 'Appearance',
      },
    ],
    acceptsChildren: true,
    childTypes: ['button', 'text', 'image'],
  },
  {
    type: 'list',
    name: 'List',
    category: 'Data Display',
    icon: '📋',
    description: 'Ordered or unordered list',
    defaultProps: {
      items: ['Item 1', 'Item 2', 'Item 3'],
      ordered: false,
      spacing: '8px',
    },
    propSchema: [
      {
        name: 'items',
        label: 'Items',
        type: 'multiselect',
        defaultValue: ['Item 1', 'Item 2', 'Item 3'],
        category: 'Content',
      },
      {
        name: 'ordered',
        label: 'Ordered',
        type: 'boolean',
        defaultValue: false,
        category: 'Type',
      },
      {
        name: 'spacing',
        label: 'Item Spacing',
        type: 'spacing',
        defaultValue: '8px',
        category: 'Layout',
      },
    ],
    acceptsChildren: false,
  },
  // Additional Components for Templates
  {
    type: 'badge',
    name: 'Badge',
    category: 'Data Display',
    icon: '🏷️',
    description: 'Status badge or label',
    defaultProps: {
      text: 'New',
      backgroundColor: '#e5e7eb',
      color: '#374151',
      fontSize: '12px',
      padding: '2px 8px',
      borderRadius: '4px'
    },
    propSchema: [
      {
        name: 'text',
        label: 'Text',
        type: 'string',
        defaultValue: 'New',
        category: 'Content',
      },
      {
        name: 'backgroundColor',
        label: 'Background',
        type: 'color',
        defaultValue: '#e5e7eb',
        category: 'Style',
      },
      {
        name: 'color',
        label: 'Text Color',
        type: 'color',
        defaultValue: '#374151',
        category: 'Style',
      },
      {
        name: 'fontSize',
        label: 'Font Size',
        type: 'spacing',
        defaultValue: '12px',
        category: 'Style',
      },
    ],
    acceptsChildren: false,
  },
  {
    type: 'icon',
    name: 'Icon',
    category: 'Media',
    icon: '🎨',
    description: 'Icon element',
    defaultProps: {
      icon: '⭐',
      size: '24px',
      color: '#000000'
    },
    propSchema: [
      {
        name: 'icon',
        label: 'Icon',
        type: 'icon',
        defaultValue: '⭐',
        category: 'Content',
      },
      {
        name: 'size',
        label: 'Size',
        type: 'spacing',
        defaultValue: '24px',
        category: 'Size',
      },
      {
        name: 'color',
        label: 'Color',
        type: 'color',
        defaultValue: '#000000',
        category: 'Style',
      },
    ],
    acceptsChildren: false,
  },
  {
    type: 'divider',
    name: 'Divider',
    category: 'Layout',
    icon: '➖',
    description: 'Horizontal divider',
    defaultProps: {
      margin: '16px 0',
      borderColor: '#e5e7eb',
      borderWidth: '1px'
    },
    propSchema: [
      {
        name: 'margin',
        label: 'Margin',
        type: 'spacing',
        defaultValue: '16px 0',
        category: 'Spacing',
      },
      {
        name: 'borderColor',
        label: 'Color',
        type: 'color',
        defaultValue: '#e5e7eb',
        category: 'Style',
      },
      {
        name: 'text',
        label: 'Text (optional)',
        type: 'string',
        category: 'Content',
      },
    ],
    acceptsChildren: false,
  },
  {
    type: 'link',
    name: 'Link',
    category: 'Text',
    icon: '🔗',
    description: 'Hyperlink',
    defaultProps: {
      text: 'Click here',
      href: '#',
      color: '#3b82f6',
      textDecoration: 'underline'
    },
    propSchema: [
      {
        name: 'text',
        label: 'Text',
        type: 'string',
        defaultValue: 'Click here',
        category: 'Content',
      },
      {
        name: 'href',
        label: 'URL',
        type: 'string',
        defaultValue: '#',
        category: 'Content',
      },
      {
        name: 'color',
        label: 'Color',
        type: 'color',
        defaultValue: '#3b82f6',
        category: 'Style',
      },
      {
        name: 'target',
        label: 'Target',
        type: 'select',
        defaultValue: '_self',
        options: [
          { label: 'Same Window', value: '_self' },
          { label: 'New Window', value: '_blank' },
        ],
        category: 'Behavior',
      },
    ],
    acceptsChildren: false,
  },
  {
    type: 'textarea',
    name: 'Textarea',
    category: 'Form',
    icon: '📝',
    description: 'Multi-line text input',
    defaultProps: {
      placeholder: 'Enter text...',
      rows: 4,
      required: false
    },
    propSchema: [
      {
        name: 'label',
        label: 'Label',
        type: 'string',
        category: 'Content',
      },
      {
        name: 'placeholder',
        label: 'Placeholder',
        type: 'string',
        defaultValue: 'Enter text...',
        category: 'Content',
      },
      {
        name: 'rows',
        label: 'Rows',
        type: 'number',
        defaultValue: 4,
        min: 2,
        max: 20,
        category: 'Size',
      },
      {
        name: 'required',
        label: 'Required',
        type: 'boolean',
        defaultValue: false,
        category: 'Validation',
      },
    ],
    acceptsChildren: false,
  },
  {
    type: 'form',
    name: 'Form',
    category: 'Form',
    icon: '📋',
    description: 'Form container',
    defaultProps: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    propSchema: [
      {
        name: 'action',
        label: 'Action URL',
        type: 'string',
        category: 'Form',
      },
      {
        name: 'method',
        label: 'Method',
        type: 'select',
        defaultValue: 'POST',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
        ],
        category: 'Form',
      },
      {
        name: 'gap',
        label: 'Field Spacing',
        type: 'spacing',
        defaultValue: '16px',
        category: 'Layout',
      },
    ],
    acceptsChildren: true,
  },
  {
    type: 'navigation',
    name: 'Navigation',
    category: 'Layout',
    icon: '🧭',
    description: 'Navigation container',
    defaultProps: {
      display: 'flex',
      gap: '24px',
      alignItems: 'center'
    },
    propSchema: [
      {
        name: 'display',
        label: 'Display',
        type: 'select',
        defaultValue: 'flex',
        options: [
          { label: 'Flex', value: 'flex' },
          { label: 'Block', value: 'block' },
        ],
        category: 'Layout',
      },
      {
        name: 'gap',
        label: 'Gap',
        type: 'spacing',
        defaultValue: '24px',
        category: 'Layout',
      },
    ],
    acceptsChildren: true,
  },
  {
    type: 'checkbox',
    name: 'Checkbox',
    category: 'Form',
    icon: '☑️',
    description: 'Checkbox input',
    defaultProps: {
      label: 'Checkbox',
      checked: false,
      required: false
    },
    propSchema: [
      {
        name: 'label',
        label: 'Label',
        type: 'string',
        defaultValue: 'Checkbox',
        category: 'Content',
      },
      {
        name: 'checked',
        label: 'Checked',
        type: 'boolean',
        defaultValue: false,
        category: 'State',
      },
      {
        name: 'required',
        label: 'Required',
        type: 'boolean',
        defaultValue: false,
        category: 'Validation',
      },
    ],
    acceptsChildren: false,
  },
  {
    type: 'select',
    name: 'Select',
    category: 'Form',
    icon: '📑',
    description: 'Dropdown select',
    defaultProps: {
      label: 'Select',
      placeholder: 'Choose...',
      options: ['Option 1', 'Option 2', 'Option 3'],
      required: false
    },
    propSchema: [
      {
        name: 'label',
        label: 'Label',
        type: 'string',
        defaultValue: 'Select',
        category: 'Content',
      },
      {
        name: 'placeholder',
        label: 'Placeholder',
        type: 'string',
        defaultValue: 'Choose...',
        category: 'Content',
      },
      {
        name: 'options',
        label: 'Options',
        type: 'multiselect',
        defaultValue: ['Option 1', 'Option 2', 'Option 3'],
        category: 'Content',
      },
      {
        name: 'required',
        label: 'Required',
        type: 'boolean',
        defaultValue: false,
        category: 'Validation',
      },
    ],
    acceptsChildren: false,
  },
];

// Helper functions to work with the registry
export function getComponentDefinition(type: string): ComponentDefinition | undefined {
  return componentRegistry.find(c => c.type === type);
}

export function getComponentsByCategory(category: string): ComponentDefinition[] {
  return componentRegistry.filter(c => c.category === category);
}

export function getCategories(): string[] {
  return Array.from(new Set(componentRegistry.map(c => c.category)));
}

export function canAcceptChild(parentType: string, childType: string): boolean {
  const parent = getComponentDefinition(parentType);
  if (!parent || !parent.acceptsChildren) return false;
  if (!parent.childTypes || parent.childTypes.length === 0) return true;
  return parent.childTypes.includes(childType);
}

export function canHaveParent(childType: string, parentType: string): boolean {
  const child = getComponentDefinition(childType);
  if (!child) return false;
  if (!child.parentTypes || child.parentTypes.length === 0) return true;
  return child.parentTypes.includes(parentType);
}