# To house any objects we may need as classes - e.g project or tasks! 
from . import db
from flask_login import UserMixin

# removed def __init__ from here in the below classes as it isn't in SQLAlchemy models (?)
class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    dueDate = db.Column(db.String(20), nullable=False)
    # number of total tasks in the project - this is a bit of a placeholder for now, but could be useful later on
    tasksActive = db.Column(db.Integer, nullable=False)
    tasksCompleted = db.Column(db.Integer, nullable=False)

    @property
    def progress(self): 
        if self.tasksActive == 0 and self.tasksCompleted == 0:
            return 0
        else:
            return (self.tasksCompleted / self.tasksActive) * 100 

    def __str__(self):
        return f"Project: {self.name}, Description: {self.description}, Start Date: {self.dueDate}"

class Task(db.Model):
    parentProject = db.Column(db.String(100), db.ForeignKey('project.id'), nullable=False)
    name = db.Column(db.String(100), primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    dueDate = db.Column(db.String(20), nullable=False)
    #0 represents in progress, 1 represents completed
    status = db.Column(db.Integer, nullable=False)
    
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)

    def __str__(self):
        return f"User: {self.username}, Email: {self.email}"