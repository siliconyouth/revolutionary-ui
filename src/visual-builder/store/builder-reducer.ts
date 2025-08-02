import { 
  BuilderState, 
  BuilderAction, 
  BuilderActionType, 
  ComponentNode 
} from '../core/types';
import { v4 as uuidv4 } from 'uuid';
import { getComponentDefinition } from '../core/component-registry';

export const initialBuilderState: BuilderState = {
  components: [],
  selectedComponentId: null,
  hoveredComponentId: null,
  draggedItem: null,
  dropZones: [],
  history: {
    past: [],
    present: [],
    future: []
  },
  settings: {
    framework: 'react',
    styling: 'tailwind',
    devicePreview: 'desktop',
    showGrid: true,
    gridSize: 8,
    snapToGrid: true,
    autoSave: true,
    darkMode: false
  }
};

export function builderReducer(
  state: BuilderState,
  action: BuilderAction
): BuilderState {
  switch (action.type) {
    case BuilderActionType.ADD_COMPONENT: {
      const { type, parentId, index } = action.payload;
      const definition = getComponentDefinition(type);
      
      if (!definition) return state;

      const newComponent: ComponentNode = {
        id: uuidv4(),
        type,
        name: definition.name,
        props: { ...definition.defaultProps },
        children: []
      };

      const newComponents = addComponentToTree(
        [...state.components],
        newComponent,
        parentId,
        index
      );

      return {
        ...state,
        components: newComponents,
        selectedComponentId: newComponent.id,
        history: addToHistory(state.history, newComponents)
      };
    }

    case BuilderActionType.UPDATE_COMPONENT: {
      const { id, updates } = action.payload;
      const newComponents = updateComponentInTree(
        [...state.components],
        id,
        updates
      );

      return {
        ...state,
        components: newComponents,
        history: addToHistory(state.history, newComponents)
      };
    }

    case BuilderActionType.DELETE_COMPONENT: {
      const { id } = action.payload;
      const newComponents = deleteComponentFromTree(
        [...state.components],
        id
      );

      return {
        ...state,
        components: newComponents,
        selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
        history: addToHistory(state.history, newComponents)
      };
    }

    case BuilderActionType.MOVE_COMPONENT: {
      const { componentId, newParentId, newIndex } = action.payload;
      
      // First, remove component from its current location
      let component: ComponentNode | null = null;
      let componentsAfterRemoval = [...state.components];
      
      const removeComponent = (nodes: ComponentNode[]): ComponentNode[] => {
        return nodes.filter(node => {
          if (node.id === componentId) {
            component = node;
            return false;
          }
          if (node.children.length > 0) {
            node.children = removeComponent(node.children);
          }
          return true;
        });
      };

      componentsAfterRemoval = removeComponent(componentsAfterRemoval);

      if (!component) return state;

      // Then add it to the new location
      const newComponents = addComponentToTree(
        componentsAfterRemoval,
        component,
        newParentId,
        newIndex
      );

      return {
        ...state,
        components: newComponents,
        history: addToHistory(state.history, newComponents)
      };
    }

    case BuilderActionType.DUPLICATE_COMPONENT: {
      const { id } = action.payload;
      const component = findComponentById(state.components, id);
      
      if (!component) return state;

      const duplicate = duplicateComponent(component);
      const parentId = findParentId(state.components, id);
      const index = findComponentIndex(state.components, id, parentId) + 1;

      const newComponents = addComponentToTree(
        [...state.components],
        duplicate,
        parentId,
        index
      );

      return {
        ...state,
        components: newComponents,
        selectedComponentId: duplicate.id,
        history: addToHistory(state.history, newComponents)
      };
    }

    case BuilderActionType.SELECT_COMPONENT: {
      return {
        ...state,
        selectedComponentId: action.payload.id
      };
    }

    case BuilderActionType.CLEAR_SELECTION: {
      return {
        ...state,
        selectedComponentId: null
      };
    }

    case BuilderActionType.HOVER_COMPONENT: {
      return {
        ...state,
        hoveredComponentId: action.payload.id
      };
    }

    case BuilderActionType.START_DRAG: {
      return {
        ...state,
        draggedItem: action.payload.item
      };
    }

    case BuilderActionType.END_DRAG: {
      return {
        ...state,
        draggedItem: null
      };
    }

    case BuilderActionType.UPDATE_DROP_ZONES: {
      return {
        ...state,
        dropZones: action.payload.zones
      };
    }

    case BuilderActionType.UNDO: {
      if (state.history.past.length === 0) return state;

      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);

      return {
        ...state,
        components: previous,
        history: {
          past: newPast,
          present: previous,
          future: [state.history.present, ...state.history.future]
        }
      };
    }

    case BuilderActionType.REDO: {
      if (state.history.future.length === 0) return state;

      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);

      return {
        ...state,
        components: next,
        history: {
          past: [...state.history.past, state.history.present],
          present: next,
          future: newFuture
        }
      };
    }

    case BuilderActionType.UPDATE_SETTINGS: {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload.settings
        }
      };
    }

    case BuilderActionType.LOAD_TEMPLATE: {
      const { components } = action.payload;
      return {
        ...state,
        components,
        selectedComponentId: null,
        history: addToHistory(state.history, components)
      };
    }

    case BuilderActionType.CLEAR_CANVAS: {
      return {
        ...state,
        components: [],
        selectedComponentId: null,
        history: addToHistory(state.history, [])
      };
    }

    case BuilderActionType.IMPORT_COMPONENTS: {
      const { components } = action.payload;
      return {
        ...state,
        components,
        selectedComponentId: null,
        history: addToHistory(state.history, components)
      };
    }

    default:
      return state;
  }
}

