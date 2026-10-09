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

    //imgs
    const imgs = document.querySelectorAll('.img');
    imgs.forEach(img => {
        img.addEventListener('animationend', () => {
            img.style.animation = 'none';
            img.classList.add('ready');
        });
    });

    setTimeout(() => {
        imgs.forEach(img => {
            img.style.animation = 'none';
            img.classList.add('ready');
        });
    }, 1500);

    const track = document.getElementById('avatarCarousel');
    if (track) {
        let isMobile = window.innerWidth <= 760;
        let autoSlideTimer = null;
        let isTransitioning = false;
        let safetyTimeout = null;

        function resetTrack() {
            if (!isTransitioning) return;
            track.style.transition = 'none';
            if (track.firstElementChild) {
                track.appendChild(track.firstElementChild);
            }
            track.style.transform = 'translateX(0)';
            void track.offsetHeight;
            isTransitioning = false;
        }

        function slideNext() {
            if (!isMobile || isTransitioning || track.children.length < 2) return;
            if (document.hidden || document.body.classList.contains('menu-open')) return;

            isTransitioning = true;
            track.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
            track.style.transform = 'translateX(-100vw)';

            clearTimeout(safetyTimeout);
            safetyTimeout = setTimeout(resetTrack, 550);
        }

        track.addEventListener('transitionend', (e) => {
            if (e.target !== track || e.propertyName !== 'transform') return;
            resetTrack();
        });

        function startAutoSlide() {
            stopAutoSlide();
            autoSlideTimer = setInterval(slideNext, 2000);
        }

        function stopAutoSlide() {
            if (autoSlideTimer) {
                clearInterval(autoSlideTimer);
                autoSlideTimer = null;
            }
        }

        function handleResize() {
            const currentlyMobile = window.innerWidth <= 760;
            if (currentlyMobile !== isMobile) {
                isMobile = currentlyMobile;
                if (isMobile) {
                    track.style.transform = 'translateX(0)';
                    track.style.transition = 'none';
                    isTransitioning = false;
                    startAutoSlide();
                } else {
                    stopAutoSlide();
                    track.style.transform = '';
                    track.style.transition = '';
                    const items = Array.from(track.children);
                    items.sort((a, b) => (parseInt(a.dataset.order, 10) || 0) - (parseInt(b.dataset.order, 10) || 0));
                    items.forEach(item => track.appendChild(item));
                }
            }
        }

        if (isMobile) {
            startAutoSlide();
        }

        let resizeDebounce = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeDebounce);
            resizeDebounce = setTimeout(handleResize, 150);
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoSlide();
            } else if (isMobile) {
                startAutoSlide();
            }
        });
    }
});


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