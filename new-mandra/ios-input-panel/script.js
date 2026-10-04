// burger

document.addEventListener('DOMContentLoaded', function(){
    const openbtn = document.querySelector('.openbtn');
    const closebtn = document.querySelector('.closebtn');
    const menu = document.querySelector('.menu');
    if ( openbtn && closebtn ) {
        openbtn.addEventListener('click', function() {
            openbtn.classList.add('hidden');
            closebtn.classList.add('visible');
            menu.classList.add('visible');
            document.body.classList.add('menu-open');
        });
        closebtn.addEventListener('click', function(){
            openbtn.classList.remove('hidden');
            closebtn.classList.remove('visible');
            menu.classList.remove('visible');
            document.body.classList.remove('menu-open');
        });
    }

});


// carousel-dots & appearance animations

(function initPanelCarousel() {
    const carousel = document.getElementById('panelCarousel');
    const dotsContainer = document.getElementById('carouselDots');
    if (!carousel || !dotsContainer) return;

    const cards = carousel.querySelectorAll('.carousel-item');
    if (!cards.length) return;

    dotsContainer.innerHTML = '';
    cards.forEach((card, index) => {
        const dot = document.createElement('button');
        dot.classList.add('dot');
        dot.setAttribute('aria-label', `Слайд ${index + 1}`);
        if (index === 0) dot.classList.add('active');

        dot.addEventListener('click', () => {
            card.scrollIntoView({
                behavior: 'smooth',
                inline: 'start',
                block: 'nearest'
            });
        });
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.dot');

    const dotsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const activeIndex = Array.from(cards).indexOf(entry.target);
                dots.forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === activeIndex);
                });
            }
        });
    }, {
        root: carousel,
        threshold: 0.5
    });

    const animObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (window.innerWidth <= 760) {
                entry.target.classList.toggle('visible', entry.isIntersecting);
            } else {
                entry.target.classList.add('visible');
            }
        });
    }, {
        root: window.innerWidth <= 760 ? carousel : null,
        threshold: 0.15
    });

    cards.forEach(card => {
        dotsObserver.observe(card);
        animObserver.observe(card);
    });
})();