document.addEventListener('DOMContentLoaded', function() {
  // initialise all components
  try {
    initialiseFileUpload();
    initialiseEvidenceModal();
    initialiseTaskControls();
    initialiseSubtaskIcons();
    addDeleteHandlers();
    initialiseTaskAssignmentModal();
    initialiseApprovalButtons();
    initialiseRevertButtons();
    initialiseTaskCards();

  } catch (error) {
    showMessage('error', 'Error initializing page components');
  }
});

// Make the circular subtask icons clickable
function initialiseSubtaskIcons() {
  const incompleteCircles = document.querySelectorAll('.subtask-incomplete');
  const completeCircles = document.querySelectorAll('.subtask-complete');
  
  // Make incomplete circles clickable (mark as complete)
  incompleteCircles.forEach(circle => {
    circle.style.cursor = 'pointer';
    
    circle.addEventListener('click', function() {
      try {
        const subtaskContainer = this.closest('div.flex.items-center.justify-between');
        if (!subtaskContainer) return;
        
        const subtaskElement = subtaskContainer.querySelector('[data-subtask-id]');
        if (!subtaskElement) return;
        
        const subtaskId = subtaskElement.dataset.subtaskId;
        updateSubtaskStatus(subtaskId, 1); // 1 = complete
      } catch (error) {
        showMessage('error', 'Error updating subtask');
      }
    });
  });
  
  // Make complete circles clickable (mark as incomplete)
  completeCircles.forEach(circle => {
    circle.style.cursor = 'pointer';
    
    circle.addEventListener('click', function() {
      try {
        const subtaskContainer = this.closest('div.flex.items-center.justify-between');
        if (!subtaskContainer) return;
        
        const subtaskElement = subtaskContainer.querySelector('[data-subtask-id]');
        if (!subtaskElement) return;
        
        const subtaskId = subtaskElement.dataset.subtaskId;
        updateSubtaskStatus(subtaskId, 0); // 0 = incomplete
      } catch (error) {
        showMessage('error', 'Error updating subtask');
      }
    });
  });
}

// Helper function to update subtask status
function updateSubtaskStatus(subtaskId, status) {
  if (!subtaskId) {
    showMessage('error', 'Error: Missing subtask ID');
    return;
  }
  
  fetch('/update_subtask_status', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      'subtaskId': subtaskId,
      'status': status
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Server error');
    }
    return response.json();
  })
  .then(data => {
    if (data.status === 'success') {
      showMessage('success', 'Subtask updated successfully');
      // Reduced delay from 1000ms to 500ms for faster response
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      showMessage('error', 'Error updating subtask: ' + (data.message || 'Unknown error'));
    }
  })
  .catch(error => {
    showMessage('error', 'Connection error. Please try again.');
  });
}

// initialise evidence modal
function initialiseEvidenceModal() {
  const viewFilesButtons = document.querySelectorAll('.view-files-btn');
  const evidenceModal = document.getElementById('evidence-modal');
  const closeEvidenceModal = document.getElementById('close-evidence-modal');
  
  // Set up event listeners for opening modal
  viewFilesButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      try {
        const subtaskId = this.dataset.subtaskId;
        const subtaskContainer = this.closest('div');
        if (!subtaskContainer) return;
        
        const subtaskSpan = subtaskContainer.querySelector('span');
        if (!subtaskSpan) return;
        
        const subtaskName = subtaskSpan.textContent.trim();
        
        // Update modal title and subtask ID
        const modalTitle = document.getElementById('evidence-modal-title');
        if (modalTitle) {
          modalTitle.textContent = `Task: ${document.title.split(' - ')[0]} > ${subtaskName}`;
        }
        
        const modalSubtaskId = document.getElementById('modalSubtaskId');
        if (modalSubtaskId) {
          modalSubtaskId.value = subtaskId;
        }
        
        // Show modal
        if (evidenceModal) {
          evidenceModal.classList.remove('hidden');
        }
      } catch (error) {
        showMessage('error', 'Error opening file viewer');
      }
    });
  });
  
  // Set up modal close
  if (closeEvidenceModal) {
    closeEvidenceModal.addEventListener('click', function() {
      if (evidenceModal) {
        evidenceModal.classList.add('hidden');
      }
    });
  }
  
  // Modal upload form submission
  const modalUploadForm = document.getElementById('modalUploadForm');
  if (modalUploadForm) {
    modalUploadForm.addEventListener('submit', function(e) {
      e.preventDefault();
      uploadFiles(this);
    });
  }
}

