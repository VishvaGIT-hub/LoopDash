/**
 * ============================================
 * LOOP DASH ULTRA 3D - MAIN ENTRY POINT
 * ============================================
 */

// Global instances
window.gameManager = null;
window.uiManager = null;
window.audioManager = null;
window.saveManager = null;
window.analyticsManager = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Loop Dash Ultra 3D - Starting...');
    
    // Show loader
    showLoader();
    
    // Load assets and initialize
    loadGame();
});

function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.add('active');
    }
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.remove('active');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 1000);
    }
}

async function loadGame() {
    const loadingText = document.getElementById('loadingText');
    const loadingPercent = document.getElementById('loadingPercent');
    const progressFill = document.getElementById('progressFill');
    
    const steps = [
        { text: 'Initializing 3D Engine...', duration: 500 },
        { text: 'Loading Game Systems...', duration: 800 },
        { text: 'Creating World...', duration: 600 },
        { text: 'Loading Characters...', duration: 700 },
        { text: 'Preparing Assets...', duration: 500 },
        { text: 'Finalizing...', duration: 400 }
    ];
    
    let progress = 0;
    
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        if (loadingText) loadingText.textContent = step.text;
        
        await new Promise(resolve => setTimeout(resolve, step.duration));
        
        progress = ((i + 1) / steps.length) * 100;
        
        if (progressFill) progressFill.style.width = progress + '%';
        if (loadingPercent) loadingPercent.textContent = Math.floor(progress) + '%';
        
        // Initialize systems at specific steps
        if (i === 1) {
            initializeManagers();
        } else if (i === 3) {
            initializeGame();
        }
    }
    
    // Hide loader and show menu
    hideLoader();
    showMainMenu();
    
    console.log('✅ Game Loaded Successfully!');
}

function initializeManagers() {
    window.saveManager = new SaveManager();
    window.audioManager = new AudioManager();
    window.analyticsManager = new AnalyticsManager();
    window.uiManager = new UIManager();
    
    console.log('✅ Managers Initialized');
}

function initializeGame() {
    window.gameManager = new GameManager();
    
    // Update menu stats
    if (window.uiManager) {
        const stats = window.gameManager.getStats();
        window.uiManager.updateMenuStats(stats);
    }
    
    console.log('✅ Game Initialized');
}

function showMainMenu() {
    if (window.uiManager) {
        window.uiManager.showScreen('mainMenu');
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    if (window.gameManager && window.gameManager.engine) {
        window.gameManager.engine.resize(window.innerWidth, window.innerHeight);
    }
});

// Handle visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (window.gameManager && window.gameManager.state === 'playing') {
            window.gameManager.togglePause();
        }
    }
});

// Prevent context menu
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Global error handler
window.addEventListener('error', (e) => {
    console.error('💥 Error:', e.error);
});

console.log('🎮 Loop Dash Ultra 3D - Initialized');
