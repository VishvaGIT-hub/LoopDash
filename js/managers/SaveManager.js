/**
 * ============================================
 * SAVE MANAGER - Save/Load game data
 * ============================================
 */

class SaveManager {
    constructor() {
        this.saveKey = 'loopDashSave';
        this.autosaveInterval = 30000; // 30 seconds
        this.autosaveTimer = 0;
        
        console.log('✅ SaveManager Initialized');
    }
    
    save(data) {
        try {
            const saveData = {
                version: '1.0.0',
                timestamp: Date.now(),
                data: data
            };
            
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            console.log('💾 Game Saved');
            return true;
        } catch (error) {
            console.error('❌ Save failed:', error);
            return false;
        }
    }
    
    load() {
        try {
            const saved = localStorage.getItem(this.saveKey);
            if (saved) {
                const saveData = JSON.parse(saved);
                console.log('📂 Game Loaded');
                return saveData.data;
            }
        } catch (error) {
            console.error('❌ Load failed:', error);
        }
        return null;
    }
    
    delete() {
        localStorage.removeItem(this.saveKey);
        console.log('🗑️ Save Deleted');
    }
    
    exportSave() {
        const saved = localStorage.getItem(this.saveKey);
        if (saved) {
            const blob = new Blob([saved], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'loopdash_save.json';
            a.click();
        }
    }
    
    importSave(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                localStorage.setItem(this.saveKey, JSON.stringify(data));
                console.log('📥 Save Imported');
            } catch (error) {
                console.error('❌ Import failed:', error);
            }
        };
        reader.readAsText(file);
    }
}
