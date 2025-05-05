from flask import Blueprint, render_template, request, redirect, url_for, jsonify
from .models import Project, Task
from flask_login import login_required, current_user
from . import db # Import the db object

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

@routes.route('/submitNewProject', methods=['POST'])
def submitNewProject():
    print("Are we here???")
    # Get the form data
    name = request.form['projectName']
    description = request.form['projectDescription']
    dueDate = request.form['projectDueDate']
    tasksActive = 0  # Assuming you want to initialize this to 0 when creating a new project
    tasksCompleted = 0  # Assuming you want to initialize this to 0 when creating a new project
    # Create a new project instance
    new_project = Project(
        name=name,
        description=description,
        dueDate=dueDate,
        tasksActive=tasksActive,
        tasksCompleted=tasksCompleted
    )

    # Add the new project to the database session and commit
    db.session.add(new_project)
    db.session.commit()

    return jsonify({'message': 'Project created successfully'})

@routes.route('/project_view/<int:project_id>')
def project_view(project_id):
    project = Project.query.get_or_404(project_id)
    tasks = Task.query.filter_by(parentProject=project_id).all()
    return render_template('project_view.html', project=project, tasks=tasks, user=current_user)

