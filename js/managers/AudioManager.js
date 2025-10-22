/**
 * ============================================
 * AUDIO MANAGER - Sound and music
 * ============================================
 */

class AudioManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = new Map();
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.enabled = true;
        
        this.loadSettings();
        
        console.log('✅ AudioManager Initialized');
    }
    
    playSound(type, options = {}) {
        if (!this.enabled) return;
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        gainNode.gain.setValueAtTime(
            (options.volume || 1) * this.sfxVolume,
            this.context.currentTime
        );
        
        switch(type) {
            case 'jump':
                oscillator.frequency.value = 400;
                oscillator.type = 'square';
                gainNode.gain.exponentialRampToValueAtTime(
                    0.01,
                    this.context.currentTime + 0.1
                );
                oscillator.start(this.context.currentTime);
                oscillator.stop(this.context.currentTime + 0.1);
                break;
                
            case 'coin':
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.exponentialRampToValueAtTime(
                    0.01,
                    this.context.currentTime + 0.1
                );
                oscillator.start(this.context.currentTime);
                oscillator.stop(this.context.currentTime + 0.1);
                break;
                
            case 'powerup':
                oscillator.frequency.value = 600;
                oscillator.type = 'triangle';
                gainNode.gain.exponentialRampToValueAtTime(
                    0.01,
                    this.context.currentTime + 0.3
                );
                oscillator.start(this.context.currentTime);
                oscillator.stop(this.context.currentTime + 0.3);
                break;
                
            case 'crash':
                oscillator.frequency.value = 100;
                oscillator.type = 'sawtooth';
                gainNode.gain.exponentialRampToValueAtTime(
                    0.01,
                    this.context.currentTime + 0.5
                );
                oscillator.start(this.context.currentTime);
                oscillator.stop(this.context.currentTime + 0.5);
                break;
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }
    
    toggleSound() {
        this.enabled = !this.enabled;
        this.saveSettings();
        return this.enabled;
    }
    
    saveSettings() {
        localStorage.setItem('audioSettings', JSON.stringify({
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            enabled: this.enabled
        }));
    }
    
    loadSettings() {
        const saved = localStorage.getItem('audioSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.musicVolume = settings.musicVolume || 0.5;
            this.sfxVolume = settings.sfxVolume || 0.7;
            this.enabled = settings.enabled !== false;
        }
    }
}
