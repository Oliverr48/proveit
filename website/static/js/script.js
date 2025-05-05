// Common JavaScript for all pages

document.addEventListener('DOMContentLoaded', function() {
  // Highlight current page in navigation
  highlightCurrentNavItem();

  // Add hover effects to relevant elements
  addHoverEffects();
});

/**
 * Highlights the current navigation item based on the current path
 */
function highlightCurrentNavItem() {
  const currentPath = window.location.pathname;
  
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href');
    
    if (href === currentPath) {
      item.classList.add('active');
      const icon = item.querySelector('i');
      if (icon) {
        icon.classList.remove('text-slate-500');
        icon.classList.add('text-indigo-600');
      }
    } else {
      item.classList.remove('active');
      const icon = item.querySelector('i');
      if (icon) {
        icon.classList.remove('text-indigo-600');
        icon.classList.add('text-slate-500');
      }
    }
  });
}

/**
 * Adds hover effects to interactive elements
 */
function addHoverEffects() {
  // Button hover effects
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-1px)';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0)';
    });
  });

  // Card hover effects for elements with card-hover class
  document.querySelectorAll('.card-hover').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-3px)';
      card.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
    });
  });
}

/**
 * Toggles a dropdown menu
 * @param {string} id - The ID of the dropdown element
 */
function toggleDropdown(id) {
  const dropdown = document.getElementById(id);
  if (dropdown) {
    dropdown.classList.toggle('hidden');
  }
}

/**
 * Shows a notification
 * @param {string} message - The notification message
 * @param {string} type - The type of notification (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
  // Implementation for showing notifications
  console.log(`${type}: ${message}`);
  // In a real implementation, this would create and show a notification element
}