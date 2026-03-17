export class RatingWidget {
  constructor(elements, onLike, onRate) {
    this.dom = {
      btnLike: document.getElementById(elements.btnLike),
      likeCount: document.getElementById(elements.likeCount),
      ratingAvg: document.getElementById(elements.ratingAvg),
      stars: document.querySelectorAll(elements.starsSelector)
    };

    this.onLike = onLike;
    this.onRate = onRate;

    this._bindEvents();
  }

  _bindEvents() {
    if (this.dom.btnLike) {
      this.dom.btnLike.addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(30); // Haptic feedback mobile
        if (this.onLike) this.onLike();
      });
    }

    this.dom.stars.forEach((star) => {
      star.addEventListener('click', (e) => {
        if (navigator.vibrate) navigator.vibrate(20);
        const ratingValue = parseInt(e.currentTarget.getAttribute('data-rating'));
        if (this.onRate) this.onRate(ratingValue);
      });
    });
  }

  render(interactions, isLiked, userRating) {
    // Likes
    this.dom.likeCount.textContent = interactions.likes || 0;

    if (isLiked) {
      this.dom.btnLike.classList.add('liked');
    } else {
      this.dom.btnLike.classList.remove('liked');
    }

    // Média
    let media = '--';
    if (interactions.ratings && interactions.ratings.length > 0) {
      const sum = interactions.ratings.reduce((a, b) => a + b, 0);
      media = (sum / interactions.ratings.length).toFixed(1);
    }
    this.dom.ratingAvg.textContent = `Média: ${media}`;

    // Estrelas do Usuário
    this.dom.stars.forEach((star) => {
      const starVal = parseInt(star.getAttribute('data-rating'));
      if (starVal <= userRating) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
      star.style.pointerEvents = 'auto'; // Permitir re-avaliação
    });
  }

  // Opcional feedback de "Toasts"
  showToast(message) {
    let toast = document.createElement('div');
    toast.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg text-sm z-50 transition-opacity duration-300 pointer-events-none`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => (toast.style.opacity = '0'), 2000);
    setTimeout(() => toast.remove(), 2500);
  }
}
