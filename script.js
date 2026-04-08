// Scroll Navigation Highlighting
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Trigger scroll event on load to highlight correct link
window.dispatchEvent(new Event('scroll'));

// Typing Animation System
const textArray = ["SWE @ Martin Lab", "Former IGN Intern"];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    const typewriterElement = document.getElementById('typewriter');
    if (!typewriterElement) return;

    const currentText = textArray[textIndex];

    if (isDeleting) {
        typewriterElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typewriterElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeed = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === currentText.length) {
        typeSpeed = 2500; // Pause after typing fully
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % textArray.length;
        typeSpeed = 500; // Pause before typing the next word
    }

    setTimeout(type, typeSpeed);
}

// Start typing animation
if (textArray.length) setTimeout(type, 500);

// Sidebar Interaction
const navbar = document.querySelector('.navbar');
if (navbar) {
    // Use a try-catch block in case CSS variables are not supported or defined
    let sidebarWidth = 250; // Fallback width
    try {
        // Read the width from the CSS variable for consistency
        sidebarWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width'), 10);
    } catch (e) {
        console.error("Could not read --sidebar-width CSS variable.", e);
    }
    const triggerArea = 30; // px from left edge to trigger the sidebar

    document.addEventListener('mousemove', (e) => {
        if (e.clientX <= triggerArea || (e.clientX <= sidebarWidth && navbar.classList.contains('visible'))) {
            navbar.classList.add('visible');
        } else {
            navbar.classList.remove('visible');
        }
    });
}
