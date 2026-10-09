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

    // Toggle card description on tap (mobile) & click
    let touchMoved = false;
    let touchStartX = 0;
    let touchStartY = 0;

    cards.forEach(card => {
        dotsObserver.observe(card);
        animObserver.observe(card);

        card.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchMoved = false;
        }, { passive: true });

        card.addEventListener('touchmove', (e) => {
            if (Math.abs(e.touches[0].clientX - touchStartX) > 10 || Math.abs(e.touches[0].clientY - touchStartY) > 10) {
                touchMoved = true;
            }
        }, { passive: true });

        card.addEventListener('click', () => {
            if (touchMoved) {
                touchMoved = false;
                return;
            }
            const isAlreadyActive = card.classList.contains('active-desc');
            cards.forEach(c => c.classList.remove('active-desc'));
            if (!isAlreadyActive) {
                card.classList.add('active-desc');
            }
        });
    });

    // Close description on click outside carousel
    document.addEventListener('click', (e) => {
        if (!carousel.contains(e.target)) {
            cards.forEach(c => c.classList.remove('active-desc'));
        }
    });

    // Close description on carousel swipe/scroll
    carousel.addEventListener('scroll', () => {
        cards.forEach(c => c.classList.remove('active-desc'));
    }, { passive: true });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 760) {
            cards.forEach(c => c.classList.remove('active-desc'));
        }
    });
})();


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