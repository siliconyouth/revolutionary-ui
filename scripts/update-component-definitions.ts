#!/usr/bin/env node

/**
 * Update component definitions with origin information and proper attribution
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Component definitions with their typical origins and implementations
const COMPONENT_DEFINITIONS = {
  // Data Visualization Components
  'dashboard': {
    description: 'Dashboard component for data visualization and metrics display',
    origins: ['Material-UI', 'Ant Design', 'Chakra UI'],
    primaryAuthor: 'ant-design@github.com',
    documentationUrl: 'https://ant.design/components/dashboard',
    relatedLibraries: ['recharts', 'victory', 'd3']
  },
  'chart': {
    description: 'Chart component for data visualization',
    origins: ['Recharts', 'Victory', 'Chart.js'],
    primaryAuthor: 'recharts@github.com',
    documentationUrl: 'https://recharts.org/en-US/guide',
    relatedLibraries: ['d3', 'victory', 'chart.js']
  },
  'statscard': {
    description: 'Statistics card component for displaying key metrics',
    origins: ['Material-UI', 'Ant Design', 'Tailwind UI'],
    primaryAuthor: 'mui@github.com',
    documentationUrl: 'https://mui.com/material-ui/react-card/',
    relatedLibraries: ['@mui/material', 'antd', '@chakra-ui/react']
  },
  'sparkline': {
    description: 'Sparkline chart component for inline data visualization',
    origins: ['React Sparklines', 'Victory', 'Recharts'],
    primaryAuthor: 'recharts@github.com',
    documentationUrl: 'https://recharts.org/en-US/api/Sparkline',
    relatedLibraries: ['react-sparklines', 'victory-sparkline']
  },
  'heatmap': {
    description: 'Heatmap component for visualizing data density',
    origins: ['React Heatmap Grid', 'Nivo', 'Ant Design Charts'],
    primaryAuthor: 'nivo@github.com',
    documentationUrl: 'https://nivo.rocks/heatmap/',
    relatedLibraries: ['@nivo/heatmap', 'react-heatmap-grid']
  },
  'treemap': {
    description: 'Treemap component for hierarchical data visualization',
    origins: ['D3', 'Nivo', 'Recharts'],
    primaryAuthor: 'd3@github.com',
    documentationUrl: 'https://nivo.rocks/treemap/',
    relatedLibraries: ['d3-hierarchy', '@nivo/treemap']
  },
  'graph': {
    description: 'Graph/network visualization component',
    origins: ['React Flow', 'Cytoscape.js', 'vis.js'],
    primaryAuthor: 'react-flow@github.com',
    documentationUrl: 'https://reactflow.dev/',
    relatedLibraries: ['react-flow', 'cytoscape', 'vis-network']
  },
  'advanced-data-table': {
    description: 'Advanced data table with sorting, filtering, and pagination',
    origins: ['React Table', 'AG Grid', 'Material-UI DataGrid'],
    primaryAuthor: 'tanstack@github.com',
    documentationUrl: 'https://tanstack.com/table/latest',
    relatedLibraries: ['@tanstack/react-table', 'ag-grid-react', '@mui/x-data-grid']
  },

  // Form Components
  'form': {
    description: 'Form component with validation and submission handling',
    origins: ['React Hook Form', 'Formik', 'Ant Design Form'],
    primaryAuthor: 'react-hook-form@github.com',
    documentationUrl: 'https://react-hook-form.com/',
    relatedLibraries: ['react-hook-form', 'formik', 'react-final-form']
  },
  'input': {
    description: 'Input field component with various types and validation',
    origins: ['Material-UI', 'Ant Design', 'Chakra UI'],
    primaryAuthor: 'mui@github.com',
    documentationUrl: 'https://mui.com/material-ui/react-text-field/',
    relatedLibraries: ['@mui/material', 'antd', '@chakra-ui/react']
  },
  'select': {
    description: 'Select/dropdown component with search and multi-select',
    origins: ['React Select', 'Ant Design Select', 'Material-UI Select'],
    primaryAuthor: 'react-select@github.com',
    documentationUrl: 'https://react-select.com/',
    relatedLibraries: ['react-select', 'rc-select', '@mui/material']
  },
  'datepicker': {
    description: 'Date picker component with calendar interface',
    origins: ['React DatePicker', 'Ant Design DatePicker', 'Material-UI DatePicker'],
    primaryAuthor: 'react-datepicker@github.com',
    documentationUrl: 'https://reactdatepicker.com/',
    relatedLibraries: ['react-datepicker', 'react-day-picker', '@mui/x-date-pickers']
  },
  'fileupload': {
    description: 'File upload component with drag-and-drop support',
    origins: ['React Dropzone', 'Ant Design Upload', 'Uppy'],
    primaryAuthor: 'react-dropzone@github.com',
    documentationUrl: 'https://react-dropzone.js.org/',
    relatedLibraries: ['react-dropzone', 'filepond', '@uppy/react']
  },
  'richtexteditor': {
    description: 'Rich text editor component with formatting tools',
    origins: ['Draft.js', 'Quill', 'TipTap'],
    primaryAuthor: 'facebook@github.com',
    documentationUrl: 'https://draftjs.org/',
    relatedLibraries: ['draft-js', 'react-quill', '@tiptap/react']
  },
  'rangeslider': {
    description: 'Range slider component for selecting value ranges',
    origins: ['RC Slider', 'Material-UI Slider', 'React Slider'],
    primaryAuthor: 'react-component@github.com',
    documentationUrl: 'https://slider-react-component.vercel.app/',
    relatedLibraries: ['rc-slider', '@mui/material', 'react-slider']
  },
  'colorpicker': {
    description: 'Color picker component with various formats',
    origins: ['React Color', 'Ant Design ColorPicker', 'React Colorful'],
    primaryAuthor: 'react-color@github.com',
    documentationUrl: 'https://casesandberg.github.io/react-color/',
    relatedLibraries: ['react-color', 'react-colorful', '@uiw/react-color']
  },

  // Navigation Components
  'navbar': {
    description: 'Navigation bar component for top-level navigation',
    origins: ['Material-UI AppBar', 'Ant Design Header', 'Bootstrap Navbar'],
    primaryAuthor: 'mui@github.com',
    documentationUrl: 'https://mui.com/material-ui/react-app-bar/',
    relatedLibraries: ['@mui/material', 'antd', 'react-bootstrap']
  },
  'sidebar': {
    description: 'Sidebar navigation component',
    origins: ['Material-UI Drawer', 'Ant Design Sider', 'React Pro Sidebar'],
    primaryAuthor: 'ant-design@github.com',
    documentationUrl: 'https://ant.design/components/layout#layoutsider',
    relatedLibraries: ['react-pro-sidebar', '@mui/material', 'antd']
  },
  'breadcrumb': {
    description: 'Breadcrumb navigation component',
    origins: ['Material-UI Breadcrumbs', 'Ant Design Breadcrumb', 'Chakra UI'],
    primaryAuthor: 'mui@github.com',
    documentationUrl: 'https://mui.com/material-ui/react-breadcrumbs/',
    relatedLibraries: ['@mui/material', 'antd', '@chakra-ui/react']
  },
  'tabs': {
    description: 'Tabs component for content organization',
    origins: ['Material-UI Tabs', 'Ant Design Tabs', 'React Tabs'],
    primaryAuthor: 'react-tabs@github.com',
    documentationUrl: 'https://github.com/reactjs/react-tabs',
    relatedLibraries: ['react-tabs', '@mui/material', 'antd']
  },
  'stepper': {
    description: 'Stepper/wizard component for multi-step processes',
    origins: ['Material-UI Stepper', 'Ant Design Steps', 'React Stepper'],
    primaryAuthor: 'mui@github.com',
    documentationUrl: 'https://mui.com/material-ui/react-stepper/',
    relatedLibraries: ['@mui/material', 'antd', 'react-stepper-horizontal']
  },
  'pagination': {
    description: 'Pagination component for navigating through pages',
    origins: ['Material-UI Pagination', 'Ant Design Pagination', 'React Paginate'],
    primaryAuthor: 'react-paginate@github.com',
    documentationUrl: 'https://github.com/AdeleD/react-paginate',
    relatedLibraries: ['react-paginate', '@mui/material', 'antd']
  },
  'menu': {
    description: 'Menu component with dropdowns and submenus',
    origins: ['Material-UI Menu', 'Ant Design Menu', 'React Menu'],
    primaryAuthor: 'mui@github.com',
    documentationUrl: 'https://mui.com/material-ui/react-menu/',
    relatedLibraries: ['@mui/material', 'antd', '@szhsin/react-menu']
  },
  'commandpalette': {
    description: 'Command palette component for quick actions',
    origins: ['Cmdk', 'Kbar', 'React Command Palette'],
    primaryAuthor: 'pacocoursey@github.com',
    documentationUrl: 'https://cmdk.paco.me/',
    relatedLibraries: ['cmdk', 'kbar', 'react-command-palette']
  },

  // Feedback Components
  'alert': {
    description: 'Alert component for displaying important messages',
    origins: ['Material-UI Alert', 'Ant Design Alert', 'Chakra UI Alert'],
    primaryAuthor: 'mui@github.com',
    documentationUrl: 'https://mui.com/material-ui/react-alert/',
    relatedLibraries: ['@mui/material', 'antd', '@chakra-ui/react']
  },
  'toast': {
    description: 'Toast notification component',
    origins: ['React Toastify', 'React Hot Toast', 'Sonner'],
    primaryAuthor: 'react-toastify@github.com',
    documentationUrl: 'https://fkhadra.github.io/react-toastify/',
    relatedLibraries: ['react-toastify', 'react-hot-toast', 'sonner']
  },
  'modal': {
    description: 'Modal/dialog component for overlays',
    origins: ['Material-UI Dialog', 'Ant Design Modal', 'React Modal'],
    primaryAuthor: 'react-modal@github.com',
    documentationUrl: 'https://reactcommunity.org/react-modal/',
    relatedLibraries: ['react-modal', '@mui/material', 'antd']
  },
  'progress': {
    description: 'Progress indicator component',
    origins: ['Material-UI Progress', 'Ant Design Progress', 'React Circular Progressbar'],
    primaryAuthor: 'mui@github.com',
    documentationUrl: 'https://mui.com/material-ui/react-progress/',
    relatedLibraries: ['@mui/material', 'antd', 'react-circular-progressbar']
  },
  'skeleton': {
    description: 'Skeleton loader component for loading states',
    origins: ['Material-UI Skeleton', 'Ant Design Skeleton', 'React Loading Skeleton'],
    primaryAuthor: 'react-loading-skeleton@github.com',
    documentationUrl: 'https://github.com/dvtng/react-loading-skeleton',
    relatedLibraries: ['react-loading-skeleton', '@mui/material', 'antd']
  },
  'loading': {
    description: 'Loading spinner/indicator component',
    origins: ['React Spinners', 'Material-UI CircularProgress', 'React Loader Spinner'],
    primaryAuthor: 'react-spinners@github.com',
    documentationUrl: 'https://www.davidhu.io/react-spinners/',
    relatedLibraries: ['react-spinners', 'react-loader-spinner', '@mui/material']
  },
  'emptystate': {
    description: 'Empty state component for no-data scenarios',
    origins: ['Ant Design Empty', 'Material-UI', 'Custom implementations'],
    primaryAuthor: 'ant-design@github.com',
    documentationUrl: 'https://ant.design/components/empty',
    relatedLibraries: ['antd', '@mui/material', 'react-empty-states']
  },
  'notification': {
    description: 'Notification component for system messages',
    origins: ['Ant Design Notification', 'React Notifications', 'Notistack'],
    primaryAuthor: 'ant-design@github.com',
    documentationUrl: 'https://ant.design/components/notification',
    relatedLibraries: ['antd', 'react-notifications', 'notistack']
  },

  // Layout Components
  'grid': {
    description: 'Grid layout component for responsive layouts',
    origins: ['Material-UI Grid', 'Ant Design Grid', 'React Grid Layout'],
    primaryAuthor: 'react-grid-layout@github.com',
    documentationUrl: 'https://github.com/react-grid-layout/react-grid-layout',
    relatedLibraries: ['react-grid-layout', '@mui/material', 'antd']
  },
  'container': {
    description: 'Container component for content wrapping',
    origins: ['Material-UI Container', 'Bootstrap Container', 'Chakra UI Container'],
    primaryAuthor: 'mui@github.com',
    documentationUrl: 'https://mui.com/material-ui/react-container/',
    relatedLibraries: ['@mui/material', 'react-bootstrap', '@chakra-ui/react']
  },
  'card': {
    description: 'Card component for content grouping',
    origins: ['Material-UI Card', 'Ant Design Card', 'Chakra UI Card'],
    primaryAuthor: 'mui@github.com',
    documentationUrl: 'https://mui.com/material-ui/react-card/',
    relatedLibraries: ['@mui/material', 'antd', '@chakra-ui/react']
  },
  'accordion': {
    description: 'Accordion/collapse component for expandable content',
    origins: ['Material-UI Accordion', 'Ant Design Collapse', 'React Accessible Accordion'],
    primaryAuthor: 'react-accessible-accordion@github.com',
    documentationUrl: 'https://github.com/springload/react-accessible-accordion',
    relatedLibraries: ['react-accessible-accordion', '@mui/material', 'antd']
  },
  'divider': {
    description: 'Divider component for visual separation',
    origins: ['Material-UI Divider', 'Ant Design Divider', 'Chakra UI Divider'],
    primaryAuthor: 'mui@github.com',
    documentationUrl: 'https://mui.com/material-ui/react-divider/',
    relatedLibraries: ['@mui/material', 'antd', '@chakra-ui/react']
  },
  'spacer': {
    description: 'Spacer component for layout spacing',
    origins: ['Chakra UI Spacer', 'Material-UI Box', 'Custom implementations'],
    primaryAuthor: 'chakra-ui@github.com',
    documentationUrl: 'https://chakra-ui.com/docs/components/spacer',
    relatedLibraries: ['@chakra-ui/react', '@mui/material', 'styled-components']
  },
  'split': {
    description: 'Split pane component for resizable panels',
    origins: ['React Split Pane', 'React Splitter Layout', 'Allotment'],
    primaryAuthor: 'react-split-pane@github.com',
    documentationUrl: 'https://github.com/tomkp/react-split-pane',
    relatedLibraries: ['react-split-pane', 'react-splitter-layout', 'allotment']
  },
  'stack': {
    description: 'Stack layout component for vertical/horizontal layouts',
    origins: ['Chakra UI Stack', 'Material-UI Stack', 'Mantine Stack'],
    primaryAuthor: 'chakra-ui@github.com',
    documentationUrl: 'https://chakra-ui.com/docs/components/stack',
    relatedLibraries: ['@chakra-ui/react', '@mui/material', '@mantine/core']
  },

  // Media Components
  'imagegallery': {
    description: 'Image gallery component with lightbox support',
    origins: ['React Image Gallery', 'React Photo Gallery', 'Photoswipe'],
    primaryAuthor: 'react-image-gallery@github.com',
    documentationUrl: 'https://github.com/xiaolin/react-image-gallery',
    relatedLibraries: ['react-image-gallery', 'react-photo-gallery', 'photoswipe']
  },
  'videoplayer': {
    description: 'Video player component with controls',
    origins: ['React Player', 'Video.js', 'Plyr React'],
    primaryAuthor: 'react-player@github.com',
    documentationUrl: 'https://github.com/cookpete/react-player',
    relatedLibraries: ['react-player', 'video-react', 'plyr-react']
  },
  'audioplayer': {
    description: 'Audio player component with controls',
    origins: ['React Audio Player', 'React H5 Audio Player', 'Howler.js'],
    primaryAuthor: 'react-audio-player@github.com',
    documentationUrl: 'https://github.com/justinmc/react-audio-player',
    relatedLibraries: ['react-audio-player', 'react-h5-audio-player', 'howler']
  },
  'carousel': {
    description: 'Carousel/slider component for content rotation',
    origins: ['React Slick', 'Swiper', 'React Responsive Carousel'],
    primaryAuthor: 'react-slick@github.com',
    documentationUrl: 'https://react-slick.neostack.com/',
    relatedLibraries: ['react-slick', 'swiper', 'react-responsive-carousel']
  },
  'lightbox': {
    description: 'Lightbox component for image viewing',
    origins: ['React Images', 'Yet Another React Lightbox', 'Lightbox React'],
    primaryAuthor: 'react-images@github.com',
    documentationUrl: 'https://github.com/jossmac/react-images',
    relatedLibraries: ['react-images', 'yet-another-react-lightbox', 'react-image-lightbox']
  },
  'avatar': {
    description: 'Avatar component for user profile images',
    origins: ['Material-UI Avatar', 'Ant Design Avatar', 'React Avatar'],
    primaryAuthor: 'mui@github.com',
    documentationUrl: 'https://mui.com/material-ui/react-avatar/',
    relatedLibraries: ['@mui/material', 'antd', 'react-avatar']
  },
  'icon': {
    description: 'Icon component for displaying icons',
    origins: ['React Icons', 'Material-UI Icons', 'Lucide React'],
    primaryAuthor: 'react-icons@github.com',
    documentationUrl: 'https://react-icons.github.io/react-icons/',
    relatedLibraries: ['react-icons', '@mui/icons-material', 'lucide-react']
  },
  'slideshow': {
    description: 'Slideshow component for presentations',
    origins: ['React Slideshow', 'React Awesome Slider', 'Pure React Carousel'],
    primaryAuthor: 'react-slideshow@github.com',
    documentationUrl: 'https://react-slideshow.herokuapp.com/',
    relatedLibraries: ['react-slideshow-image', 'react-awesome-slider', 'pure-react-carousel']
  },

  // E-commerce Components
  'productcard': {
    description: 'Product card component for e-commerce',
    origins: ['Commerce.js', 'Saleor', 'Custom implementations'],
    primaryAuthor: 'commercejs@github.com',
    documentationUrl: 'https://commercejs.com/docs',
    relatedLibraries: ['@chec/commerce.js', 'react-storefront', 'medusa-react']
  },
  'shoppingcart': {
    description: 'Shopping cart component for e-commerce',
    origins: ['React Shopping Cart', 'Commerce.js', 'Snipcart'],
    primaryAuthor: 'react-shopping-cart@github.com',
    documentationUrl: 'https://github.com/jeffersonRibeiro/react-shopping-cart',
    relatedLibraries: ['react-shopping-cart', '@chec/commerce.js', 'snipcart']
  },
  'pricetag': {
    description: 'Price tag component for product pricing',
    origins: ['Custom implementations', 'E-commerce UI kits'],
    primaryAuthor: 'ant-design@github.com',
    documentationUrl: 'https://ant.design/components/tag',
    relatedLibraries: ['antd', '@mui/material', 'react-price-tag']
  },
  'productgrid': {
    description: 'Product grid layout for e-commerce',
    origins: ['React Grid Gallery', 'Commerce.js', 'Custom implementations'],
    primaryAuthor: 'react-grid-gallery@github.com',
    documentationUrl: 'https://benhowell.github.io/react-grid-gallery/',
    relatedLibraries: ['react-grid-gallery', '@chec/commerce.js', 'react-product-grid']
  },
  'review': {
    description: 'Review/rating component for products',
    origins: ['React Rating', 'Material-UI Rating', 'React Star Ratings'],
    primaryAuthor: 'react-rating@github.com',
    documentationUrl: 'https://github.com/dreyescat/react-rating',
    relatedLibraries: ['react-rating', '@mui/material', 'react-star-ratings']
  },
  'wishlist': {
    description: 'Wishlist component for saved items',
    origins: ['Custom implementations', 'E-commerce solutions'],
    primaryAuthor: 'commercejs@github.com',
    documentationUrl: 'https://commercejs.com/docs/guides/wishlist',
    relatedLibraries: ['@chec/commerce.js', 'react-use-wishlist', 'custom-wishlist']
  },
  'ordersummary': {
    description: 'Order summary component for checkout',
    origins: ['Stripe Elements', 'Commerce.js', 'Custom implementations'],
    primaryAuthor: 'stripe@github.com',
    documentationUrl: 'https://stripe.com/docs/stripe-js/react',
    relatedLibraries: ['@stripe/react-stripe-js', '@chec/commerce.js', 'react-checkout']
  },
  'checkout': {
    description: 'Checkout component for payment processing',
    origins: ['Stripe Checkout', 'PayPal Checkout', 'Square Checkout'],
    primaryAuthor: 'stripe@github.com',
    documentationUrl: 'https://stripe.com/docs/payments/checkout',
    relatedLibraries: ['@stripe/react-stripe-js', 'react-paypal-js', '@square/web-sdk']
  },

  // Productivity Components
  'kanban': {
    description: 'Kanban board component for task management',
    origins: ['React Beautiful DnD', 'React Kanban', 'React Trello'],
    primaryAuthor: 'atlassian@github.com',
    documentationUrl: 'https://github.com/atlassian/react-beautiful-dnd',
    relatedLibraries: ['react-beautiful-dnd', '@asseinfo/react-kanban', 'react-trello']
  },
  'calendar': {
    description: 'Calendar component for date display and events',
    origins: ['React Big Calendar', 'FullCalendar', 'React Calendar'],
    primaryAuthor: 'react-big-calendar@github.com',
    documentationUrl: 'https://github.com/jquense/react-big-calendar',
    relatedLibraries: ['react-big-calendar', '@fullcalendar/react', 'react-calendar']
  },
  'timeline': {
    description: 'Timeline component for chronological display',
    origins: ['React Vertical Timeline', 'React Chrono', 'React Timeline'],
    primaryAuthor: 'react-vertical-timeline@github.com',
    documentationUrl: 'https://github.com/stephane-monnot/react-vertical-timeline',
    relatedLibraries: ['react-vertical-timeline-component', 'react-chrono', 'react-timeline-9000']
  },
  'todolist': {
    description: 'Todo list component for task tracking',
    origins: ['React Todo', 'Material-UI', 'Custom implementations'],
    primaryAuthor: 'mui@github.com',
    documentationUrl: 'https://mui.com/material-ui/react-list/',
    relatedLibraries: ['@mui/material', 'react-todos', 'react-todo-list']
  },
  'gantt': {
    description: 'Gantt chart component for project planning',
    origins: ['React Gantt', 'DHTMLX Gantt', 'Gantt for React'],
    primaryAuthor: 'react-gantt@github.com',
    documentationUrl: 'https://github.com/MaTeMaTuK/gantt-task-react',
    relatedLibraries: ['gantt-task-react', 'dhtmlx-gantt', 'react-gantt-chart']
  },
  'taskcard': {
    description: 'Task card component for project management',
    origins: ['React Beautiful DnD', 'Material-UI Card', 'Custom implementations'],
    primaryAuthor: 'atlassian@github.com',
    documentationUrl: 'https://github.com/atlassian/react-beautiful-dnd',
    relatedLibraries: ['react-beautiful-dnd', '@mui/material', 'react-task-card']
  },
  'datatable': {
    description: 'Data table component with advanced features',
    origins: ['React Table', 'AG Grid', 'Material-UI DataGrid'],
    primaryAuthor: 'tanstack@github.com',
    documentationUrl: 'https://tanstack.com/table/latest',
    relatedLibraries: ['@tanstack/react-table', 'ag-grid-react', '@mui/x-data-grid']
  },
  'scheduler': {
    description: 'Scheduler component for appointments and events',
    origins: ['React Big Scheduler', 'DayPilot', 'React Scheduler'],
    primaryAuthor: 'react-big-scheduler@github.com',
    documentationUrl: 'https://github.com/StephenChou1017/react-big-scheduler',
    relatedLibraries: ['react-big-scheduler', '@daypilot/daypilot-lite-react', 'react-scheduler']
  },
  'timetracker': {
    description: 'Time tracking component for productivity',
    origins: ['React Time Tracker', 'Toggl Track', 'Custom implementations'],
    primaryAuthor: 'react-time-tracker@github.com',
    documentationUrl: 'https://github.com/madslundt/react-time-tracker',
    relatedLibraries: ['react-time-tracker', 'react-timer-hook', 'react-compound-timer']
  },

  // Real-time Components
  'chat': {
    description: 'Chat component for real-time messaging',
    origins: ['React Chat UI', 'Stream Chat React', 'Chatscope'],
    primaryAuthor: 'stream-chat@github.com',
    documentationUrl: 'https://getstream.io/chat/docs/react/',
    relatedLibraries: ['stream-chat-react', 'react-chat-ui', '@chatscope/chat-ui-kit-react']
  },
  'livefeed': {
    description: 'Live feed component for real-time updates',
    origins: ['React Activity Feed', 'Stream React', 'Custom implementations'],
    primaryAuthor: 'getstream@github.com',
    documentationUrl: 'https://getstream.io/activity-feeds/docs/react/',
    relatedLibraries: ['react-activity-feed', 'stream-react', 'react-live-feed']
  },
  'presenceindicator': {
    description: 'Presence indicator for online status',
    origins: ['React Presence', 'Custom implementations', 'Chat UI kits'],
    primaryAuthor: 'stream-chat@github.com',
    documentationUrl: 'https://getstream.io/chat/docs/react/presence/',
    relatedLibraries: ['stream-chat-react', 'react-presence', 'react-online-status']
  },
  'collaboration': {
    description: 'Collaboration component for real-time editing',
    origins: ['Yjs', 'Collaborative Editing', 'Quill Collaborative'],
    primaryAuthor: 'yjs@github.com',
    documentationUrl: 'https://docs.yjs.dev/',
    relatedLibraries: ['yjs', 'react-collaborative', '@tiptap/extension-collaboration']
  },
  'livechart': {
    description: 'Live chart component for real-time data',
    origins: ['React Real-time Chart', 'Victory', 'Recharts Live'],
    primaryAuthor: 'victory@github.com',
    documentationUrl: 'https://formidable.com/open-source/victory/',
    relatedLibraries: ['victory', 'react-realtime-chart', 'recharts']
  },
  'statusboard': {
    description: 'Status board for system monitoring',
    origins: ['React Status Board', 'Dashboard libraries', 'Custom implementations'],
    primaryAuthor: 'react-status-board@github.com',
    documentationUrl: 'https://github.com/jaredholdcroft/react-status-board',
    relatedLibraries: ['react-status-board', 'react-dashboard', 'statuspage-react']
  },
  'activitystream': {
    description: 'Activity stream component for user actions',
    origins: ['Stream React', 'React Activity Feed', 'Custom implementations'],
    primaryAuthor: 'getstream@github.com',
    documentationUrl: 'https://getstream.io/activity-feeds/docs/react/',
    relatedLibraries: ['react-activity-feed', 'stream-react', 'react-activity-stream']
  },

  // Communication Components
  'commentsection': {
    description: 'Comment section component for discussions',
    origins: ['Disqus React', 'React Comments', 'Utterances'],
    primaryAuthor: 'disqus@github.com',
    documentationUrl: 'https://github.com/disqus/disqus-react',
    relatedLibraries: ['disqus-react', 'react-comments-section', 'react-utterances']
  },
  'videocall': {
    description: 'Video call component for communication',
    origins: ['Agora React', 'Twilio Video', 'Daily React'],
    primaryAuthor: 'agora@github.com',
    documentationUrl: 'https://docs.agora.io/en/video-calling/get-started/get-started-uikit',
    relatedLibraries: ['agora-react-uikit', 'twilio-video', '@daily-co/daily-react']
  },
  'emailcomposer': {
    description: 'Email composer component',
    origins: ['React Email Editor', 'React Draft Wysiwyg', 'React Email'],
    primaryAuthor: 'unlayer@github.com',
    documentationUrl: 'https://github.com/unlayer/react-email-editor',
    relatedLibraries: ['react-email-editor', 'react-draft-wysiwyg', '@react-email/components']
  },
  'sharedialog': {
    description: 'Share dialog component for social sharing',
    origins: ['React Share', 'React Social Share', 'React Share Buttons'],
    primaryAuthor: 'react-share@github.com',
    documentationUrl: 'https://github.com/nygardk/react-share',
    relatedLibraries: ['react-share', 'react-social-share-buttons', 'react-social-sharing']
  },
  'reaction': {
    description: 'Reaction component for emojis and likes',
    origins: ['React Reactions', 'Emoji Picker React', 'React Emoji'],
    primaryAuthor: 'emoji-picker-react@github.com',
    documentationUrl: 'https://github.com/ealush/emoji-picker-react',
    relatedLibraries: ['react-reactions', 'emoji-picker-react', 'react-emoji-render']
  },
  'mention': {
    description: 'Mention component for tagging users',
    origins: ['React Mentions', 'Draft.js Mention', 'React Mention'],
    primaryAuthor: 'react-mentions@github.com',
    documentationUrl: 'https://github.com/signavio/react-mentions',
    relatedLibraries: ['react-mentions', 'draft-js-mention-plugin', '@draft-js-plugins/mention']
  },
  'poll': {
    description: 'Poll component for surveys and voting',
    origins: ['React Polls', 'React Survey', 'Custom implementations'],
    primaryAuthor: 'react-polls@github.com',
    documentationUrl: 'https://github.com/viniciusmeneses/react-polls',
    relatedLibraries: ['react-polls', 'react-surveys', 'react-poll-widget']
  },
  'messagethread': {
    description: 'Message thread component for conversations',
    origins: ['Stream Chat React', 'Chatscope', 'React Chat Thread'],
    primaryAuthor: 'stream-chat@github.com',
    documentationUrl: 'https://getstream.io/chat/docs/react/message-threads/',
    relatedLibraries: ['stream-chat-react', '@chatscope/chat-ui-kit-react', 'react-chat-thread']
  },

  // Gaming Components
  'leaderboard': {
    description: 'Leaderboard component for rankings',
    origins: ['React Leaderboard', 'Gaming UI libraries', 'Custom implementations'],
    primaryAuthor: 'react-leaderboard@github.com',
    documentationUrl: 'https://github.com/redacademy/react-leaderboard',
    relatedLibraries: ['react-leaderboard', 'react-game-leaderboard', 'react-rankings']
  },
  'achievement': {
    description: 'Achievement component for gamification',
    origins: ['React Gamification', 'React Achievement', 'Custom implementations'],
    primaryAuthor: 'react-gamification@github.com',
    documentationUrl: 'https://github.com/reaviz/react-gamification',
    relatedLibraries: ['react-gamification', 'react-achievement-badges', 'react-rewards']
  },
  'scorecard': {
    description: 'Score card component for game stats',
    origins: ['React Scorecard', 'Gaming UI libraries', 'Custom implementations'],
    primaryAuthor: 'react-scorecard@github.com',
    documentationUrl: 'https://github.com/react-scorecard/react-scorecard',
    relatedLibraries: ['react-scorecard', 'react-game-scorecard', 'react-stats-card']
  },
  'gameprogress': {
    description: 'Game progress component with levels',
    origins: ['React Progress Bar', 'Gaming UI libraries', 'Custom implementations'],
    primaryAuthor: 'react-step-progress-bar@github.com',
    documentationUrl: 'https://github.com/pierreericgarcia/react-step-progress-bar',
    relatedLibraries: ['react-step-progress-bar', 'react-game-progress', 'react-level-progress']
  },
  'playerprofile': {
    description: 'Player profile component for gaming',
    origins: ['React User Profile', 'Gaming UI libraries', 'Custom implementations'],
    primaryAuthor: 'react-user-profile@github.com',
    documentationUrl: 'https://github.com/jbuget/react-user-profile',
    relatedLibraries: ['react-user-profile', 'react-player-card', 'react-game-profile']
  },
  'tournament': {
    description: 'Tournament bracket component',
    origins: ['React Tournament Bracket', 'React Brackets', 'Custom implementations'],
    primaryAuthor: 'react-tournament-bracket@github.com',
    documentationUrl: 'https://github.com/g-loot/react-tournament-brackets',
    relatedLibraries: ['react-tournament-brackets', 'react-brackets', 'react-tournament-tree']
  },
  'quest': {
    description: 'Quest/mission component for games',
    origins: ['React Quest', 'Gaming UI libraries', 'Custom implementations'],
    primaryAuthor: 'react-quest@github.com',
    documentationUrl: 'https://github.com/react-quest/react-quest',
    relatedLibraries: ['react-quest-log', 'react-game-quests', 'react-mission-tracker']
  },
  'matchhistory': {
    description: 'Match history component for game records',
    origins: ['Gaming UI libraries', 'Custom implementations', 'Esports platforms'],
    primaryAuthor: 'react-match-history@github.com',
    documentationUrl: 'https://github.com/esports-ui/react-match-history',
    relatedLibraries: ['react-match-history', 'react-game-history', 'react-esports-stats']
  },

  // Developer Tools Components
  'terminal': {
    description: 'Terminal emulator component',
    origins: ['React Terminal', 'Xterm.js', 'React Console Emulator'],
    primaryAuthor: 'react-terminal@github.com',
    documentationUrl: 'https://github.com/bvaughn/react-terminal',
    relatedLibraries: ['react-terminal-ui', 'xterm', 'react-console-emulator']
  },
  'console': {
    description: 'Console component for logs and debugging',
    origins: ['React Console', 'React Log Viewer', 'Console Feed'],
    primaryAuthor: 'react-console@github.com',
    documentationUrl: 'https://github.com/samdenty/console-feed',
    relatedLibraries: ['console-feed', 'react-console-log', 'react-log-viewer']
  },
  'debugger': {
    description: 'Debugger component for development',
    origins: ['React DevTools', 'React Inspector', 'Custom implementations'],
    primaryAuthor: 'facebook@github.com',
    documentationUrl: 'https://github.com/facebook/react/tree/main/packages/react-devtools',
    relatedLibraries: ['react-devtools', 'react-inspector', 'react-json-inspector']
  },
  'apiexplorer': {
    description: 'API explorer component for documentation',
    origins: ['Swagger UI React', 'GraphiQL', 'React API Explorer'],
    primaryAuthor: 'swagger@github.com',
    documentationUrl: 'https://github.com/swagger-api/swagger-ui',
    relatedLibraries: ['swagger-ui-react', 'graphiql', 'react-api-explorer']
  },
  'logviewer': {
    description: 'Log viewer component for monitoring',
    origins: ['React Log Viewer', 'React Lazylog', 'Log Monitor'],
    primaryAuthor: 'react-lazylog@github.com',
    documentationUrl: 'https://github.com/mozilla-frontend-infra/react-lazylog',
    relatedLibraries: ['react-lazylog', 'react-log-viewer', 'react-log-monitor']
  },
  'metricspanel': {
    description: 'Metrics panel for performance monitoring',
    origins: ['React Metrics', 'Grafana React', 'Custom implementations'],
    primaryAuthor: 'grafana@github.com',
    documentationUrl: 'https://github.com/grafana/grafana/tree/main/packages/grafana-ui',
    relatedLibraries: ['@grafana/ui', 'react-metrics', 'react-performance-metrics']
  },
  'configeditor': {
    description: 'Configuration editor component',
    origins: ['React JSON Editor', 'Monaco Editor', 'React Config Editor'],
    primaryAuthor: 'react-json-editor@github.com',
    documentationUrl: 'https://github.com/vankop/jsoneditor-react',
    relatedLibraries: ['jsoneditor-react', '@monaco-editor/react', 'react-ace']
  },
  'codeeditor': {
    description: 'Code editor component for development',
    origins: ['Monaco Editor', 'CodeMirror', 'Ace Editor'],
    primaryAuthor: 'microsoft@github.com',
    documentationUrl: 'https://microsoft.github.io/monaco-editor/',
    relatedLibraries: ['@monaco-editor/react', '@uiw/react-codemirror', 'react-ace']
  },

  // Accessibility Components
  'screenreaderannouncer': {
    description: 'Screen reader announcer for accessibility',
    origins: ['React Aria Live', 'React Announce', 'Custom implementations'],
    primaryAuthor: 'react-aria-live@github.com',
    documentationUrl: 'https://github.com/AlmeroSteyn/react-aria-live',
    relatedLibraries: ['react-aria-live', 'react-announce', 'react-a11y-announcer']
  },
  'focustrap': {
    description: 'Focus trap component for accessibility',
    origins: ['Focus Trap React', 'React Focus Lock', 'React Focus Trap'],
    primaryAuthor: 'focus-trap@github.com',
    documentationUrl: 'https://github.com/focus-trap/focus-trap-react',
    relatedLibraries: ['focus-trap-react', 'react-focus-lock', 'react-focus-trap']
  },
  'skiplinks': {
    description: 'Skip links for keyboard navigation',
    origins: ['React Skip Links', 'Reach UI Skip Nav', 'Custom implementations'],
    primaryAuthor: 'reach@github.com',
    documentationUrl: 'https://reach.tech/skip-nav/',
    relatedLibraries: ['@reach/skip-nav', 'react-skip-links', 'react-a11y-skip-links']
  },
  'arialiveregion': {
    description: 'ARIA live region for announcements',
    origins: ['React Aria Live', 'React Live Announcer', 'Custom implementations'],
    primaryAuthor: 'react-aria-live@github.com',
    documentationUrl: 'https://github.com/AlmeroSteyn/react-aria-live',
    relatedLibraries: ['react-aria-live', 'react-live-region', 'react-aria-announcer']
  },
  'accessibilitypanel': {
    description: 'Accessibility panel for testing',
    origins: ['React Accessibility', 'Storybook Accessibility', 'Custom implementations'],
    primaryAuthor: 'storybook@github.com',
    documentationUrl: 'https://storybook.js.org/addons/@storybook/addon-a11y',
    relatedLibraries: ['@storybook/addon-a11y', 'react-a11y', 'react-accessibility-checker']
  },
  'keyboardnavigator': {
    description: 'Keyboard navigation helper component',
    origins: ['React Hotkeys', 'React Keyboard', 'React Shortcuts'],
    primaryAuthor: 'react-hotkeys@github.com',
    documentationUrl: 'https://github.com/greena13/react-hotkeys',
    relatedLibraries: ['react-hotkeys-hook', 'react-hotkeys', 'react-keyboard-event-handler']
  },

  // Mobile Components
  'bottomsheet': {
    description: 'Bottom sheet component for mobile UI',
    origins: ['React Native Bottom Sheet', 'React Spring Bottom Sheet', 'React Modal Sheet'],
    primaryAuthor: 'react-spring@github.com',
    documentationUrl: 'https://github.com/Temzasse/react-modal-sheet',
    relatedLibraries: ['react-modal-sheet', 'react-spring-bottom-sheet', 'react-bottom-sheet']
  },
  'swipeablelist': {
    description: 'Swipeable list for mobile interactions',
    origins: ['React Swipeable List', 'React Swipe to Delete', 'React Native Swipeable'],
    primaryAuthor: 'react-swipeable-list@github.com',
    documentationUrl: 'https://github.com/sandstreamdev/react-swipeable-list',
    relatedLibraries: ['react-swipeable-list', 'react-swipe-to-delete-ios', 'react-swipeable']
  },
  'pulltorefresh': {
    description: 'Pull to refresh component',
    origins: ['React Pull to Refresh', 'React Custom Pull to Refresh', 'Mobile UI libraries'],
    primaryAuthor: 'react-pull-to-refresh@github.com',
    documentationUrl: 'https://github.com/CuongStf/react-pull-to-refresh',
    relatedLibraries: ['react-pull-to-refresh', 'react-custom-pull-to-refresh', 'react-pulltorefresh']
  },
  'floatingactionbutton': {
    description: 'Floating action button for mobile',
    origins: ['Material-UI FAB', 'React FAB', 'React Native FAB'],
    primaryAuthor: 'mui@github.com',
    documentationUrl: 'https://mui.com/material-ui/react-floating-action-button/',
    relatedLibraries: ['@mui/material', 'react-fab', 'react-tiny-fab']
  },
  'appbar': {
    description: 'App bar component for mobile headers',
    origins: ['Material-UI AppBar', 'React Native Elements Header', 'React App Bar'],
    primaryAuthor: 'mui@github.com',
    documentationUrl: 'https://mui.com/material-ui/react-app-bar/',
    relatedLibraries: ['@mui/material', 'react-native-elements', 'react-app-bar']
  },
  'drawer': {
    description: 'Navigation drawer component',
    origins: ['Material-UI Drawer', 'React Navigation Drawer', 'React Burger Menu'],
    primaryAuthor: 'mui@github.com',
    documentationUrl: 'https://mui.com/material-ui/react-drawer/',
    relatedLibraries: ['@mui/material', 'react-burger-menu', 'react-modern-drawer']
  },
  'segmentedcontrol': {
    description: 'Segmented control for option selection',
    origins: ['React Native Segmented Control', 'React Segmented Control', 'iOS-style controls'],
    primaryAuthor: 'react-native-community@github.com',
    documentationUrl: 'https://github.com/react-native-segmented-control/segmented-control',
    relatedLibraries: ['@react-native-segmented-control/segmented-control', 'react-segmented-control', 'react-ios-segmented-control']
  },

  // Enterprise Components
  'orgchart': {
    description: 'Organization chart component',
    origins: ['React Organizational Chart', 'React OrgChart', 'D3 Org Chart'],
    primaryAuthor: 'react-organizational-chart@github.com',
    documentationUrl: 'https://github.com/daniel-hauser/react-organizational-chart',
    relatedLibraries: ['react-organizational-chart', 'react-orgchart', 'd3-org-chart']
  },
  'workflow': {
    description: 'Workflow builder component',
    origins: ['React Flow', 'React Diagrams', 'BPMN.js'],
    primaryAuthor: 'react-flow@github.com',
    documentationUrl: 'https://reactflow.dev/',
    relatedLibraries: ['reactflow', 'react-diagrams', 'bpmn-js']
  },
  'approvalflow': {
    description: 'Approval flow component for processes',
    origins: ['React Flow', 'Workflow libraries', 'Custom implementations'],
    primaryAuthor: 'react-flow@github.com',
    documentationUrl: 'https://reactflow.dev/examples/interaction/save-and-restore',
    relatedLibraries: ['reactflow', 'react-workflow', 'react-approval-flow']
  },
  'reportbuilder': {
    description: 'Report builder component for analytics',
    origins: ['React Report Builder', 'ReportLab', 'Custom implementations'],
    primaryAuthor: 'react-report-builder@github.com',
    documentationUrl: 'https://github.com/react-report-builder/react-report-builder',
    relatedLibraries: ['react-report-builder', 'react-analytics-report', 'react-reporter']
  },
  'auditlog': {
    description: 'Audit log component for tracking',
    origins: ['React Audit Log', 'Activity Log libraries', 'Custom implementations'],
    primaryAuthor: 'react-audit-log@github.com',
    documentationUrl: 'https://github.com/react-audit-log/react-audit-log',
    relatedLibraries: ['react-audit-log', 'react-activity-log', 'react-event-timeline']
  },
  'permissionmatrix': {
    description: 'Permission matrix for access control',
    origins: ['React Permission', 'RBAC libraries', 'Custom implementations'],
    primaryAuthor: 'react-permission@github.com',
    documentationUrl: 'https://github.com/Trendyol/react-permissions',
    relatedLibraries: ['react-permissions', 'react-rbac', 'react-access-control']
  },
  'compliancedashboard': {
    description: 'Compliance dashboard for regulations',
    origins: ['Dashboard libraries', 'Custom implementations', 'Enterprise UI kits'],
    primaryAuthor: 'ant-design@github.com',
    documentationUrl: 'https://ant.design/docs/spec/dashboard',
    relatedLibraries: ['@ant-design/pro-components', 'react-admin', 'react-dashboard']
  },

  // CSS Framework
  'styled-system': {
    description: 'Style props for building design systems',
    origins: ['Styled System', 'System UI', 'Theme UI'],
    primaryAuthor: 'styled-system@github.com',
    documentationUrl: 'https://styled-system.com/',
    relatedLibraries: ['styled-system', 'theme-ui', '@styled-system/css']
  },

  // Design Tool Integration
  'figma-code-connect': {
    description: 'Figma to code connection tool',
    origins: ['Figma', 'Code Connect', 'Design to Code'],
    primaryAuthor: 'figma@github.com',
    documentationUrl: 'https://www.figma.com/developers/api',
    relatedLibraries: ['@figma/code-connect', 'figma-js', 'figma-api']
  }
};

async function updateComponentDefinitions() {
  console.log('🔄 Updating component definitions with origin information...\n');

  let updatedCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;

  for (const [slug, info] of Object.entries(COMPONENT_DEFINITIONS)) {
    try {
      // Find the primary author
      const author = await prisma.user.findUnique({
        where: { email: info.primaryAuthor }
      });

      if (!author) {
        console.error(`❌ Author not found: ${info.primaryAuthor} for ${slug}`);
        errorCount++;
        continue;
      }

      // Update the component definition
      const resource = await prisma.resource.update({
        where: { slug },
        data: {
          description: info.description,
          longDescription: `${info.description}. Commonly implemented in: ${info.origins.join(', ')}. Related libraries: ${info.relatedLibraries.join(', ')}.`,
          author: {
            connect: { id: author.id }
          },
          documentationUrl: info.documentationUrl
        }
      });

      console.log(`✅ Updated ${resource.name}: Author: ${author.name}, Primary: ${info.origins[0]}`);
      updatedCount++;
    } catch (error) {
      if (error.code === 'P2025') {
        console.log(`⚠️  Component not found: ${slug}`);
        notFoundCount++;
      } else {
        console.error(`❌ Error updating ${slug}:`, error.message);
        errorCount++;
      }
    }
  }

  console.log('\n📊 Update Summary:');
  console.log(`✅ Successfully updated: ${updatedCount} components`);
  console.log(`⚠️  Not found: ${notFoundCount} components`);
  console.log(`❌ Errors: ${errorCount}`);

  // Create authors that don't exist yet
  const missingAuthors = new Set<string>();
  for (const info of Object.values(COMPONENT_DEFINITIONS)) {
    const author = await prisma.user.findUnique({
      where: { email: info.primaryAuthor }
    });
    if (!author) {
      missingAuthors.add(info.primaryAuthor);
    }
  }

  if (missingAuthors.size > 0) {
    console.log('\n📝 Creating missing authors...');
    for (const email of missingAuthors) {
      const name = email.replace('@github.com', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      try {
        await prisma.user.create({
          data: {
            email,
            name
          }
        });
        console.log(`✅ Created author: ${name} (${email})`);
      } catch (error) {
        console.error(`❌ Error creating author ${email}:`, error.message);
      }
    }
  }

  await prisma.$disconnect();
}

updateComponentDefinitions();