/**
 * ============================================
 * ANALYTICS MANAGER - Track game metrics
 * ============================================
 */

class AnalyticsManager {
    constructor() {
        this.events = [];
        this.sessionStart = Date.now();
        this.totalPlayTime = 0;
        
        console.log('✅ AnalyticsManager Initialized');
    }
    
    trackEvent(category, action, label, value) {
        const event = {
            category,
            action,
            label,
            value,
            timestamp: Date.now()
        };
        
        this.events.push(event);
        console.log('📊 Event:', category, action, label, value);
    }
    
    trackGameStart() {
        this.trackEvent('game', 'start', 'game_session');
    }
    
    trackGameEnd(score, distance) {
        this.trackEvent('game', 'end', 'score', score);
        this.trackEvent('game', 'end', 'distance', distance);
    }
    
    trackPurchase(item, price) {
        this.trackEvent('shop', 'purchase', item, price);
    }
    
    getSessionDuration() {
        return Date.now() - this.sessionStart;
    }
    
    getStats() {
        return {
            totalEvents: this.events.length,
            sessionDuration: this.getSessionDuration(),
            totalPlayTime: this.totalPlayTime
        };
    }
}
