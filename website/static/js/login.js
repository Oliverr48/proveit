// Login page JavaScript

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePasswordToggle();
    initializeFormValidation();
    initializeDemoLogin();
    initializeMobileMenu();
    initializeNavLinks();
  });
  
  /**
   * Initializes password visibility toggle
   */
  function initializePasswordToggle() {
    const toggleButton = document.getElementById('toggle-password');
  
    if (toggleButton) {
      toggleButton.addEventListener('click', function () {
        const pwd = document.getElementById('login-password');
        const icon = this.querySelector('i');
  
        // Toggle between password and text
        pwd.type = pwd.type === 'password' ? 'text' : 'password';
  
        // Toggle icon
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
      });
    }
  }
  
  /**
 * Replaces form validation with server-side POST request to /login
 */
  function initializeFormValidation() {
    const loginForm = document.getElementById('login-form');
    
    // Check for signup_success parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('signup_success')) {
        // Success notification is now handled by Flask flash messages
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Basic client-side validation only
            if (!validateEmail(email) || password.length < 6) {
                e.preventDefault(); // Stop form submission
                
                if (!validateEmail(email)) {
                    document.getElementById('email-error').classList.remove('hidden');
                }
                
                if (password.length < 6) {
                    document.getElementById('password-error').classList.remove('hidden');
                }
            }
            // If validation passes, form will submit to backend naturally
        });
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
  function initializeDemoLogin() {
    const demoButton = document.getElementById('demo-login');
  
    if (demoButton) {
      demoButton.addEventListener('click', function () {
        // Set demo login credentials
        const emailField = document.getElementById('login-email');
        const passwordField = document.getElementById('login-password');
        
        if (emailField) emailField.value = 'demo@projectpulse.com';
        if (passwordField) passwordField.value = 'demopassword';
  
        // Submit form programmatically
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
          loginForm.dispatchEvent(new Event('submit'));
        }
      });
    }
  }
  
  /**
   * Initializes mobile menu toggle
   */
  function initializeMobileMenu() {
    const menuButton = document.getElementById('mobile-menu-button');
  
    if (menuButton) {
      menuButton.addEventListener('click', function () {
        const menu = document.getElementById('mobile-menu');
        const icon = this.querySelector('i');
  
        if (menu) menu.classList.toggle('hidden');
  
        // Toggle icon
        if (icon) {
          icon.classList.toggle('fa-bars');
          icon.classList.toggle('fa-times');
        }
      });
    }
  }
  
  /**
   * Initializes navigation link animations
   */
  function initializeNavLinks() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('mouseenter', function() {
        this.classList.add('text-indigo-600');
      });
      
      link.addEventListener('mouseleave', function() {
        this.classList.remove('text-indigo-600');
      });
    });
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 100,
            behavior: 'smooth'
          });
        }
      });
    });
  }



