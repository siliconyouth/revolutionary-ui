/**
 * Core types for the Visual Component Builder
 */

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ComponentNode {
  id: string;
  type: string;
  name: string;
  props: Record<string, any>;
  children: ComponentNode[];
  position?: Position;
  size?: Size;
  locked?: boolean;
  visible?: boolean;
  selected?: boolean;
}

export interface DragItem {
  id: string;
  type: string;
  sourceIndex?: number;
  parentId?: string;
  isNew?: boolean;
}

export interface DropZone {
  id: string;
  parentId: string;
  index: number;
  rect: DOMRect;
}

export interface ComponentDefinition {
  type: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  defaultProps: Record<string, any>;
  propSchema: PropSchema[];
  acceptsChildren: boolean;
  childTypes?: string[]; // Allowed child component types
  parentTypes?: string[]; // Allowed parent component types
}

export interface PropSchema {
  name: string;
  label: string;
  type: PropType;
  defaultValue?: any;
  required?: boolean;
  options?: Array<{ label: string; value: any }>;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  helperText?: string;
  category?: string;
  condition?: (props: Record<string, any>) => boolean;
}

export type PropType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'color'
  | 'spacing'
  | 'icon'
  | 'image'
  | 'action'
  | 'style'
  | 'slot';

export interface BuilderState {
  components: ComponentNode[];
  selectedComponentId: string | null;
  hoveredComponentId: string | null;
  draggedItem: DragItem | null;
  dropZones: DropZone[];
  history: {
    past: ComponentNode[][];
    present: ComponentNode[];
    future: ComponentNode[][];
  };
  settings: BuilderSettings;
}

export interface BuilderSettings {
  framework: string;
  styling: string;
  devicePreview: 'desktop' | 'tablet' | 'mobile';
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  autoSave: boolean;
  darkMode: boolean;
}

export interface ExportOptions {
  format: 'factory' | 'code' | 'json';
  framework: string;
  styling: string;
  typescript: boolean;
  prettier: boolean;
  includeImports: boolean;
}

export interface BuilderAction {
  type: BuilderActionType;
  payload?: any;
}

export enum BuilderActionType {
  // Component actions
  ADD_COMPONENT = 'ADD_COMPONENT',
  UPDATE_COMPONENT = 'UPDATE_COMPONENT',
  DELETE_COMPONENT = 'DELETE_COMPONENT',
  MOVE_COMPONENT = 'MOVE_COMPONENT',
  DUPLICATE_COMPONENT = 'DUPLICATE_COMPONENT',
  
  // Selection actions
  SELECT_COMPONENT = 'SELECT_COMPONENT',
  CLEAR_SELECTION = 'CLEAR_SELECTION',
  HOVER_COMPONENT = 'HOVER_COMPONENT',
  
  // Drag and drop actions
  START_DRAG = 'START_DRAG',
  END_DRAG = 'END_DRAG',
  UPDATE_DROP_ZONES = 'UPDATE_DROP_ZONES',
  
  // History actions
  UNDO = 'UNDO',
  REDO = 'REDO',
  
  // Settings actions
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  
  // Bulk actions
  LOAD_TEMPLATE = 'LOAD_TEMPLATE',
  CLEAR_CANVAS = 'CLEAR_CANVAS',
  IMPORT_COMPONENTS = 'IMPORT_COMPONENTS'
}

export interface ComponentRenderer {
  render(node: ComponentNode, framework: string): string;
  preview(node: ComponentNode): React.ReactElement;
}

export interface PropertyEditor {
  type: PropType;
  component: React.ComponentType<PropertyEditorProps>;
}

export interface PropertyEditorProps {
  value: any;
  onChange: (value: any) => void;
  schema: PropSchema;
  componentProps: Record<string, any>;
}