<template>
  <div>
    <DataTable />
  </div>
</template>

<script setup lang="ts">
import { h, defineComponent } from 'vue'
import { setup } from '@vladimirdukelic/revolutionary-ui-factory/v2'

// Initialize Revolutionary UI Factory with Vue adapter
const ui = setup({ framework: 'vue' })

// Sample data
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Moderator', status: 'Active' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'Active' }
]

// Create DataTable component with Revolutionary UI Factory
const DataTable = defineComponent({
  name: 'DataTable',
  setup() {
    const TableComponent = ui.createDataTable({
      columns: [
        { id: 'id', header: 'ID', accessorKey: 'id', sortable: true },
        { id: 'name', header: 'Name', accessorKey: 'name', sortable: true },
        { id: 'email', header: 'Email', accessorKey: 'email' },
        { 
          id: 'role', 
          header: 'Role', 
          accessorKey: 'role',
          cell: (info) => h('span', { 
            class: `badge badge-${info.getValue().toLowerCase()}` 
          }, info.getValue())
        },
        {
          id: 'status',
          header: 'Status',
          accessorKey: 'status',
          cell: (info) => h('span', {
            class: `status ${info.getValue().toLowerCase()}`
          }, info.getValue())
        }
      ],
      data: users,
      features: {
        sorting: true,
        filtering: true,
        pagination: true,
        search: true
      },
      className: 'vue-table-demo'
    })
    
    return () => h(TableComponent)
  }
})
</script>

<style>
.vue-table-demo {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge-admin {
  background: #fee2e2;
  color: #dc2626;
}

.badge-user {
  background: #dbeafe;
  color: #2563eb;
}

.badge-moderator {
  background: #fef3c7;
  color: #d97706;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
}

.status::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status.active {
  color: #16a34a;
}

.status.active::before {
  background: #16a34a;
}

.status.inactive {
  color: #dc2626;
}

.status.inactive::before {
  background: #dc2626;
}
</style>