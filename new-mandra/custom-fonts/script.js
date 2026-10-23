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