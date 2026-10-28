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

    document.body.classList.remove('modal-open');

    const backdrop = modal.querySelector('.modal-backdrop');
    const closeBtn = modal.querySelector('.modal-close');
    const imgBase = modal.querySelector('.img-target-base');
    const imgCustom = modal.querySelector('.img-target-custom');
    const cardBase = modal.querySelector('.modal-card.card-base');
    const cardCustom = modal.querySelector('.modal-card.card-custom');
    const modalCards = modal.querySelectorAll('.modal-card');
    const modalStack = modal.querySelector('.modal-stack');
    const compareSlider = modal.querySelector('.compare-slider');
    const badgeBase = modal.querySelector('.card-base .modal-badge');
    const badgeCustom = modal.querySelector('.card-custom .modal-badge');
    const triggerCards = document.querySelectorAll('.img-card-m');
    const holdBtn = modal.querySelector('.hold-btn');
    const holdFill = modal.querySelector('.hold-btn-fill');
    const holdText = modal.querySelector('.hold-btn-text');
    const toggleContainer = modal.querySelector('.bell-toggle');
    const toggleBtn = modal.querySelector('.bell-toggle__button');

    let isToggleOn = false;
    let comparePos = 50;
    let isDraggingCompare = false;

    let currentScale = 1;
    let startDist = 0;
    let startScale = 1;
    let posX = 0, posY = 0;
    let startX = 0, startY = 0;
    let isPinching = false;
    let isPanning = false;
    let touchMoved = false;
    let lastTap = 0;
    let currentMode = 'study'; // 'study' (режим изучения) или 'compare' (режим сравнения)
    let isCardZoomed = false; // открыта ли отдельная увеличенная карточка в режиме изучения
    let activeZoomedCard = null;

    const HOLD_DURATION = 750;
    let holdStartTime = 0;
    let holdAnimId = null;
    let isHolding = false;

    function applyTransform(animated = false) {
        if (currentMode !== 'study' || !isCardZoomed) return;
        const transformValue = `translate(${posX.toFixed(1)}px, ${posY.toFixed(1)}px) scale(${currentScale.toFixed(3)})`;
        const transitionValue = animated ? 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';

        if (cardBase) {
            cardBase.style.transition = transitionValue;
            cardBase.style.setProperty('transform', transformValue, 'important');
        }
        if (cardCustom && !cardCustom.classList.contains('slide-in-down')) {
            cardCustom.style.transition = transitionValue;
            cardCustom.style.setProperty('transform', transformValue, 'important');
        }
    }

    function updateButtonLabel() {
        if (!holdText) return;
        if (currentMode === 'study') {
            holdText.textContent = 'Режим сравнения';
        } else {
            holdText.textContent = 'Режим изучения';
        }
    }

    function setComparePosition(percent) {
        comparePos = Math.max(0, Math.min(100, percent));
        if (modalStack) {
            modalStack.style.setProperty('--compare-pos', `${comparePos}%`);
        }
        if (badgeBase) badgeBase.style.opacity = comparePos < 18 ? '0' : '1';
        if (badgeCustom) badgeCustom.style.opacity = comparePos > 82 ? '0' : '1';
    }

    function handleComparePointer(clientX) {
        if (!modalStack) return;
        const rect = modalStack.getBoundingClientRect();
        if (rect.width <= 0) return;
        const rawPercent = ((clientX - rect.left) / rect.width) * 100;
        setComparePosition(rawPercent);
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

        if (currentMode !== 'study' || !isCardZoomed) return;

        if (on) {
            modal.classList.add('toggle-on');
            cardCustom.classList.add('is-zoomed');
            activeZoomedCard = cardCustom;

            if (animated && currentScale < 1.05) {
                cardCustom.classList.remove('slide-in-down');
                void cardCustom.offsetWidth;
                cardCustom.classList.add('slide-in-down');
            } else {
                applyTransform(false);
            }
        } else {
            modal.classList.remove('toggle-on');
            cardCustom.classList.remove('is-zoomed', 'slide-in-down');
            activeZoomedCard = cardBase;
            applyTransform(false);
        }

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

    function openStudySelection() {
        currentMode = 'study';
        isCardZoomed = false;
        activeZoomedCard = null;

        modal.classList.remove('compare-mode', 'zoomed-card', 'zoomed-mode', 'toggle-on');
        modal.classList.add('study-mode');
        endHold();

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

        if (badgeBase) badgeBase.style.opacity = '';
        if (badgeCustom) badgeCustom.style.opacity = '';

        setToggleState(false, false);
        updateButtonLabel();
    }

    function openZoomedCard(card) {
        currentMode = 'study';
        isCardZoomed = true;
        activeZoomedCard = card || cardBase;

        modal.classList.remove('compare-mode');
        modal.classList.add('study-mode', 'zoomed-card', 'zoomed-mode');

        modalCards.forEach(c => {
            c.classList.remove('is-zoomed', 'slide-in-down', 'slide-in-up');
            c.style.removeProperty('transform');
            c.style.transition = '';
        });

        currentScale = 1;
        posX = 0;
        posY = 0;
        setToggleState(card === cardCustom, false);
        updateButtonLabel();
        applyTransform(true);
    }

    function openCompareMode() {
        currentMode = 'compare';
        isCardZoomed = false;
        activeZoomedCard = null;

        modal.classList.remove('study-mode', 'zoomed-card', 'zoomed-mode', 'toggle-on');
        modal.classList.add('compare-mode');
        endHold();

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

        setComparePosition(50);
        setToggleState(false, false);
        updateButtonLabel();
    }

    function toggleMode() {
        if (currentMode === 'study') {
            openCompareMode();
        } else {
            openStudySelection();
        }
    }

    function closeModal() {
        modal.classList.remove('active');
        openStudySelection();
        document.body.classList.remove('modal-open');
    }

    triggerCards.forEach((card, index) => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const fontNumber = index + 1;
            if (imgBase) imgBase.src = `assets/no-cf-${fontNumber}.jpg`;
            if (imgCustom) imgCustom.src = `assets/with-cf-${fontNumber}.jpg`;

            openStudySelection(); 
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

                toggleMode();

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

    let freeSpaceTouchActive = false;
    let freeSpaceTouchStartX = 0;
    let freeSpaceTouchStartY = 0;
    let freeSpaceTouchStartTime = 0;
    let justHandledFreeSpaceTap = false;

    function handleFreeSpaceClose(e) {
        if (!modal.classList.contains('active')) return;
        if (justHandledFreeSpaceTap) return;
        justHandledFreeSpaceTap = true;
        setTimeout(() => { justHandledFreeSpaceTap = false; }, 350);

        if (e && e.cancelable && e.type !== 'click') {
            e.preventDefault();
        }

        if (currentMode === 'study' && isCardZoomed) {
            openStudySelection();
        } else {
            closeModal();
        }
    }

    if (backdrop) {
        backdrop.addEventListener('click', (e) => {
            if (!modal.classList.contains('active')) return;
            handleFreeSpaceClose(e);
        });
    }

    modal.addEventListener('click', (e) => {
        if (!modal.classList.contains('active')) return;
        if (justHandledFreeSpaceTap) return;

        if (touchMoved || e.target.closest('.hold-btn') || e.target.closest('.bell-toggle')) {
            touchMoved = false;
            return;
        }

        if (e.target.closest('.modal-close')) {
            if (currentMode === 'study' && isCardZoomed) {
                openStudySelection();
            } else {
                closeModal();
            }
            return;
        }

        const clickedCard = e.target.closest('.modal-card');

        if (clickedCard) {
            if (currentMode === 'study' && !isCardZoomed) {
                openZoomedCard(clickedCard);
            }
            return;
        }

        handleFreeSpaceClose(e);
    });

    if (modalStack) {
        modalStack.addEventListener('pointerdown', (e) => {
            if (currentMode !== 'compare') return;
            if (e.target.closest('.hold-btn, .modal-close, .bell-toggle')) return;
            isDraggingCompare = true;
            touchMoved = true;
            if (compareSlider) compareSlider.classList.add('is-dragging');
            try {
                modalStack.setPointerCapture(e.pointerId);
            } catch (_) {}
            handleComparePointer(e.clientX);
        });

        modalStack.addEventListener('pointermove', (e) => {
            if (!isDraggingCompare || currentMode !== 'compare') return;
            handleComparePointer(e.clientX);
        });

        const stopPointerDrag = (e) => {
            if (isDraggingCompare) {
                isDraggingCompare = false;
                if (compareSlider) compareSlider.classList.remove('is-dragging');
                try {
                    if (modalStack.hasPointerCapture(e.pointerId)) {
                        modalStack.releasePointerCapture(e.pointerId);
                    }
                } catch (_) {}
                setTimeout(() => { touchMoved = false; }, 100);
            }
        };

        modalStack.addEventListener('pointerup', stopPointerDrag);
        modalStack.addEventListener('pointercancel', stopPointerDrag);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            if (!modal.classList.contains('active')) return;
            e.stopPropagation();
            if (currentMode === 'study' && isCardZoomed) {
                openStudySelection();
            } else {
                closeModal();
            }
        });
    }

    modal.addEventListener('touchstart', (e) => {
        if (!modal.classList.contains('active')) return;
        const isInteractive = Boolean(e.target.closest('.modal-card, .hold-btn, .bell-toggle, .modal-close, .compare-slider'));

        if (!isInteractive && e.touches.length === 1) {
            freeSpaceTouchActive = true;
            freeSpaceTouchStartX = e.touches[0].clientX;
            freeSpaceTouchStartY = e.touches[0].clientY;
            freeSpaceTouchStartTime = Date.now();
        } else {
            freeSpaceTouchActive = false;
        }

        if (currentMode === 'compare') {
            if (e.target.closest('.modal-stack')) {
                isDraggingCompare = true;
                touchMoved = true;
                if (compareSlider) compareSlider.classList.add('is-dragging');
                handleComparePointer(e.touches[0].clientX);
            }
            return;
        }

        if (currentMode !== 'study' || !isCardZoomed) return;

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
            if (cardBase) cardBase.classList.add('touching');
            if (cardCustom) cardCustom.classList.add('touching');
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
                if (cardBase) cardBase.classList.add('touching');
                if (cardCustom) cardCustom.classList.add('touching');
            }
        }
    }, { passive: false });

    modal.addEventListener('touchmove', (e) => {
        if (!modal.classList.contains('active')) return;
        if (freeSpaceTouchActive && e.touches.length === 1) {
            const moveDist = Math.hypot(
                e.touches[0].clientX - freeSpaceTouchStartX,
                e.touches[0].clientY - freeSpaceTouchStartY
            );
            if (moveDist > 10) {
                freeSpaceTouchActive = false;
            }
        }

        if (currentMode === 'compare') {
            if (isDraggingCompare && e.touches.length > 0) {
                e.preventDefault();
                touchMoved = true;
                handleComparePointer(e.touches[0].clientX);
            }
            return;
        }

        if (currentMode !== 'study' || !isCardZoomed) return;

        const refCard = cardBase || cardCustom;
        if (!refCard) return;

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

            const maxPanX = (currentScale - 1) * (refCard.offsetWidth / 2);
            const maxPanY = (currentScale - 1) * (refCard.offsetHeight / 2);
            posX = Math.max(-maxPanX, Math.min(maxPanX, posX));
            posY = Math.max(-maxPanY, Math.min(maxPanY, posY));

            applyTransform(false);
        }
    }, { passive: false });

    modal.addEventListener('touchend', (e) => {
        if (!modal.classList.contains('active')) return;
        if (freeSpaceTouchActive && e.changedTouches.length > 0) {
            const tapDist = Math.hypot(
                e.changedTouches[0].clientX - freeSpaceTouchStartX,
                e.changedTouches[0].clientY - freeSpaceTouchStartY
            );
            const tapDuration = Date.now() - freeSpaceTouchStartTime;
            freeSpaceTouchActive = false;

            if (tapDist < 12 && tapDuration < 450) {
                handleFreeSpaceClose(e);
                return;
            }
        }

        if (currentMode === 'compare') {
            if (isDraggingCompare) {
                isDraggingCompare = false;
                if (compareSlider) compareSlider.classList.remove('is-dragging');
                setTimeout(() => { touchMoved = false; }, 150);
            }
            return;
        }

        if (currentMode !== 'study' || !isCardZoomed) return;

        if (e.touches.length < 2) isPinching = false;
        if (e.touches.length === 0) {
            isPanning = false;
            if (cardBase) cardBase.classList.remove('touching');
            if (cardCustom) cardCustom.classList.remove('touching');

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