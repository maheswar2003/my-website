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

// Enhanced DOM utilities
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

// Theme management
class ThemeManager {
    constructor() {
        this.theme = this.getTheme();
        this.init();
    }

    getTheme() {
        return localStorage.getItem('theme') || 
               (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }

    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateThemeIcon();
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
        this.setTheme(this.theme);
        
        // Add theme toggle button
        const nav = $('.nav-container');
        if (nav && !$('.theme-toggle')) {
            const themeToggle = document.createElement('button');
            themeToggle.className = 'theme-toggle';
            themeToggle.setAttribute('aria-label', 'Toggle dark mode');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggle.addEventListener('click', () => this.toggleTheme());
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

// Navigation management
class NavigationManager {
    constructor() {
        this.navToggle = $('#nav-toggle');
        this.navMenu = $('#nav-menu');
        this.navLinks = $$('.nav-link');
        this.isMenuOpen = false;
        this.init();
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.navMenu?.classList.toggle('active');
        this.navToggle?.classList.toggle('active');
        this.navToggle?.setAttribute('aria-expanded', this.isMenuOpen);
        
        // Update hamburger animation
        this.updateHamburgerAnimation();
        
        // Manage body scroll
        document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }

    closeMenu() {
        if (this.isMenuOpen) {
            this.toggleMenu();
        }
    }

    updateHamburgerAnimation() {
        const bars = this.navToggle?.querySelectorAll('.bar');
        if (!bars) return;

        if (this.isMenuOpen) {
            bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
            bars[1].style.opacity = '0';
            bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
        } else {
            bars.forEach(bar => {
                bar.style.transform = '';
                bar.style.opacity = '';
            });
        }
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

        // Smooth scrolling with offset for fixed header
        this.setupSmoothScrolling();
    }

    setupSmoothScrolling() {
        $$('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = $(targetId);
                
                if (target) {
                    const headerHeight = $('.header')?.offsetHeight || 0;
                    const targetPosition = target.getBoundingClientRect().top + 
                                         window.pageYOffset - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Header scroll effects
class HeaderManager {
    constructor() {
        this.header = $('.header');
        this.lastScrollY = window.scrollY;
        this.ticking = false;
        this.init();
    }

    updateHeader() {
        const currentScrollY = window.scrollY;
        
        if (!this.header) return;

        if (currentScrollY > 100) {
            this.header.style.background = this.getThemeBackground(0.98);
            this.header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            this.header.style.background = this.getThemeBackground(0.95);
            this.header.style.boxShadow = 'none';
        }

        // Hide/show header on scroll (optional enhancement)
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

    getThemeBackground(opacity) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
                      window.matchMedia('(prefers-color-scheme: dark)').matches;
        return isDark ? `rgba(26, 32, 44, ${opacity})` : `rgba(255, 255, 255, ${opacity})`;
    }

    requestTick() {
        if (!this.ticking) {
            requestAnimationFrame(() => this.updateHeader());
            this.ticking = true;
        }
    }

    init() {
        window.addEventListener('scroll', throttle(() => this.requestTick(), 16));
    }
}

// Contact form management
class ContactFormManager {
    constructor() {
        this.form = $('#contact-form');
        this.submitButton = this.form?.querySelector('button[type="submit"]');
        this.btnText = this.submitButton?.querySelector('.btn-text');
        this.btnLoader = this.submitButton?.querySelector('.btn-loader');
        this.isSubmitting = false;
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
        } else {
            this.btnText.textContent = 'Send Message';
        }
    }

    async submitForm(formData) {
        try {
            const response = await fetch('https://formsubmit.co/maheswar2003@yahoo.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    message: formData.get('message'),
                    _subject: `New message from ${formData.get('name')} via portfolio website`,
                    _captcha: false,
                    _template: 'table'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return { success: true };
        } catch (error) {
            console.error('Form submission error:', error);
            return { 
                success: false, 
                error: 'Network error. Please check your connection and try again.' 
            };
        }
    }

    showSubmissionStatus(success, message) {
        const statusElement = $('#submit-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `submit-status ${success ? 'success' : 'error'}`;
            statusElement.style.display = 'block';
            
            setTimeout(() => {
                statusElement.style.display = 'none';
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
            transform: 'translateX(100%)',
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
        
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => this.removeNotification(notification), 5000);
    }

    removeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }

    init() {
        if (!this.form) return;

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

        // Form submission
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (this.isSubmitting) return;
            
            if (!this.validateForm()) {
                this.showNotification('Please fix the errors before submitting.', 'error');
                return;
            }
            
            this.setLoadingState(true);
            
            const formData = new FormData(this.form);
            const result = await this.submitForm(formData);
            
            this.setLoadingState(false);
            
            if (result.success) {
                this.showSubmissionStatus(true, 'Thank you for your message! I\'ll get back to you soon.');
                this.form.reset();
                // Clear any error states
                fields.forEach(field => {
                    field.classList.remove('error');
                    this.showFieldError(field, '');
                });
            } else {
                this.showSubmissionStatus(false, result.error || 'Sorry, there was an error sending your message. Please try again or email me directly.');
            }
        });
    }
}

// Animation management with Intersection Observer
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
        const animatedElements = $$('.project-card, .skill-tag, .contact-item, .about-text, .hero-content');
        
        animatedElements.forEach(element => {
            element.classList.add('animate-observer');
            this.observer.observe(element);
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

// Typing effect
class TypingEffect {
    constructor(element, text, options = {}) {
        this.element = element;
        this.text = text;
        this.speed = options.speed || 50;
        this.delay = options.delay || 500;
        this.cursor = options.cursor !== false;
        this.init();
    }

    async type() {
        if (!this.element) return;

        this.element.innerHTML = this.cursor ? '<span class="typing-cursor">|</span>' : '';
        
        for (let i = 0; i < this.text.length; i++) {
            await new Promise(resolve => setTimeout(resolve, this.speed));
            
            if (this.cursor) {
                this.element.innerHTML = this.text.slice(0, i + 1) + '<span class="typing-cursor">|</span>';
            } else {
                this.element.innerHTML = this.text.slice(0, i + 1);
            }
        }

        // Remove cursor after typing is complete
        if (this.cursor) {
            setTimeout(() => {
                this.element.innerHTML = this.text;
            }, 1000);
        }
    }

    init() {
        setTimeout(() => this.type(), this.delay);
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    measureLCP() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }

    measureFID() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.metrics.fid = entry.processingStart - entry.startTime;
                }
            });
            observer.observe({ entryTypes: ['first-input'] });
        }
    }

    measureCLS() {
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            let clsEntries = [];
            
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsEntries.push(entry);
                        clsValue += entry.value;
                    }
                }
                this.metrics.cls = clsValue;
            });
            observer.observe({ entryTypes: ['layout-shift'] });
        }
    }

    logMetrics() {
        if (process.env.NODE_ENV === 'development') {
            console.log('Performance Metrics:', this.metrics);
        }
    }

    init() {
        this.measureLCP();
        this.measureFID();
        this.measureCLS();
        
        // Log metrics after page load
        window.addEventListener('load', () => {
            setTimeout(() => this.logMetrics(), 5000);
        });
    }
}

