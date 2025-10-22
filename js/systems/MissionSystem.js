/**
 * ============================================
 * MISSION SYSTEM - Daily missions and challenges
 * ============================================
 */

class MissionSystem {
    constructor() {
        this.enabled = true;
        this.missions = [];
        this.completedMissions = new Set();
        this.lastResetDate = null;
        
        this.missionTypes = [
            {
                id: 'collect_coins',
                name: 'Coin Collector',
                description: 'Collect {target} coins',
                icon: '💰',
                reward: { coins: 100, xp: 50 },
                targetRange: [50, 200]
            },
            {
                id: 'run_distance',
                name: 'Marathon Runner',
                description: 'Run {target} meters',
                icon: '🏃',
                reward: { coins: 150, xp: 75 },
                targetRange: [1000, 5000]
            },
            {
                id: 'combo_streak',
                name: 'Combo Master',
                description: 'Achieve a {target} combo streak',
                icon: '🔥',
                reward: { coins: 200, xp: 100 },
                targetRange: [10, 30]
            },
            {
                id: 'perfect_jumps',
                name: 'Jump Expert',
                description: 'Perform {target} perfect jumps',
                icon: '🦘',
                reward: { coins: 100, xp: 50 },
                targetRange: [20, 50]
            },
            {
                id: 'collect_powerups',
                name: 'Power Collector',
                description: 'Collect {target} power-ups',
                icon: '⚡',
                reward: { coins: 150, xp: 75 },
                targetRange: [5, 15]
            }
        ];
        
        this.loadMissions();
        this.checkDailyReset();
        
        console.log('✅ MissionSystem Initialized');
    }
    
    checkDailyReset() {
        const today = new Date().toDateString();
        const saved = localStorage.getItem('lastMissionReset');
        
        if (saved !== today) {
            this.generateDailyMissions();
            localStorage.setItem('lastMissionReset', today);
            this.lastResetDate = today;
        }
    }
    
    generateDailyMissions() {
        this.missions = [];
        this.completedMissions.clear();
        
        // Generate 3 random missions
        const shuffled = [...this.missionTypes].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < 3; i++) {
            const type = shuffled[i];
            const target = Math.floor(
                type.targetRange[0] + 
                Math.random() * (type.targetRange[1] - type.targetRange[0])
            );
            
            this.missions.push({
                id: `${type.id}_${Date.now()}_${i}`,
                type: type.id,
                name: type.name,
                description: type.description.replace('{target}', target),
                icon: type.icon,
                target: target,
                progress: 0,
                reward: type.reward,
                completed: false
            });
        }
        
        this.saveMissions();
        console.log('📋 Daily missions generated');
    }
    
    updateProgress(type, amount = 1) {
        let updated = false;
        
        this.missions.forEach(mission => {
            if (mission.type === type && !mission.completed) {
                mission.progress = Math.min(mission.progress + amount, mission.target);
                
                if (mission.progress >= mission.target && !this.completedMissions.has(mission.id)) {
                    this.completeMission(mission);
                }
                
                updated = true;
            }
        });
        
        if (updated) {
            this.saveMissions();
        }
    }
    
    completeMission(mission) {
        mission.completed = true;
        this.completedMissions.add(mission.id);
        
        console.log(`✅ Mission completed: ${mission.name}`);
        
        // Award rewards
        if (window.gameManager) {
            window.gameManager.addCoins(mission.reward.coins);
            window.gameManager.addXP(mission.reward.xp);
        }
        
        // Show notification
        if (window.uiManager) {
            window.uiManager.showNotification({
                title: 'Mission Complete!',
                message: `${mission.name}: +${mission.reward.coins} coins`,
                type: 'success'
            });
        }
        
        this.saveMissions();
    }
    
    getMissions() {
        return this.missions;
    }
    
    getActiveMissions() {
        return this.missions.filter(m => !m.completed);
    }
    
    getCompletedMissions() {
        return this.missions.filter(m => m.completed);
    }
    
    saveMissions() {
        localStorage.setItem('missions', JSON.stringify(this.missions));
        localStorage.setItem('completedMissions', 
            JSON.stringify(Array.from(this.completedMissions)));
    }
    
    loadMissions() {
        const saved = localStorage.getItem('missions');
        if (saved) {
            this.missions = JSON.parse(saved);
        }
        
        const completed = localStorage.getItem('completedMissions');
        if (completed) {
            this.completedMissions = new Set(JSON.parse(completed));
        }
    }
    
    reset() {
        this.generateDailyMissions();
    }
}
