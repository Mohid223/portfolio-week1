 // Portfolio Main JavaScript
class Portfolio {
    constructor() {
        this.init();
    }

    init() {
        // Initialize all functionality when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.setGreeting();
            this.initNavigation();
            this.initFormValidation();
            this.initScrollEffects();
            this.initSmoothScrolling();
            this.addNotificationStyles();
        });
    }

    // Dynamic Greeting Based on Time of Day
    setGreeting() {
        const greetingElement = document.getElementById('greeting');
        if (!greetingElement) return;

        const hour = new Date().getHours();
        let greeting;
        
        if (hour < 12) {
            greeting = "Good Morning, I'm Mohiuddin";
        } else if (hour < 18) {
            greeting = "Good Afternoon, I'm Mohiuddin";
        } else {
            greeting = "Good Evening, I'm Mohiuddin";
        }
        
        greetingElement.textContent = greeting;
    }

    // Mobile Navigation
    initNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (!hamburger || !navMenu) return;

        // Toggle mobile menu
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close mobile menu when clicking on links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Form Validation and Submission
    initFormValidation() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        const elements = {
            name: document.getElementById('name'),
            email: document.getElementById('email'),
            message: document.getElementById('message'),
            nameError: document.getElementById('nameError'),
            emailError: document.getElementById('emailError'),
            messageError: document.getElementById('messageError'),
            submitBtn: document.querySelector('.submit-btn')
        };

        // Real-time validation with debouncing
        this.setupRealTimeValidation(elements);
        
        // Form submission
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmission(elements);
        });
    }

    setupRealTimeValidation(elements) {
        const debounce = (func, delay) => {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(null, args), delay);
            };
        };

        elements.name.addEventListener('input', debounce(() => this.validateName(elements), 300));
        elements.email.addEventListener('input', debounce(() => this.validateEmail(elements), 300));
        elements.message.addEventListener('input', debounce(() => this.validateMessage(elements), 300));
    }

    validateName({ name, nameError }) {
        const value = name.value.trim();
        if (!value) {
            this.showFieldError(nameError, 'Name is required');
            return false;
        } else if (value.length < 2) {
            this.showFieldError(nameError, 'Name must be at least 2 characters');
            return false;
        } else {
            this.clearFieldError(nameError);
            return true;
        }
    }

    validateEmail({ email, emailError }) {
        const value = email.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!value) {
            this.showFieldError(emailError, 'Email is required');
            return false;
        } else if (!emailRegex.test(value)) {
            this.showFieldError(emailError, 'Please enter a valid email address');
            return false;
        } else {
            this.clearFieldError(emailError);
            return true;
        }
    }

    validateMessage({ message, messageError }) {
        const value = message.value.trim();
        if (!value) {
            this.showFieldError(messageError, 'Message is required');
            return false;
        } else if (value.length < 10) {
            this.showFieldError(messageError, 'Message must be at least 10 characters');
            return false;
        } else {
            this.clearFieldError(messageError);
            return true;
        }
    }

    showFieldError(errorElement, message) {
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearFieldError(errorElement) {
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    validateForm(elements) {
        const isNameValid = this.validateName(elements);
        const isEmailValid = this.validateEmail(elements);
        const isMessageValid = this.validateMessage(elements);
        
        return isNameValid && isEmailValid && isMessageValid;
    }

    async handleFormSubmission(elements) {
        if (!this.validateForm(elements)) {
            this.showNotification('Please fix the errors in the form before submitting.', 'warning');
            return;
        }

        const formData = {
            name: elements.name.value.trim(),
            email: elements.email.value.trim(),
            message: elements.message.value.trim(),
            timestamp: new Date().toISOString()
        };

        await this.sendMessage(formData, elements);
    }

    async sendMessage(formData, { submitBtn, name, email, message }) {
        // Show loading state
        this.setButtonLoading(submitBtn, true);
        
        try {
            const response = await fetch('https://formspree.io/f/movpkovj', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                    _subject: `Portfolio Contact from ${formData.name}`,
                    _replyto: formData.email
                })
            });
            
            if (response.ok) {
                this.showNotification('✅ Message sent successfully! I will reply to you soon.', 'success');
                this.resetForm([name, email, message]);
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.showNotification('❌ Failed to send message. Please try again later.', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    setButtonLoading(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            button.disabled = true;
        } else {
            button.innerHTML = 'Send Message';
            button.disabled = false;
        }
    }

    resetForm(fields) {
        fields.forEach(field => {
            if (field) field.value = '';
        });
    }

    // Notification System
    showNotification(message, type = 'info') {
        // Remove existing notifications
        this.removeExistingNotifications();
        
        const notification = this.createNotificationElement(message, type);
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    removeExistingNotifications() {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
    }

    createNotificationElement(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add click handler for close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        return notification;
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Scroll Effects
    initScrollEffects() {
        const scrollTopBtn = document.getElementById('scrollTop');
        if (!scrollTopBtn) return;

        // Scroll to top button
        window.addEventListener('scroll', () => {
            const show = window.pageYOffset > 300;
            scrollTopBtn.classList.toggle('show', show);
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Navbar background on scroll
        let lastScrollY = window.scrollY;
        const navbar = document.querySelector('.navbar');
        
        window.addEventListener('scroll', () => {
            if (!navbar) return;
            
            const currentScrollY = window.scrollY;
            
            // Add/remove background based on scroll position
            if (currentScrollY > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.background = 'var(--white)';
                navbar.style.backdropFilter = 'none';
            }
            
            // Hide/show navbar on scroll direction
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        });
    }

    // Smooth Scrolling
    initSmoothScrolling() {
        // Navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 70;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // CTA Button
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', () => {
                const projectsSection = document.getElementById('projects');
                if (projectsSection) {
                    const offsetTop = projectsSection.offsetTop - 70;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }

    // Dynamic Styles
    addNotificationStyles() {
        if (document.getElementById('notification-styles')) return;

        const styles = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                border-left: 4px solid #3498db;
                z-index: 10000;
                max-width: 400px;
                animation: slideInRight 0.3s ease;
                backdrop-filter: blur(10px);
            }
            
            .notification-success {
                border-left-color: #27ae60;
            }
            
            .notification-error {
                border-left-color: #e74c3c;
            }
            
            .notification-warning {
                border-left-color: #f39c12;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .notification-content i {
                font-size: 1.2rem;
            }
            
            .notification-success .notification-content i {
                color: #27ae60;
            }
            
            .notification-error .notification-content i {
                color: #e74c3c;
            }
            
            .notification-warning .notification-content i {
                color: #f39c12;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: #777;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 50%;
                transition: all 0.3s ease;
                margin-left: auto;
            }
            
            .notification-close:hover {
                background: rgba(0, 0, 0, 0.1);
                color: #333;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .fa-spin {
                animation: fa-spin 1s infinite linear;
            }
            
            @keyframes fa-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
}

// Initialize Portfolio
new Portfolio();

// Additional utility functions
const utils = {
    // Debounce function for performance
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for scroll events
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Check if element is in viewport
    isInViewport: (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Portfolio, utils };
}