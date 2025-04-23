// Projects page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Apply project card hover effects
    applyProjectCardEffects();
    
    // Initialize project filter
    initializeProjectFilter();
    
    // Initialize the "New Project" button
    initializeNewProjectButton();
  });
  
  /**
   * Applies hover effects to project cards
   */
  function applyProjectCardEffects() {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-3px)';
        card.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
      });
    });
    
    // Apply hover effects to view buttons
    document.querySelectorAll('.btn-primary').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-1px)';
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0)';
      });
    });
  }
  
  /**
   * Initializes project filtering functionality
   */
  function initializeProjectFilter() {
    const filterButtons = document.querySelectorAll('[data-filter]');
    
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        const filter = this.dataset.filter;
        
        // Update active state of filter buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // Filter projects
        filterProjects(filter);
      });
    });
  }
  
  /**
   * Filters projects based on status
   * @param {string} filter - Filter criteria (all, active, completed, onHold)
   */
  function filterProjects(filter) {
    document.querySelectorAll('.project-card').forEach(card => {
      if (filter === 'all') {
        card.style.display = '';
        return;
      }
      
      // Get status from badge element
      const badge = card.querySelector('.status-badge');
      if (!badge) return;
      
      const status = badge.textContent.toLowerCase().trim();
      const matches = status === filter;
      
      card.style.display = matches ? '' : 'none';
    });
  }
  
  /**
   * Initializes the new project button
   */
  function initializeNewProjectButton() {
    const newProjectBtn = document.querySelector('.btn-primary');
    
    if (newProjectBtn) {
      newProjectBtn.addEventListener('click', function() {
        // In a real implementation, this would show a modal
        // or redirect to a new project page
        alert('New Project button clicked!');
      });
    }
  }
  
  /**
   * Opens a project detail view
   * @param {string} projectId - The ID of the project to view
   */
  function viewProject(projectId) {
    // In a real implementation, this would navigate to the project detail page
    window.location.href = `/project-detail/${projectId}`;
  }