function moveCarousel(direction) {
    const carousel = document.getElementById('catalogCarousel');
    const firstCard = carousel.querySelector('.carousel-item');
    if (!firstCard) return;

    const gap = parseFloat(window.getComputedStyle(carousel).gap) || 20;
    const scrollStep = firstCard.offsetWidth + gap;

    carousel.scrollBy({
        left: direction * scrollStep,
        behavior: 'smooth'
    });
}