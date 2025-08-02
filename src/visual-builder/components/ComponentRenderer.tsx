import React from 'react';
import { ComponentNode } from '../core/types';
import { getComponentDefinition } from '../core/component-registry';

interface ComponentRendererProps {
  node: ComponentNode;
  isSelected: boolean;
  isHovered: boolean;
  onClick: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  children?: React.ReactNode;
}

export function ComponentRenderer({
  node,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  children,
}: ComponentRendererProps) {
  const definition = getComponentDefinition(node.type);
  if (!definition) return null;

  const renderComponent = () => {
    const { props } = node;
    
    switch (node.type) {
      case 'container':
        return (
          <div
            style={{
              display: props.display || 'flex',
              flexDirection: props.flexDirection || 'column',
              gap: props.gap || '16px',
              padding: props.padding || '16px',
              margin: props.margin || '0px',
              backgroundColor: props.backgroundColor || 'transparent',
              borderRadius: props.borderRadius || '0px',
              ...(props.style || {}),
            }}
            className={props.className}
            data-drop-container
          >
            {children}
          </div>
        );

      case 'grid':
        return (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${props.columns || 3}, 1fr)`,
              gridTemplateRows: props.rows || 'auto',
              gap: props.gap || '16px',
              padding: props.padding || '0px',
              ...(props.style || {}),
            }}
            className={props.className}
            data-drop-container
          >
            {children}
          </div>
        );

      case 'heading':
        const HeadingTag = `h${props.level || 2}`;
        return React.createElement(HeadingTag, {
          style: {
            color: props.color || '#000000',
            fontSize: props.fontSize || '24px',
            fontWeight: props.fontWeight || 'bold',
            textAlign: props.textAlign || 'left',
            ...(props.style || {}),
          },
          className: props.className
        }, props.text || 'Heading');

      case 'text':
        return (
          <p
            style={{
              color: props.color || '#333333',
              fontSize: props.fontSize || '16px',
              lineHeight: props.lineHeight || '1.5',
              ...(props.style || {}),
            }}
            className={props.className}
          >
            {props.text || 'Lorem ipsum dolor sit amet'}
          </p>
        );

      case 'button':
        const buttonStyles = getButtonStyles(props.variant || 'primary', props.size || 'medium');
        return (
          <button
            style={{
              ...buttonStyles,
              width: props.fullWidth ? '100%' : 'auto',
              ...(props.style || {}),
            }}
            className={props.className}
            disabled={props.disabled}
            onClick={(e) => {
              e.stopPropagation();
              handleAction(props.onClick);
            }}
          >
            {props.text || 'Click me'}
          </button>
        );

      case 'input':
        return (
          <div className={props.className}>
            {props.label && (
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {props.label}
                {props.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <input
              type={props.type || 'text'}
              placeholder={props.placeholder || ''}
              required={props.required}
              disabled={props.disabled}
              style={props.style}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );

      case 'image':
        return (
          <img
            src={props.src || 'https://via.placeholder.com/300x200'}
            alt={props.alt || 'Image'}
            style={{
              width: props.width || '100%',
              height: props.height || 'auto',
              objectFit: props.objectFit || 'cover',
              ...(props.style || {}),
            }}
            className={props.className}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Error';
            }}
          />
        );

      case 'card':
        return (
          <div
            style={{
              padding: props.padding || '16px',
              borderRadius: props.borderRadius || '8px',
              backgroundColor: '#ffffff',
              boxShadow: props.shadow ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              border: '1px solid #e5e7eb',
              ...(props.style || {}),
            }}
            className={props.className}
            data-drop-container
          >
            {props.title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {props.title}
              </h3>
            )}
            {props.description && (
              <p className="text-sm text-gray-600 mb-4">
                {props.description}
              </p>
            )}
            {children}
          </div>
        );

      case 'list':
        const ListTag = props.ordered ? 'ol' : 'ul';
        return (
          <ListTag
            style={{
              listStyle: props.ordered ? 'decimal' : 'disc',
              paddingLeft: '20px',
              ...(props.style || {}),
            }}
            className={props.className}
          >
            {(props.items || []).map((item: string, index: number) => (
              <li
                key={index}
                style={{ marginBottom: props.spacing || '8px' }}
              >
                {item}
              </li>
            ))}
          </ListTag>
        );

      default:
        return (
          <div
            style={props.style}
            className={props.className}
            data-drop-container={definition.acceptsChildren}
          >
            {children || `[${node.type}]`}
          </div>
        );
    }
  };

  return (
    <div
      data-component-id={node.id}
      className={`relative ${isSelected ? 'ring-2 ring-purple-500' : ''} ${
        isHovered ? 'ring-1 ring-purple-300' : ''
      }`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {renderComponent()}
      
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-6 left-0 bg-purple-600 text-white px-2 py-0.5 text-xs rounded">
          {node.name}
        </div>
      )}
    </div>
  );
}

// Helper functions

function getButtonStyles(variant: string, size: string) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 500,
    borderRadius: '6px',
    transition: 'all 0.2s',
    cursor: 'pointer',
    border: 'none',
  };

  const variantStyles: Record<string, any> = {
    primary: {
      backgroundColor: '#7c3aed',
      color: '#ffffff',
    },
    secondary: {
      backgroundColor: '#e5e7eb',
      color: '#374151',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#7c3aed',
      border: '1px solid #7c3aed',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#374151',
    },
  };

  const sizeStyles: Record<string, any> = {
    small: {
      padding: '4px 12px',
      fontSize: '14px',
    },
    medium: {
      padding: '8px 16px',
      fontSize: '16px',
    },
    large: {
      padding: '12px 24px',
      fontSize: '18px',
    },
  };

  return {
    ...baseStyles,
    ...(variantStyles[variant] || variantStyles.primary),
    ...(sizeStyles[size] || sizeStyles.medium),
  };
}

function handleAction(action: any) {
  if (!action) return;

  switch (action.type) {
    case 'navigate':
      window.location.href = action.value;
      break;
    case 'alert':
      alert(action.value);
      break;
    case 'console':
      console.log(action.value);
      break;
    case 'custom':
      try {
        // eslint-disable-next-line no-eval
        eval(action.value);
      } catch (err) {
        console.error('Action error:', err);
      }
      break;
  }
}