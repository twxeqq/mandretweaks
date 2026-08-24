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
