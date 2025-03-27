import { login, signUp } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get('type');

    // DOM Elements
    const loginOptions = document.querySelector('.login-options');
    const loginForms = document.querySelector('.login-forms');
    const signupForms = document.querySelector('.signup-forms');
    const loginTypeButtons = document.querySelectorAll('.login-type-btn');
    const artistLoginForm = document.getElementById('artistLoginForm');
    const filmmakerLoginForm = document.getElementById('filmmakerLoginForm');
    const artistSignupForm = document.getElementById('artistSignupForm');
    const filmmakerSignupForm = document.getElementById('filmmakerSignupForm');

    // Check if user is already logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.email) {
        // If user is already logged in, redirect to appropriate page
        const redirectUrl = sessionStorage.getItem('redirectUrl');
        if (redirectUrl) {
            sessionStorage.removeItem('redirectUrl');
            window.location.href = redirectUrl;
        } else {
            window.location.href = currentUser.type === 'artist' ? 'artist-profile.html' : 'filmmaker-profile.html';
        }
        return;
    }

    // Store the previous page URL if coming from a protected page
    const referrer = document.referrer;
    if (referrer && referrer.includes(window.location.origin)) {
        const protectedPages = ['rentals.html', 'auditions.html'];
        const referrerPage = referrer.split('/').pop();
        if (protectedPages.includes(referrerPage)) {
            sessionStorage.setItem('redirectUrl', referrerPage);
        }
    }

    // Validation Rules
    const validationRules = {
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        },
        password: {
            minLength: 8,
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        },
        phone: {
            pattern: /^[0-9]{10}$/,
            message: 'Please enter a valid 10-digit phone number'
        },
        name: {
            minLength: 2,
            pattern: /^[a-zA-Z\s]{2,}$/,
            message: 'Name must be at least 2 characters long and contain only letters and spaces'
        }
    };

    // Show appropriate form based on URL parameter
    if (userType === 'artist') {
        showLoginForm('artist');
    } else if (userType === 'filmmaker') {
        showLoginForm('filmmaker');
    }

    // Event Listeners for Login Type Buttons
    loginTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.dataset.type;
            showLoginForm(type);
        });
    });

    // Event Listeners for Sign Up Links
    document.getElementById('artistSignupLink').addEventListener('click', function(e) {
        e.preventDefault();
        showSignupForm('artist');
    });

    document.getElementById('filmmakerSignupLink').addEventListener('click', function(e) {
        e.preventDefault();
        showSignupForm('filmmaker');
    });

    // Event Listeners for Login Links
    document.getElementById('artistLoginLink').addEventListener('click', function(e) {
        e.preventDefault();
        showLoginForm('artist');
    });

    document.getElementById('filmmakerLoginLink').addEventListener('click', function(e) {
        e.preventDefault();
        showLoginForm('filmmaker');
    });

    // Form Submission Handlers
    const artistForm = document.getElementById('artistForm');
    if (artistForm) {
        artistForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            handleLogin(event, email, password, 'artist');
        });
    }

    const filmmakerForm = document.getElementById('filmmakerForm');
    if (filmmakerForm) {
        filmmakerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            handleLogin(event, email, password, 'filmmaker');
        });
    }

    // Add event listeners for signup forms
    document.getElementById('artistSignupForm').addEventListener('submit', handleArtistSignup);
    document.getElementById('filmmakerSignupForm').addEventListener('submit', handleFilmmakerSignup);

    // Helper Functions
    function showLoginForm(type) {
        loginOptions.style.display = 'none';
        loginForms.style.display = 'block';
        signupForms.style.display = 'none';

        if (type === 'artist') {
            artistLoginForm.style.display = 'block';
            filmmakerLoginForm.style.display = 'none';
        } else {
            artistLoginForm.style.display = 'none';
            filmmakerLoginForm.style.display = 'block';
        }
    }

    function showSignupForm(type) {
        loginOptions.style.display = 'none';
        loginForms.style.display = 'none';
        signupForms.style.display = 'block';

        if (type === 'artist') {
            artistSignupForm.style.display = 'block';
            filmmakerSignupForm.style.display = 'none';
        } else {
            artistSignupForm.style.display = 'none';
            filmmakerSignupForm.style.display = 'block';
        }
    }

    // Validation Functions
    function validateField(value, rule) {
        if (rule.pattern && !rule.pattern.test(value)) {
            return rule.message;
        }
        if (rule.minLength && value.length < rule.minLength) {
            return `Must be at least ${rule.minLength} characters long`;
        }
        return '';
    }

    function showFieldError(input, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
        input.classList.add('error');
    }

    function clearFieldError(input) {
        const errorDiv = input.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.classList.remove('error');
    }

    // Login handler function
    async function handleLogin(event, email, password, type) {
        try {
            // Show loading state
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';

            // Attempt login with Firebase
            const result = await login(email, password);
            
            if (result.success) {
                // Show success message
                showNotification('Login successful!', 'success');
                
                // Redirect to home page
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        } catch (error) {
            showNotification(error.message || 'Login failed. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    }

    // Form Handlers
    async function handleArtistSignup(e) {
        e.preventDefault();
        const formData = {
            name: document.getElementById('artistSignupName').value,
            email: document.getElementById('artistSignupEmail').value,
            password: document.getElementById('artistSignupPassword').value,
            type: 'artist'
        };

        // Clear previous errors
        document.querySelectorAll('.field-error').forEach(error => error.remove());
        document.querySelectorAll('.error').forEach(input => input.classList.remove('error'));

        // Validate fields
        let hasError = false;
        const nameError = validateField(formData.name, validationRules.name);
        if (nameError) {
            showFieldError(document.getElementById('artistSignupName'), nameError);
            hasError = true;
        }

        const emailError = validateField(formData.email, validationRules.email);
        if (emailError) {
            showFieldError(document.getElementById('artistSignupEmail'), emailError);
            hasError = true;
        }

        const passwordError = validateField(formData.password, validationRules.password);
        if (passwordError) {
            showFieldError(document.getElementById('artistSignupPassword'), passwordError);
            hasError = true;
        }

        if (hasError) return;

        // Show loading state
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Creating account...';

        try {
            // Attempt user creation with Firebase
            const result = await signUp(formData.email, formData.password, formData.name, formData.type);
            
            if (result.success) {
                showNotification('Account created successfully! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        } catch (error) {
            showNotification(error.message || 'Failed to create account. Please try again.', 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Sign Up';
        }
    }

    async function handleFilmmakerSignup(e) {
        e.preventDefault();
        const formData = {
            name: document.getElementById('filmmakerSignupName').value,
            email: document.getElementById('filmmakerSignupEmail').value,
            password: document.getElementById('filmmakerSignupPassword').value,
            type: 'filmmaker'
        };

        // Clear previous errors
        document.querySelectorAll('.field-error').forEach(error => error.remove());
        document.querySelectorAll('.error').forEach(input => input.classList.remove('error'));

        // Validate fields
        let hasError = false;
        const nameError = validateField(formData.name, validationRules.name);
        if (nameError) {
            showFieldError(document.getElementById('filmmakerSignupName'), nameError);
            hasError = true;
        }

        const emailError = validateField(formData.email, validationRules.email);
        if (emailError) {
            showFieldError(document.getElementById('filmmakerSignupEmail'), emailError);
            hasError = true;
        }

        const passwordError = validateField(formData.password, validationRules.password);
        if (passwordError) {
            showFieldError(document.getElementById('filmmakerSignupPassword'), passwordError);
            hasError = true;
        }

        if (hasError) return;

        // Show loading state
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Creating account...';

        try {
            // Attempt user creation with Firebase
            const result = await signUp(formData.email, formData.password, formData.name, formData.type);
            
            if (result.success) {
                showNotification('Account created successfully! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        } catch (error) {
            showNotification(error.message || 'Failed to create account. Please try again.', 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Sign Up';
        }
    }

    // Notification System
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
}); 