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


//mobile

(function () {
    const navbar = document.querySelector('.navbar');
    const scene = document.querySelector('.container-m');
    const sticky = document.querySelector('.sticky-view');
    const track = document.querySelector('.container-title');
    const deco = document.querySelector('.deco-imgs-m');
    if (!scene || !sticky || !track) return;

    function setNavHeight() {
        if (navbar) {
            document.documentElement.style.setProperty('--nav-h', navbar.offsetHeight + 'px');
        }
    }

    function onScroll() {
        const total = scene.offsetHeight - sticky.offsetHeight;
        if (total <= 0) return;

        const progress = Math.min(Math.max(-scene.getBoundingClientRect().top / total, 0), 1);
        const maxScroll = track.scrollWidth - track.clientWidth;

        track.scrollLeft = progress * maxScroll;

        if (deco) {
            deco.classList.toggle('show', progress >= 0.5);
        }
    }

    function onResize() {
        setNavHeight();
        onScroll();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('load', onResize);
    onResize();
})();


// scroll progress

(function () {
    const progressbar = document.getElementById('progressbar');
    if (!progressbar) return;

    function updateprog() {
        const scrolltop = window.scrollY || document.documentElement.scrollTop;
        const totalheight = document.documentElement.scrollHeight - window.innerHeight;

        if (totalheight > 0) {
            progressbar.style.width = `${(scrolltop / totalheight) * 100}%`
        }
    }

    window.addEventListener('scroll', updateprog, {passive: true});
    window.addEventListener('resize', updateprog);
    window.addEventListener('load', updateprog);
})();


// carousel-dots

(function initcarnavig() {
    const carousel = document.getElementById('catalogCarousel');
    const dotscontainer = document.getElementById('carouselDots');
    if (!carousel || !dotscontainer) return;

    const cards = document.querySelectorAll('.carousel-item');
    dotscontainer.innerHTML = '';
    cards.forEach((card, index) => {
        const dot = document.createElement('button');
        dot.classList.add('dot');
        dot.setAttribute('aria-label', `Слайд ${index + 1}`);
        if (index === 0) dot.classList.add('active');

        dot.addEventListener('click', () => {
            card.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        });
        dotscontainer.appendChild(dot);
    });

    const dots = dotscontainer.querySelectorAll('.dot');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const activeindex = Array.from(cards).indexOf(entry.target);
                dots.forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === activeindex);
                });
            }
        });
    }, {
        root: carousel,
        threshold: 0.6
    });
    cards.forEach(card => observer.observe(card))
}) ();


// carousel observer

(function () {
    const catalog = document.querySelector('.catalog-container');
    function getthershold() {
        if (window.innerWidth > 760) return 0.1;
        const catalogheight = catalog.offsetHeight || 500;
        const ratio = (window.innerHeight * 0.8) / catalogheight;
        return Math.min(0.8, Math.max(0.2, Math.floor(ratio * 10) / 10));
    }

    const catalogobserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (window.innerWidth <= 760) {
                entry.target.classList.toggle('visible', entry.isIntersecting);
            } else {
                entry.target.classList.add('visible');
            }
        });
    }, {threshold: getthershold()});

    catalogobserver.observe(catalog);
}) ();