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

// режим рассмотра
(function fontmodal() {
    const modal = document.getElementById('font-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.modal-close');
    const imgBase = modal.querySelector('.img-target-base');
    const imgCustom = modal.querySelector('.img-target-custom');
    const modalCards = modal.querySelectorAll('.modal-card');
    const triggerCards = document.querySelectorAll('.img-card-m');

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

    function applyTransform(animated = false) {
        if (!activeZoomedCard) return;
        if (animated) {
            activeZoomedCard.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        } else {
            activeZoomedCard.style.transition = 'none';
        }
        // принудительно устанавливаем стиль, перебивая любые внешние правила
        activeZoomedCard.style.setProperty(
            'transform',
            `translate(${posX.toFixed(1)}px, ${posY.toFixed(1)}px) scale(${currentScale.toFixed(3)})`,
            'important'
        );
    }

    function openZoom(card) {
        modalCards.forEach(c => c.classList.remove('is-zoomed'));
        card.classList.add('is-zoomed');
        modal.classList.add('zoomed-mode');
        activeZoomedCard = card;
        currentScale = 1;
        posX = 0;
        posY = 0;
        applyTransform(true);
    }

    function resetZoom() {
        modal.classList.remove('zoomed-mode');
        if (activeZoomedCard) {
            activeZoomedCard.classList.remove('touching', 'is-zoomed');
            activeZoomedCard.style.removeProperty('transform');
            activeZoomedCard.style.transition = '';
            activeZoomedCard = null;
        }
        modalCards.forEach(c => {
            c.classList.remove('is-zoomed', 'touching');
            c.style.removeProperty('transform');
            c.style.transition = '';
        });
        currentScale = 1;
        posX = 0;
        posY = 0;
        isPinching = false;
        isPanning = false;
        touchMoved = false;
    }

    function closeModal() {
        modal.classList.remove('active');
        resetZoom();
        document.body.classList.remove('modal-open');
    }

    // открытие модалки из каталога
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

    // одиночные клики: открытие карточки или шаг назад
    modal.addEventListener('click', (e) => {
        if (touchMoved) {
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
        } else {
            closeModal(); 
        }
    });

    // начало касания
    modal.addEventListener('touchstart', (e) => {
        if (!modal.classList.contains('zoomed-mode') || !activeZoomedCard) return;

        // двойной тап для быстрого увеличения / возврата
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

        // запуск приближения двумя пальцами (Pinch)
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
        // перемещение одним пальцем
        else if (e.touches.length === 1) {
            startX = e.touches[0].clientX - posX;
            startY = e.touches[0].clientY - posY;
            if (currentScale > 1.05) {
                isPanning = true;
                activeZoomedCard.classList.add('touching');
            }
        }
    }, { passive: false });

    // движение пальцев
    modal.addEventListener('touchmove', (e) => {
        if (!modal.classList.contains('zoomed-mode') || !activeZoomedCard) return;

        // масштабирование двумя пальцами
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
        } 
        // перемещение увеличенной картинки
        else if (isPanning && e.touches.length === 1 && currentScale > 1.05) {
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

    // отпускание пальцев
    modal.addEventListener('touchend', (e) => {
        if (!modal.classList.contains('zoomed-mode') || !activeZoomedCard) return;

        if (e.touches.length < 2) isPinching = false;
        if (e.touches.length === 0) {
            isPanning = false;
            activeZoomedCard.classList.remove('touching');

            // возврат к 1x при сжатии
            if (currentScale < 1.05) {
                currentScale = 1;
                posX = 0;
                posY = 0;
                applyTransform(true);
            }

            setTimeout(() => {
                touchMoved = false;
            }, 300);
        }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
})();