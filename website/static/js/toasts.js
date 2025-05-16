document.addEventListener('DOMContentLoaded', function() {
  // Get flash messages from the data attribute
  const flashMessagesContainer = document.getElementById('flash-messages-data');
  let flashMessages = [];
  
  if (flashMessagesContainer && flashMessagesContainer.dataset.flashMessages) {
    try {
      flashMessages = JSON.parse(flashMessagesContainer.dataset.flashMessages);
    } catch(e) {
      console.error('Error parsing flash messages:', e);
    }
  }
  
  // Display each flash message
  if (flashMessages && flashMessages.length > 0) {
    flashMessages.forEach(function(flash) {
      showToast(flash.message, flash.category);
    });
  }

  // Toast notification function
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    // Set icon and styling based on message type
    let icon = '';
    let bgColor = '';
    let borderColor = '';
    let textColor = '';
    
    if (type === 'success') {
      icon = '<div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"><svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></div>';
      bgColor = 'bg-white';
      borderColor = 'border-l-4 border-green-500';
      textColor = 'text-green-800';
    } else if (type === 'error' || type === 'danger') {
      icon = '<div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0"><svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></div>';
      bgColor = 'bg-white';
      borderColor = 'border-l-4 border-red-500';
      textColor = 'text-red-800';
    } else {
      icon = '<div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0"><svg class="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg></div>';
      bgColor = 'bg-white';
      borderColor = 'border-l-4 border-indigo-500';
      textColor = 'text-indigo-800';
    }
    
    // Create toast HTML
    toast.className = `${bgColor} ${borderColor} rounded-md shadow-lg p-4 mb-3 flex items-center transform transition-all duration-300 translate-y-8 opacity-0`;
    toast.innerHTML = `
      ${icon}
      <div class="ml-3 flex-grow">
        <div class="flex justify-between items-center">
          <p class="text-sm font-medium ${textColor}">${message}</p>
          <button class="text-gray-400 hover:text-gray-600 focus:outline-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="w-full bg-gray-200 mt-2 rounded-full h-1 overflow-hidden opacity-75">
          <div class="toast-progress bg-current h-full w-full"></div>
        </div>
      </div>
    `;
    
    // Add to container
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-y-8', 'opacity-0');
    }, 10);
    
    // Setup progress bar animation
    const progressBar = toast.querySelector('.toast-progress');
    progressBar.style.transition = 'width 4s linear';
    
    // Start the countdown animation after a tiny delay
    setTimeout(() => {
      progressBar.style.width = '0%';
    }, 50);
    
    // Auto-dismiss after 4 seconds
    const dismissTimeout = setTimeout(() => {
      dismissToast(toast);
    }, 4000);
    
    // Setup dismissal with click
    toast.querySelector('button').addEventListener('click', () => {
      clearTimeout(dismissTimeout);
      dismissToast(toast);
    });
    
    // Pause progress bar on hover
    toast.addEventListener('mouseenter', () => {
      progressBar.style.transition = 'none';
      clearTimeout(dismissTimeout);
    });
    
    // Resume progress bar on mouse leave
    toast.addEventListener('mouseleave', () => {
      const remainingWidth = (progressBar.offsetWidth / progressBar.parentNode.offsetWidth) * 100;
      const remainingTime = (remainingWidth / 100) * 4000;
      
      if (remainingTime > 0) {
        progressBar.style.transition = `width ${remainingTime}ms linear`;
        progressBar.style.width = '0%';
        
        const newDismissTimeout = setTimeout(() => {
          dismissToast(toast);
        }, remainingTime);
        
        // Store timeout so it can be cleared if needed
        toast._dismissTimeout = newDismissTimeout;
      } else {
        dismissToast(toast);
      }
    });
  }
  
  // Function to dismiss a toast with animation
  function dismissToast(toast) {
    toast.classList.add('opacity-0', 'translate-y-8');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
  
  // Make function globally available
  window.showToast = showToast;
});