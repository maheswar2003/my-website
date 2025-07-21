// Enhanced Portfolio Website Script with Advanced Features
// Version 2.0.0 - Optimized for Performance and Modern UX

'use strict';

// IMMEDIATE NAVIGATION FIX - Ensure buttons work right away
document.addEventListener('DOMContentLoaded', () => {
    // Add navigation handlers that work immediately
    const setupNavigation = () => {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        
        navLinks.forEach((link, index) => {
            // Remove any existing handlers
            const oldHandler = link._immediateNavHandler;
            if (oldHandler) {
                link.removeEventListener('click', oldHandler);
            }
            
            // Add new handler
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const targetId = link.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    const header = document.querySelector('.header');
                    const headerHeight = header ? header.offsetHeight : 80;
                    const targetPosition = target.getBoundingClientRect().top + 
                                         window.pageYOffset - headerHeight - 20;
                    
                    // Use smooth scrolling
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                } else {
                    // Navigation target not found - silently handle
                }
            };
            
            link._immediateNavHandler = handler;
            link.addEventListener('click', handler);
        });
    };
    
    // Set up navigation immediately
    setupNavigation();
    
    // Set up again after a short delay in case DOM changes
    setTimeout(setupNavigation, 100);
    setTimeout(setupNavigation, 500);
});

// Performance optimization: Use requestIdleCallback for non-critical tasks
const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));

// Utility functions
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
};

const debounce = (func, wait, immediate) => {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

// Enhanced DOM utilities with caching
const DOMCache = new Map();
const $ = selector => {
    if (!DOMCache.has(selector)) {
        DOMCache.set(selector, document.querySelector(selector));
    }
    return DOMCache.get(selector);
};
const $$ = selector => document.querySelectorAll(selector);

// Loading Screen Manager
class LoadingScreen {
    constructor() {
        this.screen = $('#loading-screen');
        this.hasLoaded = false;
    }

    hide() {
        if (this.hasLoaded) return;
        this.hasLoaded = true;
        
        // Ensure all critical resources are loaded
        Promise.all([
            document.fonts.ready,
            new Promise(resolve => {
                if (document.readyState === 'complete') resolve();
                else window.addEventListener('load', resolve);
            })
        ]).then(() => {
            this.screen?.classList.add('fade-out');
            document.body.classList.add('loaded');
            
            // Remove loading screen from DOM after animation
            setTimeout(() => {
                this.screen?.remove();
                DOMCache.delete('#loading-screen');
            }, 500);
        });
    }
}



// Particle Effects Manager
class ParticleEffects {
    constructor() {
        this.container = $('#hero-particles');
        if (this.container && window.particlesJS) {
            this.init();
        }
    }

    init() {
        particlesJS('hero-particles', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#ffffff'
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    }
                },
                opacity: {
                    value: 0.5,
                    random: false,
                    anim: {
                        enable: false,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 40,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#ffffff',
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        });
    }
}

// GSAP Animations Manager
class GSAPAnimations {
    constructor() {
        this.timeline = null;
        this.scrollTriggers = [];
        
        if (window.gsap && window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
            this.init();
        }
    }

    init() {
        // Set default ease
        gsap.defaults({ ease: 'power3.out' });
        
        // Initialize animations
        this.heroAnimation();
        this.scrollAnimations();
        this.parallaxEffects();
        this.textAnimations();
    }

    heroAnimation() {
        const tl = gsap.timeline({ delay: 0.2 });
        
        tl.from('.hero-title', {
            y: 30,
            duration: 0.8,
            clearProps: 'all'
        })
        .from('.hero-subtitle', {
            y: 20,
            duration: 0.6
        }, '-=0.4')
        .from('.hero-buttons .btn', {
            y: 15,
            duration: 0.5,
            stagger: 0.15
        }, '-=0.3')
        .from('.hero-image', {
            scale: 0.92,
            duration: 0.7,
            ease: 'back.out(1.4)'
        }, '-=0.6');
    }