// initialise file upload components
function initialiseFileUpload() {
  // Set up drop zones
  try {
    initialiseDropZone('drop-zone', 'fileInput');
    initialiseDropZone('modal-drop-zone', 'modalFileInput');
  } catch (error) {
    // Silently handle errors
  }
  
  // Main upload form
  const uploadForm = document.getElementById('uploadEvidenceForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', function(e) {
      e.preventDefault();
      uploadFiles(this);
    });
  }
}

// Set up a drop zone for file uploads
function initialiseDropZone(dropZoneId, fileInputId) {
  const dropZone = document.getElementById(dropZoneId);
  const fileInput = document.getElementById(fileInputId);
  
  if (!dropZone || !fileInput) return;
  
  // Prevent default behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
    dropZone.addEventListener(event, e => {
      e.preventDefault();
      e.stopPropagation();
    });
  });
  
  // Highlight drop zone
  ['dragenter', 'dragover'].forEach(event => {
    dropZone.addEventListener(event, () => dropZone.classList.add('border-indigo-500', 'bg-indigo-50'));
  });
  
  ['dragleave', 'drop'].forEach(event => {
    dropZone.addEventListener(event, () => dropZone.classList.remove('border-indigo-500', 'bg-indigo-50'));
  });
  
  // Handle file drop
  dropZone.addEventListener('drop', function(e) {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      try {
        // Update file input for form submission
        const dataTransfer = new DataTransfer();
        Array.from(files).forEach(file => dataTransfer.items.add(file));
        fileInput.files = dataTransfer.files;
        
        // Show file preview
        updateFilePreview(files, fileInputId === 'modalFileInput' ? 'modalFilePreview' : 'filePreview');
      } catch (error) {
        showMessage('error', 'Error handling files');
      }
    }
  });
  
  // Handle click to select files
  dropZone.addEventListener('click', function() {
    fileInput.click();
  });
  
  // Display selected files
  fileInput.addEventListener('change', function() {
    if (this.files.length > 0) {
      updateFilePreview(this.files, fileInputId === 'modalFileInput' ? 'modalFilePreview' : 'filePreview');
    }
  });
}

// Update file preview
function updateFilePreview(files, previewId) {
  const previewElement = document.getElementById(previewId);
  if (!previewElement) return;
  
  previewElement.innerHTML = '';
  
  Array.from(files).forEach(file => {
    const fileExtension = file.name.split('.').pop().toUpperCase();
    const fileSize = (file.size / 1024).toFixed(2) + ' KB';
    
    const filePreview = document.createElement('div');
    filePreview.className = 'file-preview-item';
    filePreview.innerHTML = `
      <div class="file-preview-icon">${fileExtension}</div>
      <div class="file-preview-name">${file.name}</div>
      <div class="text-xs text-gray-500">${fileSize}</div>
    `;
    
    previewElement.appendChild(filePreview);
  });
  
  showMessage('info', `${files.length} file(s) selected for upload`, previewId + 'Message');
}

// Upload files using FormData and Fetch API
function uploadFiles(form) {
  const formData = new FormData(form);
  const isModalForm = form.id === 'modalUploadForm';
  const progressBar = document.getElementById(isModalForm ? 'modalUploadProgressBar' : 'uploadProgressBar');
  const progressContainer = document.getElementById(isModalForm ? 'modalUploadProgress' : 'uploadProgress');
  
  // Check if form contains files
  let hasFiles = false;
  for (let [key, value] of formData.entries()) {
    if (key === 'files[]' && value instanceof File) {
      hasFiles = true;
      break;
    }
  }
  
  if (!hasFiles) {
    showMessage('warning', 'Please select files to upload', isModalForm ? 'modalUploadMessage' : 'uploadMessage');
    return;
  }
  
  // Show progress
  if (progressContainer) {
    progressContainer.classList.remove('hidden');
  }
  
  if (progressBar) {
    progressBar.style.width = '0%';
  }
  
  fetch('/upload_evidence', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Server error');
    }
    return response.json();
  })
  .then(data => {
    if (progressBar) {
      progressBar.style.width = '100%';
    }
    
    if (data.success) {
      showMessage('success', 'Files uploaded successfully!', isModalForm ? 'modalUploadMessage' : 'uploadMessage');
      form.reset();
      
      // Clear file preview
      const previewElement = document.getElementById(isModalForm ? 'modalFilePreview' : 'filePreview');
      if (previewElement) {
        previewElement.innerHTML = '';
      }
      
      // Reduced delay from 1500ms to 700ms for faster response
      setTimeout(() => {
        location.reload();
      }, 700);
    } else {
      showMessage('error', 'Error uploading files: ' + (data.message || 'Unknown error'), 
        isModalForm ? 'modalUploadMessage' : 'uploadMessage');
    }
  })
  .catch(error => {
    if (progressBar) {
      progressBar.style.width = '0%';
    }
    
    showMessage('error', 'Connection error. Please try again.', 
      isModalForm ? 'modalUploadMessage' : 'uploadMessage');
  })
  .finally(() => {
    // Hide progress after a delay
    if (progressContainer) {
      setTimeout(() => {
        progressContainer.classList.add('hidden');
      }, 2000);
    }
  });
}

