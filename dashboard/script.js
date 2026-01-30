// ===================================== 
// Dashboard Script - Navigation & Interactions
// ===================================== 

document.addEventListener('DOMContentLoaded', function() {
    // Initialize hamburger menu
    initHamburgerMenu();
    
    // Initialize page transition
    initPageTransition();
    
    // Set active nav link
    setActiveNavLink();
    
    // Add smooth scrolling behavior
    setupSmoothScrolling();
    
    // Add hover effects to interactive elements
    setupCardInteractions();
});

// ===================================== 
// Hamburger Menu Toggle
// ===================================== 
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!hamburger || !navMenu) return;
    
    // Toggle menu on hamburger click
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('open');
    });
    
    // Close menu when nav link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('open');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-container') && navMenu.classList.contains('open')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('open');
        }
    });
}

// ===================================== 
// Page Transition Effect
// ===================================== 
function initPageTransition() {
    // Create loading overlay if not exists
    if (!document.querySelector('.page-transition-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        overlay.innerHTML = `
            <div class="transition-spinner">
                <div class="spinner-circle"></div>
                <p class="transition-text">Loading...</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    // Fade in page on load
    const overlay = document.querySelector('.page-transition-overlay');
    setTimeout(() => {
        overlay.classList.add('fade-out');
    }, 300);
    
    // Handle navigation links
    document.querySelectorAll('a[href*=".html"]').forEach(link => {
        // Skip anchor links
        if (link.getAttribute('href').includes('#')) return;
        
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Check if it's an internal navigation
            if (href && !href.startsWith('http') && !href.startsWith('//')) {
                e.preventDefault();
                
                // Show transition effect
                overlay.classList.remove('fade-out');
                
                setTimeout(() => {
                    window.location.href = href;
                }, 400);
            }
        });
    });
}

// ===================================== 
// Set Active Navigation Link
// ===================================== 
function setActiveNavLink() {
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Remove active class from all links
        link.classList.remove('active');
        
        // Check for dashboard
        if ((currentPage.includes('index.html') || currentPage.endsWith('/')) && 
            (href.includes('index.html') || href === '.' || href === './')) {
            link.classList.add('active');
        }
        
        // Check for Process
        if (currentPage.includes('Process') && href.includes('Process')) {
            link.classList.add('active');
        }
        
        // Check for RR (Round Robin)
        if (currentPage.includes('RR') && href.includes('RR')) {
            link.classList.add('active');
        }
        
        // Check for Members
        if (currentPage.includes('members') && href.includes('members')) {
            link.classList.add('active');
        }
        
        // Check for dashboard subfolder
        if (currentPage.includes('dashboard') && href === './' || href === './index.html') {
            link.classList.add('active');
        }
    });
}

// ===================================== 
// Smooth Scrolling
// ===================================== 
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// ===================================== 
// Card Interaction Effects
// ===================================== 
function setupCardInteractions() {
    const appCards = document.querySelectorAll('.app-card');
    const infoCards = document.querySelectorAll('.info-card');
    const sitemapNodes = document.querySelectorAll('.sitemap-node');
    const statCards = document.querySelectorAll('.stat-card');
    
    // Add keyboard accessibility
    addKeyboardAccessibility([
        ...appCards,
        ...infoCards,
        ...sitemapNodes,
        ...statCards
    ]);
    
    // Add focus states
    [...appCards, ...infoCards, ...sitemapNodes].forEach(card => {
        card.addEventListener('focus', function() {
            this.style.outline = '2px solid #0e3061';
            this.style.outlineOffset = '2px';
        });
        
        card.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
}

// ===================================== 
// Keyboard Accessibility
// ===================================== 
function addKeyboardAccessibility(elements) {
    elements.forEach(element => {
        if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }
        
        // Make sitemap-node links keyboard accessible (now <a> tags)
        if (element.classList.contains('sitemap-node') && element.tagName === 'A') {
            element.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.location.href = this.href;
                }
            });
        }
    });
}

// ===================================== 
// Scroll Animation (Optional - adds scroll effect)
// ===================================== 
function observeElementsOnScroll() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.6s ease-out';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all cards
    document.querySelectorAll('.app-card, .info-card, .stat-card').forEach(card => {
        observer.observe(card);
    });
}

// Add scroll animation if document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeElementsOnScroll);
} else {
    observeElementsOnScroll();
}

// ===================================== 
// Mobile Menu Toggle (if hamburger menu is added)
// ===================================== 
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('show');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('show');
            });
        });
    }
}

setupMobileMenu();

console.log('Dashboard script loaded successfully');
