# To house any objects we may need as classes - e.g project or tasks! 
from . import db
from flask_login import UserMixin

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

    owner = db.relationship('User', backref='projects')  # Relationship to access the owner of the project
    collaborators = db.relationship('User', secondary=project_collaborators, backref='collaborated_projects')

    @property
    def progress(self): 
        if (self.tasksActive == 0 and self.tasksCompleted == 0):
            return 0
        else:
            print (self.tasksCompleted / (self.tasksActive + self.tasksCompleted) * 100)
            return round((self.tasksCompleted / (self.tasksActive + self.tasksCompleted)*100),2)

    def __str__(self):
        return f"Project: {self.name}, Description: {self.description}, Start Date: {self.dueDate}"

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    parentProject = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    # The below will maybe have to be a drop down; a list of users??
    collabs = db.Column(db.String(200), nullable=False)
    dueDate = db.Column(db.String(20), nullable=False)
    # 0 represents in progress, 1 represents completed
    status = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(100), nullable=True)

    subtasks = db.relationship('Subtask', backref='task', lazy=True)  # Ensure 'Subtask' matches the class name
    project = db.relationship('Project', backref='tasks')

class Subtask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.Integer, default=0)  # 0 for incomplete, 1 for complete
    taskId = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    
    def __repr__(self):
        return f'<Subtask {self.name}>'

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    firstName = db.Column(db.String(100), nullable=False)
    lastName = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)

    def __str__(self):
        return f"User: {self.firstName} {self.lastName}, Username: {self.username}, Email: {self.email}"

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
    # task = db.relationship('Task', backref='activities')