// Add event handlers to delete buttons
function addDeleteHandlers() {
  const deleteButtons = document.querySelectorAll('.delete-file-btn');
  
  deleteButtons.forEach(button => {
    button.addEventListener('click', function() {
      if (confirm('Are you sure you want to delete this file?')) {
        const fileId = this.dataset.fileId;
        
        if (!fileId) {
          showMessage('error', 'Error: Missing file ID');
          return;
        }
        
        fetch('/delete_file/' + fileId, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 
            'X-Requested-With': 'XMLHttpRequest'
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Server error');
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            const fileItem = this.closest('.file-item');
            if (fileItem) {
              fileItem.style.opacity = '0';
              setTimeout(() => fileItem.remove(), 300);
              showMessage('success', 'File deleted successfully');
            }
          } else {
            showMessage('error', 'Error deleting file: ' + (data.message || 'Unknown error'));
          }
        })
        .catch(error => {
          showMessage('error', 'Connection error. Please try again.');
        });
      }
    });
  });
}

// initialise task controls (complete task button and add subtask form)
function initialiseTaskControls() {
  // Complete task button
  const complTaskBtn = document.querySelector('.complTaskBtn');
  
  if (complTaskBtn) {
    // Check if data attribute is present
    if (!complTaskBtn.hasAttribute('data-task-id')) {
      // Try to find the task ID from the URL
      const urlMatch = window.location.pathname.match(/\/task\/(\d+)/);
      if (urlMatch && urlMatch[1]) {
        const taskId = urlMatch[1];
        complTaskBtn.setAttribute('data-task-id', taskId);
      } else {
        showMessage('error', 'Error: Task ID not found');
      }
    }
    
    // Add click event listener
    complTaskBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const taskId = this.dataset.taskId;
      
      if (!taskId) {
        showMessage('error', 'Error: Missing task ID');
        return;
      }
      
      const btnText = this.innerHTML;
      
      // Disable button and show loading state
      this.disabled = true;
      this.innerHTML = `
        <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Processing...
      `;
      
      fetch('/completeTask', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({'task_id': taskId})
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Server error');
        }
        return response.json();
      })
      .then(data => {
        // Create a status message element
        const messageDiv = document.createElement('div');
        messageDiv.className = 'mt-4 p-4 rounded-lg';
        
        // Insert message after the button and hide the complete button
        complTaskBtn.parentNode.appendChild(messageDiv);
        complTaskBtn.style.display = 'none';
        
        // Check if task requires approval (using both the flag and message content as fallback)
        const requiresApproval = data.requires_approval || 
                               (data.message && data.message.includes('awaiting approval'));
        
        if (requiresApproval) {
          // Task is pending approval
          messageDiv.className += ' bg-yellow-50 text-yellow-800';
          messageDiv.innerHTML = `
            <div class="flex items-center">
              <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
              </svg>
              <span>Task marked as complete and is awaiting approval from the project owner.</span>
            </div>
          `;
          
          // Update the status badge
          const statusBadge = document.querySelector('.status-badge');
          if (statusBadge) {
            statusBadge.className = 'status-badge';
            statusBadge.classList.add('bg-yellow-50', 'text-yellow-700');
            statusBadge.innerHTML = '⏳ Pending Approval';
          }
          
          // Do NOT reload the page for tasks that need approval
        } else {
          // Task was auto-approved
          messageDiv.className += ' bg-green-50 text-green-800';
          messageDiv.innerHTML = `
            <div class="flex items-center">
              <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Task successfully marked as complete!</span>
            </div>
          `;
          
          // Update the status badge
          const statusBadge = document.querySelector('.status-badge');
          if (statusBadge) {
            statusBadge.className = 'status-badge status-completed';
            statusBadge.innerHTML = '✓ Completed';
          }
          
          // Only reload for auto-approved tasks - reduced delay for faster response
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      })
      .catch(error => {
        // Reset button
        this.disabled = false;
        this.innerHTML = btnText;
        showMessage('error', 'Error completing task. Please try again.');
      });
    });
  }
  
  // Add subtask form
  const addSubtaskForm = document.querySelector('.add-subtask-form');
  
  if (addSubtaskForm) {
    // Check if data attribute is present
    if (!addSubtaskForm.hasAttribute('data-task-id')) {
      // Try to find the task ID from the URL
      const urlMatch = window.location.pathname.match(/\/task\/(\d+)/);
      if (urlMatch && urlMatch[1]) {
        const taskId = urlMatch[1];
        addSubtaskForm.setAttribute('data-task-id', taskId);
      }
    }
    
    addSubtaskForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const taskId = this.dataset.taskId;
      
      if (!taskId) {
        showMessage('error', 'Error: Missing task ID');
        return;
      }
      
      const subtaskNameInput = this.querySelector('input[name="subtaskName"]');
      if (!subtaskNameInput) {
        showMessage('error', 'Error: Could not find subtask name input');
        return;
      }
      
      const subtaskName = subtaskNameInput.value;
      
      if (!subtaskName.trim()) {
        showMessage('warning', 'Please enter a subtask name');
        return;
      }
      
      // Disable the input and submit button
      const submitBtn = this.querySelector('button[type="submit"]');
      if (subtaskNameInput) subtaskNameInput.disabled = true;
      if (submitBtn) submitBtn.disabled = true;
      
      fetch('/create_subtask', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
          'taskId': taskId,
          'subtaskName': subtaskName
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Server error');
        }
        return response.json();
      })
      .then(data => {
        if (data.status === 'success') {
          // Show success message
          showMessage('success', 'Subtask created successfully!');
          
          // Clear the input field
          if (subtaskNameInput) subtaskNameInput.value = '';
          
          // Re-enable the form
          if (subtaskNameInput) subtaskNameInput.disabled = false;
          if (submitBtn) submitBtn.disabled = false;
          
          // Reduced delay from 1000ms to 500ms for faster response
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          // Re-enable the form
          if (subtaskNameInput) subtaskNameInput.disabled = false;
          if (submitBtn) submitBtn.disabled = false;
          
          showMessage('error', 'Error creating subtask: ' + (data.message || 'Unknown error'));
        }
      })
      .catch(error => {
        // Re-enable the form
        if (subtaskNameInput) subtaskNameInput.disabled = false;
        if (submitBtn) submitBtn.disabled = false;
        
        showMessage('error', 'Error creating subtask. Please try again.');
      });
    });
  }
}

