<template>
  <div ref="kanbanContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { setup } from '@vladimirdukelic/revolutionary-ui-factory/v2'

const kanbanContainer = ref<HTMLElement>()

// Sample kanban data
const kanbanData = {
  columns: [
    {
      id: 'todo',
      title: 'To Do',
      items: [
        { id: '1', title: 'Research Vue 3 Composition API', priority: 'high' },
        { id: '2', title: 'Setup project structure', priority: 'medium' },
        { id: '3', title: 'Design component architecture', priority: 'high' }
      ]
    },
    {
      id: 'inprogress',
      title: 'In Progress',
      items: [
        { id: '4', title: 'Implement user authentication', priority: 'high' },
        { id: '5', title: 'Create API endpoints', priority: 'medium' }
      ]
    },
    {
      id: 'review',
      title: 'Review',
      items: [
        { id: '6', title: 'Code review for auth module', priority: 'medium' },
        { id: '7', title: 'Test API integration', priority: 'high' }
      ]
    },
    {
      id: 'done',
      title: 'Done',
      items: [
        { id: '8', title: 'Initial project setup', priority: 'low' },
        { id: '9', title: 'Configure development environment', priority: 'low' }
      ]
    }
  ]
}

onMounted(() => {
  // Initialize Revolutionary UI Factory with Vue adapter
  const ui = setup({ framework: 'vue' })
  
  // Create Kanban board with just configuration!
  const KanbanBoard = ui.createKanban({
    columns: kanbanData.columns,
    onDragEnd: (result) => {
      console.log('Drag ended:', result)
      // In a real app, you'd update the data here
    },
    cardRenderer: (item) => ({
      className: `kanban-card priority-${item.priority}`,
      children: [
        { type: 'h4', children: item.title },
        { 
          type: 'span', 
          className: `priority-badge ${item.priority}`,
          children: item.priority.toUpperCase()
        }
      ]
    }),
    className: 'vue-kanban-demo'
  })
  
  // Mount the kanban board
  if (kanbanContainer.value) {
    ui.mount(KanbanBoard, kanbanContainer.value)
  }
})
</script>

<style>
.vue-kanban-demo {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.kanban-columns {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
}

.kanban-column {
  flex: 1;
  min-width: 250px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.kanban-column-header {
  margin-bottom: 1rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kanban-column-count {
  background: #e5e7eb;
  color: #6b7280;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
}

.kanban-cards {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.kanban-card {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: grab;
  transition: all 0.2s;
}

.kanban-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.kanban-card.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.kanban-card h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #1f2937;
}

.priority-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.priority-badge.high {
  background: #fee2e2;
  color: #dc2626;
}

.priority-badge.medium {
  background: #fef3c7;
  color: #d97706;
}

.priority-badge.low {
  background: #dbeafe;
  color: #2563eb;
}

.kanban-card.priority-high {
  border-left: 3px solid #dc2626;
}

.kanban-card.priority-medium {
  border-left: 3px solid #d97706;
}

.kanban-card.priority-low {
  border-left: 3px solid #2563eb;
}
</style>