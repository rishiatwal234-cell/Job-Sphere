// Search functionality
class SearchManager {
    constructor() {
        this.searchInput = document.querySelector('.search-bar input');
        this.suggestionsContainer = null;
        this.debounceTimer = null;
        this.init();
    }

    init() {
        if (this.searchInput) {
            this.createSuggestionsContainer();
            this.setupEventListeners();
        }
    }

    createSuggestionsContainer() {
        this.suggestionsContainer = document.createElement('div');
        this.suggestionsContainer.className = 'search-suggestions';
        this.suggestionsContainer.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            display: none;
            max-height: 300px;
            overflow-y: auto;
        `;
        this.searchInput.parentNode.style.position = 'relative';
        this.searchInput.parentNode.appendChild(this.suggestionsContainer);
    }

    setupEventListeners() {
        this.searchInput.addEventListener('input', (e) => {
            this.handleInput(e.target.value);
        });

        this.searchInput.addEventListener('focus', () => {
            if (this.suggestionsContainer.children.length > 0) {
                this.showSuggestions();
            }
        });

        this.searchInput.addEventListener('blur', () => {
            setTimeout(() => this.hideSuggestions(), 200);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideSuggestions();
                this.searchInput.blur();
            }
        });
    }

    handleInput(query) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            if (query.length >= 2) {
                this.fetchSuggestions(query);
            } else {
                this.hideSuggestions();
            }
        }, 300);
    }

    async fetchSuggestions(query) {
        try {
            const response = await fetch(`/api/jobs/suggestions?q=${encodeURIComponent(query)}`);
            const suggestions = await response.json();
            this.displaySuggestions(suggestions);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    }

    displaySuggestions(suggestions) {
        this.suggestionsContainer.innerHTML = '';

        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.style.cssText = `
                padding: 12px 16px;
                border-bottom: 1px solid var(--border);
                cursor: pointer;
                transition: background-color 0.2s ease;
            `;
            item.innerHTML = `
                <div style="font-weight: 500; color: var(--text-primary);">${suggestion.title}</div>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">${suggestion.company}</div>
            `;

            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = 'var(--bg-secondary)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'transparent';
            });

            item.addEventListener('click', () => {
                window.location.href = suggestion.url;
            });

            this.suggestionsContainer.appendChild(item);
        });

        this.showSuggestions();
    }

    showSuggestions() {
        this.suggestionsContainer.style.display = 'block';
    }

    hideSuggestions() {
        this.suggestionsContainer.style.display = 'none';
    }
}

// Filter functionality
class FilterManager {
    constructor() {
        this.filters = {};
        this.init();
    }

    init() {
        this.setupFilterListeners();
        this.loadSavedFilters();
    }

    setupFilterListeners() {
        // Job type checkboxes
        document.querySelectorAll('input[name="job_type"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateFilters());
        });

        // Location input
        const locationInput = document.querySelector('input[name="location"]');
        if (locationInput) {
            locationInput.addEventListener('input', (e) => {
                this.debounce(() => this.updateFilters(), 500);
            });
        }

        // Salary range
        const salaryMin = document.querySelector('input[name="salary_min"]');
        const salaryMax = document.querySelector('input[name="salary_max"]');
        if (salaryMin) salaryMin.addEventListener('input', () => this.updateFilters());
        if (salaryMax) salaryMax.addEventListener('input', () => this.updateFilters());

        // Experience level
        document.querySelectorAll('input[name="experience_level"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateFilters());
        });

        // Clear filters
        const clearBtn = document.querySelector('.clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearFilters());
        }
    }

    updateFilters() {
        const jobTypes = Array.from(document.querySelectorAll('input[name="job_type"]:checked')).map(cb => cb.value);
        const location = document.querySelector('input[name="location"]')?.value || '';
        const salaryMin = document.querySelector('input[name="salary_min"]')?.value || '';
        const salaryMax = document.querySelector('input[name="salary_max"]')?.value || '';
        const experienceLevels = Array.from(document.querySelectorAll('input[name="experience_level"]:checked')).map(cb => cb.value);

        this.filters = {
            job_type: jobTypes,
            location: location,
            salary_min: salaryMin,
            salary_max: salaryMax,
            experience_level: experienceLevels
        };

        this.saveFilters();
        this.applyFilters();
    }

    applyFilters() {
        const url = new URL(window.location);
        Object.keys(this.filters).forEach(key => {
            const value = this.filters[key];
            if (Array.isArray(value)) {
                url.searchParams.delete(key);
                value.forEach(v => url.searchParams.append(key, v));
            } else if (value) {
                url.searchParams.set(key, value);
            } else {
                url.searchParams.delete(key);
            }
        });

        // Reset to page 1 when filters change
        url.searchParams.set('page', '1');

        window.location.href = url.toString();
    }

    clearFilters() {
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => input.value = '');
        this.filters = {};
        this.saveFilters();
        this.applyFilters();
    }

    saveFilters() {
        localStorage.setItem('jobFilters', JSON.stringify(this.filters));
    }

    loadSavedFilters() {
        const saved = localStorage.getItem('jobFilters');
        if (saved) {
            this.filters = JSON.parse(saved);
            this.applySavedFilters();
        }
    }

    applySavedFilters() {
        // Apply saved filters to form inputs
        Object.keys(this.filters).forEach(key => {
            const value = this.filters[key];
            if (Array.isArray(value)) {
                value.forEach(v => {
                    const checkbox = document.querySelector(`input[name="${key}"][value="${v}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            } else {
                const input = document.querySelector(`input[name="${key}"]`);
                if (input) input.value = value;
            }
        });
    }

    debounce(func, wait) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(func, wait);
    }
}

// Mood-based filtering
function setupMoodFilters() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mood = btn.dataset.mood;
            this.applyMoodFilter(mood);
        });
    });
}

function applyMoodFilter(mood) {
    const moodFilters = {
        creative: { skills: ['Design', 'Marketing', 'Content'] },
        stability: { job_type: ['full-time'], experience_level: ['mid', 'senior'] },
        remote: { job_type: ['remote'] },
        challenge: { experience_level: ['senior', 'lead'] }
    };

    const filters = moodFilters[mood];
    if (filters) {
        // Clear existing filters
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

        // Apply mood filters
        Object.keys(filters).forEach(key => {
            const values = filters[key];
            values.forEach(value => {
                const checkbox = document.querySelector(`input[name="${key}"][value="${value}"]`);
                if (checkbox) checkbox.checked = true;
            });
        });

        // Trigger filter update
        window.filterManager?.updateFilters();
    }
}

// Initialize search and filters
document.addEventListener('DOMContentLoaded', () => {
    window.searchManager = new SearchManager();
    window.filterManager = new FilterManager();
    setupMoodFilters();
});