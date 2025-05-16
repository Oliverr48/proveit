// Global variable for the task modal
let taskModal;
let inviteModal;

// Initialize the Add Task button and modal
function initializeAddTaskButton() {
  const addTaskBtn = document.getElementById('newTaskBtn');
  taskModal = document.getElementById('modalAddTask');
  const closeModalBtn = document.getElementById('closeModalBtn');
  
  if (addTaskBtn && taskModal) {
    addTaskBtn.addEventListener('click', function() {
      taskModal.classList.remove('hidden');
      taskModal.style.display = 'flex';
    });
    
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', function() {
        taskModal.classList.add('hidden');
        taskModal.style.display = 'none';
      });
    }
  }
}

// Initialize the Invite modal
function initializeInviteModal() {
  const inviteBtn = document.getElementById('openInviteModalBtn');
  inviteModal = document.getElementById('inviteModal');
  const closeInviteModalBtn = document.getElementById('closeInviteModalBtn');
  
  if (inviteBtn && inviteModal) {
    inviteBtn.addEventListener('click', function() {
      inviteModal.classList.remove('hidden');
      inviteModal.style.display = 'flex';
    });
    
    if (closeInviteModalBtn) {
      closeInviteModalBtn.addEventListener('click', function() {
        inviteModal.classList.add('hidden');
        inviteModal.style.display = 'none';
      });
    }
  }
}

// Initialize the approval toggle
function initializeApprovalToggle() {
  const approvalToggle = document.getElementById('approvalToggle');
  
  if (approvalToggle) {
    approvalToggle.addEventListener('change', function() {
      const projectId = this.getAttribute('data-project-id');
      
      // Show loading state
      const originalLabel = this.nextElementSibling.nextElementSibling.textContent;
      this.nextElementSibling.nextElementSibling.textContent = 'Updating...';
      
      fetch(`/toggle_project_approval/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then(response => response.json())
      .then(data => {
        // Restore original label
        this.nextElementSibling.nextElementSibling.textContent = originalLabel;
        
        if (data.status === 'success') {
          console.log(`Project approval requirement set to: ${data.approval_required}`);
          // Optional: Brief feedback message that fades out
          const feedbackText = data.approval_required ? 
            "Task approval is now required" : 
            "Task approval is no longer required";
            
          // Create a floating notification
          const notification = document.createElement('div');
          notification.textContent = feedbackText;
          notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-500';
          document.body.appendChild(notification);
          
          // Remove after 3 seconds
          setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
          }, 3000);
        } else {
          console.error('Error:', data.message);
          // Revert the toggle if there was an error
          this.checked = !this.checked;
          alert('Failed to update approval setting: ' + data.message);
        }
      })
      .catch(error => {
        // Restore original label
        this.nextElementSibling.nextElementSibling.textContent = originalLabel;
        
        console.error('Error:', error);
        // Revert the toggle if there was an error
        this.checked = !this.checked;
        alert('An error occurred while updating the approval setting.');
      });
    });
  }
}

// Initialize the Complete Task button
function initializeTaskCompleteButton() {
  const completeTaskBtn = document.getElementById('complTaskBtn');
  
  if (completeTaskBtn) {
    completeTaskBtn.addEventListener('click', function() {
      $.ajax({
        url: '/completeTask',
        type: 'POST',
        data: {task_id: this.dataset.taskId},
        success: function(response) {
          location.reload(); // Refresh to show the updated task status
        },
        error: function(error) {
          alert('Error completing task: ' + error.responseText);
        }
      });
    });
  }
}

// Initialize the Evidence Modal
function initializeEvidenceModal() {
  const viewFilesButtons = document.querySelectorAll('.view-files-btn');
  const evidenceModal = document.getElementById('evidence-modal');
  const closeEvidenceModal = document.getElementById('close-evidence-modal');
  
  viewFilesButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const subtaskId = this.dataset.subtaskId;
      const subtaskName = this.closest('div').querySelector('span').textContent.trim();
      
      // Update modal title
      if (document.getElementById('evidence-modal-title')) {
        document.getElementById('evidence-modal-title').textContent = `Task: ${document.title} > ${subtaskName}`;
      }
      
      // Show modal
      if (evidenceModal) {
        evidenceModal.classList.remove('hidden');
      }
    });
  });
  
  if (closeEvidenceModal && evidenceModal) {
    closeEvidenceModal.addEventListener('click', function() {
      evidenceModal.classList.add('hidden');
    });
  }
}

// Initialize File Upload functionality
function initializeFileUpload() {
  const dropZones = document.querySelectorAll('.drop-zone');
  
  dropZones.forEach(zone => {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      zone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
      zone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      zone.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
      zone.classList.add('border-indigo-500', 'bg-indigo-50');
    }
    
    function unhighlight() {
      zone.classList.remove('border-indigo-500', 'bg-indigo-50');
    }
    
    zone.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
      const files = e.dataTransfer.files;
      // Handle file upload
      console.log('Files dropped:', files);
      
      if (files.length > 0) {
        alert(`${files.length} file(s) selected for upload`);
      }
    }
    
    zone.addEventListener('click', function() {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.multiple = true;
      fileInput.click();
      
      fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
          console.log('Files selected:', this.files);
          alert(`${this.files.length} file(s) selected for upload`);
        }
      });
    });
  });
}

// Direct revert task function that can be called from inline onclick
function revertTask(event, taskId) {
  // Stop the event from bubbling up to parent elements
  event.preventDefault();
  event.stopPropagation();
  
  if (confirm('Are you sure you want to revert this task to in-progress status?')) {
    fetch('/revertTask', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({'task_id': taskId})
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        // Show a quick success message
        alert('Task reverted successfully!');
        location.reload();
      } else {
        alert('Error reverting task: ' + (data.message || 'Unknown error'));
      }
    })
    .catch(error => {
      alert('Connection error. Please try again.');
    });
  }
  
  // Return false to prevent any navigation
  return false;
}

// DOM Content Loaded - Initialize everything
document.addEventListener('DOMContentLoaded', function() {
  // Apply all event listeners after DOM has loaded
  initializeAddTaskButton();
  initializeTaskCompleteButton();
  initializeEvidenceModal();
  initializeFileUpload();
  initializeInviteModal(); // Added function to handle invite modal
  initializeApprovalToggle(); // Added function to handle approval toggle

  // Handle form submission
  $('#addTaskForm').on('submit', function(e) {
    e.preventDefault();
    console.log('Form submitted!');
    
    $.ajax({
      url: '/submitAddTask',
      type: 'POST',
      data: $(this).serialize(),
      success: function(response) {
        if (taskModal) {
          taskModal.classList.add('hidden');
          taskModal.style.display = 'none';
        }
        location.reload(); // Refresh to show the new project
      },
      error: function(error) {
        alert('Error adding task: ' + error.responseText);
      }
    });
  });
});