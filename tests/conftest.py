import pytest
import os
import tempfile
from website import create_app, db
from website.models import User, Project, Task, Subtask
from werkzeug.security import generate_password_hash

@pytest.fixture
def app():
    """Create and configure a Flask app for testing."""
    # Create a temporary file for the test database
    db_fd, db_path = tempfile.mkstemp()
    
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': f'sqlite:///{db_path}',
        'WTF_CSRF_ENABLED': False,  # Disable CSRF for testing
        'SERVER_NAME': 'localhost.localdomain',  # Required for url_for in tests
    })
    
    # Create the database and all tables
    with app.app_context():
        db.create_all()
        
        # Check if the test user already exists before creating it
        existing_user = User.query.filter_by(email='test@example.com').first()
        if not existing_user:
            # Create a test user with all required fields
            test_user = User(
                email='test@example.com', 
                username='testuser',
                firstName='Test',   # Add this
                lastName='User',    # Add this
                password=generate_password_hash('password123')
            )
            db.session.add(test_user)
            db.session.commit()
    
    yield app
    
    # Clean up
    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """A test CLI runner for the app."""
    return app.test_cli_runner()

@pytest.fixture
def auth(client):
    """Authentication helper for tests."""
    class AuthActions:
        def login(self, email='test@example.com', password='password123'):
            return client.post('/login', data={
                'email': email,
                'password': password
            }, follow_redirects=True)
            
        def logout(self):
            return client.get('/logout', follow_redirects=True)
            
    return AuthActions()

@pytest.fixture
def logged_in_client(client, auth):
    """A test client that's already logged in."""
    auth.login()
    return client

@pytest.fixture
def test_project(app):
    """Create a test project for the test user."""
    with app.app_context():
        user = User.query.filter_by(email='test@example.com').first()
        
        # Create a project
        project = Project(
            name='Test Project',
            description='A project for testing',
            dueDate='2025-12-31',
            tasksActive=0,
            tasksCompleted=0,
            owner_id=user.id
        )
        db.session.add(project)
        db.session.commit()
        
        # Get the ID before yielding (to avoid detached instance errors)
        project_id = project.id
        
        yield project