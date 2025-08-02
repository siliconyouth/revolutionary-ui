import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { setup } from '@vladimirdukelic/revolutionary-ui-factory/v2';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-container">
      <h1>Revolutionary UI Factory - Angular Example</h1>
      
      <section class="demo-section">
        <h2>Dashboard Component (96% less code!)</h2>
        <div #dashboardContainer></div>
      </section>
      
      <section class="demo-section">
        <h2>Data Table Component (70% less code!)</h2>
        <div #tableContainer></div>
      </section>
      
      <section class="demo-section">
        <h2>Form Component (80% less code!)</h2>
        <div #formContainer></div>
      </section>
      
      <section class="demo-section">
        <h2>Kanban Board (95% less code!)</h2>
        <div #kanbanContainer></div>
      </section>
    </div>
  `,
  styles: [`
    .app-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    h1 {
      color: #dd0031;
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .demo-section {
      margin: 3rem 0;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    h2 {
      color: #1f2937;
      margin-bottom: 1.5rem;
    }
  `]
})
export class AppComponent {
  title = 'revolutionary-ui-angular';
  
  ngAfterViewInit() {
    // Initialize Revolutionary UI Factory with Angular adapter
    const ui = setup({ framework: 'angular' });
    
    // Create Dashboard
    this.createDashboard(ui);
    
    // Create Data Table
    this.createDataTable(ui);
    
    // Create Form
    this.createForm(ui);
    
    // Create Kanban
    this.createKanban(ui);
  }
  
  private createDashboard(ui: any) {
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
            format: (v: number) => `$${v.toLocaleString()}`
          }
        },
        {
          id: 'users',
          type: 'stats',
          config: {
            value: 8420,
            label: 'Active Users',
            change: 8.2,
            trend: 'up'
          }
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
                borderColor: '#dd0031',
                backgroundColor: 'rgba(221, 0, 49, 0.1)'
              }]
            }
          }
        }
      ],
      className: 'angular-dashboard-demo'
    });
    
    // Mount to container
    const container = document.querySelector('[#dashboardContainer]');
    if (container) {
      ui.mount(Dashboard, container);
    }
  }
  
  private createDataTable(ui: any) {
    const users = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
      { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Moderator' }
    ];
    
    const DataTable = ui.createDataTable({
      columns: [
        { id: 'id', header: 'ID', accessorKey: 'id' },
        { id: 'name', header: 'Name', accessorKey: 'name' },
        { id: 'email', header: 'Email', accessorKey: 'email' },
        { id: 'role', header: 'Role', accessorKey: 'role' }
      ],
      data: users,
      features: {
        sorting: true,
        filtering: true,
        pagination: true
      },
      className: 'angular-table-demo'
    });
    
    const container = document.querySelector('[#tableContainer]');
    if (container) {
      ui.mount(DataTable, container);
    }
  }
  
  private createForm(ui: any) {
    const Form = ui.createForm({
      fields: [
        {
          id: 'name',
          name: 'name',
          label: 'Full Name',
          type: 'text',
          required: true,
          placeholder: 'Enter your name'
        },
        {
          id: 'email',
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          placeholder: 'your.email@example.com'
        },
        {
          id: 'message',
          name: 'message',
          label: 'Message',
          type: 'textarea',
          required: true,
          placeholder: 'Type your message here...'
        }
      ],
      onSubmit: (data: any) => {
        console.log('Form submitted:', data);
        alert('Form submitted! Check console for data.');
      },
      submitText: 'Send Message',
      className: 'angular-form-demo'
    });
    
    const container = document.querySelector('[#formContainer]');
    if (container) {
      ui.mount(Form, container);
    }
  }
  
  private createKanban(ui: any) {
    const Kanban = ui.createKanban({
      columns: [
        {
          id: 'todo',
          title: 'To Do',
          items: [
            { id: '1', title: 'Research Angular 15 features' },
            { id: '2', title: 'Setup project structure' }
          ]
        },
        {
          id: 'inprogress',
          title: 'In Progress',
          items: [
            { id: '3', title: 'Implement authentication' }
          ]
        },
        {
          id: 'done',
          title: 'Done',
          items: [
            { id: '4', title: 'Initial project setup' }
          ]
        }
      ],
      className: 'angular-kanban-demo'
    });
    
    const container = document.querySelector('[#kanbanContainer]');
    if (container) {
      ui.mount(Kanban, container);
    }
  }
}