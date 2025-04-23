// Dashboard specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Apply card hover effects to dashboard cards
    applyDashboardCardEffects();
    
    // Initialize tabs if present
    initializeTabs();
  });
  
  /**
   * Applies hover effects specifically to dashboard cards
   */
  function applyDashboardCardEffects() {
    document.querySelectorAll('.dashboard-card').forEach(card => {
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
   * Initializes tab functionality
   */
  function initializeTabs() {
    const tabs = document.querySelectorAll('[data-tab]');
    if (tabs.length > 0) {
      tabs.forEach(tab => {
        tab.addEventListener('click', function() {
          const target = this.dataset.tab;
          
          // Remove active class from all tabs
          tabs.forEach(t => t.classList.remove('bg-indigo-50', 'text-indigo-700'));
          tabs.forEach(t => t.classList.add('bg-slate-100', 'text-slate-500'));
          
          // Add active class to clicked tab
          this.classList.remove('bg-slate-100', 'text-slate-500');
          this.classList.add('bg-indigo-50', 'text-indigo-700');
          
          // Show the target content and hide others
          document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
          });
          
          document.querySelector(`.tab-content[data-tab="${target}"]`)?.classList.remove('hidden');
        });
      });
    }
  }
  
  /**
   * Filters the upcoming deadlines table
   * @param {string} filter - Filter criteria (all, thisWeek, thisMonth)
   */
  function filterDeadlines(filter) {
    const rows = document.querySelectorAll('#deadlines-table tbody tr');
    
    rows.forEach(row => {
      const dateCell = row.querySelector('td:nth-child(4)');
      if (!dateCell) return;
      
      const dateText = dateCell.textContent;
      const dueDate = new Date(dateText);
      const today = new Date();
      
      // Calculate the end of current week and month
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
      
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      let showRow = true;
      
      if (filter === 'thisWeek') {
        showRow = dueDate <= endOfWeek;
      } else if (filter === 'thisMonth') {
        showRow = dueDate <= endOfMonth;
      }
      
      row.style.display = showRow ? '' : 'none';
    });
  }