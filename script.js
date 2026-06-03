document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const navAnchors = navLinks ? Array.from(navLinks.querySelectorAll('a')) : [];
    const revealElements = Array.from(document.querySelectorAll('.reveal'));
    const typewriterElement = document.getElementById('typewriter');
    const typewriterStrings = [
        'Machine Learning Engineer Intern at Lawrence Berkeley National Laboratory',
        'Former SWE Intern at Imagine Games Network'
    ];

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });

        navAnchors.forEach((anchor) => {
            anchor.addEventListener('click', () => {
                navLinks.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach((element) => observer.observe(element));

    if (typewriterElement && typewriterStrings.length) {
        let stringIndex = 0;
        let characterIndex = typewriterStrings[0].length;
        let isDeleting = true;

        typewriterElement.textContent = typewriterStrings[0];

        const typeSpeed = () => (isDeleting ? 38 : 65);

        const loop = () => {
            const currentString = typewriterStrings[stringIndex];

            if (isDeleting) {
                characterIndex -= 1;
                typewriterElement.textContent = currentString.slice(0, characterIndex);
            } else {
                characterIndex += 1;
                typewriterElement.textContent = currentString.slice(0, characterIndex);
            }

            let delay = typeSpeed();

            if (!isDeleting && characterIndex === currentString.length) {
                delay = 1600;
                isDeleting = true;
            } else if (isDeleting && characterIndex === 0) {
                isDeleting = false;
                stringIndex = (stringIndex + 1) % typewriterStrings.length;
                delay = 350;
            }

            window.setTimeout(loop, delay);
        };

        window.setTimeout(loop, 1400);
    }
});
