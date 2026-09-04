
function updateDecoAnimation() {
    const scrollY = window.scrollY;
    const decocontainer = document.querySelector('.deco-imgs');
    if (!decocontainer) return;

    const rect = decocontainer.getBoundingClientRect();
    const scrollprog = window.innerHeight - rect.top;

    const deco1 = document.querySelector('.deco-1');
    const deco2 = document.querySelector('.deco-2');
    const deco3 = document.querySelector('.deco-3');

    const offset = scrollY * 0.2;

    let opacityprog = scrollprog / 300;

    opacityprogm = Math.min(Math.max(opacityprog, 0), 1);

    if (deco1 && deco2 && deco3) {
        deco1.style.transform = `translateX(${200 - offset}px) rotate(34deg)`
        deco2.style.transform = `translateX(${-170 + offset}px) rotate(-30deg)`
        deco3.style.transform = `translateX(${-150 + offset}px) rotate(-20deg)`

        deco1.style.opacity = opacityprog;
        deco2.style.opacity = opacityprog;
        deco3.style.opacity = opacityprog;
    }

}

window.addEventListener('DOMContentLoaded', updateDecoAnimation);
window.addEventListener('scroll', updateDecoAnimation);


document.getElementById('trigger').addEventListener('click', () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
});

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

