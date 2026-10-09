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


// background
(function initVanityBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const n = canvas.getContext('2d');
    if (!n) return;

    const r = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const i = document.createElement('canvas');
    const a = i.getContext('2d');
    if (!a) return;

    const PF = new Uint8Array(512);
    {
        let e = 1337;
        for (let idx = 0; idx < 256; idx++) PF[idx] = idx;
        for (let t = 255; t > 0; t--) {
            e = (e * 16807) % 2147483647;
            const randIdx = e % (t + 1);
            [PF[t], PF[randIdx]] = [PF[randIdx], PF[t]];
        }
        for (let idx = 0; idx < 256; idx++) PF[256 + idx] = PF[idx];
    }

    function FF(e, t) {
        const xFloor = Math.floor(e);
        const yFloor = Math.floor(t);
        const xFrac = e - xFloor;
        const yFrac = t - yFloor;
        const xSmooth = xFrac * xFrac * (3 - 2 * xFrac);
        const ySmooth = yFrac * yFrac * (3 - 2 * yFrac);
        const c = (x, y) => PF[(PF[x & 255] + (y & 255)) & 511] / 255;
        const l = c(xFloor, yFloor);
        const u = c(xFloor + 1, yFloor);
        const d = c(xFloor, yFloor + 1);
        const f = c(xFloor + 1, yFloor + 1);
        return l + (u - l) * xSmooth + (d - l) * ySmooth + (l - u - d + f) * xSmooth * ySmooth;
    }

    const IF = 3;
    const LF = performance.now();
    const RF = 11;
    const zF = 6;

    function BF() {
        const cssVal = getComputedStyle(document.documentElement).getPropertyValue('--accent-2').trim();
        const hexMatch = /^#([0-9a-f]{6})$/i.exec(cssVal);
        if (!hexMatch) return [127, 203, 245];
        const num = parseInt(hexMatch[1], 16);
        return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    }

    const o = BF();
    let s = 0;
    let c = 0;
    let l = 0;
    let u = 0;
    let d = new Uint8Array();

    const f = () => {
        s = canvas.width = Math.max(1, window.innerWidth);
        c = canvas.height = Math.max(1, window.innerHeight);
        l = i.width = Math.ceil(s / IF);
        u = i.height = Math.ceil(c / IF);
        d = new Uint8Array(l * u);
    };
    f();
    window.addEventListener('resize', f);

    const p = (timeSec) => {
        const imgData = a.createImageData(l, u);
        const pixels = imgData.data;

        for (let y = 0; y < u; y++) {
            for (let x = 0; x < l; x++) {
                const rVal = FF(x * 0.009 + timeSec * 0.02, y * 0.013 + timeSec * 0.012) * 0.7
                           + FF(x * 0.03, y * 0.04 - timeSec * 0.015) * 0.3;
                d[y * l + x] = Math.floor(rVal * RF);
            }
        }

        for (let y = 0; y < u - 1; y++) {
            for (let x = 0; x < l - 1; x++) {
                const nVal = d[y * l + x];
                if (nVal !== d[y * l + x + 1] || nVal !== d[(y + 1) * l + x]) {
                    const idx = (y * l + x) * 4;
                    const isAccent = (nVal === zF);
                    pixels[idx]     = isAccent ? o[0] : 255;
                    pixels[idx + 1] = isAccent ? o[1] : 255;
                    pixels[idx + 2] = isAccent ? o[2] : 255;
                    pixels[idx + 3] = isAccent ? 140 : 42;
                }
            }
        }

        a.putImageData(imgData, 0, 0);

        n.fillStyle = '#050507';
        n.fillRect(0, 0, s, c);

        const grad = n.createRadialGradient(s * 0.85, c * 0.05, 0, s * 0.85, c * 0.05, s * 0.4);
        grad.addColorStop(0, 'rgba(125,117,223,.08)');
        grad.addColorStop(1, 'rgba(125,117,223,0)');
        n.fillStyle = grad;
        n.fillRect(0, 0, s, c);

        n.imageSmoothingEnabled = false;
        n.drawImage(i, 0, 0, l * IF, u * IF);
        n.imageSmoothingEnabled = true;
    };

    let m = 0;
    let h = -1;
    const g = (timestamp) => {
        m = requestAnimationFrame(g);
        const tSec = (timestamp - LF) / 1000;
        if (tSec - h < 0.06) return;
        h = tSec;
        p(tSec);
    };

    if (r) {
        p((performance.now() - LF) / 1000);
    } else {
        m = requestAnimationFrame(g);
    }

    const onVisChange = () => {
        cancelAnimationFrame(m);
        m = 0;
        if (!document.hidden && !r) {
            m = requestAnimationFrame(g);
        }
    };

    document.addEventListener('visibilitychange', onVisChange);
})();