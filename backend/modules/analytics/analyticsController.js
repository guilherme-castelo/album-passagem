const analyticsService = require('./analyticsService');

class AnalyticsController {
    async registerSession(req, res) {
        try {
            const { sessionId, data } = req.body;
            await analyticsService.registerSession(sessionId, data);
            
            return res.status(200).json({ success: true });
        } catch (err) {
            console.error('AnalyticsController.registerSession Error:', err);
            return res.status(400).json({ error: err.message });
        }
    }

    async getDashboard(req, res) {
        try {
            const metrics = await analyticsService.getDashboardMetrics();
            return res.status(200).json(metrics);
        } catch (err) {
            console.error('AnalyticsController.getDashboard Error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getTrackMetrics(req, res) {
        try {
            const metrics = await analyticsService.getTrackMetrics();
            return res.status(200).json(metrics);
        } catch (err) {
            console.error('AnalyticsController.getTrackMetrics Error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = new AnalyticsController();
