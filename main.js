// Main JavaScript - Orchestrates all functionality
class LosPrimasosWebsite {
    constructor() {
        this.isLoaded = false;
        this.isMobile = window.innerWidth <= 768;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeComponents();
        this.handleLoading();
    }
    
    setupEventListeners() {
        window.addEventListener('load', () => this.handlePageLoad());
        window.addEventListener('resize', () => this.handleResize());
        
        // Navigation
        this.setupNavigation();
        
        // Cursor (desktop only)
        if (!this.isMobile) {
            this.initCursor();
        }
        
        // Magnetic buttons
        this.initMagneticButtons();
        
        // Floating elements
        this.initFloatingElements();
    }
    
    initializeComponents() {
        // Initialize Three.js scene
        if (window.ThreeScene) {
            this.threeScene = new ThreeScene();
        }
        
        // Initialize GSAP animations
        if (window.GSAPAnimations) {
            this.animations = new GSAPAnimations();
        }
    }
    
    handleLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        const loadingProgress = document.querySelector('.loading-progress');
        const loadingLogo = document.querySelector('.loading-logo');
        
        // Animate loading logo
        gsap.to(loadingLogo, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out"
        });
        
        // Simulate loading progress
        gsap.to(loadingProgress, {
            width: '100%',
            duration: 2,
            ease: "power2.out",
            onComplete: () => {
                setTimeout(() => {
                    this.hideLoadingScreen();
                }, 500);
            }
        });
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        
        gsap.to(loadingScreen, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            onComplete: () => {
                loadingScreen.style.display = 'none';
                this.handlePageLoad();
            }
        });
    }
    
    handlePageLoad() {
        if (this.isLoaded) return;
        this.isLoaded = true;
        
        // Show navigation
        gsap.to('#nav', {
            y: 0,
            duration: 1,
            ease: "power2.out",
            delay: 0.5
        });
        
        // Start animations
        if (this.animations) {
            this.animations.initScrollAnimations();
        }
        
        // Initialize Three.js scene
        if (this.threeScene) {
            this.threeScene.init();
        }
        
        // Enable smooth scrolling
        this.initSmoothScroll();
    }
    
    handleResize() {
        this.isMobile = window.innerWidth <= 768;
        
        if (this.threeScene) {
            this.threeScene.handleResize();
        }
    }
    
    setupNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navLinks = document.querySelectorAll('.nav-link');
        
        // Mobile navigation toggle
        navToggle?.addEventListener('click', () => {
            // Add mobile menu functionality if needed
            console.log('Mobile menu toggle');
        });
        
        // Smooth scroll for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    initCursor() {
        const cursor = document.getElementById('cursor');
        const cursorDot = document.getElementById('cursor-dot');
        
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        let dotX = 0, dotY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        // Smooth cursor animation
        const animateCursor = () => {
            // Main cursor with delay
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            
            // Dot cursor with faster follow
            dotX += (mouseX - dotX) * 0.8;
            dotY += (mouseY - dotY) * 0.8;
            
            cursor.style.transform = `translate(${cursorX - 20}px, ${cursorY - 20}px)`;
            cursorDot.style.transform = `translate(${dotX - 2}px, ${dotY - 2}px)`;
            
            requestAnimationFrame(animateCursor);
        };
        
        animateCursor();
        
        // Cursor hover effects
        const hoverElements = document.querySelectorAll('a, button, .service-card, .contact-item');
        
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.style.transform += ' scale(1.5)';
                cursor.style.borderColor = '#667eea';
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.style.transform = cursor.style.transform.replace(' scale(1.5)', '');
                cursor.style.borderColor = '#333';
            });
        });
    }
    
    initMagneticButtons() {
        if (this.isMobile) return;
        
        const magneticElements = document.querySelectorAll('.magnetic-btn');
        
        magneticElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(element, {
                    x: x * 0.3,
                    y: y * 0.3,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
            
            element.addEventListener('mouseleave', () => {
                gsap.to(element, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: "power2.out"
                });
            });
        });
    }
    
    initFloatingElements() {
        if (this.isMobile) return;
        
        const floatingElements = document.querySelectorAll('.floating-element');
        
        document.addEventListener('mousemove', (e) => {
            const mouseX = (e.clientX / window.innerWidth) - 0.5;
            const mouseY = (e.clientY / window.innerHeight) - 0.5;
            
            floatingElements.forEach((element, index) => {
                const speed = parseFloat(element.dataset.speed) || 0.5;
                const x = mouseX * 50 * speed;
                const y = mouseY * 50 * speed;
                
                gsap.to(element, {
                    x: x,
                    y: y,
                    duration: 1,
                    ease: "power2.out"
                });
            });
        });
    }
    
    initSmoothScroll() {
        // Simple smooth scrolling implementation
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80; // Account for fixed nav
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Update navigation active state on scroll
        this.updateNavOnScroll();
    }
    
    updateNavOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY + 100;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        });
    }
}

// Performance optimization
const optimizePerformance = () => {
    // Add will-change property to animated elements
    const animatedElements = document.querySelectorAll('.floating-element, .magnetic-btn, .hero-title-line');
    animatedElements.forEach(element => {
        element.classList.add('will-change-transform', 'gpu-accelerated');
    });
    
    // Lazy load images if any
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Reduce motion for users who prefer it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.01s');
    }
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    optimizePerformance();
    new LosPrimasosWebsite();
});

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when tab is not visible
        gsap.globalTimeline.pause();
    } else {
        // Resume animations when tab becomes visible
        gsap.globalTimeline.resume();
    }
});