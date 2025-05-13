// JS for handling events within each project - e.g adding tasks 

document.addEventListener('DOMContentLoaded', function() {
  // Apply project card hover effects
 
  
  // Initialize the "New Project" button
  initializeAddTaskButton();

  //Initialize the project detail view button
  initializeTaskCompleteButton();

});


function initializeAddTaskButton() {
  const addTaskBtn = document.getElementById('newTaskBtn');
  var modal = document.getElementById('modalAddTask');
  
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', function () {

      modal.classList.remove('hidden');
      modal.style.display = 'flex';

      // Close button listener
      modal.querySelector('#closeModalBtn').addEventListener('click', function () {

        modal.classList.add('hidden');
        modal.style.display = 'none';
      });
    });
  }
}

function initializeTaskCompleteButton() {
  const completeTaskBtn = document.getElementById('complTaskBtn'); 
  
  if (completeTaskBtn) {
    completeTaskBtn.addEventListener('click', function () {
      
      $.ajax({
        url: '/completeTask',
        type: 'POST',
        data: {task_id: this.dataset.taskId },
        success: function (response) {
          //alert('Project completed successfully!');
          location.reload(); // Refresh to show the updated project status
        },
        error: function (error) {
          alert('Error completing project: ' + error.responseText);
        }
      })
    });
  }
}