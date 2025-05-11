// website/static/js/task_detail.js

document.addEventListener('DOMContentLoaded', function() {
    // Evidence files modal
    const viewFilesButtons = document.querySelectorAll('.view-files-btn');
    const evidenceModal = document.getElementById('evidence-modal');
    const closeEvidenceModal = document.getElementById('close-evidence-modal');
    
    viewFilesButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const subtaskId = this.dataset.subtaskId;
        const subtaskName = this.closest('div').parentElement.querySelector('span').textContent.trim();
        
        // Update modal title
        document.getElementById('evidence-modal-title').textContent = `Task: ${document.title.split(' - ')[0]} > ${subtaskName}`;
        
        // Show modal
        evidenceModal.classList.remove('hidden');
      });
    });
    
    if (closeEvidenceModal) {
      closeEvidenceModal.addEventListener('click', function() {
        evidenceModal.classList.add('hidden');
      });
    }
    
    // File upload functionality
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
        console.log('Files dropped:', files);
        
        if (files.length > 0) {
          alert(`${files.length} file(s) ready to upload`);
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
            alert(`${this.files.length} file(s) ready to upload`);
          }
        });
      });
    });
    
    // Complete task button
    const complTaskBtn = document.querySelector('.complTaskBtn');
    if (complTaskBtn) {
      complTaskBtn.addEventListener('click', function() {
        const taskId = this.dataset.taskId;
        
        fetch('/completeTask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'task_id': taskId
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.message === 'Task completed successfully') {
            window.location.reload();
          } else {
            alert('Error completing task');
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
      });
    }
    
    // Complete subtask buttons
    const completeSubtaskBtns = document.querySelectorAll('.completeSubtaskBtn');
    completeSubtaskBtns.forEach(button => {
      button.addEventListener('click', function() {
        const subtaskId = this.dataset.subtaskId;
        
        fetch('/update_subtask_status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'subtaskId': subtaskId,
            'status': 1
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
        .catch(error => {
          console.error('Error:', error);
        });
      });
    });
    
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
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
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
        .catch(error => {
          console.error('Error:', error);
        });
      });
    }
  });