    scrollAnimations() {
        // Ensure elements are visible first
        const sections = $$('.about, .projects, .contact');
        const projectCards = $$('.project-card');
        const skillTags = $$('.skill-tag');
        
        // Set initial visibility
        [...sections, ...projectCards, ...skillTags].forEach(el => {
            el.style.opacity = '1';
            el.style.visibility = 'visible';
        });
        
        // Animate sections on scroll
        sections.forEach((section, index) => {
            gsap.from(section, {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none none'
                },
                y: 60,
                opacity: 0,
                duration: 1,
                delay: index * 0.1
            });
        });

        // Animate project cards
        if (projectCards.length > 0) {
            gsap.from('.project-card', {
                scrollTrigger: {
                    trigger: '.projects-grid',
                    start: 'top 70%'
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: {
                    amount: 0.6,
                    from: 'start'
                }
            });
        }

        // Animate skill tags - disabled to prevent visibility issues
        // if (skillTags.length > 0) {
        //     gsap.from('.skill-tag', {
        //         scrollTrigger: {
        //             trigger: '.skills',
        //             start: 'top 80%'
        //         },
        //         scale: 0,
        //         opacity: 0,
        //         duration: 0.5,
        //         stagger: {
        //             amount: 0.8,
        //             from: 'random'
        //         },
        //         ease: 'back.out(1.7)'
        //     });
        // }
    }

    parallaxEffects() {
        // Hero parallax
        gsap.to('.hero-circle', {
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            },
            y: -100,
            scale: 1.2,
            opacity: 0.3
        });

        // Background parallax for sections
        const parallaxSections = $$('.about, .contact');
        parallaxSections.forEach(section => {
            gsap.to(section, {
                scrollTrigger: {
                    trigger: section,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                },
                backgroundPosition: '50% 100px',
                ease: 'none'
            });
        });
    }

    textAnimations() {
        // Split text animations for headings
        const headings = $$('.section-title');
        headings.forEach(heading => {
            const letters = heading.textContent.split('').map(letter => 
                `<span class="letter">${letter === ' ' ? '&nbsp;' : letter}</span>`
            ).join('');
            
            heading.innerHTML = letters;
            
            gsap.from(heading.querySelectorAll('.letter'), {
                scrollTrigger: {
                    trigger: heading,
                    start: 'top 80%'
                },
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.03,
                ease: 'power2.out'
            });
        });
    }
}

// Enhanced Theme Manager with Smooth Transitions
class ThemeManager {
    constructor() {
        this.theme = this.getTheme();
        this.transitions = true;
        this.init();
    }

