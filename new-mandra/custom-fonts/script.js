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


// cursor
(function glcursor() {
    const cursor = document.querySelector('.custom-cursor');
    if (!cursor) return;

    let isvisible = false;

    let mouseX = 0;
    let mouseY = 0;

    let currentX = 0;
    let currentY = 0;
    const ease = 0.15;
    let activecard = null;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        if (!isvisible) {
            currentX = mouseX;
            currentY = mouseY;
            cursor.style.opacity = '1';
            isvisible = true;
        }
    });

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        isvisible = false;
    });

    const interactives = document.querySelectorAll('a, button, .burger');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('interactive'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('interactive'));
    });

    const cards = document.querySelectorAll('.img-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            activecard = card;
            cursor.classList.add('is-card');
        });

        card.addEventListener('mouseleave', () => {
            if (activecard === card) {
                activecard = null;
            }
            cursor.classList.remove('is-card');
        });
    });

    function render() {
        if (isvisible) {
            currentX += (mouseX - currentX) * ease;
            currentY += (mouseY - currentY) * ease;

            cursor.style.left = `${currentX}px`;
            cursor.style.top = `${currentY}px`;

            if (activecard) {
                const rect = activecard.getBoundingClientRect();
                const cardX = currentX - rect.left;
                const cardY = currentY - rect.top; 

                const x = (cardX / rect.width) * 100;
                const y = (cardY / rect.height) * 100;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const maxdist = Math.hypot(centerX, centerY);
                const currentdist = Math.hypot(cardX - centerX, cardY - centerY);

                const factor = Math.max(0, 1 - (currentdist / maxdist));
                const minR = 45;
                const maxR = 105;
                const radius = minR + (maxR - minR) * factor;

                activecard.style.setProperty('--x', `${x.toFixed(1)}%`);
                activecard.style.setProperty('--y', `${y.toFixed(1)}%`);
                activecard.style.setProperty('--r', `${radius.toFixed(1)}px`);

                cursor.style.setProperty('--cursor-size', `${(radius * 2).toFixed(1)}px`);
            }
        }
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
})();


// анимации карточек для телефона

(function mobileObserver() {
    const mobilecards = document.querySelectorAll('.img-card-m');
    if (!mobilecards.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                obs.unobserve(entry.target);
            }
        });
    }, {threshold: 0.2});
    mobilecards.forEach(card => observer.observe(card));
})();

