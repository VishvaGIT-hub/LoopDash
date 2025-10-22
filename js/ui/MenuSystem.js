/**
 * ============================================
 * MENU SYSTEM - Menu management
 * ============================================
 */

class MenuSystem {
    constructor() {
        this.menus = new Map();
        this.currentMenu = null;
        
        this.initMenus();
        
        console.log('✅ MenuSystem Initialized');
    }
    
    initMenus() {
        // Register menus
        this.registerMenu('main', document.getElementById('mainMenu'));
        this.registerMenu('pause', document.getElementById('pauseMenu'));
        this.registerMenu('gameOver', document.getElementById('gameOverModal'));
    }
    
    registerMenu(id, element) {
        if (element) {
            this.menus.set(id, element);
        }
    }
    
    showMenu(id) {
        const menu = this.menus.get(id);
        if (menu) {
            this.hideAllMenus();
            menu.classList.add('active');
            menu.style.display = 'flex';
            this.currentMenu = id;
        }
    }
    
    hideMenu(id) {
        const menu = this.menus.get(id);
        if (menu) {
            menu.classList.remove('active');
            menu.style.display = 'none';
            if (this.currentMenu === id) {
                this.currentMenu = null;
            }
        }
    }
    
    hideAllMenus() {
        this.menus.forEach(menu => {
            menu.classList.remove('active');
            menu.style.display = 'none';
        });
        this.currentMenu = null;
    }
    
    toggleMenu(id) {
        const menu = this.menus.get(id);
        if (menu) {
            if (this.currentMenu === id) {
                this.hideMenu(id);
            } else {
                this.showMenu(id);
            }
        }
    }
}
