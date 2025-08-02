import React from 'react';
import { ComponentNode } from '../core/types';
import { getComponentDefinition } from '../core/component-registry';

interface ComponentPreviewProps {
  component: ComponentNode;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  framework: string;
  styling: string;
}

export function ComponentPreview({
  component,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  framework,
  styling
}: ComponentPreviewProps) {
  const definition = getComponentDefinition(component.type);
  if (!definition) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(component.id);
  };

  const handleMouseEnter = () => {
    onHover(component.id);
  };

  const handleMouseLeave = () => {
    onHover(null);
  };

  // Render component based on type
  const renderComponent = () => {
    switch (component.type) {
      case 'container':
        return (
          <div
            style={{
              padding: component.props.padding,
              margin: component.props.margin,
              backgroundColor: component.props.backgroundColor,
              borderRadius: component.props.borderRadius,
              display: component.props.display,
              flexDirection: component.props.flexDirection,
              gap: component.props.gap,
              minHeight: component.children.length === 0 ? '100px' : 'auto',
            }}
            data-drop-container
          >
            {component.children.length === 0 ? (
              <div className="text-gray-400 text-center">
                Drop components here
              </div>
            ) : (
              component.children.map((child) => (
                <ComponentPreview
                  key={child.id}
                  component={child}
                  isSelected={false}
                  isHovered={false}
                  onSelect={onSelect}
                  onHover={onHover}
                  framework={framework}
                  styling={styling}
                />
              ))
            )}
          </div>
        );

      case 'grid':
        return (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${component.props.columns}, 1fr)`,
              gridTemplateRows: component.props.rows,
              gap: component.props.gap,
              padding: component.props.padding,
              minHeight: component.children.length === 0 ? '100px' : 'auto',
            }}
            data-drop-container
          >
            {component.children.length === 0 ? (
              <div className="text-gray-400 text-center col-span-full">
                Drop components here
              </div>
            ) : (
              component.children.map((child) => (
                <ComponentPreview
                  key={child.id}
                  component={child}
                  isSelected={false}
                  isHovered={false}
                  onSelect={onSelect}
                  onHover={onHover}
                  framework={framework}
                  styling={styling}
                />
              ))
            )}
          </div>
        );

      case 'heading':
        const HeadingTag = `h${component.props.level}`;
        return React.createElement(HeadingTag, {
          style: {
            color: component.props.color,
            fontSize: component.props.fontSize,
            fontWeight: component.props.fontWeight,
            textAlign: component.props.textAlign,
          }
        }, component.props.text);

      case 'text':
        return (
          <p
            style={{
              color: component.props.color,
              fontSize: component.props.fontSize,
              lineHeight: component.props.lineHeight,
            }}
          >
            {component.props.text}
          </p>
        );

      case 'button':
        return (
          <button
            className={getButtonClasses(component.props, styling)}
            disabled={component.props.disabled}
            style={{
              width: component.props.fullWidth ? '100%' : 'auto',
            }}
          >
            {component.props.text}
          </button>
        );

      case 'input':
        return (
          <div>
            {component.props.label && (
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {component.props.label}
                {component.props.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <input
              type={component.props.type}
              placeholder={component.props.placeholder}
              disabled={component.props.disabled}
              required={component.props.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );

      case 'image':
        return (
          <img
            src={component.props.src}
            alt={component.props.alt}
            style={{
              width: component.props.width,
              height: component.props.height,
              objectFit: component.props.objectFit,
            }}
            className="max-w-full"
          />
        );

      case 'card':
        return (
          <div
            className={`bg-white rounded-lg ${component.props.shadow ? 'shadow-lg' : ''}`}
            style={{
              padding: component.props.padding,
              borderRadius: component.props.borderRadius,
            }}
          >
            {component.props.title && (
              <h3 className="text-lg font-semibold mb-2">{component.props.title}</h3>
            )}
            {component.props.description && (
              <p className="text-gray-600 mb-4">{component.props.description}</p>
            )}
            <div data-drop-container>
              {component.children.map((child) => (
                <ComponentPreview
                  key={child.id}
                  component={child}
                  isSelected={false}
                  isHovered={false}
                  onSelect={onSelect}
                  onHover={onHover}
                  framework={framework}
                  styling={styling}
                />
              ))}
            </div>
          </div>
        );

      case 'list':
        const ListTag = component.props.ordered ? 'ol' : 'ul';
        return (
          <ListTag
            className={component.props.ordered ? 'list-decimal' : 'list-disc'}
            style={{
              paddingLeft: '20px',
              marginTop: component.props.spacing,
              marginBottom: component.props.spacing,
            }}
          >
            {component.props.items.map((item: string, index: number) => (
              <li key={index} style={{ marginBottom: component.props.spacing }}>
                {item}
              </li>
            ))}
          </ListTag>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">
              {definition.icon} {component.type} component
            </p>
          </div>
        );
    }
  };

  return (
    <div
      data-component-id={component.id}
      className={`relative ${isSelected ? 'ring-2 ring-purple-500 ring-offset-2' : ''} ${
        isHovered ? 'ring-2 ring-purple-300 ring-offset-1' : ''
      }`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {renderComponent()}
      
      {/* Selection overlay */}
      {(isSelected || isHovered) && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-6 left-0 text-xs bg-purple-600 text-white px-2 py-1 rounded">
            {component.name}
          </div>
        </div>
      )}
    </div>
  );
}

function getButtonClasses(props: any, styling: string): string {
  if (styling !== 'tailwind') {
    return 'button';
  }

  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-purple-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  };

  return `${baseClasses} ${sizeClasses[props.size || 'medium']} ${
    variantClasses[props.variant || 'primary']
  } ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
}