// Helper functions
function addComponentToTree(
  components: ComponentNode[],
  newComponent: ComponentNode,
  parentId: string | null,
  index?: number
): ComponentNode[] {
  if (!parentId || parentId === 'root') {
    // Add to root level
    const insertIndex = index !== undefined ? index : components.length;
    components.splice(insertIndex, 0, newComponent);
    return components;
  }

  // Add to specific parent
  return components.map(component => {
    if (component.id === parentId) {
      const children = [...component.children];
      const insertIndex = index !== undefined ? index : children.length;
      children.splice(insertIndex, 0, newComponent);
      return { ...component, children };
    }
    
    if (component.children.length > 0) {
      return {
        ...component,
        children: addComponentToTree(component.children, newComponent, parentId, index)
      };
    }
    
    return component;
  });
}

function updateComponentInTree(
  components: ComponentNode[],
  id: string,
  updates: Partial<ComponentNode>
): ComponentNode[] {
  return components.map(component => {
    if (component.id === id) {
      return { ...component, ...updates };
    }
    
    if (component.children.length > 0) {
      return {
        ...component,
        children: updateComponentInTree(component.children, id, updates)
      };
    }
    
    return component;
  });
}

function deleteComponentFromTree(
  components: ComponentNode[],
  id: string
): ComponentNode[] {
  return components
    .filter(component => component.id !== id)
    .map(component => ({
      ...component,
      children: deleteComponentFromTree(component.children, id)
    }));
}

function findComponentById(
  components: ComponentNode[],
  id: string
): ComponentNode | null {
  for (const component of components) {
    if (component.id === id) return component;
    
    const found = findComponentById(component.children, id);
    if (found) return found;
  }
  
  return null;
}

function findParentId(
  components: ComponentNode[],
  childId: string,
  parentId: string | null = null
): string | null {
  for (const component of components) {
    if (component.id === childId) return parentId;
    
    const found = findParentId(component.children, childId, component.id);
    if (found !== null) return found;
  }
  
  return null;
}

function findComponentIndex(
  components: ComponentNode[],
  id: string,
  parentId: string | null
): number {
  if (!parentId || parentId === 'root') {
    return components.findIndex(c => c.id === id);
  }

  const parent = findComponentById(components, parentId);
  if (!parent) return -1;
  
  return parent.children.findIndex(c => c.id === id);
}

function duplicateComponent(component: ComponentNode): ComponentNode {
  return {
    ...component,
    id: uuidv4(),
    name: `${component.name} Copy`,
    children: component.children.map(child => duplicateComponent(child))
  };
}

function addToHistory(
  history: BuilderState['history'],
  components: ComponentNode[]
): BuilderState['history'] {
  return {
    past: [...history.past, history.present].slice(-50), // Keep last 50 states
    present: components,
    future: []
  };
}