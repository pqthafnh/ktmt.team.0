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

    // Start JS particle pool for continuous blossoms (adaptive size for mobile)
    const initialPoolSize = window.innerWidth <= 768 ? 24 : 36;
    startParticlePool(initialPoolSize);
    
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

// Populate empty SVG blossom elements with petal markup
function populateBlossoms() {
    const blossomSvgs = document.querySelectorAll('.blossom-svg');
    if (!blossomSvgs || blossomSvgs.length === 0) return;

    const template = `
        <g>
            <ellipse class="petal" cx="0" cy="-6" rx="6" ry="10" transform="rotate(0)" />
            <ellipse class="petal--accent" cx="0" cy="-6" rx="6" ry="10" transform="rotate(72)" />
            <ellipse class="petal" cx="0" cy="-6" rx="6" ry="10" transform="rotate(144)" />
            <ellipse class="petal--accent" cx="0" cy="-6" rx="6" ry="10" transform="rotate(216)" />
            <ellipse class="petal" cx="0" cy="-6" rx="6" ry="10" transform="rotate(288)" />
            <circle class="center" cx="0" cy="0" r="2" />
        </g>
    `;

    blossomSvgs.forEach(svg => {
        // only populate if empty
        if (svg.children.length === 0) {
            svg.innerHTML = template;
        }
    });
}

/* ===============================
   JS Particle Pool for continuous blossoms
   - Creates a fixed pool of SVG nodes
   - Updates positions via requestAnimationFrame
   - Recycles nodes when they pass the bottom
 =============================== */
let _blossomPool = [];
let _poolSize = 36;
let _poolAnimId = null;
let _lastTs = 0;
let _overlayEl = null;

function startParticlePool(size = 36) {
    _poolSize = size;
    _overlayEl = document.querySelector('.page-transition-overlay');
    if (!_overlayEl) return;

    // remove any existing static SVG blossoms to avoid duplicates
    document.querySelectorAll('.blossom-svg').forEach(el => el.remove());

    _blossomPool = [];
    for (let i = 0; i < _poolSize; i++) {
        const b = createJSBlossom();
        _overlayEl.appendChild(b.el);
        _blossomPool.push(b);
        respawnBlossom(b, true);
    }

    _lastTs = performance.now();
    if (_poolAnimId) cancelAnimationFrame(_poolAnimId);
    _poolAnimId = requestAnimationFrame(_updatePool);

    // rebuild pool when crossing mobile breakpoint
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const targetSize = window.innerWidth <= 768 ? 24 : 36;
            if (targetSize !== _poolSize) {
                stopParticlePool();
                startParticlePool(targetSize);
            }
        }, 250);
    });
}

function stopParticlePool() {
    if (_poolAnimId) {
        cancelAnimationFrame(_poolAnimId);
        _poolAnimId = null;
    }
    // remove blossom elements
    if (_blossomPool && _blossomPool.length) {
        _blossomPool.forEach(b => {
            try { b.el.remove(); } catch (e) {}
        });
    }
    _blossomPool = [];
}

function createJSBlossom() {
    const ns = 'http://www.w3.org/2000/svg';
    const el = document.createElementNS(ns, 'svg');
    el.setAttribute('viewBox', '-12 -12 24 24');
    el.classList.add('blossom-svg', 'js-blossom');
    el.style.position = 'absolute';
    el.style.left = '0px';
    el.style.top = '0px';
    el.style.pointerEvents = 'none';
    // inner markup
    el.innerHTML = `
        <g>
            <ellipse class="petal" cx="0" cy="-6" rx="6" ry="10" transform="rotate(0)" />
            <ellipse class="petal--accent" cx="0" cy="-6" rx="6" ry="10" transform="rotate(72)" />
            <ellipse class="petal" cx="0" cy="-6" rx="6" ry="10" transform="rotate(144)" />
            <ellipse class="petal--accent" cx="0" cy="-6" rx="6" ry="10" transform="rotate(216)" />
            <ellipse class="petal" cx="0" cy="-6" rx="6" ry="10" transform="rotate(288)" />
            <circle class="center" cx="0" cy="0" r="2" />
        </g>
    `;

    return {
        el,
        x: 0,
        y: 0,
        size: 40,
        speed: 60,
        drift: 40,
        rot: 0,
        rotSpeed: 0,
        life: 0
    };
}

