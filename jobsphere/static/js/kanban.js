// Kanban board for application tracking
class KanbanBoard {
    constructor(container) {
        this.container = container;
        this.columns = ['applied', 'viewed', 'shortlisted', 'hired'];
        this.applications = {};
        this.draggedElement = null;
        this.init();
    }

    init() {
        this.loadApplications();
        this.render();
        this.setupDragAndDrop();
    }

    async loadApplications() {
        try {
            // In a real app, this would fetch from API
            // For now, we'll use the applications passed from template
            const applicationsData = JSON.parse(this.container.dataset.applications || '[]');

            this.columns.forEach(status => {
                this.applications[status] = applicationsData.filter(app => app.status === status);
            });
        } catch (error) {
            console.error('Error loading applications:', error);
        }
    }

    render() {
        this.container.innerHTML = '';

        const board = document.createElement('div');
        board.className = 'kanban-board';

        this.columns.forEach(status => {
            const column = this.createColumn(status);
            board.appendChild(column);
        });

        this.container.appendChild(board);
    }

    createColumn(status) {
        const column = document.createElement('div');
        column.className = 'kanban-column';
        column.dataset.status = status;

        const header = document.createElement('div');
        header.className = 'kanban-header';
        header.innerHTML = `
            <h3>${this.formatStatus(status)}</h3>
            <span class="count">${this.applications[status]?.length || 0}</span>
        `;

        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'kanban-cards';

        this.applications[status]?.forEach(app => {
            const card = this.createCard(app);
            cardsContainer.appendChild(card);
        });

        column.appendChild(header);
        column.appendChild(cardsContainer);

        return column;
    }

    createCard(application) {
        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.draggable = true;
        card.dataset.appId = application.id;

        card.innerHTML = `
            <div class="card-header">
                <h4>${application.job.title}</h4>
                <span class="company">${application.job.company}</span>
            </div>
            <div class="card-meta">
                <span class="date">Applied ${this.formatDate(application.applied_at)}</span>
            </div>
        `;

        card.addEventListener('dragstart', (e) => {
            this.draggedElement = card;
            card.classList.add('dragging');
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            this.draggedElement = null;
        });

        return card;
    }

    setupDragAndDrop() {
        const columns = this.container.querySelectorAll('.kanban-column');

        columns.forEach(column => {
            const cardsContainer = column.querySelector('.kanban-cards');

            cardsContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = this.getDragAfterElement(cardsContainer, e.clientY);
                const draggable = document.querySelector('.dragging');

                if (afterElement) {
                    cardsContainer.insertBefore(draggable, afterElement);
                } else {
                    cardsContainer.appendChild(draggable);
                }
            });

            cardsContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                const newStatus = column.dataset.status;
                const appId = this.draggedElement.dataset.appId;

                this.moveApplication(appId, newStatus);
            });
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.kanban-card:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    async moveApplication(appId, newStatus) {
        try {
            const response = await fetch(`/employer/application/${appId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `status=${newStatus}`
            });

            if (response.ok) {
                // Update local data
                const app = this.findApplication(appId);
                if (app) {
                    const oldStatus = app.status;
                    app.status = newStatus;

                    // Move in data structure
                    this.applications[oldStatus] = this.applications[oldStatus].filter(a => a.id != appId);
                    this.applications[newStatus].push(app);

                    // Re-render
                    this.render();
                    this.setupDragAndDrop();

                    showToast(`Application moved to ${this.formatStatus(newStatus)}`, 'success');
                }
            } else {
                showToast('Error updating application status', 'error');
                this.render(); // Revert visual change
            }
        } catch (error) {
            console.error('Error moving application:', error);
            showToast('Error updating application status', 'error');
            this.render(); // Revert visual change
        }
    }

    findApplication(appId) {
        for (const status of this.columns) {
            const app = this.applications[status]?.find(a => a.id == appId);
            if (app) return app;
        }
        return null;
    }

    formatStatus(status) {
        const formats = {
            'applied': 'Applied',
            'viewed': 'Viewed',
            'shortlisted': 'Shortlisted',
            'hired': 'Hired',
            'rejected': 'Rejected'
        };
        return formats[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'today';
        if (diffDays === 2) return 'yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        return date.toLocaleDateString();
    }
}

// CSS for Kanban (add to components.css)
const kanbanStyles = `
.kanban-board {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin: 20px 0;
}

.kanban-column {
    background: var(--bg-card);
    border-radius: 12px;
    padding: 16px;
    border: 1px solid var(--border);
}

.kanban-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--accent-primary);
}

.kanban-header h3 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.125rem;
}

.count {
    background: var(--accent-primary);
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 500;
}

.kanban-cards {
    min-height: 200px;
}

.kanban-card {
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
    cursor: move;
    transition: all 0.2s ease;
    border: 1px solid var(--border);
}

.kanban-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.kanban-card.dragging {
    opacity: 0.5;
    transform: rotate(5deg);
}

.card-header h4 {
    margin: 0 0 4px 0;
    font-size: 1rem;
    color: var(--text-primary);
}

.company {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.card-meta {
    margin-top: 8px;
}

.date {
    color: var(--text-secondary);
    font-size: 0.75rem;
}

@media (max-width: 768px) {
    .kanban-board {
        grid-template-columns: 1fr;
    }
}
`;

// Inject styles
const kanbanStyleSheet = document.createElement('style');
kanbanStyleSheet.textContent = kanbanStyles;
document.head.appendChild(kanbanStyleSheet);

// Initialize Kanban boards
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.kanban-container').forEach(container => {
        new KanbanBoard(container);
    });
});