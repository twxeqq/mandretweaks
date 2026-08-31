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
        });
        closebtn.addEventListener('click', function(){
            openbtn.classList.remove('hidden');
            closebtn.classList.remove('visible');
            menu.classList.remove('visible')
        });
    }

});