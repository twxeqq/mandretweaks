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


// линза
(function cardlens() {
    const cards = document.querySelectorAll('.img-card');
    if (!cards.length) return;

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;


            const x = (mouseX / rect.width) * 100;
            const y = (mouseY / rect.height) * 100;


            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const maxdist = Math.hypot(centerX, centerY);
            const currentdist = Math.hypot(mouseX - centerX, mouseY - centerY);

            const factor = Math.max(0, 1 - (currentdist / maxdist)) 

            const minR = 45;
            const maxR = 100;
            const radius = minR + (maxR - minR) * factor;

            card.style.setProperty('--x', `${x.toFixed(1)}%`);
            card.style.setProperty('--y', `${y.toFixed(1)}%`);
            card.style.setProperty('--r', `${radius.toFixed(1)}px`);
        });
    });

})();