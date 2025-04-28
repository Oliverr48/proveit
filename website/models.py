# To house any objects we may need as classes - e.g project or tasks! 
from . import db
from flask_login import UserMixin

# removed def __init__ from here in the below classes as it isn't in SQLAlchemy models (?)
class Project(db.Model):
    name = db.Column(db.String(100), primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    dueDate = db.Column(db.String(20), nullable=False)

    def __str__(self):
        return f"Project: {self.name}, Description: {self.description}, Start Date: {self.dueDate}"
    
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)

    def __str__(self):
        return f"User: {self.username}, Email: {self.email}"