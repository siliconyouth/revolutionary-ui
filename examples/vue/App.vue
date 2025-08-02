<template>
  <div id="app">
    <h1>Revolutionary UI Factory - Vue 3 Example</h1>
    
    <section class="demo-section">
      <h2>Dashboard Component (96% less code!)</h2>
      <DashboardDemo />
    </section>
    
    <section class="demo-section">
      <h2>Data Table Component (70% less code!)</h2>
      <DataTableDemo />
    </section>
    
    <section class="demo-section">
      <h2>Form Component (80% less code!)</h2>
      <FormDemo />
    </section>
    
    <section class="demo-section">
      <h2>Kanban Board (95% less code!)</h2>
      <KanbanDemo />
    </section>
  </div>
</template>

<script setup lang="ts">
import DashboardDemo from './components/DashboardDemo.vue'
import DataTableDemo from './components/DataTableDemo.vue'
import FormDemo from './components/FormDemo.vue'
import KanbanDemo from './components/KanbanDemo.vue'
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.demo-section {
  margin: 3rem 0;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
}

h1 {
  color: #3b82f6;
  text-align: center;
  margin-bottom: 3rem;
}

h2 {
  color: #1f2937;
  margin-bottom: 1.5rem;
}
</style>