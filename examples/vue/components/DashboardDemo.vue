<template>
  <div ref="dashboardContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { setup } from '@vladimirdukelic/revolutionary-ui-factory/v2'

const dashboardContainer = ref<HTMLElement>()

onMounted(() => {
  // Initialize Revolutionary UI Factory with Vue adapter
  const ui = setup({ framework: 'vue' })
  
  // Create dashboard with just configuration!
  const Dashboard = ui.createDashboard({
    widgets: [
      {
        id: 'revenue',
        type: 'stats',
        config: {
          value: 125600,
          label: 'Total Revenue',
          change: 12.5,
          trend: 'up',
          format: (v) => `$${v.toLocaleString()}`
        },
        gridArea: 'revenue'
      },
      {
        id: 'users',
        type: 'stats',
        config: {
          value: 8420,
          label: 'Active Users',
          change: 8.2,
          trend: 'up'
        },
        gridArea: 'users'
      },
      {
        id: 'chart',
        type: 'chart',
        config: {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Revenue',
              data: [65000, 72000, 78000, 85000, 95000, 125600],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)'
            }]
          },
          height: 300
        },
        gridArea: 'chart'
      },
      {
        id: 'activity',
        type: 'timeline',
        config: {
          items: [
            { date: new Date(), title: 'New user registered', icon: '👤' },
            { date: new Date(Date.now() - 3600000), title: 'Payment received', icon: '💰' },
            { date: new Date(Date.now() - 7200000), title: 'Order completed', icon: '📦' }
          ]
        },
        gridArea: 'activity'
      }
    ],
    layout: {
      areas: `
        "revenue users users"
        "chart chart activity"
      `,
      columns: '1fr 1fr 1fr',
      gap: '1rem'
    },
    className: 'vue-dashboard-demo'
  })
  
  // Mount the dashboard
  if (dashboardContainer.value) {
    ui.mount(Dashboard, dashboardContainer.value)
  }
})
</script>

<style scoped>
.vue-dashboard-demo {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>