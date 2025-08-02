import { ComponentRegistry } from './data/componentRegistry.js';
import { MarketplaceApp } from './components/MarketplaceApp.js';
import { Router } from './utils/router.js';
import './styles/main.css';

// Initialize the marketplace
document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    
    // Initialize component registry
    const registry = new ComponentRegistry();
    
    // Initialize router
    const router = new Router();
    
    // Initialize main app
    const marketplace = new MarketplaceApp(app, registry, router);
    marketplace.init();
    
    // Handle initial route
    router.handleRoute();
});

// Register service worker for offline support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
}