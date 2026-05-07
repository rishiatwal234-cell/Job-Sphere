// Theme management
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Apply theme on page load
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        document.body.setAttribute('data-theme', this.currentTheme);
        
        // Initialize theme assets
        this.loadThemeAssets();
        
        // Setup toggle listeners
        this.setupThemeToggle();
    }

    setupThemeToggle() {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleTheme());
            this.updateToggleIcon();
        }
    }

    updateToggleIcon() {
        const toggle = document.getElementById('theme-toggle');
        if (toggle && toggle.querySelector('[data-lucide]')) {
            toggle.querySelector('[data-lucide]').setAttribute(
                'data-lucide',
                this.currentTheme === 'dark' ? 'sun' : 'moon'
            );
            // Re-render lucide icons
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        document.body.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateToggleIcon();
        this.loadThemeAssets();
    }

    loadThemeAssets() {
        // Theme assets are now handled by weather system
        // No auto-loading of animations - user can toggle via weather controls
    }

    initStars() {
        // Deprecated - handled by weather system
    }

    destroyStars() {
        // Deprecated - handled by weather system
    }

    initNature() {
        // Deprecated - handled by weather system
    }

    destroyNature() {
        // Deprecated - handled by weather system
    }
}

// Initialize theme manager when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeManager = new ThemeManager();
    });
} else {
    window.themeManager = new ThemeManager();
}