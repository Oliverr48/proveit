// Streamlined task_detail.js with clickable subtask icons

document.addEventListener('DOMContentLoaded', function() {
  // Initialise all components
  initialiseFileUpload();
  initialiseEvidenceModal();
  initialiseTaskControls();
  initialiseSubtaskIcons(); // Add subtask icon click handling
});

// Make only the circular subtask icons clickable
function initialiseSubtaskIcons() {
  // Get only the circle icons (both complete and incomplete)
  const incompleteCircles = document.querySelectorAll('.subtask-incomplete');
  const completeCircles = document.querySelectorAll('.subtask-complete');
  
  // Make incomplete circles clickable (mark as complete)
  incompleteCircles.forEach(circle => {
      circle.style.cursor = 'pointer';
      
      circle.addEventListener('click', function() {
          const subtaskContainer = this.closest('div.flex.items-center.justify-between');
          const subtaskId = subtaskContainer.querySelector('[data-subtask-id]').dataset.subtaskId;
          
          updateSubtaskStatus(subtaskId, 1); // 1 = complete
      });
  });
  
  // Make complete circles clickable (mark as incomplete)
  completeCircles.forEach(circle => {
      circle.style.cursor = 'pointer';
      
      circle.addEventListener('click', function() {
          const subtaskContainer = this.closest('div.flex.items-center.justify-between');
          const subtaskId = subtaskContainer.querySelector('[data-subtask-id]').dataset.subtaskId;
          
          updateSubtaskStatus(subtaskId, 0); // 0 = incomplete
      });
  });
  
  // Ensure no other tick elements are clickable
  document.querySelectorAll('.subtask-tick, .subtask-checkbox').forEach(tick => {
      // Remove any existing click event listeners by cloning and replacing
      const newTick = tick.cloneNode(true);
      tick.parentNode.replaceChild(newTick, tick);
      
      // Make sure it doesn't look clickable
      newTick.style.cursor = 'default';
  });
}

// Helper function to update subtask status
function updateSubtaskStatus(subtaskId, status) {
  fetch('/update_subtask_status', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
          'subtaskId': subtaskId,
          'status': status
      })
  })
  .then(response => response.json())
  .then(data => {
      if (data.status === 'success') {
          window.location.reload();
      } else {
          alert('Error updating subtask status');
      }
  })
  .catch(error => console.error('Error:', error));
}

// Initialise evidence modal
function initialiseEvidenceModal() {
  const viewFilesButtons = document.querySelectorAll('.view-files-btn');
  const evidenceModal = document.getElementById('evidence-modal');
  const closeEvidenceModal = document.getElementById('close-evidence-modal');
  
  // Set up event listeners for opening modal
  viewFilesButtons.forEach(button => {
      button.addEventListener('click', function(e) {
          e.preventDefault();
          const subtaskId = this.dataset.subtaskId;
          const subtaskName = this.closest('div').querySelector('span').textContent.trim();
          
          // Set modal title and subtask ID
          document.getElementById('evidence-modal-title').textContent = `Task: ${document.title.split(' - ')[0]} > ${subtaskName}`;
          document.getElementById('modalSubtaskId').value = subtaskId;
          
          // Show modal and load files
          evidenceModal.classList.remove('hidden');
          loadFiles('/get_subtask_files/' + subtaskId, 'modal-file-list');
      });
  });
  
  // Set up modal close
  if (closeEvidenceModal) {
      closeEvidenceModal.addEventListener('click', function() {
          evidenceModal.classList.add('hidden');
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

// Initialise file upload components
function initialiseFileUpload() {
  // Set up drop zones
  initialiseDropZone('drop-zone', 'fileInput');
  initialiseDropZone('modal-drop-zone', 'modalFileInput');
  
  // Main upload form
  const uploadForm = document.getElementById('uploadEvidenceForm');
  if (uploadForm) {
      uploadForm.addEventListener('submit', function(e) {
          e.preventDefault();
          uploadFiles(this);
      });
  }
  
  // Load task files
  const existingFiles = document.getElementById('existingFiles');
  if (existingFiles) {
      const taskId = existingFiles.dataset.taskId;
      if (taskId) {
          loadFiles('/get_task_files/' + taskId, 'existingFiles');
      }
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
          // Update file input for form submission
          const dataTransfer = new DataTransfer();
          Array.from(files).forEach(file => dataTransfer.items.add(file));
          fileInput.files = dataTransfer.files;
          
          // Show file count alert
          alert(`${files.length} file(s) ready to upload`);
      }
  });
  
  // Handle click to select files
  dropZone.addEventListener('click', function() {
      fileInput.click();
  });
  
  // Display selected files
  fileInput.addEventListener('change', function() {
      if (this.files.length > 0) {
          alert(`${this.files.length} file(s) ready to upload`);
      }
  });
}

// Upload files using FormData and XHR
function uploadFiles(form) {
  const formData = new FormData(form);
  const xhr = new XMLHttpRequest();
  
  xhr.open('POST', '/upload_evidence', true);
  
  xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          alert('Files uploaded successfully!');
          
          // Reload files
          if (form.id === 'modalUploadForm') {
              const subtaskId = document.getElementById('modalSubtaskId').value;
              loadFiles('/get_subtask_files/' + subtaskId, 'modal-file-list');
          } else {
              const taskId = document.getElementById('existingFiles').dataset.taskId;
              loadFiles('/get_task_files/' + taskId, 'existingFiles');
          }
          
          // Reset form
          form.reset();
      } else {
          alert('Error uploading files. Please try again.');
      }
  };
  
  xhr.onerror = function() {
      alert('Connection error. Please try again.');
  };
  
  xhr.send(formData);
}

