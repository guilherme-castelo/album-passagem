const analyticsRepository = require('./analyticsRepository');

class AnalyticsService {
    async registerSession(sessionId, payload) {
        if (!sessionId) throw new Error("Session ID is required.");
        return await analyticsRepository.upsertSession(sessionId, payload);
    }

    async getDashboardMetrics() {
        const stats = await analyticsRepository.getDashboardStats();
        const global = stats.global[0] || { totalVisits: 0, avgDuration: 0 };
        
        return {
            totalVisits: global.totalVisits,
            avgDuration: global.avgDuration,
            devices: stats.devices,
            referrers: stats.referrers,
            recentPassengers: stats.recentPassengers || []
        };
    }

    async getTrackMetrics() {
        return await analyticsRepository.getTrackMetrics();
    }
}

module.exports = new AnalyticsService();
