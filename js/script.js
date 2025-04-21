// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all event listeners
    initializePasswordToggle();
    initializeFormValidation();
    initializeDemoLogin();
    initializeMobileMenu();
  });
  
  // Toggle password visibility
  function initializePasswordToggle() {
    const toggleButton = document.getElementById('toggle-password');
    
    if (toggleButton) {
      toggleButton.addEventListener('click', function() {
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
  
  // Form validation
  function initializeFormValidation() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email');
        const pwd = document.getElementById('login-password');
        
        // Reset errors
        document.getElementById('email-error').classList.add('hidden');
        document.getElementById('password-error').classList.add('hidden');
        
        let isValid = true;
        
        // Validate email
        if (!email.value.includes('@')) {
          document.getElementById('email-error').classList.remove('hidden');
          isValid = false;
        }
        
        // Validate password
        if (pwd.value.length < 6) {
          document.getElementById('password-error').classList.remove('hidden');
          isValid = false;
        }
        
        // Submit if valid
        if (isValid) {
          alert('Login successful!');
          // Here you would typically submit the form to a server
        }
      });
    }
  }
  
  // Demo login functionality
  function initializeDemoLogin() {
    const demoButton = document.getElementById('demo-login');
    
    if (demoButton) {
      demoButton.addEventListener('click', function() {
        document.getElementById('login-email').value = 'demo@proveit.com';
        document.getElementById('login-password').value = 'demopassword';
      });
    }
  }
  
  // Mobile menu toggle
  function initializeMobileMenu() {
    const menuButton = document.getElementById('mobile-menu-button');
    
    if (menuButton) {
      menuButton.addEventListener('click', function() {
        const menu = document.getElementById('mobile-menu');
        const icon = this.querySelector('i');
        
        // Toggle menu visibility
        menu.classList.toggle('hidden');
        
        // Toggle icon between bars and X
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      });
    }
  }