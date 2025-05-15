import pytest
import time
from website.models import User, Project, Task, Subtask
from website import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

def test_new_user(app):
    """Test creating a new user."""
    with app.app_context():
        # Create a new user with unique email and username using timestamp
        timestamp = int(time.time())
        unique_email = f"new_{timestamp}@example.com"
        unique_username = f"newuser_{timestamp}"
        
        user = User(
            email=unique_email,
            username=unique_username,
            firstName='New',
            lastName='User',
            password=generate_password_hash('securepassword')
        )
        db.session.add(user)
        db.session.commit()
        
        # Query the user
        saved_user = User.query.filter_by(email=unique_email).first()
        
        # Assertions
        assert saved_user is not None
        assert saved_user.username == unique_username
        assert saved_user.firstName == 'New'
        assert saved_user.lastName == 'User'
        assert check_password_hash(saved_user.password, 'securepassword')
        assert not check_password_hash(saved_user.password, 'wrongpassword')

def test_user_project_relationship(app):
    """Test the relationship between users and projects."""
    with app.app_context():
        # Get test user
        user = User.query.filter_by(email='test@example.com').first()
        
        # Create projects owned by the user
        project1 = Project(
            name='Project 1',
            description='First test project',
            dueDate='2025-12-31',
            tasksActive=0,
            tasksCompleted=0,
            owner_id=user.id
        )
        
        project2 = Project(
            name='Project 2',
            description='Second test project',
            dueDate='2025-12-31',
            tasksActive=0,
            tasksCompleted=0,
            owner_id=user.id
        )
        
        db.session.add_all([project1, project2])
        db.session.commit()
        
        # Get the user's projects
        user_projects = Project.query.filter_by(owner_id=user.id).all()
        
        # Assertions
        assert len(user_projects) >= 2  # Changed to >= since other tests may create projects
        assert 'Project 1' in [p.name for p in user_projects]
        assert 'Project 2' in [p.name for p in user_projects]

def test_project_task_relationship(app, test_project):
    """Test the relationship between projects and tasks."""
    with app.app_context():
        # Use the project ID to get a fresh project instance
        project_id = test_project.id
        project = Project.query.get(project_id)
        
        # Create tasks for the project
        task1 = Task(
            name='Task 1',
            description='First test task',
            dueDate='2025-12-31',
            status=0,  # In progress
            parentProject=project.id,
            collabs='Test User'  # Required field
        )
        
        task2 = Task(
            name='Task 2',
            description='Second test task',
            dueDate='2025-12-31',
            status=0,  # In progress
            parentProject=project.id,
            collabs='Test User'  # Required field
        )
        
        db.session.add_all([task1, task2])
        
        # Update project task counters
        project.tasksActive = 2  
        db.session.commit()
        
        # Get project tasks
        project_tasks = Task.query.filter_by(parentProject=project.id).all()
        
        # Assertions
        assert len(project_tasks) == 2
        assert 'Task 1' in [t.name for t in project_tasks]
        assert 'Task 2' in [t.name for t in project_tasks]
        assert project.tasksActive == 2

def test_task_subtask_relationship(app, test_project):
    """Test the relationship between tasks and subtasks."""
    with app.app_context():
        # Use the project ID to get a fresh project instance
        project_id = test_project.id
        project = Project.query.get(project_id)
        
        # Create a task
        task = Task(
            name='Main Task',
            description='A task with subtasks',
            dueDate='2025-12-31',
            status=0,  # In progress
            parentProject=project.id,
            collabs='Test User'  # Required field
        )
        db.session.add(task)
        db.session.flush()  # Get task ID without committing
        
        # Create subtasks
        subtask1 = Subtask(
            name='Subtask 1',
            taskId=task.id,
            status=0  # Incomplete
        )
        
        subtask2 = Subtask(
            name='Subtask 2',
            taskId=task.id,
            status=0  # Incomplete
        )
        
        db.session.add_all([subtask1, subtask2])
        db.session.commit()
        
        # Get subtasks
        task_subtasks = Subtask.query.filter_by(taskId=task.id).all()
        
        # Assertions
        assert len(task_subtasks) == 2
        assert 'Subtask 1' in [s.name for s in task_subtasks]
        assert 'Subtask 2' in [s.name for s in task_subtasks]

def test_task_completion(app, test_project):
    """Test marking a task as complete."""
    with app.app_context():
        # Use the project ID to get a fresh project instance
        project_id = test_project.id
        project = Project.query.get(project_id)
        
        # Create a task
        task = Task(
            name='Completable Task',
            description='A task to be completed',
            dueDate='2025-12-31',
            status=0,  # In progress
            parentProject=project.id,
            collabs='Test User'  # Required field
        )
        db.session.add(task)
        
        # Update project counters
        project.tasksActive = 1
        project.tasksCompleted = 0
        db.session.commit()
        
        # Mark the task as complete
        task.status = 1  # Completed
        project.tasksActive -= 1
        project.tasksCompleted += 1
        db.session.commit()
        
        # Retrieve updated task and project
        updated_task = Task.query.get(task.id)
        updated_project = Project.query.get(project.id)
        
        # Assertions
        assert updated_task.status == 1
        assert updated_project.tasksActive == 0
        assert updated_project.tasksCompleted == 1