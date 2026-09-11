document.addEventListener('DOMContentLoaded', function() {
    const imgs = document.querySelectorAll('.hleft, .hright')
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, {threshold: 0.5,
        rootMargin:  '0px 0px -20px 0px'
    });
    imgs.forEach(img => observer.observe(img))
});

// mobile menu

document.addEventListener('DOMContentLoaded', function(){
    const openbtn = document.querySelector('.openbtn');
    const closebtn = document.querySelector('.closebtn');
    const menu = document.querySelector('.menu');
    if ( openbtn && closebtn ) {
        openbtn.addEventListener('click', function() {
            openbtn.classList.add('hidden');
            closebtn.classList.add('visible');
            menu.classList.add('visible');
            document.body.style.overflow = 'hidden';
        });
        closebtn.addEventListener('click', function(){
            openbtn.classList.remove('hidden');
            closebtn.classList.remove('visible');
            menu.classList.remove('visible')
            document.body.style.overflow = ''
        });
    }

});

// scroll

function onscroll() {
    const scrolltop = window.scrollY || document.documentElement.scrollTop;

    const progressbar = document.getElementById('progressbar');
    const totalheight = document.documentElement.scrollHeight - window.innerHeight;
    
    if (progressbar && totalheight > 0) {
        const progress = (scrolltop / totalheight) * 100;
        progressbar.style.width = `${progress}%`;
    }

    const section = document.querySelector('.scroll-selection');
    const carousel = document.querySelector('.carousel');

    if (section && carousel) {
        const rect = section.getBoundingClientRect();
        const totalscrolldis = section.offsetHeight - window.innerHeight;
        
        const scrolledin = -rect.top;

        const progress = Math.min(Math.max(scrolledin / totalscrolldis, 0), 1);
        
        const maxscroll = carousel.scrollWidth - carousel.clientWidth;
        
        carousel.scrollLeft = progress * maxscroll;
    }
}

window.addEventListener('scroll', onscroll);