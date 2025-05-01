from flask import Blueprint, render_template, request, redirect, url_for
from .models import Project, Task
from flask_login import login_required, current_user

routes = Blueprint('routes', __name__)

@routes.route('/')
def index():
    return render_template('index.html')

@routes.route('/dashboard')
@login_required
def dashboard():
    projects = Project.query.all()
    comTasks = Task.query.filter_by(status=1)
    totalTasks = Task.query.all()
    return render_template('dashboard.html', user=current_user, projects=projects, comTasks=comTasks, totalTasks=totalTasks)

@routes.route('/projects')
@login_required
def projects():
    #Get the projs from the DB 
    projects = Project.query.all()
    # May need to update this in future to get tasks only for active projects? 
    comTasks = Task.query.filter_by(status=1)
    print("Got the projects!")
    return render_template('project.html', projects=projects, comTasks=comTasks, user=current_user)

