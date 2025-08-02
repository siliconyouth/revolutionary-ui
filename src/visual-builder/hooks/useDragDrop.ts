import { useCallback, useEffect, useRef, useState } from 'react';
import { ComponentNode, DragItem, DropZone, Position } from '../core/types';
import { canAcceptChild, getComponentDefinition } from '../core/component-registry';

interface DragDropOptions {
  onDrop: (dragItem: DragItem, dropZone: DropZone) => void;
  onReorder: (dragItem: DragItem, dropZone: DropZone) => void;
  snapToGrid?: boolean;
  gridSize?: number;
}

export function useDragDrop(options: DragDropOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragPosition, setDragPosition] = useState<Position>({ x: 0, y: 0 });
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [activeDropZone, setActiveDropZone] = useState<DropZone | null>(null);
  const dragPreviewRef = useRef<HTMLDivElement | null>(null);

  // Start dragging
  const startDrag = useCallback((
    event: React.DragEvent | React.MouseEvent,
    item: DragItem,
    preview?: HTMLElement
  ) => {
    setIsDragging(true);
    setDraggedItem(item);

    // Create custom drag preview
    if (preview && dragPreviewRef.current) {
      const rect = preview.getBoundingClientRect();
      dragPreviewRef.current.style.width = `${rect.width}px`;
      dragPreviewRef.current.style.height = `${rect.height}px`;
      
      // Clone the preview element
      const clone = preview.cloneNode(true) as HTMLElement;
      clone.style.opacity = '0.8';
      dragPreviewRef.current.appendChild(clone);
    }

    // Set initial drag position
    const clientX = 'clientX' in event ? event.clientX : (event as React.TouchEvent).touches[0].clientX;
    const clientY = 'clientY' in event ? event.clientY : (event as React.TouchEvent).touches[0].clientY;
    setDragPosition({ x: clientX, y: clientY });

    // Prevent default drag image
    if ('dataTransfer' in event && event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setDragImage(new Image(), 0, 0);
    }
  }, []);

  // Update drag position
  const updateDragPosition = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX;
    const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY;

    let x = clientX;
    let y = clientY;

    // Snap to grid if enabled
    if (options.snapToGrid && options.gridSize) {
      x = Math.round(x / options.gridSize) * options.gridSize;
      y = Math.round(y / options.gridSize) * options.gridSize;
    }

    setDragPosition({ x, y });

    // Update drag preview position
    if (dragPreviewRef.current) {
      dragPreviewRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }

    // Check for active drop zone
    const element = document.elementFromPoint(clientX, clientY);
    if (element) {
      const dropZone = findDropZone(element, dropZones);
      setActiveDropZone(dropZone);
    }
  }, [isDragging, dropZones, options.snapToGrid, options.gridSize]);

  // End dragging
  const endDrag = useCallback((event?: MouseEvent | TouchEvent) => {
    if (!isDragging || !draggedItem) return;

    // Find drop zone at current position
    if (event) {
      const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX;
      const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY;
      
      const element = document.elementFromPoint(clientX, clientY);
      if (element) {
        const dropZone = findDropZone(element, dropZones);
        
        if (dropZone && canDrop(draggedItem, dropZone)) {
          if (draggedItem.isNew) {
            options.onDrop(draggedItem, dropZone);
          } else {
            options.onReorder(draggedItem, dropZone);
          }
        }
      }
    }

    // Clean up
    setIsDragging(false);
    setDraggedItem(null);
    setActiveDropZone(null);
    
    if (dragPreviewRef.current) {
      dragPreviewRef.current.innerHTML = '';
    }
  }, [isDragging, draggedItem, dropZones, options]);

  // Register drop zones
  const registerDropZones = useCallback((components: ComponentNode[]) => {
    const zones: DropZone[] = [];

    const collectDropZones = (
      nodes: ComponentNode[],
      parentId: string = 'root'
    ) => {
      nodes.forEach((node, index) => {
        // Add drop zone before each component
        const element = document.querySelector(`[data-component-id="${node.id}"]`);
        if (element) {
          const rect = element.getBoundingClientRect();
          zones.push({
            id: `${parentId}-${index}`,
            parentId,
            index,
            rect,
          });
        }

        // If component accepts children, add drop zones inside
        const def = getComponentDefinition(node.type);
        if (def?.acceptsChildren) {
          const containerElement = document.querySelector(
            `[data-component-id="${node.id}"] [data-drop-container]`
          );
          
          if (containerElement) {
            const rect = containerElement.getBoundingClientRect();
            
            if (node.children.length === 0) {
              // Empty container - single drop zone
              zones.push({
                id: `${node.id}-0`,
                parentId: node.id,
                index: 0,
                rect,
              });
            } else {
              // Recursively collect drop zones from children
              collectDropZones(node.children, node.id);
              
              // Add drop zone after last child
              zones.push({
                id: `${node.id}-${node.children.length}`,
                parentId: node.id,
                index: node.children.length,
                rect,
              });
            }
          }
        }
      });
    };

    collectDropZones(components);
    setDropZones(zones);
  }, []);

  // Check if item can be dropped in zone
  const canDrop = useCallback((item: DragItem, zone: DropZone): boolean => {
    // Can't drop on itself
    if (item.id === zone.parentId) return false;

    // Check if parent accepts this child type
    if (zone.parentId === 'root') return true;
    
    return canAcceptChild(zone.parentId, item.type);
  }, []);

  // Find drop zone from DOM element
  const findDropZone = (
    element: Element,
    zones: DropZone[]
  ): DropZone | null => {
    const rect = element.getBoundingClientRect();
    
    // Find the closest drop zone
    let closestZone: DropZone | null = null;
    let closestDistance = Infinity;

    zones.forEach(zone => {
      const distance = getDistance(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        zone.rect.left + zone.rect.width / 2,
        zone.rect.top + zone.rect.height / 2
      );

      if (distance < closestDistance && distance < 50) {
        closestDistance = distance;
        closestZone = zone;
      }
    });

    return closestZone;
  };

  // Calculate distance between two points
  const getDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  // Set up global event listeners
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => updateDragPosition(e);
      const handleMouseUp = (e: MouseEvent) => endDrag(e);
      const handleTouchMove = (e: TouchEvent) => updateDragPosition(e);
      const handleTouchEnd = (e: TouchEvent) => endDrag(e);

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, updateDragPosition, endDrag]);

  return {
    isDragging,
    draggedItem,
    dragPosition,
    activeDropZone,
    dropZones,
    startDrag,
    endDrag,
    registerDropZones,
    canDrop,
    dragPreviewRef,
  };
}