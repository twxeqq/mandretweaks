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