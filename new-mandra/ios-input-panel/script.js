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


// scroll progress

(function () {
    const progressbar = document.getElementById('progressbar');
    if (!progressbar) return;

    function updateprog() {
        const scrolltop = window.scrollY || document.documentElement.scrollTop;
        const totalheight = document.documentElement.scrollHeight - window.innerHeight;

        if (totalheight > 0) {
            progressbar.style.width = `${(scrolltop / totalheight) * 100}%`
        }
    }

    window.addEventListener('scroll', updateprog, {passive: true});
    window.addEventListener('resize', updateprog);
    window.addEventListener('load', updateprog);
})();