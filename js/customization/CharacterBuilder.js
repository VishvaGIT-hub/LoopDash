/**
 * ============================================
 * CHARACTER BUILDER - Character creation
 * ============================================
 */

class CharacterBuilder {
    constructor() {
        this.characters = this.createCharacters();
        this.selectedCharacter = 'default';
        this.unlockedCharacters = new Set(['default']);
        
        this.loadProgress();
        
        console.log('✅ CharacterBuilder Initialized');
    }
    
    createCharacters() {
        return {
            default: {
                id: 'default',
                name: 'Default Runner',
                emoji: '🏃',
                price: 0,
                stats: {
                    speed: 70,
                    jump: 70,
                    luck: 70,
                    magnet: 5
                },
                color: 0x00f2fe,
                trail: 0x00f2fe,
                ability: null
            },
            speedster: {
                id: 'speedster',
                name: 'Speedster',
                emoji: '⚡',
                price: 500,
                stats: {
                    speed: 95,
                    jump: 60,
                    luck: 65,
                    magnet: 5
                },
                color: 0xffff00,
                trail: 0xffff00,
                ability: { type: 'speed_boost', value: 1.2 }
            },
            jumper: {
                id: 'jumper',
                name: 'High Jumper',
                emoji: '🦘',
                price: 500,
                stats: {
                    speed: 65,
                    jump: 95,
                    luck: 70,
                    magnet: 5
                },
                color: 0xff6b6b,
                trail: 0xff6b6b,
                ability: { type: 'triple_jump', value: 3 }
            },
            lucky: {
                id: 'lucky',
                name: 'Lucky Star',
                emoji: '🍀',
                price: 750,
                stats: {
                    speed: 70,
                    jump: 70,
                    luck: 95,
                    magnet: 8
                },
                color: 0x51cf66,
                trail: 0x51cf66,
                ability: { type: 'coin_multiplier', value: 1.5 }
            },
            cyber: {
                id: 'cyber',
                name: 'Cyber Runner',
                emoji: '🤖',
                price: 1000,
                stats: {
                    speed: 85,
                    jump: 85,
                    luck: 80,
                    magnet: 7
                },
                color: 0x9b59b6,
                trail: 0x9b59b6,
                ability: { type: 'shield_duration', value: 1.5 }
            },
            ninja: {
                id: 'ninja',
                name: 'Shadow Ninja',
                emoji: '🥷',
                price: 1500,
                stats: {
                    speed: 90,
                    jump: 90,
                    luck: 75,
                    magnet: 6
                },
                color: 0x2c3e50,
                trail: 0x8e44ad,
                ability: { type: 'invulnerable_time', value: 2 }
            },
            alien: {
                id: 'alien',
                name: 'Space Alien',
                emoji: '👽',
                price: 2000,
                stats: {
                    speed: 80,
                    jump: 100,
                    luck: 90,
                    magnet: 10
                },
                color: 0x1dd1a1,
                trail: 0x1dd1a1,
                ability: { type: 'hover', value: 2 }
            },
            robot: {
                id: 'robot',
                name: 'Mega Robot',
                emoji: '🤖',
                price: 2500,
                stats: {
                    speed: 75,
                    jump: 75,
                    luck: 85,
                    magnet: 8
                },
                color: 0x3498db,
                trail: 0x3498db,
                ability: { type: 'destroy_obstacles', value: true }
            },
            dragon: {
                id: 'dragon',
                name: 'Dragon Rider',
                emoji: '🐉',
                price: 5000,
                stats: {
                    speed: 100,
                    jump: 95,
                    luck: 95,
                    magnet: 12
                },
                color: 0xe74c3c,
                trail: 0xff6348,
                ability: { type: 'fly', value: 5 }
            },
            legendary: {
                id: 'legendary',
                name: 'Legendary Hero',
                emoji: '⭐',
                price: 10000,
                stats: {
                    speed: 100,
                    jump: 100,
                    luck: 100,
                    magnet: 15
                },
                color: 0xffd700,
                trail: 0xffd700,
                ability: { type: 'all_powerups', value: true }
            }
        };
    }
    
    getCharacter(id) {
        return this.characters[id];
    }
    
    getAllCharacters() {
        return Object.values(this.characters);
    }
    
    getSelectedCharacter() {
        return this.characters[this.selectedCharacter];
    }
    
    selectCharacter(id) {
        if (this.unlockedCharacters.has(id)) {
            this.selectedCharacter = id;
            this.saveProgress();
            console.log(`👤 Character selected: ${id}`);
            return true;
        }
        return false;
    }
    
    unlockCharacter(id, cost = true) {
        const character = this.characters[id];
        if (!character) return false;
        
        if (this.unlockedCharacters.has(id)) {
            return false;
        }
        
        if (cost && window.gameManager) {
            const canAfford = window.gameManager.spendCoins(character.price);
            if (!canAfford) return false;
        }
        
        this.unlockedCharacters.add(id);
        this.saveProgress();
        console.log(`🔓 Character unlocked: ${id}`);
        return true;
    }
    
    isUnlocked(id) {
        return this.unlockedCharacters.has(id);
    }
    
    getUnlockedCharacters() {
        return Array.from(this.unlockedCharacters).map(id => this.characters[id]);
    }
    
    getLockedCharacters() {
        return Object.values(this.characters).filter(c => !this.unlockedCharacters.has(c.id));
    }
    
    saveProgress() {
        localStorage.setItem('selectedCharacter', this.selectedCharacter);
        localStorage.setItem('unlockedCharacters', 
            JSON.stringify(Array.from(this.unlockedCharacters)));
    }
    
    loadProgress() {
        const selected = localStorage.getItem('selectedCharacter');
        if (selected && this.characters[selected]) {
            this.selectedCharacter = selected;
        }
        
        const unlocked = localStorage.getItem('unlockedCharacters');
        if (unlocked) {
            this.unlockedCharacters = new Set(JSON.parse(unlocked));
        }
    }
}
