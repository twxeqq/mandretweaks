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


// catalog title

const titleobs = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            entry.target.classList.remove('visible');
        }
    });
}, {threshold: 0.3});

const catalogtitle = document.querySelector('.catalog-title');
if (catalogtitle) {
    titleobs.observe(catalogtitle);
}


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
            document.body.style.overflow = 'hidden';
        });
        closebtn.addEventListener('click', function(){
            openbtn.classList.remove('hidden');
            closebtn.classList.remove('visible');
            menu.classList.remove('visible')
            document.body.style.overflow = ''
        });
    }

});