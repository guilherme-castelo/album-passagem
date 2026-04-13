const connectToDatabase = require('../../lib/db');

class AnalyticsRepository {
    async getCollection() {
        const db = await connectToDatabase();
        return db.collection('analytics_sessions');
    }

    async upsertSession(sessionId, payload) {
        const collection = await this.getCollection();
        const { ObjectId } = require('mongodb');
        
        let trackViews = [];
        if (Array.isArray(payload.trackViews)) {
            trackViews = payload.trackViews.map(tv => ({
                trackId: tv.trackId ? new ObjectId(tv.trackId) : null,
                duration: tv.duration || 0
            })).filter(tv => tv.trackId !== null);
        }

        return collection.updateOne(
            { sessionId },
            { 
                $set: { 
                    updatedAt: new Date(),
                    deviceType: payload.deviceType || 'desktop',
                    referrer: payload.referrer || 'direct',
                    utm_source: payload.utm_source || null,
                    utm_medium: payload.utm_medium || null,
                    utm_campaign: payload.utm_campaign || null,
                    duration: payload.duration || 0,
                    trackViews: trackViews,
                    passengerName: payload.passengerName || 'Anônimo'
                },
                $setOnInsert: { createdAt: new Date() }
            },
            { upsert: true }
        );
    }

    async getDashboardStats() {
        const collection = await this.getCollection();
        
        // Aggregate total visits, avg duration, top referrer, and device split
        const stats = await collection.aggregate([
            {
                $facet: {
                    global: [
                        { $group: { 
                            _id: null, 
                            totalVisits: { $sum: 1 }, 
                            avgDuration: { $avg: '$duration' }
                        }}
                    ],
                    devices: [
                        { $group: { _id: '$deviceType', count: { $sum: 1 } } }
                    ],
                    referrers: [
                        { $group: { _id: '$referrer', count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 5 }
                    ],
                    recentPassengers: [
                        { $match: { passengerName: { $exists: true, $ne: 'Anônimo', $ne: null } } },
                        { $sort: { updatedAt: -1 } },
                        { $limit: 50 },
                        { $project: { passengerName: 1, duration: 1, updatedAt: 1 } }
                    ]
                }
            }
        ]).toArray();

        return stats[0];
    }

    async getTrackMetrics() {
        const collection = await this.getCollection();

        // Unwind track views and sum time spent per track
        return collection.aggregate([
            { $unwind: '$trackViews' },
            { $group: {
                _id: '$trackViews.trackId',
                totalTimeSpent: { $sum: '$trackViews.duration' },
                uniqueListeners: { $sum: 1 } // Since we're grouping by track inside sessions
            }}
        ]).toArray();
    }
}

module.exports = new AnalyticsRepository();
