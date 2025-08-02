export class Router {
    constructor() {
        this.routes = new Map();
        this.currentPath = '/';
        this.listeners = new Map();
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('popstate', () => this.handleRoute());
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }

    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        this.currentPath = hash.split('?')[0];
        
        // Parse query parameters
        const queryString = hash.split('?')[1] || '';
        this.queryParams = new URLSearchParams(queryString);
        
        this.emit('route', {
            path: this.currentPath,
            params: this.queryParams
        });
    }

    navigate(path) {
        window.location.hash = path;
    }

    getParam(key) {
        return this.queryParams.get(key);
    }
}