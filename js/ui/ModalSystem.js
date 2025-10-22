/**
 * ============================================
 * MODAL SYSTEM - Modal dialogs
 * ============================================
 */

class ModalSystem {
    constructor() {
        this.modals = new Map();
        this.activeModal = null;
        
        console.log('✅ ModalSystem Initialized');
    }
    
    createModal(id, content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                ${options.title ? `<h2 class="modal-title">${options.title}</h2>` : ''}
                <div class="modal-body">${content}</div>
                ${options.actions ? `<div class="modal-actions">${options.actions}</div>` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modals.set(id, modal);
        
        // Close on backdrop click
        if (options.closeOnBackdrop !== false) {
            modal.querySelector('.modal-backdrop').addEventListener('click', () => {
                this.hideModal(id);
            });
        }
        
        return modal;
    }
    
    showModal(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
            this.activeModal = id;
        }
    }
    
    hideModal(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
            if (this.activeModal === id) {
                this.activeModal = null;
            }
        }
    }
    
    removeModal(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.remove();
            this.modals.delete(id);
        }
    }
}
