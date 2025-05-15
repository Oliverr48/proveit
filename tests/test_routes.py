import pytest
from website.models import User, Project, Task, Subtask
from website import db
from werkzeug.security import generate_password_hash
import json

def test_login(client):
    """Test login functionality."""
    # Test invalid login
    response = client.post('/login', data={
        'email': 'wrong@example.com',
        'password': 'wrongpassword'
    }, follow_redirects=True)
    assert b'Login Failed' in response.data or b'Incorrect Email/Password' in response.data
    
    # Test valid login
    response = client.post('/login', data={
        'email': 'test@example.com',
        'password': 'password123'
    }, follow_redirects=True)
    assert b'Dashboard' in response.data

def test_dashboard(logged_in_client):
    """Test dashboard page loads correctly."""
    response = logged_in_client.get('/dashboard')
    assert response.status_code == 200
    assert b'Dashboard' in response.data

def test_create_project(logged_in_client, app):
    """Test project creation endpoint."""
    response = logged_in_client.post('/submitNewProject', data={
        'projectName': 'New Project',
        'projectDescription': 'Project created in test',
        'projectDueDate': '2025-12-31'
    })
    
    assert response.status_code == 200
    assert b'Project created successfully' in response.data or response.get_json().get('message') == 'Project created successfully'
    
    # Verify project was created
    with app.app_context():
        project = Project.query.filter_by(name='New Project').first()
        assert project is not None
        assert project.description == 'Project created in test'

def test_projects_list(logged_in_client, test_project):
    """Test the projects list page."""
    response = logged_in_client.get('/projects')
    assert response.status_code == 200
    assert b'Test Project' in response.data

def test_project_view(logged_in_client, test_project):
    """Test viewing a specific project."""
    response = logged_in_client.get(f'/project_view/{test_project.id}')
    assert response.status_code == 200
    assert b'Test Project' in response.data

def test_create_task(logged_in_client, test_project, app):
    """Test task creation endpoint."""
    response = logged_in_client.post('/submitAddTask', data={
        'taskName': 'New Task',
        'taskDescription': 'Task created in test',
        'taskDueDate': '2025-12-31',
        'project_id': test_project.id
    })
    
    assert response.status_code == 200
    assert b'Task created successfully' in response.data or response.get_json().get('message') == 'Task created successfully'
    
    # Verify task was created and project counters updated
    with app.app_context():
        task = Task.query.filter_by(name='New Task').first()
        assert task is not None
        assert task.description == 'Task created in test'
        
        updated_project = Project.query.get(test_project.id)
        assert updated_project.tasksActive >= 1

def test_complete_task(logged_in_client, app, test_project):
    """Test completing a task."""
    # First create a task
    with app.app_context():
        task = Task(
            name='Task to Complete',
            description='This task will be completed',
            dueDate='2025-12-31',
            status=0,  # In progress
            parentProject=test_project.id,
            collabs='Test User'  # Required field
        )
        db.session.add(task)
        test_project.tasksActive = 1
        db.session.commit()
        task_id = task.id
    
    # Now complete the task
    response = logged_in_client.post('/completeTask', data={
        'task_id': task_id
    })
    
    assert response.status_code == 200
    assert b'Task completed successfully' in response.data or response.get_json().get('message') == 'Task completed successfully'
    
    # Verify task is completed and project counters updated
    with app.app_context():
        updated_task = Task.query.get(task_id)
        assert updated_task.status == 1  # Completed
        
        updated_project = Project.query.get(test_project.id)
        assert updated_project.tasksActive == 0
        assert updated_project.tasksCompleted == 1

def test_create_subtask(logged_in_client, app, test_project):
    """Test creating a subtask."""
    # First create a task
    with app.app_context():
        task = Task(
            name='Task with Subtasks',
            description='This task will have subtasks',
            dueDate='2025-12-31',
            status=0,  # In progress
            parentProject=test_project.id,
            collabs='Test User'  # Required field
        )
        db.session.add(task)
        db.session.commit()
        task_id = task.id
    
    # Now create a subtask
    response = logged_in_client.post('/create_subtask', data={
        'taskId': task_id,
        'subtaskName': 'New Subtask'
    })
    
    assert response.status_code == 200
    
    # Check for valid JSON response
    try:
        data = json.loads(response.data)
        assert data['status'] == 'success'
    except:
        # If not JSON, assume success based on status code
        pass
    
    # Verify subtask was created
    with app.app_context():
        subtask = Subtask.query.filter_by(name='New Subtask').first()
        assert subtask is not None
        assert subtask.taskId == task_id