// Dark mode toggle
function setDarkMode(enabled) {
  document.body.classList.toggle('dark-mode', enabled);
  localStorage.setItem('darkMode', enabled ? '1' : '0');
}

function toggleDarkMode() {
  setDarkMode(!document.body.classList.contains('dark-mode'));
}

// Add dark mode toggle button if not present
if (!document.getElementById('dark-mode-toggle')) {
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'dark-mode-toggle';
  toggleBtn.className = 'button glow';
  toggleBtn.setAttribute('aria-label', 'Toggle dark mode');
  toggleBtn.style.position = 'fixed';
  toggleBtn.style.bottom = '2em';
  toggleBtn.style.right = '2em';
  toggleBtn.style.zIndex = '1000';
  toggleBtn.innerHTML = '🌓';
  toggleBtn.onclick = toggleDarkMode;
  document.body.appendChild(toggleBtn);
}

// On load, set dark mode from localStorage
if (localStorage.getItem('darkMode') === '1') {
  setDarkMode(true);
}

// Button micro-interactions (keyboard accessibility)
document.addEventListener('keydown', function(e) {
  if ((e.key === 'Enter' || e.key === ' ') && document.activeElement.classList.contains('button')) {
    document.activeElement.classList.add('active');
  }
});
document.addEventListener('keyup', function(e) {
  if ((e.key === 'Enter' || e.key === ' ') && document.activeElement.classList.contains('button')) {
    document.activeElement.classList.remove('active');
  }
});

// Apply glassmorphism and glow to relevant elements if not present
window.addEventListener('DOMContentLoaded', () => {
  // Add glass class to main content sections if not present
  document.querySelectorAll('section, .main, .card').forEach(el => {
    if (!el.classList.contains('glass')) {
      el.classList.add('glass');
    }
  });
  // Add glow to main CTAs
  document.querySelectorAll('.cta, .button').forEach(el => {
    if (!el.classList.contains('glow')) {
      el.classList.add('glow');
    }
  });
});

// Initialize everything when DOM is ready
class App {
    constructor() {
        this.components = {};
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initComponents());
        } else {
            this.initComponents();
        }
    }

    initComponents() {
        try {
            // Initialize core components
            this.components.theme = new ThemeManager();
            this.components.navigation = new NavigationManager();
            this.components.header = new HeaderManager();
            this.components.form = new ContactFormManager();
            this.components.animations = new AnimationManager();
            this.components.performance = new PerformanceMonitor();

            // Initialize typing effect for hero title
            const heroTitle = $('.hero-title');
            if (heroTitle) {
                const originalText = heroTitle.textContent;
                this.components.typing = new TypingEffect(heroTitle, originalText, {
                    delay: 1000,
                    speed: 50
                });
            }

            // Add loading animation end
            document.body.classList.add('loaded');

            // Add CSS for animations
            this.addAnimationStyles();

        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    addAnimationStyles() {
        if ($('#dynamic-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'dynamic-styles';
        styles.textContent = `
            body {
                opacity: 0;
                transition: opacity 0.5s ease;
            }
            
            body.loaded {
                opacity: 1;
            }
            
            .animate-observer {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .animate-observer.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .typing-cursor {
                animation: blink 1s infinite;
            }
            
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
            
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
            
            .form-group input.error,
            .form-group textarea.error {
                border-color: #ef4444;
                box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
            }
            
            .submit-status.success {
                color: #10b981;
            }
            
            .submit-status.error {
                color: #ef4444;
            }
            
            @media (prefers-reduced-motion: reduce) {
                .animate-observer,
                .typing-cursor {
                    animation: none !important;
                    transition: none !important;
                }
                
                .animate-observer {
                    opacity: 1 !important;
                    transform: none !important;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Start the application
new App(); 