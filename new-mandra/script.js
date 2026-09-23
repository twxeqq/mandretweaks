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
            document.body.style.overflow = 'hidden';
        });
        closebtn.addEventListener('click', function(){
            openbtn.classList.remove('hidden');
            closebtn.classList.remove('visible');
            menu.classList.remove('visible');
            document.body.classList.remove('menu-open');
            document.body.style.overflow = '';
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
            deco.classList.toggle('show', progress >= 0.98);
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

    function updateProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        if (totalHeight > 0) {
            const progress = (scrollTop / totalHeight) * 100;
            progressbar.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
        }
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    window.addEventListener('load', updateProgress);
    updateProgress();
})();