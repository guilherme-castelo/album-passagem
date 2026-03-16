class TrackService {
    getAlbumInfo() {
        return {
            title: "Passagem",
            artist: "Bruno",
            event: "Pré-lançamento Teatro Belas Artes",
            date: "2026-03-18T20:00:00-04:00"
        };
    }

    toggleLike(track, action) {
        let currentLikes = track.interactions?.likes || 0;
        
        if (action === 'unlike') {
            currentLikes = Math.max(0, currentLikes - 1);
        } else {
            currentLikes += 1;
        }
        
        return currentLikes;
    }

    submitRating(track, rating, oldRating) {
        let ratings = track.interactions?.ratings || [];
            
        if (oldRating) {
            const idx = ratings.indexOf(oldRating);
            if (idx !== -1) {
                ratings.splice(idx, 1);
            }
        }
        
        ratings.push(rating);
        return ratings;
    }
}

module.exports = new TrackService();