    getTheme() {
        return localStorage.getItem('theme') || 
               (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }

    setTheme(theme) {
        this.theme = theme;
        
        // Add transition class
        if (this.transitions) {
            document.documentElement.classList.add('theme-transition');
        }
        
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateThemeIcon();
        
        // Remove transition class after animation
        if (this.transitions) {
            setTimeout(() => {
                document.documentElement.classList.remove('theme-transition');
            }, 300);
        }
    }

    toggleTheme() {
        this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
    }

    updateThemeIcon() {
        const icon = $('.theme-toggle i');
        if (icon) {
            icon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    init() {
        // Disable transitions on initial load
        this.transitions = false;
        this.setTheme(this.theme);
        this.transitions = true;
        
        // Add theme toggle button with animation
        const nav = $('.nav-container');
        if (nav && !$('.theme-toggle')) {
            const themeToggle = document.createElement('button');
            themeToggle.className = 'theme-toggle';
            themeToggle.setAttribute('aria-label', 'Toggle dark mode');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggle.addEventListener('click', () => {
                // Add rotation animation
                themeToggle.style.transform = 'rotate(360deg)';
                setTimeout(() => {
                    themeToggle.style.transform = '';
                }, 300);
                this.toggleTheme();
            });
            nav.appendChild(themeToggle);
            this.updateThemeIcon();
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

// Enhanced Navigation with Smooth Scrolling
class NavigationManager {
    constructor() {
        this.navToggle = $('#nav-toggle');
        this.navMenu = $('#nav-menu');
        this.navLinks = $$('.nav-link');
        this.header = $('.header');
        this.isMenuOpen = false;
        this.activeSection = null;
        this.init();
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.navMenu?.classList.toggle('active');
        this.navToggle?.classList.toggle('active');
        this.navToggle?.setAttribute('aria-expanded', this.isMenuOpen);
        
        // Animate hamburger with GSAP
        if (window.gsap) {
            const bars = this.navToggle?.querySelectorAll('.bar');
            if (bars) {
                if (this.isMenuOpen) {
                    gsap.to(bars[0], { rotation: -45, y: 6, duration: 0.3 });
                    gsap.to(bars[1], { opacity: 0, duration: 0.2 });
                    gsap.to(bars[2], { rotation: 45, y: -6, duration: 0.3 });
                } else {
                    gsap.to(bars, { rotation: 0, y: 0, opacity: 1, duration: 0.3 });
                }
            }
        }
        
        // Manage body scroll
        document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }

    closeMenu() {
        if (this.isMenuOpen) {
            this.toggleMenu();
        }
    }

    updateActiveLink() {
        const sections = $$('section[id]');
        const scrollY = window.pageYOffset;
        const headerHeight = this.header?.offsetHeight || 0;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollY >= sectionTop && scrollY < sectionBottom) {
                const id = section.getAttribute('id');
                if (this.activeSection !== id) {
                    this.activeSection = id;
                    
                    this.navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            }
        });
    }

    init() {
        // Toggle menu
        this.navToggle?.addEventListener('click', () => this.toggleMenu());

        // Close menu when clicking on links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && 
                !this.navMenu?.contains(e.target) && 
                !this.navToggle?.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
            }
        });

        // Smooth scrolling with progress indicator
        this.setupSmoothScrolling();

        // Update active navigation link on scroll
        window.addEventListener('scroll', throttle(() => this.updateActiveLink(), 100));
    }

    setupSmoothScrolling() {
        $$('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = $(targetId);
                
                if (target) {
                    const headerHeight = this.header?.offsetHeight || 80;
                    const targetPosition = target.getBoundingClientRect().top + 
                                         window.pageYOffset - headerHeight - 20;
                    
                    // Use GSAP ScrollTo if available and loaded
                    if (window.gsap && window.gsap.plugins && window.gsap.plugins.ScrollToPlugin) {
                        gsap.to(window, {
                            scrollTo: targetPosition,
                            duration: 1,
                            ease: 'power3.inOut'
                        });
                    } else if (window.gsap) {
                        // Fallback with basic GSAP animation
                        const startPos = window.pageYOffset;
                        const distance = targetPosition - startPos;
                        
                        gsap.to({}, {
                            duration: 1,
                            ease: 'power3.inOut',
                            onUpdate: function() {
                                const progress = this.progress();
                                window.scrollTo(0, startPos + (distance * progress));
                            }
                        });
                    } else {
                        // Native smooth scrolling fallback
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
}

// Enhanced Header Effects
class HeaderManager {
    constructor() {
        this.header = $('.header');
        this.lastScrollY = window.scrollY;
        this.ticking = false;
        this.scrollDirection = null;
        this.init();
    }

    updateHeader() {
        const currentScrollY = window.scrollY;
        
        if (!this.header) return;

        // Determine scroll direction
        this.scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';

        // Background and shadow effects
        if (currentScrollY > 100) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }

        // Hide/show header on scroll with smooth transition
        if (Math.abs(currentScrollY - this.lastScrollY) > 5) {
            if (currentScrollY > this.lastScrollY && currentScrollY > 200) {
                this.header.style.transform = 'translateY(-100%)';
            } else {
                this.header.style.transform = 'translateY(0)';
            }
            this.lastScrollY = currentScrollY;
        }

        this.ticking = false;
    }

    requestTick() {
        if (!this.ticking) {
            requestAnimationFrame(() => this.updateHeader());
            this.ticking = true;
        }
    }

    init() {
        // Add header styles
        const style = document.createElement('style');
        style.textContent = `
            .header {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .header.scrolled {
                box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
            }
            
            [data-theme="dark"] .header.scrolled {
                box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
            }
        `;
        document.head.appendChild(style);
        
        window.addEventListener('scroll', throttle(() => this.requestTick(), 16));
    }
}

// Enhanced Contact Form with Better UX
class ContactFormManager {
    constructor() {
        this.form = $('#contact-form');
        this.submitButton = this.form?.querySelector('button[type="submit"]');
        this.btnText = this.submitButton?.querySelector('.btn-text');
        this.btnLoader = this.submitButton?.querySelector('.btn-loader');
        this.isSubmitting = false;
        this.formAnimation = null;
        this.init();
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let message = '';

        switch (fieldName) {
            case 'name':
                if (!value) {
                    isValid = false;
                    message = 'Name is required';
                } else if (value.length < 2) {
                    isValid = false;
                    message = 'Name must be at least 2 characters';
                } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                    isValid = false;
                    message = 'Name should only contain letters';
                }
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) {
                    isValid = false;
                    message = 'Email is required';
                } else if (!emailRegex.test(value)) {
                    isValid = false;
                    message = 'Please enter a valid email address';
                }
                break;
            case 'message':
                if (!value) {
                    isValid = false;
                    message = 'Message is required';
                } else if (value.length < 10) {
                    isValid = false;
                    message = 'Message must be at least 10 characters';
                } else if (value.length > 1000) {
                    isValid = false;
                    message = 'Message must be less than 1000 characters';
                }
                break;
        }

        this.showFieldError(field, isValid ? '' : message);
        return isValid;
    }

    showFieldError(field, message) {
        const errorElement = $(`#${field.name}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = message ? 'block' : 'none';
            
            // Animate error message
            if (message && window.gsap) {
                gsap.from(errorElement, {
                    y: -10,
                    opacity: 0,
                    duration: 0.3
                });
            }
        }
        
        field.classList.toggle('error', !!message);
        field.setAttribute('aria-invalid', !!message);
    }

    validateForm() {
        if (!this.form) return false;

        const fields = this.form.querySelectorAll('input, textarea');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    setLoadingState(loading) {
        if (!this.submitButton) return;

        this.isSubmitting = loading;
        this.submitButton.disabled = loading;
        this.submitButton.classList.toggle('loading', loading);
        
        if (loading) {
            this.btnText.textContent = 'Sending...';
            // Add pulse animation to button
            if (window.gsap) {
                this.formAnimation = gsap.to(this.submitButton, {
                    scale: 1.05,
                    duration: 0.5,
                    repeat: -1,
                    yoyo: true,
                    ease: 'power2.inOut'
                });
            }
        } else {
            this.btnText.textContent = 'Send Message';
            if (this.formAnimation) {
                this.formAnimation.kill();
                gsap.set(this.submitButton, { scale: 1 });
            }
        }
    }

    showSubmissionStatus(success, message) {
        const statusElement = $('#submit-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `submit-status ${success ? 'success' : 'error'}`;
            statusElement.style.display = 'block';
            
            // Animate status message
            if (window.gsap) {
                gsap.from(statusElement, {
                    y: 20,
                    opacity: 0,
                    duration: 0.5
                });
            }
            
            setTimeout(() => {
                if (window.gsap) {
                    gsap.to(statusElement, {
                        opacity: 0,
                        duration: 0.3,
                        onComplete: () => {
                            statusElement.style.display = 'none';
                        }
                    });
                } else {
                    statusElement.style.display = 'none';
                }
            }, 5000);
        }

        // Also show notification
        this.showNotification(message, success ? 'success' : 'error');
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = $('.notification');
        existingNotification?.remove();
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        // Add content
        const content = document.createElement('div');
        content.className = 'notification-content';
        content.textContent = message;
        
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', 'Close notification');
        closeButton.addEventListener('click', () => this.removeNotification(notification));
        
        notification.appendChild(content);
        notification.appendChild(closeButton);
        
        // Style notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease',
            maxWidth: '400px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        });
        
        // Set background based on type
        const backgrounds = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        };
        notification.style.background = backgrounds[type] || backgrounds.info;
        
        // Add to DOM and animate
        document.body.appendChild(notification);
        
        // Animate in with GSAP if available
        if (window.gsap) {
            gsap.to(notification, {
                x: 0,
                duration: 0.5,
                ease: 'back.out(1.2)'
            });
        } else {
            requestAnimationFrame(() => {
                notification.style.transform = 'translateX(0)';
            });
        }
        
        // Auto remove after 5 seconds
        setTimeout(() => this.removeNotification(notification), 5000);
    }

    removeNotification(notification) {
        if (notification && notification.parentNode) {
            if (window.gsap) {
                gsap.to(notification, {
                    x: 400,
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => notification.remove()
                });
            } else {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => notification.remove(), 300);
            }
        }
    }

    init() {
        if (!this.form) return;

        // Add character counter for message field
        const messageField = this.form.querySelector('textarea[name="message"]');
        if (messageField) {
            const counter = document.createElement('div');
            counter.className = 'character-counter';
            counter.textContent = '0 / 1000';
            messageField.parentNode.appendChild(counter);
            
            messageField.addEventListener('input', () => {
                const length = messageField.value.length;
                counter.textContent = `${length} / 1000`;
                counter.style.color = length > 900 ? '#ef4444' : 'var(--text-secondary)';
            });
        }

        // Real-time validation
        const fields = this.form.querySelectorAll('input, textarea');
        fields.forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', debounce(() => {
                if (field.classList.contains('error')) {
                    this.validateField(field);
                }
            }, 300));
        });

        // Remove custom JS form submission logic. Let browser handle submission.
    }
}

// Enhanced Animation Manager with GSAP
class AnimationManager {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }

    createObserver() {
        return new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Add stagger animation for children
                    const children = entry.target.querySelectorAll('.animate-child');
                    if (children.length > 0 && window.gsap) {
                        gsap.from(children, {
                            y: 30,
                            opacity: 0,
                            duration: 0.6,
                            stagger: 0.1,
                            ease: 'power2.out'
                        });
                    }
                    
                    this.observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);
    }

    init() {
        // Check for Intersection Observer support
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            this.fallbackAnimation();
            return;
        }

        this.observer = this.createObserver();
        
        // Observe elements for animation
        const animatedElements = $$('.project-card, .contact-item, .about-text');
        
        animatedElements.forEach(element => {
            element.classList.add('animate-observer');
            this.observer.observe(element);
        });

        // Add hover effects for project cards
        this.addHoverEffects();
    }

    addHoverEffects() {
        const projectCards = $$('.project-card');
        
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', function(e) {
                if (window.gsap) {
                    gsap.to(this, {
                        y: -10,
                        scale: 1.02,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            });
            
            card.addEventListener('mouseleave', function(e) {
                if (window.gsap) {
                    gsap.to(this, {
                        y: 0,
                        scale: 1,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            });
        });
    }

    fallbackAnimation() {
        // Simple scroll-based animation for older browsers
        const animateOnScroll = throttle(() => {
            const elements = $$('.project-card, .skill-tag');
            
            elements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;
                
                if (elementTop < window.innerHeight - elementVisible) {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
            });
        }, 16);

        // Set initial styles
        $$('.project-card, .skill-tag').forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });

        window.addEventListener('scroll', animateOnScroll);
        animateOnScroll(); // Initial check
    }
}

// Typing Effect with Multiple Strings
class TypingEffect {
    constructor(element, strings, options = {}) {
        this.element = element;
        this.strings = Array.isArray(strings) ? strings : [strings];
        this.speed = options.speed || 50;
        this.deleteSpeed = options.deleteSpeed || 30;
        this.delay = options.delay || 500;
        this.loop = options.loop || false;
        this.cursor = options.cursor !== false;
        this.currentString = 0;
        this.init();
    }

    async typeString(text) {
        for (let i = 0; i < text.length; i++) {
            await new Promise(resolve => setTimeout(resolve, this.speed));
            
            if (this.cursor) {
                this.element.innerHTML = text.slice(0, i + 1) + '<span class="typing-cursor">|</span>';
            } else {
                this.element.innerHTML = text.slice(0, i + 1);
            }
        }
    }

    async deleteString(text) {
        for (let i = text.length; i > 0; i--) {
            await new Promise(resolve => setTimeout(resolve, this.deleteSpeed));
            
            if (this.cursor) {
                this.element.innerHTML = text.slice(0, i - 1) + '<span class="typing-cursor">|</span>';
            } else {
                this.element.innerHTML = text.slice(0, i - 1);
            }
        }
    }

    async type() {
        if (!this.element) return;

        for (let i = 0; i < this.strings.length; i++) {
            await this.typeString(this.strings[i]);
            
            // Wait before deleting
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Delete if not the last string or if looping
            if (i < this.strings.length - 1 || this.loop) {
                await this.deleteString(this.strings[i]);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        // Loop if enabled
        if (this.loop) {
            this.type();
        }
    }

    init() {
        setTimeout(() => this.type(), this.delay);
    }
}

// Performance Monitor with Real User Metrics
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    measureWebVitals() {
        // Measure Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.metrics.lcp = lastEntry.startTime;
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                // LCP observer not supported
            }
        }

        // Measure First Input Delay (FID)
        if ('PerformanceObserver' in window) {
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.metrics.fid = entry.processingStart - entry.startTime;
                    }
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                // FID observer not supported
            }
        }

        // Measure Cumulative Layout Shift (CLS)
        if ('PerformanceObserver' in window) {
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                            this.metrics.cls = clsValue;
                        }
                    }
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                // CLS observer not supported
            }
        }
    }

    measureResourceTiming() {
        if ('performance' in window && 'getEntriesByType' in performance) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const resources = performance.getEntriesByType('resource');
                    const navigationTiming = performance.getEntriesByType('navigation')[0];
                    
                    // Calculate metrics
                    this.metrics.totalResources = resources.length;
                    this.metrics.totalSize = resources.reduce((total, resource) => {
                        return total + (resource.transferSize || 0);
                    }, 0);
                    
                    if (navigationTiming) {
                        this.metrics.domContentLoaded = navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart;
                        this.metrics.loadComplete = navigationTiming.loadEventEnd - navigationTiming.loadEventStart;
                    }
                    
                    // Performance metrics collected
                }, 3000);
            });
        }
    }

    init() {
        this.measureWebVitals();
        this.measureResourceTiming();
    }
}

// Initialize Application
class App {
    constructor() {
        this.components = {};
        this.initialized = false;
        this.init();
    }

    async waitForDependencies() {
        // Wait for critical dependencies
        const maxWaitTime = 5000;
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWaitTime) {
            if (window.gsap && window.particlesJS) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Some dependencies did not load in time
        return false;
    }

    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initComponents());
        } else {
            this.initComponents();
        }
    }

    async initComponents() {
        if (this.initialized) return;
        this.initialized = true;

        try {
            // Initialize loading screen first
            this.components.loadingScreen = new LoadingScreen();

            // Initialize core components immediately
            this.components.theme = new ThemeManager();
            this.components.navigation = new NavigationManager();
            this.components.header = new HeaderManager();
            this.components.form = new ContactFormManager();
            this.components.animations = new AnimationManager();
            this.components.performance = new PerformanceMonitor();



            // Wait for dependencies before initializing dependent components
            await this.waitForDependencies();

            // Initialize GSAP animations if available
            if (window.gsap) {
                this.components.gsapAnimations = new GSAPAnimations();
            }

            // Initialize particle effects if available
            if (window.particlesJS) {
                this.components.particles = new ParticleEffects();
            }

            // Show main greeting first, then start tech animations
            const heroTitle = $('.hero-title');
            const heroAnimatedText = $('.hero-animated-text');
            
            if (heroTitle && heroAnimatedText) {
                heroAnimatedText.setAttribute('aria-live', 'polite');
                
                // After 3 seconds, fade out main title and start tech lines
                setTimeout(() => {
                    // Fade out main hero title
                    if (window.gsap) {
                        gsap.to(heroTitle, {
                            opacity: 0,
                            y: -20,
                            duration: 0.8,
                            ease: 'power2.inOut'
                        });
                    } else {
                        heroTitle.style.opacity = '0';
                        heroTitle.style.transform = 'translateY(-20px)';
                    }
                    
                    // Start tech line animations with robotic feel
                    const techStrings = [
                        "> building AI-powered apps_",
                        "> crafting intelligent solutions_", 
                        "> exploring data and code_",
                        "> open for collaborations!_"
                    ];
                    
                    this.components.typing = new TypingEffect(heroAnimatedText, techStrings, {
                        delay: 800,
                        speed: 80,        // Slower, more robotic typing
                        deleteSpeed: 40,  // Faster deletion for tech feel
                        loop: true,
                        cursor: false     // Remove cursor since we have _ in strings
                    });
                }, 3000);
            }

            // Add dynamic styles
            this.addDynamicStyles();

            // Hide loading screen after everything is initialized
            requestIdleCallback(() => {
                this.components.loadingScreen.hide();
            });

        } catch (error) {
            // Error initializing app - fallback to basic functionality
            // Still hide loading screen on error
            this.components.loadingScreen?.hide();
        }
    }

    addDynamicStyles() {
        if ($('#dynamic-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'dynamic-styles';
        styles.textContent = `
            /* Theme transition */
            .theme-transition,
            .theme-transition *,
            .theme-transition *::before,
            .theme-transition *::after {
                transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
            }
            
            /* Loading screen styles */
            body:not(.loaded) {
                overflow: hidden;
            }
            
            /* Particles container */
            #hero-particles {
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                z-index: 0;
                opacity: 0.5;
                pointer-events: none;
            }
            
            /* Enhanced animations */
            .animate-observer {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .animate-observer.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            /* Typing cursor */
            .typing-cursor {
                animation: blink 1s infinite;
                color: inherit;
                font-weight: 300;
            }
            
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
            
            /* Character counter */
            .character-counter {
                font-size: 0.875rem;
                color: var(--text-secondary);
                text-align: right;
                margin-top: 0.25rem;
            }
            
            /* Letter animation */
            .letter {
                display: inline-block;
                transform-origin: bottom center;
            }
            
            /* Navigation active state */
            .nav-link.active {
                color: var(--primary-color);
            }
            
            .nav-link.active::after {
                width: 100%;
            }
            
            /* Form styles */
            .form-group {
                position: relative;
            }
            
            .form-group input.error,
            .form-group textarea.error {
                border-color: #ef4444;
                animation: shake 0.5s ease;
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            /* Notification styles */
            .notification {
                font-family: 'Inter', sans-serif;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s ease;
            }
            
            .notification-close:hover {
                background-color: rgba(255, 255, 255, 0.2);
            }
            
            /* Submit status */
            .submit-status {
                margin-top: 1rem;
                font-size: 0.875rem;
                text-align: center;
                display: none;
            }
            
            .submit-status.success {
                color: #10b981;
            }
            
            .submit-status.error {
                color: #ef4444;
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                *,
                *::before,
                *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
                
                .animate-observer {
                    opacity: 1 !important;
                    transform: none !important;
                }
                
                .custom-cursor,
                .custom-cursor-dot {
                    display: none !important;
                }
            }
            
            /* Mobile optimizations */
            @media (max-width: 768px) {
                #hero-particles {
                    display: none;
                }
                
                .hero-circle {
                    animation: none;
                }
            }
            
            /* Print styles */
            @media print {
                .header,
                .nav-toggle,
                .theme-toggle,
                .hero-buttons,
                .contact-form,
                .loading-screen,
                .custom-cursor,
                .custom-cursor-dot,
                #hero-particles {
                    display: none !important;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Start the application
const app = new App();

// Production build - debug exports removed for performance
// Comprehensive dependency check and fallback system
document.addEventListener('DOMContentLoaded', () => {
    // Check critical dependencies
    const dependencies = {
        gsap: !!window.gsap,
        scrollTrigger: !!(window.gsap && window.gsap.plugins && window.gsap.plugins.ScrollTrigger),
        scrollToPlugin: !!(window.gsap && window.gsap.plugins && window.gsap.plugins.ScrollToPlugin),
        particlesJS: !!window.particlesJS
    };

    // Fallback for missing dependencies
    if (!dependencies.gsap) {
        // Disable GSAP-dependent animations
        document.querySelectorAll('[data-gsap]').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }

    if (!dependencies.particlesJS) {
        // Hide particle container if particles.js failed to load
        const particleContainer = document.getElementById('hero-particles');
        if (particleContainer) {
            particleContainer.style.display = 'none';
        }
    }

    // Ensure all critical functionality works
    const criticalElements = [
        '.btn',
        '.skill-tag',
        '.project-card',
        '.nav-link',
        '.contact-form'
    ];

    criticalElements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            // Ensure visibility
            if (element.style.opacity === '0' || element.style.visibility === 'hidden') {
                element.style.opacity = '1';
                element.style.visibility = 'visible';
            }
            
            // Ensure proper display
            if (element.style.display === 'none') {
                if (element.matches('.btn')) {
                    element.style.display = 'inline-flex';
                } else if (element.matches('.skill-tag')) {
                    element.style.display = 'inline-block';
                } else {
                    element.style.display = 'block';
                }
            }
        });
    });

    // Final navigation check
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        // Ensure click event is properly bound
        if (!link._immediateNavHandler) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    });

    // Ensure loading screen is hidden
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.visibility = 'hidden';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    // Ensure body is visible
    document.body.classList.add('loaded');
    document.body.style.opacity = '1';
});

