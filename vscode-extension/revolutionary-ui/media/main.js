// VS Code Extension Webview Script

(function() {
    const vscode = acquireVsCodeApi();

    // Handle messages from extension
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.command) {
            case 'showComponents':
                displayComponents(message.components);
                break;
            case 'showError':
                displayError(message.error);
                break;
            case 'showLoading':
                displayLoading(message.show);
                break;
        }
    });

    // Display components in grid
    function displayComponents(components) {
        const container = document.querySelector('.component-grid');
        if (!container) return;

        container.innerHTML = components.map(component => `
            <div class="component-card" data-component='${JSON.stringify(component)}'>
                <h3>${escapeHtml(component.name)}</h3>
                <p class="description">${escapeHtml(component.description)}</p>
                <div class="meta">
                    <span>🔧 ${escapeHtml(component.framework)}</span>
                    <span>📁 ${escapeHtml(component.category)}</span>
                    <span>⬇️ ${component.downloads}</span>
                </div>
            </div>
        `).join('');

        // Add click handlers
        document.querySelectorAll('.component-card').forEach(card => {
            card.addEventListener('click', () => {
                const component = JSON.parse(card.getAttribute('data-component'));
                selectComponent(component);
            });
        });
    }

    // Handle component selection
    function selectComponent(component) {
        vscode.postMessage({
            command: 'selectComponent',
            component: component
        });
    }

    // Display error message
    function displayError(error) {
        const container = document.querySelector('.container');
        if (!container) return;

        container.innerHTML = `
            <div class="error">
                <strong>Error:</strong> ${escapeHtml(error)}
            </div>
        `;
    }

    // Show/hide loading state
    function displayLoading(show) {
        const container = document.querySelector('.container');
        if (!container) return;

        if (show) {
            container.innerHTML = '<div class="loading">Loading components...</div>';
        }
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        // Request initial data
        vscode.postMessage({
            command: 'ready'
        });
    });
})();