// Tabbed Navigation System
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

function showSection(targetId) {
    // Hide all sections and remove active styling
    sections.forEach(sec => {
        sec.style.display = 'none';
        sec.classList.remove('active');
    });
    
    // Remove active class from all links
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Highlight current link
    const activeLink = document.querySelector(`.nav-link[href="${targetId}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Show the targeted section
    const targetSection = document.querySelector(targetId);
    if (targetSection) {
        targetSection.style.display = 'flex';
        targetSection.classList.add('active');
        
        // Special Case: Display Skills section when Education is active
        if (targetId === '#education') {
            const skillsSection = document.querySelector('#skills');
            if (skillsSection) {
                skillsSection.style.display = 'flex';
                skillsSection.classList.add('active');
            }
        }
    }
    
    // Instantly snap to the top of the new tab
    window.scrollTo(0, 0);
}

// Initialize default tab (handles direct URL links or defaults to home)
const initialHash = window.location.hash || '#home';
showSection(initialHash);

// Add click events to navigation links
navLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        showSection(targetId);
    });
});
