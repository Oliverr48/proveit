from flask import Blueprint, render_template, request, redirect, url_for, jsonify
from .models import Project, Task
from flask_login import login_required, current_user
from . import db # Import the db object
from website.models import Project, Task, Subtask  # Add Subtask here

routes = Blueprint('routes', __name__)

@routes.route('/')
def index():
    return render_template('index.html')

@routes.route('/dashboard')
@login_required
def dashboard():
    projects = Project.query.all()
    comTasks = Task.query.filter_by(status=1).all()
    totalTasks = Task.query.all()
    return render_template('dashboard.html', user=current_user, projects=projects, comTasks=comTasks, totalTasks=totalTasks)

@routes.route('/projects')
@login_required
def projects():
    #Get the projs from the DB 
    projects = Project.query.all()
    # May need to update this in future to get tasks only for active projects? 
    comTasks = Task.query.filter_by(status=1).all()
    print("Got the projects!")
    return render_template('project.html', projects=projects, comTasks=comTasks, user=current_user)

@routes.route('/submitNewProject', methods=['POST'])
def submitNewProject():
    print("Are we here???")
    # Get the form data
    name = request.form['projectName']
    description = request.form['projectDescription']
    dueDate = request.form['projectDueDate']
    tasksActive = 0  
    tasksCompleted = 0  
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

@routes.route('/submitAddTask', methods=['POST'])
def submitAddTask():
    # Get the form data
    print("We are here in the task submit bit!")
    name = request.form['taskName']
    collabs = request.form['taskCollabs']
    dueDate = request.form['taskDueDate']
    parentProject = request.form.get('project_id')  # Get the parent project ID from the form

    project = Project.query.get_or_404(parentProject)
    project.tasksActive += 1  # Increment the active tasks count for the project

    # Create a new task instance
    new_task = Task(
        name=name,
        collabs=collabs,
        dueDate=dueDate,
        parentProject=parentProject,
        status=0  
    )
    print("New task created: ", new_task.name, new_task.collabs, new_task.dueDate, new_task.parentProject)
    # Add the new task to the database session and commit
    db.session.add(new_task)
    db.session.commit()

    return jsonify({'message': 'Task created successfully'})

@routes.route('/project_view/<int:project_id>')
def project_view(project_id):
    project = Project.query.get_or_404(project_id)
    tasks = Task.query.filter_by(parentProject=project_id).all()
    return render_template('project_view.html', project=project, tasks=tasks, user=current_user)

@routes.route('/completeTask', methods=['POST'])
def completeTask():
    task_id = request.form.get('task_id')
    task = Task.query.get_or_404(task_id)
    project = Project.query.get_or_404(task.parentProject)

    # Update the task status to completed
    task.status = 1
    project.tasksActive -= 1
    project.tasksCompleted += 1
    db.session.commit()
    return jsonify({'message': 'Task completed successfully'})

@routes.route('/task/<int:task_id>')
@login_required
def task_detail(task_id):
    """
    Display the detailed view of a specific task with evidence files
    """
    # Get the task by ID
    task = Task.query.get_or_404(task_id)
    
    # Get the parent project
    project = Project.query.get_or_404(task.parentProject)
    
    # Get subtasks for this task
    subtasks = Subtask.query.filter_by(taskId=task_id).all()
    
    # For now, we're just simulating evidence files
    evidence_files = []
    
    return render_template(
        'task_detail.html',
        task=task,
        project=project,
        subtasks=subtasks,
        evidence_files=evidence_files,
        user=current_user
    )

@routes.route('/create_subtask', methods=['POST'])
def create_subtask():
    # Get form data
    task_id = request.form.get('taskId')
    subtask_name = request.form.get('subtaskName')
    
    if not task_id or not subtask_name:
        return jsonify({'status': 'error', 'message': 'Missing required fields'})
    
    # Create new subtask
    new_subtask = Subtask(
        name=subtask_name,
        taskId=task_id,
        status=0  
    )
    
    db.session.add(new_subtask)
    db.session.commit()
    
    return jsonify({'status': 'success', 'subtask': {'id': new_subtask.id, 'name': new_subtask.name}})

@routes.route('/update_subtask_status', methods=['POST'])
def update_subtask_status():
    subtask_id = request.form.get('subtaskId')
    status = request.form.get('status')
    
    if not subtask_id or status is None:
        return jsonify({'status': 'error', 'message': 'Missing required fields'})
    
    subtask = Subtask.query.get_or_404(subtask_id)
    subtask.status = int(status)
    db.session.commit()
    
    return jsonify({'status': 'success'})