// initialise Task Assignment Modal
function initialiseTaskAssignmentModal() {
  const openModalBtn = document.getElementById('openAssignTaskBtn');
  const assignModal = document.getElementById('assignTaskModal');
  const closeModalBtn = document.getElementById('closeAssignModalBtn');
  const closeModalBtnX = document.getElementById('closeAssignModalBtnX');
  const assignTaskForm = document.getElementById('assignTaskForm');
  
  if (openModalBtn && assignModal) {
    openModalBtn.addEventListener('click', function() {
      assignModal.classList.remove('hidden');
    });
    
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', function() {
        assignModal.classList.add('hidden');
      });
    }
    
    if (closeModalBtnX) {
      closeModalBtnX.addEventListener('click', function() {
        assignModal.classList.add('hidden');
      });
    }
  }
  
  if (assignTaskForm) {
    assignTaskForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const taskId = this.elements['task_id'].value;
      const assignee = this.elements['assignee'].value;
      
      if (!taskId) {
        showMessage('error', 'Error: Missing task ID');
        return;
      }
      
      // Disable form
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Assigning...';
      }
      
      fetch('/assign_task', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
          'task_id': taskId,
          'assignee': assignee
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Server error');
        }
        return response.json();
      })
      .then(data => {
        if (data.status === 'success') {
          // Hide modal
          if (assignModal) {
            assignModal.classList.add('hidden');
          }
          
          // Show success message
          showMessage('success', 'Task assigned successfully!');
          
          // Reduced delay from 1000ms to 500ms for faster response
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          // Re-enable form
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Assign Task';
          }
          
          showMessage('error', 'Error assigning task: ' + (data.message || 'Unknown error'));
        }
      })
      .catch(error => {
        // Re-enable form
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Assign Task';
        }
        
        showMessage('error', 'Error assigning task. Please try again.');
      });
    });
  }
}

