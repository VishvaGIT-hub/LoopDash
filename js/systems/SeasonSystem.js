/**
 * ============================================
 * SEASON SYSTEM - Battle pass and seasons
 * ============================================
 */

class SeasonSystem {
    constructor() {
        this.enabled = true;
        this.currentSeason = 1;
        this.tier = 0;
        this.xp = 0;
        this.xpPerTier = 1000;
        this.maxTiers = 50;
        this.isPremium = false;
        
        this.rewards = this.createRewards();
        this.loadProgress();
        
        console.log('✅ SeasonSystem Initialized');
    }
    
    createRewards() {
        const rewards = [];
        
        for (let tier = 1; tier <= this.maxTiers; tier++) {
            rewards.push({
                tier: tier,
                free: this.generateFreeReward(tier),
                premium: this.generatePremiumReward(tier)
            });
        }
        
        return rewards;
    }
    
    generateFreeReward(tier) {
        if (tier % 10 === 0) {
            return { type: 'character', id: `character_${tier}`, icon: '👤' };
        } else if (tier % 5 === 0) {
            return { type: 'coins', amount: 500, icon: '💰' };
        } else {
            return { type: 'coins', amount: 100, icon: '💰' };
        }
    }
    
    generatePremiumReward(tier) {
        if (tier % 10 === 0) {
            return { type: 'exclusive_skin', id: `skin_${tier}`, icon: '✨' };
        } else if (tier % 5 === 0) {
            return { type: 'gems', amount: 100, icon: '💎' };
        } else {
            return { type: 'coins', amount: 200, icon: '💰' };
        }
    }
    
    addXP(amount) {
        this.xp += amount;
        
        while (this.xp >= this.xpPerTier && this.tier < this.maxTiers) {
            this.xp -= this.xpPerTier;
            this.tier++;
            this.onTierUp();
        }
        
        this.saveProgress();
    }
    
    onTierUp() {
        console.log(`📊 Season tier increased to ${this.tier}`);
        
        const reward = this.rewards[this.tier - 1];
        if (reward) {
            this.claimReward(reward.free, true);
            
            if (this.isPremium) {
                this.claimReward(reward.premium, true);
            }
        }
        
        if (window.uiManager) {
            window.uiManager.showNotification({
                title: 'Tier Up!',
                message: `You've reached tier ${this.tier}!`,
                type: 'success'
            });
        }
    }
    
    claimReward(reward, auto = false) {
        if (!reward) return;
        
        switch (reward.type) {
            case 'coins':
                if (window.gameManager) {
                    window.gameManager.addCoins(reward.amount);
                }
                break;
                
            case 'gems':
                if (window.gameManager) {
                    window.gameManager.addGems(reward.amount);
                }
                break;
                
            case 'character':
            case 'exclusive_skin':
                // Unlock in customization system
                console.log(`🎁 Unlocked: ${reward.id}`);
                break;
        }
        
        if (!auto && window.uiManager) {
            window.uiManager.showNotification({
                title: 'Reward Claimed!',
                message: `You received ${reward.icon}`,
                type: 'success'
            });
        }
    }
    
    getTier() {
        return this.tier;
    }
    
    getXP() {
        return this.xp;
    }
    
    getProgress() {
        return {
            tier: this.tier,
            xp: this.xp,
            xpForNext: this.xpPerTier,
            percentage: (this.xp / this.xpPerTier) * 100,
            isPremium: this.isPremium
        };
    }
    
    getRewards() {
        return this.rewards;
    }
    
    upgradeToPremium() {
        if (this.isPremium) return false;
        
        this.isPremium = true;
        
        // Claim all previous premium rewards
        for (let i = 0; i < this.tier; i++) {
            const reward = this.rewards[i];
            if (reward && reward.premium) {
                this.claimReward(reward.premium, true);
            }
        }
        
        this.saveProgress();
        console.log('⭐ Upgraded to Premium Pass');
        return true;
    }
    
    saveProgress() {
        localStorage.setItem('season', JSON.stringify({
            season: this.currentSeason,
            tier: this.tier,
            xp: this.xp,
            isPremium: this.isPremium
        }));
    }
    
    loadProgress() {
        const saved = localStorage.getItem('season');
        if (saved) {
            const data = JSON.parse(saved);
            this.currentSeason = data.season || 1;
            this.tier = data.tier || 0;
            this.xp = data.xp || 0;
            this.isPremium = data.isPremium || false;
        }
    }
    
    reset() {
        this.tier = 0;
        this.xp = 0;
        this.saveProgress();
    }
}
