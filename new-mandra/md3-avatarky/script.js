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

    // Animate UI Tabs logic (Sliding Track Carousel + Smooth Indicator)
    const tabsList = document.querySelector('.tabs-list');
    const indicator = document.querySelector('.tab-indicator');
    const triggers = Array.from(document.querySelectorAll('.tab-trigger'));
    const track = document.querySelector('.tabs-track');
    const panels = Array.from(document.querySelectorAll('.tab-panel'));

    function updateIndicator(targetBtn) {
        if (!tabsList || !indicator || !targetBtn) return;
        const btnRect = targetBtn.getBoundingClientRect();
        const listRect = tabsList.getBoundingClientRect();
        const left = btnRect.left - listRect.left;
        const width = btnRect.width;

        indicator.style.transform = `translateX(${left}px)`;
        indicator.style.width = `${width}px`;
    }

    function goToTab(index) {
        if (!track || !panels[index]) return;
        const offsetPercent = index * (100 / panels.length);
        track.style.transform = `translateX(-${offsetPercent}%)`;

        panels.forEach((p, idx) => {
            if (idx === index) {
                p.classList.add('active');
            } else {
                p.classList.remove('active');
            }
        });
    }

    if (tabsList && indicator && triggers.length > 0) {
        let currentIndex = triggers.findIndex(btn => btn.classList.contains('active'));
        if (currentIndex === -1) currentIndex = 0;

        const initialActive = triggers[currentIndex];
        goToTab(currentIndex);

        requestAnimationFrame(() => {
            updateIndicator(initialActive);
        });
        window.addEventListener('load', () => {
            updateIndicator(triggers[currentIndex] || triggers[0]);
        });

        triggers.forEach((btn, newIndex) => {
            btn.addEventListener('click', () => {
                if (newIndex === currentIndex) return;

                triggers.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                    if (typeof b.blur === 'function') b.blur();
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');

                updateIndicator(btn);
                goToTab(newIndex);
                currentIndex = newIndex;
            });
        });

        window.addEventListener('resize', () => {
            const currentActive = triggers[currentIndex] || triggers[0];
            updateIndicator(currentActive);
        });
    }

    initCornerWaveAnimations();
});

// Corner wave animation for cards with plugin (clipping image 1:1 with border)
function initCornerWaveAnimations() {
    const waveCards = document.querySelectorAll('.card-wave');
    if (!waveCards.length) return;

    let animId = null;
    let time = 0;

    function drawImageCover(ctx, img, dx, dy, dw, dh) {
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const destRatio = dw / dh;
        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
        if (imgRatio > destRatio) {
            sw = img.naturalHeight * destRatio;
            sx = (img.naturalWidth - sw) / 2;
        } else {
            sh = img.naturalWidth / destRatio;
            sy = (img.naturalHeight - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    const cardsData = Array.from(waveCards).map(card => {
        const canvas = card.querySelector('.card-wave-canvas');
        const img = card.querySelector('.card-wavy-img');
        const isStretched = card.dataset.wave === 'stretched';
        // 'stretched' (group): k = 0.85, amp = 6, speed = 0.050 (faster)
        // 'tight' (profile/channel): k = 1.70, amp = 4, speed = 0.085 (faster)
        const k = isStretched ? 0.85 : 1.70;
        const amp = isStretched ? 6 : 4;
        const speed = isStretched ? 0.050 : 0.085;
        return {
            card,
            canvas,
            img,
            ctx: canvas ? canvas.getContext('2d') : null,
            k,
            amp,
            speed,
            time: 0
        };
    });

    function getCornerPts(cx, cy, startA, endA, R, amp, k, t) {
        const pts = [];
        const steps = 24;
        for (let i = 0; i <= steps; i++) {
            const u = i / steps;
            const theta = startA + u * (endA - startA);
            const win = Math.sin(u * Math.PI);
            const dr = amp * Math.sin(k * u * Math.PI * 2 - t) * win;
            const r = R + dr;
            pts.push({ x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) });
        }
        return pts;
    }

    function render() {
        const pad = 12;
        const R = 48;

        cardsData.forEach(item => {
            const { card, canvas, img, ctx, k, amp, speed } = item;
            if (!canvas || !ctx) return;

            item.time += speed;
            const t = item.time;

            const cardW = card.offsetWidth;
            const cardH = card.offsetHeight;
            if (cardW === 0 || cardH === 0) return;

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const targetW = Math.round(cardW + 24);
            const targetH = Math.round(cardH + 24);

            if (canvas.width !== targetW * dpr || canvas.height !== targetH * dpr) {
                canvas.width = targetW * dpr;
                canvas.height = targetH * dpr;
            }

            ctx.save();
            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, targetW, targetH);

            const w = targetW - 2 * pad;
            const h = targetH - 2 * pad;
            const R = cardW < 340 ? 36 : 48;

            const cTL = { cx: pad + R, cy: pad + R };
            const cTR = { cx: pad + w - R, cy: pad + R };
            const cBR = { cx: pad + w - R, cy: pad + h - R };
            const cBL = { cx: pad + R, cy: pad + h - R };

            ctx.beginPath();
            // Start at top straight edge
            ctx.moveTo(pad + R, pad);
            ctx.lineTo(pad + w - R, pad);

            // Top-Right corner wave
            const trPts = getCornerPts(cTR.cx, cTR.cy, -Math.PI / 2, 0, R, amp, k, t);
            trPts.forEach(pt => ctx.lineTo(pt.x, pt.y));

            // Right straight edge
            ctx.lineTo(pad + w, pad + h - R);

            // Bottom-Right corner wave
            const brPts = getCornerPts(cBR.cx, cBR.cy, 0, Math.PI / 2, R, amp, k, t);
            brPts.forEach(pt => ctx.lineTo(pt.x, pt.y));

            // Bottom straight edge
            ctx.lineTo(pad + R, pad + h);

            // Bottom-Left corner wave
            const blPts = getCornerPts(cBL.cx, cBL.cy, Math.PI / 2, Math.PI, R, amp, k, t);
            blPts.forEach(pt => ctx.lineTo(pt.x, pt.y));

            // Left straight edge
            ctx.lineTo(pad, pad + R);

            // Top-Left corner wave
            const tlPts = getCornerPts(cTL.cx, cTL.cy, Math.PI, 1.5 * Math.PI, R, amp, k, t);
            tlPts.forEach(pt => ctx.lineTo(pt.x, pt.y));

            ctx.closePath();

            // 1. Clip and draw image 1-to-1 along the exact same wavy contour
            if (img && img.complete && img.naturalWidth > 0) {
                ctx.save();
                ctx.clip();
                drawImageCover(ctx, img, pad, pad, w, h);
                ctx.restore();
            }

            // 2. Stroke the 4px 60% white border along the exact contour
            ctx.lineWidth = 4;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.stroke();

            ctx.restore();
        });

        animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animId);
        } else {
            animId = requestAnimationFrame(render);
        }
    });
}


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
        if (!hexMatch) return [208, 66, 227];
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
        grad.addColorStop(0, 'rgba(208,66,227,.08)');
        grad.addColorStop(1, 'rgba(208,66,227,0)');
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