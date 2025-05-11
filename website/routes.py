from flask import Blueprint, render_template, request, redirect, url_for, jsonify
from .models import Project, Task, User, Activity, Subtask
from flask_login import login_required, current_user
from . import db # Import the db object
from website.models import Project, Task, Subtask  # Add Subtask here
from datetime import datetime

routes = Blueprint('routes', __name__)

@routes.route('/')
def index():
    return render_template('index.html')

@routes.route('/invite_user', methods=['POST'])
@login_required
def invite_user():
    # Get the form data
    project_id = request.json.get('project_id')
    user_search = request.json.get('userSearch')

    # Ensure the project belongs to the current user
    project = Project.query.filter_by(id=project_id, owner_id=current_user.id).first_or_404()

    # Look up the user by username or email
    user = User.query.filter((User.username == user_search) | (User.email == user_search)).first()

    if not user:
        return jsonify({'status': 'error', 'message': 'User not found'}), 404

    # Prevent users from inviting themselves
    if user.id == current_user.id:
        return jsonify({'status': 'error', 'message': 'You cannot invite yourself'}), 400

    # Check if the user is already invited
    existing_invite = Activity.query.filter_by(userId=user.id, projectId=project.id, action="Invite sent").first()
    if existing_invite:
        return jsonify({'status': 'error', 'message': 'User already invited'}), 400

    # Create an invite activity
    invite_activity = Activity(
        userId=user.id,
        projectId=project.id,
        action="Invite sent"
    )

    db.session.add(invite_activity)
    db.session.commit()

    return jsonify({'status': 'success', 'message': 'User successfully invited'})

@routes.route('/inbox')
@login_required
def inbox():
    # Fetch invites for the current user
    invites = db.session.query(
        Project.name.label('project_name'),
        User.username.label('inviter_name'),
        Activity.id.label('invite_id')
    ).join(User, User.id == Activity.userId) \
     .join(Project, Project.id == Activity.projectId) \
     .filter(Activity.action == 'Invite sent', Activity.userId == current_user.id) \
     .all()

    # Render the inbox template with the invites
    return render_template('inbox.html', invites=invites)

@routes.route('/dashboard')
@login_required
def dashboard():
    # Get projects owned by the current user or where they are a collaborator
    projects = Project.query.filter(
        (Project.owner_id == current_user.id) | 
        (Project.collaborators.any(id=current_user.id))
    ).all()
    
    # Get completed tasks for the user's projects
    comTasks = Task.query.filter(Task.parentProject.in_(
        [project.id for project in projects]
    ), Task.status == 1).all()
    
    # Get all tasks for the user's projects
    totalTasks = Task.query.filter(Task.parentProject.in_(
        [project.id for project in projects]
    )).all()
    
    return render_template(
        'dashboard.html',
        user=current_user,
        projects=projects,
        comTasks=comTasks,
        totalTasks=totalTasks
    )

@routes.route('/projects')
@login_required
def projects():
    # Get projects owned by the current user or where they are a collaborator
    projects = Project.query.filter(
        (Project.owner_id == current_user.id) | 
        (Project.collaborators.any(id=current_user.id))
    ).all()
    
    return render_template('project.html', projects=projects, user=current_user)
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
        tasksCompleted=tasksCompleted,
        owner_id=current_user.id  # Set the owner to the current user
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

    db.session.add(new_task)
    db.session.flush()

    new_activity = Activity(
        userId=current_user.id,
        projectId=parentProject,
        taskId=new_task.id,
        action=f"New task added"
    )

    print("New task created: ", new_task.name, new_task.collabs, new_task.dueDate, new_task.parentProject)
    # Add the new task to the database session and commit
    db.session.add(new_activity)
    db.session.commit()

    return jsonify({'message': 'Task created successfully'})

@routes.route('/project_view/<int:project_id>')
@login_required
def project_view(project_id):
    # Ensure the user is either the owner or a collaborator
    project = Project.query.filter(
        (Project.id == project_id) & 
        ((Project.owner_id == current_user.id) | 
         (Project.collaborators.any(id=current_user.id)))
    ).first_or_404()

    tasks = Task.query.filter_by(parentProject=project.id).all()
    return render_template('project_view.html', project=project, tasks=tasks)

@routes.route('/completeTask', methods=['POST'])
def completeTask():
    task_id = request.form.get('task_id')
    task = Task.query.get_or_404(task_id)
    project = Project.query.get_or_404(task.parentProject)


    completed_activity = Activity(
        userId=current_user.id,
        projectId=project.id,
        taskId=task.id,
        action=f"Task completed!"
    )
    # Update the task status to completed
    task.status = 1
    project.tasksActive -= 1
    project.tasksCompleted += 1
    db.session.add(completed_activity)
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
    
    #Still need this for the base.html count on the side
    projects = Project.query.all()
    
    # Get subtasks for this task
    subtasks = Subtask.query.filter_by(taskId=task_id).all()
    
    # For now, we're just simulating evidence files
    evidence_files = []
    
    return render_template(
        'task_detail.html',
        task=task,
        project=project,
        projects=projects,
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

@routes.route('/accept_invite/<int:invite_id>', methods=['POST'])
@login_required
def accept_invite(invite_id):
    # Fetch the invite activity
    invite = Activity.query.get_or_404(invite_id)

    # Ensure the invite is for the current user
    if invite.userId != current_user.id:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403

    # Add the user as a collaborator to the project
    project = Project.query.get_or_404(invite.projectId)
    if current_user not in project.collaborators:
        project.collaborators.append(current_user)

    # Update the activity to indicate the invite was accepted
    invite.action = "Invite accepted"
    db.session.commit()

    return redirect(url_for('routes.inbox'))


@routes.route('/reject_invite/<int:invite_id>', methods=['POST'])
@login_required
def reject_invite(invite_id):
    # Fetch the invite activity
    invite = Activity.query.get_or_404(invite_id)

    # Ensure the invite is for the current user
    if invite.userId != current_user.id:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403

    # Update the activity to indicate the invite was rejected
    invite.action = "Invite rejected"
    db.session.commit()

    return redirect(url_for('routes.inbox'))