// initialise the approval buttons
function initialiseApprovalButtons() {
  const approveButtons = document.querySelectorAll('.approveTaskBtn');
  const rejectButtons = document.querySelectorAll('.rejectTaskBtn');
  
  approveButtons.forEach(button => {
    button.addEventListener('click', function() {
      const taskId = this.dataset.taskId;
      
      if (!taskId) {
        showMessage('error', 'Error: Missing task ID');
        return;
      }
      
      const originalText = this.innerHTML;
      
      // Disable button and show processing state
      this.disabled = true;
      this.innerHTML = 'Processing...';
      
      fetch('/approveTask', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({'task_id': taskId})
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Server error');
        }
        return response.json();
      })
      .then(data => {
        if (data.status === 'success') {
          showMessage('success', 'Task approved successfully!');
          
          // Remove the task item after a brief delay
          const taskItem = this.closest('.notification-item') || this.closest('.bg-white');
          if (taskItem) {
            setTimeout(() => {
              taskItem.style.opacity = '0';
              setTimeout(() => {
                taskItem.remove();
                
                // Check if there are any remaining tasks
                const remainingTasks = document.querySelectorAll('.approveTaskBtn').length;
                
                if (remainingTasks === 0) {
                  // Show "no tasks" message
                  const container = document.querySelector('.space-y-4');
                  if (container) {
                    container.innerHTML = '<p class="text-gray-600">No tasks pending approval.</p>';
                  }
                  
                  // Update tab badge if present
                  const tabBadge = document.querySelector('.notification-tab[data-tab="approvals"] span');
                  if (tabBadge) {
                    tabBadge.remove();
                  }
                }
              }, 300);
            }, 500); // Reduced from 1000ms to 500ms
          }
        } else {
          // Reset button
          this.disabled = false;
          this.innerHTML = originalText;
          showMessage('error', 'Error approving task: ' + (data.message || 'Unknown error'));
        }
      })
      .catch(error => {
        // Reset button
        this.disabled = false;
        this.innerHTML = originalText;
        
        showMessage('error', 'Error approving task. Please try again.');
      });
    });
  });
  
  rejectButtons.forEach(button => {
    button.addEventListener('click', function() {
      const taskId = this.dataset.taskId;
      
      if (!taskId) {
        showMessage('error', 'Error: Missing task ID');
        return;
      }
      
      const originalText = this.innerHTML;
      
      // Confirm rejection
      if (confirm('Are you sure you want to return this task to in-progress status?')) {
        // Disable button and show processing state
        this.disabled = true;
        this.innerHTML = 'Processing...';
        
        fetch('/rejectTask', {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: new URLSearchParams({'task_id': taskId})
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Server error');
          }
          return response.json();
        })
        .then(data => {
          if (data.status === 'success') {
            showMessage('success', 'Task returned to in-progress status.');
            
            // Remove the task item after a brief delay
            const taskItem = this.closest('.notification-item') || this.closest('.bg-white');
            if (taskItem) {
              setTimeout(() => {
                taskItem.style.opacity = '0';
                setTimeout(() => {
                  taskItem.remove();
                  
                  // Check if there are any remaining tasks
                  const remainingTasks = document.querySelectorAll('.rejectTaskBtn').length;
                  
                  if (remainingTasks === 0) {
                    // Show "no tasks" message
                    const container = document.querySelector('.space-y-4');
                    if (container) {
                      container.innerHTML = '<p class="text-gray-600">No tasks pending approval.</p>';
                    }
                    
                    // Update tab badge if present
                    const tabBadge = document.querySelector('.notification-tab[data-tab="approvals"] span');
                    if (tabBadge) {
                      tabBadge.remove();
                    }
                  }
                }, 300);
              }, 500); // Reduced from 1000ms to 500ms
            }
          } else {
            // Reset button
            this.disabled = false;
            this.innerHTML = originalText;
            
            showMessage('error', 'Error returning task to in-progress: ' + (data.message || 'Unknown error'));
          }
        })
        .catch(error => {
          // Reset button
          this.disabled = false;
          this.innerHTML = originalText;
          
          showMessage('error', 'Error returning task to in-progress. Please try again.');
        });
      }
    });
  });
}