// Load files from server
function loadFiles(url, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Show loading indicator
  container.innerHTML = '<p class="text-gray-500 text-center">Loading files...</p>';
  
  fetch(url)
      .then(response => response.json())
      .then(data => {
          if (data.files && data.files.length > 0) {
              // Clear container
              container.innerHTML = '';
              
              // Add each file
              data.files.forEach(function(file) {
                  const fileItem = document.createElement('div');
                  fileItem.className = 'file-item';
                  fileItem.innerHTML = `
                      <div class="file-icon">${file.extension.toUpperCase()}</div>
                      <div class="flex-1">
                          <div class="text-sm font-medium text-gray-800">${file.filename}</div>
                          <div class="text-xs text-gray-500">${file.size} • Uploaded by ${file.uploaded_by} on ${file.upload_date}</div>
                      </div>
                      <div class="flex items-center">
                          <a href="/download_file/${file.id}" class="text-gray-400 hover:text-gray-600 mx-2">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                              </svg>
                          </a>
                          ${file.can_delete ? `
                          <button class="text-gray-400 hover:text-gray-600 delete-file-btn" data-file-id="${file.id}">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                          </button>
                          ` : ''}
                      </div>
                  `;
                  container.appendChild(fileItem);
              });
              
              // Add delete event handlers
              addDeleteHandlers();
          } else {
              container.innerHTML = '<p class="text-gray-500">No files uploaded yet.</p>';
          }
      })
      .catch(error => {
          container.innerHTML = '<p class="text-red-500">Error loading files.</p>';
      });
}

// Add event handlers to delete buttons
function addDeleteHandlers() {
  document.querySelectorAll('.delete-file-btn').forEach(button => {
      button.addEventListener('click', function() {
          if (confirm('Are you sure you want to delete this file?')) {
              const fileId = this.dataset.fileId;
              
              fetch('/delete_file/' + fileId, {
                  method: 'POST',
                  headers: {'Content-Type': 'application/x-www-form-urlencoded'}
              })
              .then(response => response.json())
              .then(data => {
                  if (data.success) {
                      const fileItem = this.closest('.file-item');
                      if (fileItem) fileItem.remove();
                  } else {
                      alert('Error deleting file: ' + data.message);
                  }
              })
              .catch(error => {
                  alert('Error deleting file.');
              });
          }
      });
  });
}

// Initialise task controls (complete task button and add subtask form)
function initialiseTaskControls() {
  // Complete task button
  const complTaskBtn = document.querySelector('.complTaskBtn');
  if (complTaskBtn) {
      complTaskBtn.addEventListener('click', function() {
          const taskId = this.dataset.taskId;
          
          fetch('/completeTask', {
              method: 'POST',
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              body: new URLSearchParams({'task_id': taskId})
          })
          .then(response => response.json())
          .then(data => {
              if (data.message === 'Task completed successfully') {
                  window.location.reload();
              } else {
                  alert('Error completing task');
              }
          })
          .catch(error => console.error('Error:', error));
      });
  }
  
  // Add subtask form
  const addSubtaskForm = document.querySelector('.add-subtask-form');
  if (addSubtaskForm) {
      addSubtaskForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const taskId = this.dataset.taskId;
          const subtaskName = this.querySelector('input[name="subtaskName"]').value;
          
          if (!subtaskName.trim()) return;
          
          fetch('/create_subtask', {
              method: 'POST',
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              body: new URLSearchParams({
                  'taskId': taskId,
                  'subtaskName': subtaskName
              })
          })
          .then(response => response.json())
          .then(data => {
              if (data.status === 'success') {
                  window.location.reload();
              } else {
                  alert('Error creating subtask: ' + data.message);
              }
          })
          .catch(error => console.error('Error:', error));
      });
  }
}