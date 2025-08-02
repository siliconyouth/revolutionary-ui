<template>
  <div>
    <ContactForm />
  </div>
</template>

<script setup lang="ts">
import { h, defineComponent, ref } from 'vue'
import { setup } from '@vladimirdukelic/revolutionary-ui-factory/v2'

// Initialize Revolutionary UI Factory with Vue adapter
const ui = setup({ framework: 'vue' })

// Create Form component with Revolutionary UI Factory
const ContactForm = defineComponent({
  name: 'ContactForm',
  setup() {
    const formData = ref({
      name: '',
      email: '',
      subject: '',
      message: ''
    })
    
    const FormComponent = ui.createForm({
      fields: [
        {
          id: 'name',
          name: 'name',
          label: 'Full Name',
          type: 'text',
          required: true,
          placeholder: 'Enter your full name',
          validation: (value) => {
            if (!value || value.length < 2) {
              return 'Name must be at least 2 characters'
            }
          }
        },
        {
          id: 'email',
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
          placeholder: 'your.email@example.com',
          validation: (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(value)) {
              return 'Please enter a valid email address'
            }
          }
        },
        {
          id: 'subject',
          name: 'subject',
          label: 'Subject',
          type: 'select',
          required: true,
          options: [
            { value: '', label: 'Select a subject' },
            { value: 'general', label: 'General Inquiry' },
            { value: 'support', label: 'Technical Support' },
            { value: 'sales', label: 'Sales Question' },
            { value: 'feedback', label: 'Feedback' }
          ]
        },
        {
          id: 'message',
          name: 'message',
          label: 'Message',
          type: 'textarea',
          required: true,
          placeholder: 'Type your message here...',
          rows: 4,
          validation: (value) => {
            if (!value || value.length < 10) {
              return 'Message must be at least 10 characters'
            }
          }
        }
      ],
      onSubmit: async (data) => {
        console.log('Form submitted:', data)
        alert('Form submitted successfully! Check console for data.')
      },
      submitText: 'Send Message',
      resetButton: true,
      className: 'vue-form-demo'
    })
    
    return () => h('div', { class: 'form-container' }, [
      h('p', { class: 'form-description' }, 
        'This form is generated with just configuration - no manual form building!'
      ),
      h(FormComponent)
    ])
  }
})
</script>

<style>
.form-container {
  max-width: 600px;
  margin: 0 auto;
}

.form-description {
  margin-bottom: 1.5rem;
  color: #6b7280;
  text-align: center;
}

.vue-form-demo {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.vue-form-demo .form-field {
  margin-bottom: 1.5rem;
}

.vue-form-demo label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.vue-form-demo input,
.vue-form-demo select,
.vue-form-demo textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.15s;
}

.vue-form-demo input:focus,
.vue-form-demo select:focus,
.vue-form-demo textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.vue-form-demo .error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.vue-form-demo .form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.vue-form-demo button {
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.15s;
  cursor: pointer;
}

.vue-form-demo button[type="submit"] {
  background: #3b82f6;
  color: white;
  border: none;
}

.vue-form-demo button[type="submit"]:hover {
  background: #2563eb;
}

.vue-form-demo button[type="reset"] {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.vue-form-demo button[type="reset"]:hover {
  background: #f9fafb;
}
</style>