// режим рассмотра + holdbtn
(function fontmodal() {
    const modal = document.getElementById('font-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.modal-close');
    const imgBase = modal.querySelector('.img-target-base');
    const imgCustom = modal.querySelector('.img-target-custom');
    const cardBase = modal.querySelector('.modal-card.card-base');
    const cardCustom = modal.querySelector('.modal-card.card-custom');
    const modalCards = modal.querySelectorAll('.modal-card');
    const triggerCards = document.querySelectorAll('.img-card-m');
    const holdBtn = modal.querySelector('.hold-btn');
    const holdFill = modal.querySelector('.hold-btn-fill');
    const holdText = modal.querySelector('.hold-btn-text');
    const toggleContainer = modal.querySelector('.bell-toggle');
    const toggleBtn = modal.querySelector('.bell-toggle__button');

    let isToggleOn = false;

    let currentScale = 1;
    let startDist = 0;
    let startScale = 1;
    let posX = 0, posY = 0;
    let startX = 0, startY = 0;
    let isPinching = false;
    let isPanning = false;
    let touchMoved = false;
    let lastTap = 0;
    let activeZoomedCard = null;

    const HOLD_DURATION = 750;
    let holdStartTime = 0;
    let holdAnimId = null;
    let isHolding = false;

    function applyTransform(animated = false) {
        if (!activeZoomedCard) return;
        activeZoomedCard.style.transition = animated ? 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
        activeZoomedCard.style.setProperty(
            'transform',
            `translate(${posX.toFixed(1)}px, ${posY.toFixed(1)}px) scale(${currentScale.toFixed(3)})`,
            'important'
        );
    }

    function updateButtonLabel() {
        if (!holdText) return;
        if (activeZoomedCard === cardBase || activeZoomedCard === cardCustom) {
            holdText.textContent = 'Режим изучения';
        } else {
            holdText.textContent = 'Режим сравнения';
        }
    }

    function setToggleState(on, animated = true) {
        isToggleOn = on;
        if (toggleContainer) {
            toggleContainer.setAttribute('data-on', on ? 'true' : 'false');
            if (on && animated) {
                toggleContainer.classList.remove('wiggle');
                void toggleContainer.offsetWidth;
                toggleContainer.classList.add('wiggle');
            }
        }
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
        }

        if (!modal.classList.contains('zoomed-mode')) return;

        if (on) {
            // Включение переключателя: картинка со шрифтом плавно и быстро выезжает вниз на место прошлой
            cardBase.classList.remove('is-zoomed', 'slide-in-down', 'slide-in-up');
            cardBase.style.removeProperty('transform');
            cardBase.style.transition = '';

            cardCustom.classList.add('is-zoomed');
            activeZoomedCard = cardCustom;

            if (animated) {
                cardCustom.classList.remove('slide-in-down', 'slide-in-up');
                void cardCustom.offsetWidth;
                cardCustom.classList.add('slide-in-down');
            } else {
                applyTransform(false);
            }
        } else {
            // Выключение переключателя: возврат к картинке без шрифта
            cardCustom.classList.remove('is-zoomed', 'slide-in-down', 'slide-in-up');
            cardCustom.style.removeProperty('transform');
            cardCustom.style.transition = '';

            cardBase.classList.add('is-zoomed');
            activeZoomedCard = cardBase;

            if (animated) {
                cardBase.classList.remove('slide-in-down', 'slide-in-up');
                void cardBase.offsetWidth;
                cardBase.classList.add('slide-in-up');
            } else {
                applyTransform(false);
            }
        }

        currentScale = 1;
        posX = 0;
        posY = 0;
        updateButtonLabel();
    }

    if (cardCustom) {
        cardCustom.addEventListener('animationend', (e) => {
            if (e.animationName === 'cardSlideDown') {
                cardCustom.classList.remove('slide-in-down');
                applyTransform(false);
            }
        });
    }
    if (cardBase) {
        cardBase.addEventListener('animationend', (e) => {
            if (e.animationName === 'cardSlideUp') {
                cardBase.classList.remove('slide-in-up');
                applyTransform(false);
            }
        });
    }

    function openZoom(card) {
        modalCards.forEach(c => {
            c.classList.remove('is-zoomed', 'slide-in-down', 'slide-in-up');
            c.style.removeProperty('transform');
            c.style.transition = '';
        });
        card.classList.add('is-zoomed');
        modal.classList.add('zoomed-mode');
        activeZoomedCard = card;
        currentScale = 1;
        posX = 0;
        posY = 0;
        setToggleState(card === cardCustom, false);
        updateButtonLabel();
        applyTransform(true);
    }

    function toggleStudyMode() {
        if (!activeZoomedCard) {
            openZoom(cardBase);
            return;
        }

        // Если уже в режиме сравнения (открыта любая из карточек) — возвращаемся в каталог 2 карточек
        resetZoom();
    }

    function resetZoom() {
        modal.classList.remove('zoomed-mode');
        endHold();

        if (activeZoomedCard) {
            activeZoomedCard.classList.remove('touching', 'is-zoomed', 'slide-in-down', 'slide-in-up');
            activeZoomedCard.style.removeProperty('transform');
            activeZoomedCard.style.transition = '';
            activeZoomedCard = null;
        }

        modalCards.forEach(c => {
            c.classList.remove('is-zoomed', 'touching', 'slide-in-down', 'slide-in-up');
            c.style.removeProperty('transform');
            c.style.transition = '';
        });

        currentScale = 1;
        posX = 0;
        posY = 0;
        isPinching = false;
        isPanning = false;
        touchMoved = false;

        setToggleState(false, false);
        updateButtonLabel();
    }

    function closeModal() {
        modal.classList.remove('active');
        resetZoom();
        document.body.classList.remove('modal-open');
    }

    triggerCards.forEach((card, index) => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const fontNumber = index + 1;
            if (imgBase) imgBase.src = `assets/no-cf-${fontNumber}.jpg`;
            if (imgCustom) imgCustom.src = `assets/with-cf-${fontNumber}.jpg`;

            resetZoom(); 
            modal.classList.add('active');
            document.body.classList.add('modal-open');
        });
    });

    function startHold(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (isHolding) return;
        isHolding = true;
        holdBtn.classList.add('is-holding');
        holdStartTime = performance.now();

        cancelAnimationFrame(holdAnimId);

        function updateProgress(now) {
            if (!isHolding) return;
            const elapsed = now - holdStartTime;
            const progress = Math.min(100, (elapsed / HOLD_DURATION) * 100);

            if (holdFill) holdFill.style.width = `${progress}%`;

            if (progress >= 100) {
                isHolding = false;
                holdBtn.classList.remove('is-holding');
                if (navigator.vibrate) navigator.vibrate(40);

                toggleStudyMode();

                if (holdFill) holdFill.style.width = '0%';
                return;
            }

            holdAnimId = requestAnimationFrame(updateProgress);
        }

        holdAnimId = requestAnimationFrame(updateProgress);
    }

    function endHold() {
        if (!isHolding) return;
        isHolding = false;
        if (holdBtn) holdBtn.classList.remove('is-holding');
        cancelAnimationFrame(holdAnimId);

        if (holdFill) {
            holdFill.style.transition = 'width 0.2s ease-out';
            holdFill.style.width = '0%';
            setTimeout(() => {
                if (holdFill) holdFill.style.transition = 'none';
            }, 200);
        }
    }

    if (holdBtn) {
        holdBtn.addEventListener('pointerdown', startHold);
        holdBtn.addEventListener('touchstart', startHold, { passive: false });
        window.addEventListener('pointerup', endHold);
        window.addEventListener('pointercancel', endHold);
        window.addEventListener('touchend', endHold);
        window.addEventListener('touchcancel', endHold);
        holdBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        holdBtn.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    }

    if (toggleContainer && toggleBtn) {
        toggleBtn.addEventListener('pointerdown', (e) => {
            if (e.button === 0) toggleContainer.dataset.pressed = '';
        });
        const releaseToggle = () => {
            delete toggleContainer.dataset.pressed;
        };
        window.addEventListener('pointerup', releaseToggle);
        window.addEventListener('pointercancel', releaseToggle);

        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            setToggleState(!isToggleOn, true);
        });

        toggleBtn.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    }

    modal.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    });

    window.addEventListener('contextmenu', (e) => {
        if (document.body.classList.contains('modal-open') || e.target.closest('#font-modal')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, { capture: true });

    modal.addEventListener('click', (e) => {
        if (touchMoved || e.target.closest('.hold-btn') || e.target.closest('.bell-toggle')) {
            touchMoved = false;
            return;
        }

        if (e.target.closest('.modal-close')) {
            closeModal();
            return;
        }

        const clickedCard = e.target.closest('.modal-card');

        if (clickedCard) {
            if (!modal.classList.contains('zoomed-mode')) {
                openZoom(clickedCard);
            }
            return;
        }

        if (modal.classList.contains('zoomed-mode')) {
            resetZoom();
            return;
        }

        closeModal();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('touchstart', (e) => {
        if (!modal.classList.contains('zoomed-mode') || !activeZoomedCard) return;

        if (e.target.closest('.modal-card') && e.touches.length === 1) {
            const now = Date.now();
            if (now - lastTap < 300) {
                e.preventDefault();
                touchMoved = true;
                if (currentScale > 1.1) {
                    currentScale = 1;
                    posX = 0;
                    posY = 0;
                } else {
                    currentScale = 2.4;
                    posX = 0;
                    posY = 0;
                }
                applyTransform(true);
                lastTap = 0;
                setTimeout(() => { touchMoved = false; }, 350);
                return;
            }
            lastTap = now;
        }

        if (e.touches.length === 2) {
            e.preventDefault();
            isPinching = true;
            isPanning = false;
            touchMoved = true;
            activeZoomedCard.classList.add('touching');
            startDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            startScale = currentScale;
        } 
        else if (e.touches.length === 1) {
            startX = e.touches[0].clientX - posX;
            startY = e.touches[0].clientY - posY;
            if (currentScale > 1.05) {
                isPanning = true;
                activeZoomedCard.classList.add('touching');
            }
        }
    }, { passive: false });

    modal.addEventListener('touchmove', (e) => {
        if (!modal.classList.contains('zoomed-mode') || !activeZoomedCard) return;

        if (isPinching && e.touches.length === 2) {
            e.preventDefault();
            touchMoved = true;
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            if (startDist > 0) {
                const factor = dist / startDist;
                currentScale = Math.min(Math.max(1, startScale * factor), 4.5);
                applyTransform(false);
            }
        } else if (isPanning && e.touches.length === 1 && currentScale > 1.05) {
            e.preventDefault();
            touchMoved = true;
            posX = e.touches[0].clientX - startX;
            posY = e.touches[0].clientY - startY;

            const maxPanX = (currentScale - 1) * (activeZoomedCard.offsetWidth / 2);
            const maxPanY = (currentScale - 1) * (activeZoomedCard.offsetHeight / 2);
            posX = Math.max(-maxPanX, Math.min(maxPanX, posX));
            posY = Math.max(-maxPanY, Math.min(maxPanY, posY));

            applyTransform(false);
        }
    }, { passive: false });

    modal.addEventListener('touchend', (e) => {
        if (!modal.classList.contains('zoomed-mode') || !activeZoomedCard) return;

        if (e.touches.length < 2) isPinching = false;
        if (e.touches.length === 0) {
            isPanning = false;
            activeZoomedCard.classList.remove('touching');

            if (currentScale < 1.05) {
                currentScale = 1;
                posX = 0;
                posY = 0;
                applyTransform(true);
            }

            setTimeout(() => { touchMoved = false; }, 300);
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