// Immediate fallback for button functionality and navigation
document.addEventListener('DOMContentLoaded', () => {
    // Ensure buttons are visible and clickable
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.style.display = 'inline-flex';
        btn.style.visibility = 'visible';
        btn.style.opacity = '1';
    });
    
    // Ensure skills are visible - force display regardless of animations
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach(tag => {
        tag.style.display = 'inline-block';
        tag.style.visibility = 'visible';
        tag.style.opacity = '1';
        tag.style.transform = 'scale(1)';
        tag.style.pointerEvents = 'auto';
    });
    
    // Also ensure skills container is visible
    const skillsSection = document.querySelector('.skills');
    const skillTagsContainer = document.querySelector('.skill-tags');
    
    if (skillsSection) {
        skillsSection.style.display = 'block';
        skillsSection.style.visibility = 'visible';
        skillsSection.style.opacity = '1';
    }
    
    if (skillTagsContainer) {
        skillTagsContainer.style.display = 'flex';
        skillTagsContainer.style.visibility = 'visible';
        skillTagsContainer.style.opacity = '1';
    }
    
    // Ensure project cards are visible
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.style.display = 'block';
        card.style.visibility = 'visible';
        card.style.opacity = '1';
    });
    
    // Ensure all project links are clickable
    const projectLinks = document.querySelectorAll('.project-link');
    projectLinks.forEach(link => {
        link.style.pointerEvents = 'auto';
        link.style.cursor = 'pointer';
        link.style.zIndex = '10';
        link.style.position = 'relative';
    });
    
    // Ensure all external links are clickable
    const externalLinks = document.querySelectorAll('a[href^="http"], a[href^="https"]');
    externalLinks.forEach(link => {
        link.style.pointerEvents = 'auto';
        link.style.cursor = 'pointer';
        link.style.zIndex = '10';
        link.style.position = 'relative';
    });
    
    // Immediate navigation fallback - ensure navigation works right away
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        // Remove any existing click handlers first
        link.removeEventListener('click', link._navHandler);
        
        // Add immediate navigation handler
        const handler = (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = target.getBoundingClientRect().top + 
                                     window.pageYOffset - headerHeight - 20;
                
                // Always use native smooth scrolling as immediate fallback
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                                    // Navigation triggered
            }
        };
        
        link._navHandler = handler;
        link.addEventListener('click', handler);
    });
    
    // Visibility fixes and navigation fallback applied
}); 

// Scroll-to-top button logic with performance optimization
(function(){
  const scrollBtn = document.getElementById('scrollToTop');
  if (!scrollBtn) return;
  
  let ticking = false;
  const updateScrollButton = () => {
    if (window.scrollY > 200) {
      scrollBtn.style.display = 'flex';
    } else {
      scrollBtn.style.display = 'none';
    }
    ticking = false;
  };
  
  // Use passive listener for better performance
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollButton);
      ticking = true;
    }
  }, { passive: true });
  
  scrollBtn.addEventListener('click', (e) => {
    e.preventDefault();
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      // Fallback for older browsers
      window.scrollTo(0, 0);
    }
  });
})();

// Enhanced error handling for critical functions
window.addEventListener('error', (event) => {
  // Silently handle errors in production to prevent user disruption
  if (event.error && event.error.name !== 'NetworkError') {
    // Log only critical errors for debugging
  }
});

window.addEventListener('unhandledrejection', (event) => {
  // Prevent unhandled promise rejections from showing to users
  event.preventDefault();
}); 