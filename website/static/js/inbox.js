/**
 * Inbox Page JavaScript
 * Handles tab switching for different notification types
 */

document.addEventListener('DOMContentLoaded', function() {
  /**
   * Initialize tab switching functionality
   * Allows users to switch between Project Invites and Pending Approvals tabs
   */
  function initTabs() {
    const tabs = document.querySelectorAll('.notification-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Hide all tab contents
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Show the corresponding tab content
        const tabId = this.dataset.tab + '-tab';
        document.getElementById(tabId).classList.add('active');
      });
    });
  }
  
  // Initialize all functionality
  initTabs();
});