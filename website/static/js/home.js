/**
 * Home Page JavaScript
 * Handles mobile menu, login form validation, and password visibility
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize mobile menu
  initMobileMenu();
  
  // Initialize login form validation
  initLoginFormValidation();
  
  // Initialize password visibility toggle
  initPasswordToggle();
  
  // Initialize demo login button
  initDemoLogin();
});

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', function() {
      // Toggle mobile menu visibility
      if (mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.remove('hidden');
      } else {
        mobileMenu.classList.add('hidden');
      }
    });
  }
}

/**
 * Initialize login form validation
 */
function initLoginFormValidation() {
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      let isValid = true;
      
      // Reset errors
      if (emailError) emailError.classList.add('hidden');
      if (passwordError) passwordError.classList.add('hidden');
      
      // Validate email
      if (emailInput && emailError) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInput.value)) {
          emailError.classList.remove('hidden');
          isValid = false;
        }
      }
      
      // Validate password
      if (passwordInput && passwordError) {
        if (passwordInput.value.length < 6) {
          passwordError.classList.remove('hidden');
          isValid = false;
        }
      }
      
      if (!isValid) {
        e.preventDefault();
      }
    });
  }
}

/**
 * Initialize password visibility toggle
 */
function initPasswordToggle() {
  const togglePasswordBtn = document.getElementById('toggle-password');
  const passwordField = document.getElementById('login-password');
  
  if (togglePasswordBtn && passwordField) {
    togglePasswordBtn.addEventListener('click', function() {
      // Toggle between password and text type
      const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordField.setAttribute('type', type);
      
      // Toggle eye icon
      const icon = this.querySelector('i');
      if (icon) {
        if (type === 'text') {
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      }
    });
  }
}

/**
 * Initialize demo login button functionality
 */
function initDemoLogin() {
  const demoLoginBtn = document.getElementById('demo-login');
  const loginForm = document.getElementById('login-form');
  
  if (demoLoginBtn && loginForm) {
    demoLoginBtn.addEventListener('click', function() {
      // Focus on the login form
      const emailInput = document.getElementById('login-email');
      if (emailInput) {
        emailInput.focus();
      }
    });
  }
}