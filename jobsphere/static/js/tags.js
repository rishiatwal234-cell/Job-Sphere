// Tag input component
class TagInput {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            placeholder: 'Type and press Enter to add...',
            maxTags: 10,
            allowDuplicates: false,
            ...options
        };
        this.tags = [];
        this.init();
    }

    init() {
        this.createElements();
        this.setupEventListeners();
        this.loadExistingTags();
    }

    createElements() {
        this.container.innerHTML = '';

        this.tagContainer = document.createElement('div');
        this.tagContainer.className = 'tag-container';

        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.className = 'tag-input';
        this.input.placeholder = this.options.placeholder;

        this.hiddenInput = document.createElement('input');
        this.hiddenInput.type = 'hidden';
        this.hiddenInput.name = this.container.dataset.name || 'tags';

        this.container.appendChild(this.tagContainer);
        this.container.appendChild(this.input);
        this.container.appendChild(this.hiddenInput);
    }

    setupEventListeners() {
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTag(this.input.value.trim());
            } else if (e.key === 'Backspace' && !this.input.value && this.tags.length > 0) {
                this.removeTag(this.tags.length - 1);
            }
        });

        this.input.addEventListener('blur', () => {
            if (this.input.value.trim()) {
                this.addTag(this.input.value.trim());
            }
        });
    }

    addTag(text) {
        if (!text) return;

        if (!this.options.allowDuplicates && this.tags.includes(text)) {
            this.showError('Tag already exists');
            return;
        }

        if (this.tags.length >= this.options.maxTags) {
            this.showError(`Maximum ${this.options.maxTags} tags allowed`);
            return;
        }

        this.tags.push(text);
        this.renderTags();
        this.updateHiddenInput();
        this.input.value = '';
        this.input.focus();
    }

    removeTag(index) {
        this.tags.splice(index, 1);
        this.renderTags();
        this.updateHiddenInput();
    }

    renderTags() {
        this.tagContainer.innerHTML = '';
        this.tags.forEach((tag, index) => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                <span class="tag-text">${tag}</span>
                <button type="button" class="tag-remove" data-index="${index}">&times;</button>
            `;

            tagElement.querySelector('.tag-remove').addEventListener('click', () => {
                this.removeTag(index);
            });

            this.tagContainer.appendChild(tagElement);
        });
    }

    updateHiddenInput() {
        this.hiddenInput.value = this.tags.join(',');
    }

    loadExistingTags() {
        const existingValue = this.container.dataset.value || '';
        if (existingValue) {
            this.tags = existingValue.split(',').map(tag => tag.trim()).filter(tag => tag);
            this.renderTags();
            this.updateHiddenInput();
        }
    }

    showError(message) {
        // Remove existing error
        const existingError = this.container.querySelector('.tag-error');
        if (existingError) existingError.remove();

        const errorElement = document.createElement('div');
        errorElement.className = 'tag-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 5px;
        `;

        this.container.appendChild(errorElement);

        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.remove();
            }
        }, 3000);
    }

    getTags() {
        return [...this.tags];
    }

    setTags(tags) {
        this.tags = [...tags];
        this.renderTags();
        this.updateHiddenInput();
    }
}

// Initialize tag inputs
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tag-input-container').forEach(container => {
        new TagInput(container);
    });
});

// CSS for tags (add to components.css)
const tagStyles = `
.tag-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
    min-height: 40px;
    padding: 8px;
    border: 2px solid var(--border);
    border-radius: 8px;
    background: var(--bg-card);
}

.tag {
    display: inline-flex;
    align-items: center;
    background: var(--accent-primary);
    color: white;
    padding: 4px 8px;
    border-radius: 16px;
    font-size: 0.875rem;
    transition: all 0.2s ease;
}

.tag:hover {
    background: var(--accent-primary-dark);
}

.tag-remove {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    margin-left: 6px;
    font-size: 1.2em;
    line-height: 1;
    padding: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s ease;
}

.tag-remove:hover {
    background: rgba(255, 255, 255, 0.2);
}

.tag-input {
    flex: 1;
    border: none;
    outline: none;
    padding: 8px;
    font-size: 16px;
    background: transparent;
    color: var(--text-primary);
}

.tag-input::placeholder {
    color: var(--text-secondary);
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = tagStyles;
document.head.appendChild(styleSheet);