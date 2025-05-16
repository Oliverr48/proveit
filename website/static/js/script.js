/**
 * Main JavaScript file for ProveIt application
 * Contains common functionality used across the application
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize responsive navigation
  initNavigation();
  
  // Setup search functionality
  initSearch();
});

/**
 * Initialize mobile navigation functionality
 */
function initNavigation() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', function() {
      if (mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.remove('hidden');
      } else {
        mobileMenu.classList.add('hidden');
      }
    });
  }
  
  // Add active class to current navigation item
  const navItems = document.querySelectorAll('.nav-item');
  const currentPath = window.location.pathname;
  
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (currentPath === href || currentPath.startsWith(href + '/')) {
      item.classList.add('active');
    }
  });
}

/**
 * Initialize search functionality
 */
function initSearch() {
  const searchInput = document.querySelector('.search-input');
  
  if (searchInput) {
    searchInput.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        // Perform search
        const searchTerm = this.value.trim();
        if (searchTerm) {
          // Implement search functionality here
          console.log('Searching for:', searchTerm);
          
          // Example: Redirect to search results page
          // window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
        }
      }
    });
  }
}

/**
 * Format date to a more readable format
 * @param {string} dateString - Date string in ISO format
 * @return {string} - Formatted date string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Calculate time difference from now
 * @param {string} dateString - Date string in ISO format
 * @return {string} - Time difference in human-readable format
 */
function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
}

/**
 * Format file size to human-readable format
 * @param {number} bytes - File size in bytes
 * @return {string} - Human-readable file size
 */
function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} bytes`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
}

/**
 * Truncate a string to a specific length and add ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @return {string} - Truncated string
 */
function truncateString(str, maxLength) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @return {string} - File extension
 */
function getFileExtension(filename) {
  return filename.split('.').pop();
}

/**
 * Get file icon based on file extension
 * @param {string} extension - File extension
 * @return {string} - CSS class for icon
 */
function getFileIconClass(extension) {
  const iconMap = {
    'pdf': 'fa-file-pdf',
    'doc': 'fa-file-word',
    'docx': 'fa-file-word',
    'xls': 'fa-file-excel',
    'xlsx': 'fa-file-excel',
    'jpg': 'fa-file-image',
    'jpeg': 'fa-file-image',
    'png': 'fa-file-image',
    'gif': 'fa-file-image',
    'zip': 'fa-file-archive',
    'rar': 'fa-file-archive',
    'txt': 'fa-file-alt'
  };
  
  return iconMap[extension.toLowerCase()] || 'fa-file';
}