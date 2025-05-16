# To house any objects we may need as classes - e.g project or tasks! 
from . import db
from flask_login import UserMixin
from datetime import datetime

# Many-to-Many relationship table for project collaborators
project_collaborators = db.Table('project_collaborators',
    db.Column('project_id', db.Integer, db.ForeignKey('project.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True)
)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    dueDate = db.Column(db.String(20), nullable=False)
    # number of total tasks in the project - this is a bit of a placeholder for now, but could be useful later on
    tasksActive = db.Column(db.Integer, nullable=False)
    tasksCompleted = db.Column(db.Integer, nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Link project to a user
    # Whether task completion requires owner approval
    approval_required = db.Column(db.Boolean, default=True)

    owner = db.relationship('User', backref='projects')  # Relationship to access the owner of the project
    collaborators = db.relationship('User', secondary=project_collaborators, backref='collaborated_projects')

    @property
    def progress(self): 
        if (self.tasksActive == 0 and self.tasksCompleted == 0):
            return 0
        else:
            print (self.tasksCompleted / (self.tasksActive + self.tasksCompleted) * 100)
            return round((self.tasksCompleted / (self.tasksActive + self.tasksCompleted)*100),2)
            
    @property
    def pending_approval_count(self):
        """Count tasks pending approval"""
        from sqlalchemy import and_
        return Task.query.filter(
            and_(
                Task.parentProject == self.id,
                Task.status == 1,
                Task.approval_status == 0
            )
        ).count()

    def __str__(self):
        return f"Project: {self.name}, Description: {self.description}, Start Date: {self.dueDate}"


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.String(250), nullable=True)
    collabs = db.Column(db.String(150), nullable=False)
    dueDate = db.Column(db.DateTime, nullable=False)
    # Make this a proper foreign key
    parentProject = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    status = db.Column(db.Integer, nullable=False, default=0)  # 0=in progress, 1=completed
    approval_status = db.Column(db.Integer, nullable=False, default=0)  # 0=pending, 1=approved, 2=rejected
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # User who completed the task
    
    # Define relationships
    project = db.relationship('Project', backref='tasks', foreign_keys=[parentProject])
    user = db.relationship('User', backref='completed_tasks', foreign_keys=[user_id])

    @property
    def needs_approval(self):
        """Check if task needs approval based on status and who completed it"""
        if not self.project.approval_required:
            return False
        if self.status != 1:  # Only completed tasks can need approval
            return False
        if self.approval_status != 0:  # Must be in pending state
            return False
        if self.user_id == self.project.owner_id:  # Owner's tasks auto-approve
            return False
        return True
        
    def __repr__(self):
        return f'<Task {self.id}: {self.name}>'

class Subtask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.Integer, default=0)  # 0 for incomplete, 1 for complete
    taskId = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    
    # Add relationship to TaskFile
    files = db.relationship('TaskFile', backref='subtask', lazy=True, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<Subtask {self.name}>'

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    firstName = db.Column(db.String(100), nullable=False)
    lastName = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    
    # Add relationship to TaskFile
    files = db.relationship('TaskFile', backref='user', lazy=True)

    def __str__(self):
        return f"User: {self.username}, Email: {self.email}"

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    projectId = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    # taskId is nullable; e.g collaborators invited etc may not be task specific 
    taskId = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=True)
    action = db.Column(db.String(200), nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship('User', backref='activities')
    project = db.relationship('Project', backref='activities')
    task = db.relationship('Task', backref='activities')


# Add the TaskFile model
class TaskFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(512), nullable=False)
    file_size = db.Column(db.Integer)  # in bytes
    file_type = db.Column(db.String(50))  # e.g., "image", "document", etc.
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    subtask_id = db.Column(db.Integer, db.ForeignKey('subtask.id'), nullable=True)