// Helper function to show messages
function showMessage(type, message, elementId = null) {
  // Define message classes based on type
  const classes = {
    success: 'bg-green-50 text-green-800',
    error: 'bg-red-50 text-red-800',
    warning: 'bg-yellow-50 text-yellow-800',
    info: 'bg-blue-50 text-blue-800'
  };
  
  // Create message element if not specified
  if (!elementId) {
    const messageEl = document.createElement('div');
    messageEl.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${classes[type]}`;
    messageEl.style.zIndex = '9999'; // Ensure it's visible above other elements
    messageEl.innerHTML = message;
    document.body.appendChild(messageEl);
    
    // Remove after 3 seconds (reduced from 5 seconds)
    setTimeout(() => {
      messageEl.style.opacity = '0';
      messageEl.style.transition = 'opacity 0.5s ease';
      setTimeout(() => messageEl.remove(), 500);
    }, 3000);
  } else {
    // Use existing element
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
      messageEl.className = `upload-message ${classes[type]}`;
      messageEl.innerHTML = message;
      messageEl.classList.remove('hidden');
      
      // Hide after 3 seconds (reduced from 5 seconds)
      setTimeout(() => {
        messageEl.classList.add('hidden');
      }, 3000);
    } else {
      // Fallback to creating a new message
      const fallbackEl = document.createElement('div');
      fallbackEl.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${classes[type]}`;
      fallbackEl.style.zIndex = '9999';
      fallbackEl.innerHTML = message;
      document.body.appendChild(fallbackEl);
      
      setTimeout(() => {
        fallbackEl.style.opacity = '0';
        fallbackEl.style.transition = 'opacity 0.5s ease';
        setTimeout(() => fallbackEl.remove(), 500);
      }, 3000);
    }
  }
}

// Add this function to your task_detail.js file
function initialiseRevertButtons() {
  const revertButtons = document.querySelectorAll('.revertTaskBtn');
  
  revertButtons.forEach(button => {
    button.addEventListener('click', function() {
      const taskId = this.dataset.taskId;
      
      if (!taskId) {
        showMessage('error', 'Error: Missing task ID');
        return;
      }
      
      if (confirm('Are you sure you want to revert this task to in-progress status?')) {
        // Disable button and show processing state
        const originalText = this.innerHTML;
        this.disabled = true;
        this.innerHTML = 'Processing...';
        
        fetch('/revertTask', {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: new URLSearchParams({'task_id': taskId})
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Server error');
          }
          return response.json();
        })
        .then(data => {
          if (data.status === 'success') {
            showMessage('success', 'Task reverted to in-progress');
            
            // Reload the page to show updated state
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } else {
            // Reset button
            this.disabled = false;
            this.innerHTML = originalText;
            showMessage('error', 'Error reverting task: ' + (data.message || 'Unknown error'));
          }
        })
        .catch(error => {
          // Reset button
          this.disabled = false;
          this.innerHTML = originalText;
          showMessage('error', 'Error reverting task. Please try again.');
        });
      }
    });
  });
}

function initialiseTaskCards() {
  const taskCards = document.querySelectorAll('.bg-white[data-task-id]');
  
  taskCards.forEach(card => {
    card.addEventListener('click', function(e) {
      // Don't navigate if clicking on the revert button
      if (e.target.closest('.revertTaskBtn')) {
        return;
      }
      
      // Otherwise navigate to task details
      const taskId = this.dataset.taskId;
      window.location.href = `/task/${taskId}`;
    });
  });
}

// Add CSS to make the page transitions smoother
document.head.insertAdjacentHTML('beforeend', `
  <style>
    .file-item {
      transition: opacity 0.3s ease;
    }
    
    .bg-white, .notification-item {
      transition: opacity 0.3s ease;
    }
    
    .upload-message {
      margin-top: 0.5rem;
      padding: 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
    }
    
    /* Status badge for pending approval */
    .bg-yellow-50 {
      background-color: #fffbeb;
    }
    
    .text-yellow-700 {
      color: #b45309;
    }
    
    /* Ensure message notifications are visible */
    .fixed {
      z-index: 9999;
    }
  </style>
`);