function respawnBlossom(b, initial = false) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw <= 768;
    if (isMobile) {
        // smaller and sparser on mobile
        b.size = Math.round(10 + Math.random() * 20); // 10-30px
        b.drift = (Math.random() * 80 - 40); // -40..40 px total drift
        b.speed = 20 + Math.random() * 60; // px/s (slower)
        // keep blossoms away from extreme edges on mobile
        b.x = Math.random() * (vw * 0.9) + (vw * 0.05);
    } else {
        b.size = Math.round(18 + Math.random() * 54); // 18-72px
        b.drift = (Math.random() * 160 - 80); // -80..80 px total drift
        b.speed = 30 + Math.random() * 120; // px/s
        b.x = Math.random() * vw;
    }
    // if initial, spread blossoms through the viewport for mid-fall appearance
    b.y = initial ? (Math.random() * vh) - (Math.random() * (isMobile ? vh * 0.6 : vh)) : - (10 + Math.random() * 120);
    b.rot = (Math.random() * 60 - 30);
    b.rotSpeed = (Math.random() * 40 - 20);
    b.life = 0;
    b.el.style.width = b.size + 'px';
    b.el.style.opacity = '1';
    b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.rot}deg)`;
}

function _updatePool(ts) {
    const dt = Math.min(0.05, (ts - _lastTs) / 1000);
    _lastTs = ts;
    const vh = window.innerHeight;

    for (let i = 0; i < _blossomPool.length; i++) {
        const b = _blossomPool[i];
        b.life += dt;
        // vertical movement
        b.y += b.speed * dt;
        // horizontal gentle drift using sine for natural motion
        b.x += Math.sin((b.life * 0.6) + i) * (b.drift * 0.02);
        b.rot += b.rotSpeed * dt;

        // fade out near bottom
        const fadeStart = vh * 0.75;
        let opacity = 1;
        if (b.y > fadeStart) {
            opacity = Math.max(0, 1 - ((b.y - fadeStart) / (vh - fadeStart)));
        }

        b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.rot}deg)`;
        b.el.style.opacity = opacity;

        // recycle
        if (b.y > vh + 80 || b.x < -200 || b.x > window.innerWidth + 200) {
            respawnBlossom(b, false);
        }
    }

    _poolAnimId = requestAnimationFrame(_updatePool);
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
    
    // Detect if mobile for longer transition timing
    const isMobile = window.innerWidth <= 768;
    const fadeDelay = isMobile ? 800 : 600;
    const navDelay = isMobile ? 800 : 600;
    
    // Fade out page on load (let user see page load with smooth fade)
    const overlay = document.querySelector('.page-transition-overlay');
    setTimeout(() => {
        overlay.classList.add('fade-out');
    }, fadeDelay);

    // When overlay finishes transitioning, show/hide content accordingly
    overlay.addEventListener('transitionend', (e) => {
        if (e.propertyName !== 'opacity') return;
        if (overlay.classList.contains('fade-out')) {
            // overlay hidden -> reveal content
            showContent();
        } else {
            // overlay visible -> hide content
            hideContent();
        }
    });
    
    // Handle navigation links
    document.querySelectorAll('a[href*=".html"]').forEach(link => {
        // Skip anchor links
        if (link.getAttribute('href').includes('#')) return;
        
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Check if it's an internal navigation
            if (href && !href.startsWith('http') && !href.startsWith('//')) {
                e.preventDefault();
                // Show transition overlay instantly to avoid a visible jank
                showOverlayInstantly(overlay);

                // Wait navDelay then navigate
                setTimeout(() => {
                    window.location.href = href;
                }, navDelay);
            }
        });
    });
}

// Show overlay instantly without running its opacity transition
function showOverlayInstantly(overlay) {
    if (!overlay) return;
    // ensure compositor usage
    overlay.style.willChange = 'opacity';
    // temporarily disable transition
    const prev = overlay.style.transition;
    overlay.style.transition = 'none';
    // make visible immediately
    overlay.classList.remove('fade-out');
    overlay.style.opacity = '1';
    // force a paint so the browser applies the change
    // eslint-disable-next-line no-unused-expressions
    overlay.offsetHeight;
    // restore transition after a frame so later fade-outs still animate
    requestAnimationFrame(() => {
        overlay.style.transition = prev || 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        // keep will-change but let browser decide when to drop it
    });
    // hide page content immediately for smoother experience
    hideContent();
}

function hideContent() {
    const content = document.querySelector('.content-wrapper, main');
    if (content) content.classList.add('content-hidden');
}

function showContent() {
    const content = document.querySelector('.content-wrapper, main');
    if (content) content.classList.remove('content-hidden');
}

// ===================================== 
// Set Active Navigation Link
// ===================================== 
function setActiveNavLink() {
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.remove('active');
        
        // Normalize paths for comparison
        const normalizedCurrent = currentPage.toLowerCase();
        const normalizedHref = href.toLowerCase();
        
        // Match dashboard/index
        if ((normalizedCurrent.includes('index.html') || normalizedCurrent.endsWith('/') || !normalizedCurrent.includes('.html')) && 
            (normalizedHref.includes('index.html') || normalizedHref === '.' || normalizedHref === './' || normalizedHref === '../index.html')) {
            link.classList.add('active');
        }
        // Match Process
        else if (normalizedCurrent.includes('process') && normalizedHref.includes('process')) {
            link.classList.add('active');
        }
        // Match Round Robin / RR
        else if (normalizedCurrent.includes('roundrobin') && normalizedHref.includes('roundrobin')) {
            link.classList.add('active');
        }
        // Match Members
        else if (normalizedCurrent.includes('member') && normalizedHref.includes('member')) {
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
