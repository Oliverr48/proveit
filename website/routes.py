from flask import Blueprint, render_template, request, redirect, url_for, jsonify, current_app, send_from_directory
from .models import Project, Task, User, Activity, Subtask, TaskFile
from flask_login import login_required, current_user
from . import db # Import the db object
from website.models import Project, Task, Subtask  # Add Subtask here
from datetime import datetime, date
from werkzeug.utils import secure_filename
import os

routes = Blueprint('routes', __name__)



# Method for getting projects and invites for the base template, displaying notifications 
def getForBase():
    # Get projects owned by the current user or where they are a collaborator
    projects = Project.query.filter(
        (Project.owner_id == current_user.id) | 
        (Project.collaborators.any(id=current_user.id))
    ).all()

     # Get projects owned by the current user or where they are a collaborator
    projects = Project.query.filter(
        (Project.owner_id == current_user.id) | 
        (Project.collaborators.any(id=current_user.id))
    ).all()

    pending_approvals = db.session.query(
                Task.id.label('task_id'),
                Task.name.label('task_name'),
                Project.name.label('project_name'),
                User.username.label('completed_by')
            ).join(
                Project, Project.id == Task.parentProject
            ).join(
                User, User.id == Task.user_id
            ).filter(
                Project.owner_id == current_user.id,
                Task.status == 1,
                Task.approval_status == 0
            ).all()

    # Fetch invites for the current user
    invites = db.session.query(
        Project.name.label('project_name'),
        User.username.label('inviter_name'),
        Activity.id.label('invite_id')
    ).join(Project, Project.id == Activity.projectId
    ).join(User, User.id == Project.owner_id
    ).filter(
        Activity.action == 'Invite sent',
        Activity.userId == current_user.id
    ).all()
    
    return projects, invites, pending_approvals


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

    # Check if the user is already a collaborator
    if user in project.collaborators:
        return jsonify({'status': 'error', 'message': 'User already in project'}), 400

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

    projects = Project.query.filter(
        (Project.owner_id == current_user.id) | 
        (Project.collaborators.any(id=current_user.id))
    ).all()

    # Fetch invites for the current user
    invites = db.session.query(
        Project.name.label('project_name'),
        User.username.label('inviter_name'),
        Activity.id.label('invite_id')
    ).join(Project, Project.id == Activity.projectId
    ).join(User, User.id == Project.owner_id
    ).filter(
        Activity.action == 'Invite sent',
        Activity.userId == current_user.id
    ).all()

    # For project owners: Fetch tasks pending approval
    pending_approvals = []
    # Check if user owns any projects
    if Project.query.filter_by(owner_id=current_user.id).first():
        # Fixed query to properly join with User and add error handling
        try:
            pending_approvals = db.session.query(
                Task.id.label('task_id'),
                Task.name.label('task_name'),
                Project.name.label('project_name'),
                User.username.label('completed_by')
            ).join(
                Project, Project.id == Task.parentProject
            ).join(
                User, User.id == Task.user_id
            ).filter(
                Project.owner_id == current_user.id,
                Task.status == 1,
                Task.approval_status == 0
            ).all()
            
            # Log for debugging
            print(f"Found {len(pending_approvals)} tasks pending approval")
            
        except Exception as e:
            # Log the error
            print(f"Error fetching pending approvals: {str(e)}")
            pending_approvals = []

    return render_template('inbox.html', 
                          invites=invites, 
                          pending_approvals=pending_approvals,
                          projects=projects)

@routes.route('/dashboard')
@login_required
def dashboard():
   
    projects, invites, pending_approvals = getForBase()

    # Get completed tasks for the user's projects
    comTasks = Task.query.filter(Task.parentProject.in_(
        [project.id for project in projects]
    ), Task.status == 1).all()
    
    # Get all tasks for the user's projects
    totalTasks = Task.query.filter(Task.parentProject.in_(
        [project.id for project in projects]
    )).all()

    recentActivity = Activity.query.filter(Activity.projectId.in_([project.id for project in projects])).order_by(Activity.timestamp.desc()).limit(5).all()
    upcomingTasks = Task.query.filter(Task.parentProject.in_([project.id for project in projects]), Task.status == 0, Task.dueDate >= datetime.now()).order_by(Task.dueDate).limit(4).all()

    # Get the number of evidence files uploaded by the user 
    evidence_files_count = TaskFile.query.filter_by(user_id=current_user.id).count()

    return render_template(
        'dashboard.html',
        user=current_user,
        projects=projects,
        comTasks=comTasks,
        totalTasks=totalTasks,
        activities=recentActivity,
        upcomingTasks=upcomingTasks, 
        evidence_files_count=evidence_files_count,
        invites=invites, 
        pending_approvals=pending_approvals
    )

@routes.route('/projects')
@login_required
def projects():
    # Get projects owned by the current user or where they are a collaborator
    
    projects, invites, pending_approvals = getForBase()
    
    
    # Get completed tasks for the user's projects
    comTasks = Task.query.filter(Task.parentProject.in_(
        [project.id for project in projects]
    ), Task.status == 1).all()
    
    # Get all tasks for the user's projects
    totalTasks = Task.query.filter(Task.parentProject.in_(
        [project.id for project in projects]
    )).all()

    allPending = db.session.query(
    Task.id.label('task_id'),
    Task.name.label('task_name'),
    Project.name.label('project_name'),
    User.username.label('completed_by')
    ).join(
        Project, Project.id == Task.parentProject
    ).join(
        User, User.id == Task.user_id
    ).filter(
        (Project.owner_id == current_user.id) | 
        (Project.collaborators.any(id=current_user.id)),
        Project.approval_required == True,
        Task.status == 1,  # completed
        Task.approval_status == 0  # pending approval  
    ).all()

    today = date.today().isoformat()
    return render_template('project.html', projects=projects, comTasks=comTasks, today=today, invites=invites, totalTasks=totalTasks, pending_approvals=pending_approvals, allPending=allPending)


# Function handling form submission to the new project table
@routes.route('/submitNewProject', methods=['POST'])
def submitNewProject():
    #print("Are we here???")
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

    db.session.add(new_project)
    db.session.flush()  # Flush to get the new project's ID for the activity log

    # Create an activity log for the project creation
    new_activity = Activity(
        userId=current_user.id,
        projectId=new_project.id,
        action=f"New project created: {name}"
    )

    # Add the new project to the database session and commit
    db.session.add(new_activity)
    db.session.commit()

    return jsonify({'message': 'Project created successfully'})

# Same as above; for tasks assigned to individual projects 
@routes.route('/submitAddTask', methods=['POST'])
def submitAddTask():
    # Get the form data
    name = request.form['taskName']
    description = request.form['taskDescription']
    
    # Convert string date to Python datetime object
    dueDate_str = request.form['taskDueDate']
    dueDate = datetime.strptime(dueDate_str, '%Y-%m-%d')
    
    parentProject = request.form.get('project_id')

    project = Project.query.get_or_404(parentProject)
    project.tasksActive += 1  # Increment the active tasks count for the project

    # Create a new task instance
    new_task = Task(
        name=name,
        description=description,
        collabs="Unassigned",
        dueDate=dueDate,  # Now using the datetime object
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

    projects, invites, pending_approvals = getForBase()

    tasks = Task.query.filter_by(parentProject=project.id).all()
    
    # Add subtask counts to each task
    for task in tasks:
        task.subtask_count = Subtask.query.filter_by(taskId=task.id).count()
        
    return render_template('project_view.html', project=project, tasks=tasks, projects=projects, invites=invites, pending_approvals=pending_approvals)

# In routes.py - Update the completeTask route
@routes.route('/completeTask', methods=['POST'])
@login_required
def completeTask():
    task_id = request.form.get('task_id')
    task = Task.query.get_or_404(task_id)
    project = Project.query.get_or_404(task.parentProject)

    # Update the task status to completed
    task.status = 1
    
    # Set the user who completed the task
    task.user_id = current_user.id
    
    # Debug log
    print(f"Project approval required: {project.approval_required}")
    print(f"Current user is owner: {project.owner_id == current_user.id}")
    
    # Set approval status based on project settings and who completed the task
    requires_approval = project.approval_required and project.owner_id != current_user.id
    
    if requires_approval:
        task.approval_status = 0  # Pending approval
        action_text = "Task marked complete - awaiting approval"
    else:
        task.approval_status = 1  # Auto-approved
        project.tasksActive -= 1
        project.tasksCompleted += 1
        action_text = "Task completed and approved"

    # Create activity record
    completed_activity = Activity(
        userId=current_user.id,
        projectId=project.id,
        taskId=task.id,
        action=action_text
    )
    
    db.session.add(completed_activity)
    db.session.commit()
    
    return jsonify({
        'message': action_text,
        'requires_approval': project.approval_required and project.owner_id != current_user.id,
        'approval_status': task.approval_status
    })

# We render the same template but change info based on task_id
@routes.route('/task/<int:task_id>')
@login_required
def task_detail(task_id):
    """
    Display the detailed view of a specific task with evidence files
    """

    projects, invites, pending_approvals = getForBase()

    # Get the task by ID
    task = Task.query.get_or_404(task_id)
    
    # Get the parent project
    project = Project.query.get_or_404(task.parentProject)
    
    #Still need this for the base.html count on the side
    projects = Project.query.all()
    
    # Get subtasks for this task
    subtasks = Subtask.query.filter_by(taskId=task_id).all()
    
    # For now, we're just simulating evidence files
    evidence_files = TaskFile.query.filter_by(task_id=task_id).all()
    
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
    # 1. Grab the invite
    invite = Activity.query.get_or_404(invite_id)

    # 2. Make sure it’s really for the logged-in user
    if invite.userId != current_user.id:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403

    # 3. Add the user as a collaborator on the target project
    project = Project.query.get_or_404(invite.projectId)

    # project.collaborators is a list of User instances
    if current_user not in project.collaborators:
        project.collaborators.append(current_user)

    # 4. Mark the invite as accepted (or set a flag if you have one)
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

@routes.route('/leave_project/<int:project_id>', methods=['POST'])
@login_required
def leave_project(project_id):
    # Fetch the project
    project = Project.query.get_or_404(project_id)

    # Ensure the user is not the owner of the project
    if project.owner_id == current_user.id:
        return jsonify({'status': 'error', 'message': 'You cannot leave your own project'}), 403

    # Remove the user from the collaborators
    if current_user in project.collaborators:
        project.collaborators.remove(current_user)
        db.session.commit()
        return redirect(url_for('routes.projects'))

    return jsonify({'status': 'error', 'message': 'You are not a collaborator on this project'}), 400

@routes.route('/delete_project/<int:project_id>', methods=['POST'])
@login_required
def delete_project(project_id):
    # Fetch the project
    project = Project.query.get_or_404(project_id)

    # Ensure the user is the owner of the project
    if project.owner_id != current_user.id:
        return jsonify({'status': 'error', 'message': 'You are not authorized to delete this project'}), 403

    # Delete all evidence files (TaskFile) and remove files from disk
    tasks = Task.query.filter_by(parentProject=project.id).all()
    for task in tasks:
        task_files = TaskFile.query.filter_by(task_id=task.id).all()
        for task_file in task_files:
            try:
                os.remove(task_file.filepath)
            except Exception:
                pass  # Ignore if file doesn't exist
            db.session.delete(task_file)
        # Delete subtasks (if you want to be explicit)
        Subtask.query.filter_by(taskId=task.id).delete()

    # Delete tasks
    Task.query.filter_by(parentProject=project.id).delete()
    # Delete activities
    Activity.query.filter_by(projectId=project.id).delete()
    # Finally, delete the project
    db.session.delete(project)
    db.session.commit()

    return redirect(url_for('routes.projects'))




upload = Blueprint('upload', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf', 'txt', 'zip'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload.route('/upload_evidence', methods=['POST'])
def upload_evidence():
    files = request.files.getlist('files[]')
    task_id = request.form.get('task_id')
    subtask_id = request.form.get('subtask_id') or None
    
    task = Task.query.get(task_id)

    upload_folder = os.path.join(current_app.root_path, 'static', 'uploads')

    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    saved_files = []

    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(upload_folder, filename)

            # Prevent filename collisions
            base, ext = os.path.splitext(filename)
            counter = 1
            while os.path.exists(filepath):
                filename = f"{base}_{counter}{ext}"
                filepath = os.path.join(upload_folder, filename)
                counter += 1

            file.save(filepath)

            task_file = TaskFile(
                filename=filename,
                filepath=filepath,
                file_size=os.path.getsize(filepath),
                file_type=file.content_type,
                user_id=current_user.id,
                task_id=task_id,
                subtask_id=subtask_id,
                upload_date=datetime.utcnow()
            )
            db.session.add(task_file)
            saved_files.append(filename)
        
        new_activity = Activity(
            userId=current_user.id,
            projectId=task.parentProject,
            taskId=task_id,
            action=f"Evidence file uploaded: {filename}"
        )

        db.session.add(new_activity)

    db.session.commit()
    return jsonify(success=True, files=saved_files)
    return redirect(url_for('routes.task_detail', task_id=task_id))

@upload.route('/download_file/<int:file_id>')
@login_required
def download_file(file_id):
    task_file = TaskFile.query.get_or_404(file_id)
    
    # Extract just the filename from the full path (secure)
    filename = os.path.basename(task_file.filepath)

    # Serve the file from the uploads directory
    return send_from_directory(
        os.path.join(current_app.root_path, 'static', 'uploads'),
        filename,
        as_attachment=True
    )

@upload.route('/delete_file/<int:file_id>', methods=['POST'])
@login_required
def delete_file(file_id):
    task_file = TaskFile.query.get_or_404(file_id)
    print("We are here!")
    # Optional: Check ownership or permission
    if task_file.user_id != current_user.id:
        return jsonify(success=False, message="You do not have permission to delete this file."), 403

    # Delete the actual file from disk
    try:
        os.remove(task_file.filepath)
    except OSError:
        pass  # File might not exist; log if necessary

    db.session.delete(task_file)
    db.session.commit()

    # If it's a JS request, return JSON
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify(success=True)
    
    return redirect(url_for('routes.task_detail', task_id=task_id))

@routes.route('/analytics')
@login_required
def analytics():
    # Get projects owned by the current user or where they are a collaborator
    projects, invites, pending_approvals = getForBase()
    return render_template('analytics.html', projects=projects , invites=invites, pending_approvals=pending_approvals)

@routes.route('/api/time-based-analytics')
@login_required
def time_based_analytics():
    activity_by_hour = db.session.query(
        extract('hour', Activity.timestamp).label('hour'),
        func.count().label('count')
    ).filter(Activity.userId == current_user.id).group_by('hour').order_by('hour').all()

    hours = [f"{i:02}:00" for i in range(24)]
    counts = [0] * 24
    for row in activity_by_hour:
        counts[int(row.hour)] = row.count

    return jsonify({'labels': hours, 'data': counts})

@routes.route('/api/team-performance-analytics')
@login_required
def team_performance_analytics():
    """
    Calculates the top contributors based on task completion.
    Returns data formatted for visualization.
    """
    projects = Project.query.filter(
        (Project.owner_id == current_user.id) |
        (Project.collaborators.any(id=current_user.id))
    ).all()

    contributor_data = {}

    for project in projects:
        tasks = Task.query.filter_by(parentProject=project.id, status=1).all()
        for task in tasks:
            if not task.collabs:
                continue

            usernames = [u.strip() for u in task.collabs.split(',') if u.strip()]
            for username in usernames:
                key = (username, project.name)
                contributor_data[key] = contributor_data.get(key, 0) + 1

    result = []
    for (username, project_name), count in contributor_data.items():
        user = User.query.filter_by(username=username).first()
        full_name = f"{user.firstName} {user.lastName}" if user else username
        role = getattr(user, 'role', 'Team Member') if user else 'Unassigned'

        # Check if contributor already exists in result list
        existing = next((r for r in result if r['username'] == username), None)
        if existing:
            existing['projects'].append({'project_name': project_name, 'task_count': count})
        else:
            result.append({
                'username': username,
                'full_name': full_name,
                'role': role,
                'projects': [{'project_name': project_name, 'task_count': count}]
            })

    return jsonify(result)

@routes.route('/api/project-performance-analytics')
@login_required
def project_performance_analytics():
    from datetime import datetime, timedelta
    """
    Calculate project completion trends over time.
    This simulates weekly progress data based on current completion percentages.
    In a production environment, this would use historical data points.
    """
    projects = Project.query.filter(
        (Project.owner_id == current_user.id) |
        (Project.collaborators.any(id=current_user.id))
    ).all()

    datasets = []
    max_weeks = 0

    for project in projects:
        # Get project creation time
        creation_activity = Activity.query.filter_by(
            projectId=project.id, action=f"New project created: {project.name}"
        ).order_by(Activity.timestamp.asc()).first()

        completion_activity = Activity.query.filter(
            Activity.projectId == project.id,
            Activity.action.in_([
                "Task completed and approved",
                "Task marked complete - awaiting approval"
            ])
        ).order_by(Activity.timestamp.desc()).first()

        if not creation_activity or not completion_activity:
            continue

        duration = (completion_activity.timestamp - creation_activity.timestamp).days
        weeks = max(1, (duration // 7) + 1)  # at least 1 week
        max_weeks = max(max_weeks, weeks)

        trend = []
        for week in range(weeks):
            week_start = creation_activity.timestamp + timedelta(weeks=week)
            week_end = week_start + timedelta(days=6)

            completed_tasks = Task.query.join(Activity).filter(
                Task.parentProject == project.id,
                Task.status == 1,
                Activity.taskId == Task.id,
                Activity.timestamp >= week_start,
                Activity.timestamp <= week_end,
                Activity.action.in_([
                    "Task completed and approved",
                    "Task marked complete - awaiting approval"
                ])
            ).count()

            total_completed = Task.query.filter_by(parentProject=project.id, status=1).count()
            percent_complete = (completed_tasks / total_completed) * 100 if total_completed else 0
            trend.append(round(percent_complete, 1))

        # Make sure the final point hits the current project.progress
        if trend:
            trend[-1] = project.progress

        datasets.append({
            'label': project.name,
            'data': trend
        })

    labels = [f"Week {i+1}" for i in range(max_weeks)]

    return jsonify({
        'labels': labels,
        'datasets': datasets
    })

@routes.route('/api/analytics/avg-time-to-complete')
@login_required
def avg_time_to_complete():
    from datetime import datetime

    projects = Project.query.filter(
        (Project.owner_id == current_user.id) |
        (Project.collaborators.any(id=current_user.id))
    ).all()

    project_completion_times = {}

    for project in projects:
        tasks = Task.query.filter_by(parentProject=project.id, status=1).all()
        if not tasks:
            continue

        total_days = 0
        task_count = 0

        for task in tasks:
            creation = Activity.query.filter_by(
                taskId=task.id, action="New task added"
            ).order_by(Activity.timestamp.asc()).first()

            completion = Activity.query.filter(
                Activity.taskId == task.id,
                Activity.action.in_([
                    "Task completed and approved",
                    "Task marked complete - awaiting approval"
                ])
            ).order_by(Activity.timestamp.desc()).first()

            if creation and completion:
                diff = (completion.timestamp - creation.timestamp).days
                total_days += max(diff, 1)  # minimum of 1 day
                task_count += 1

        if task_count > 0:
            avg_days = round(total_days / task_count, 1)
            project_completion_times[project.name] = avg_days

    labels = list(project_completion_times.keys())
    data = list(project_completion_times.values())
    average = round(sum(data) / len(data), 1) if data else 0

    return jsonify({
        'labels': labels,
        'data': data,
        'average': average
    })

@routes.route('/assign_task', methods=['POST'])
@login_required
def assign_task():
    task_id = request.form.get('task_id')
    assignee = request.form.get('assignee')
    
    task = Task.query.get_or_404(task_id)
    project = Project.query.get_or_404(task.parentProject)
    
    # Security check: ensure user is either project owner or collaborator
    if not (project.owner_id == current_user.id or current_user in project.collaborators):
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403
    
    # Update task assignment - make sure to store the full name without truncation
    task.collabs = assignee if assignee else "Unassigned"
    
    # Create activity log
    activity_message = f"Task assigned to {assignee}" if assignee else "Task unassigned"
    activity = Activity(
        userId=current_user.id,
        projectId=project.id,
        taskId=task.id,
        action=activity_message
    )
    
    db.session.add(activity)
    db.session.commit()
    
    return jsonify({'status': 'success'})

@routes.route('/approveTask', methods=['POST'])
@login_required
def approveTask():
    task_id = request.form.get('task_id')
    task = Task.query.get_or_404(task_id)
    project = Project.query.get_or_404(task.parentProject)
    
    # Get projects owned by the current user or where they are a collaborator
    projects = Project.query.filter(
        (Project.owner_id == current_user.id) | 
        (Project.collaborators.any(id=current_user.id))
    ).all()
    
    # Security check - only owner can approve
    if project.owner_id != current_user.id:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403
        flash('You are not authorized to approve this task', 'error')
        return redirect(url_for('routes.inbox'))
        
    # Update counters and approval status
    if task.approval_status == 0:  # Only update if pending
        task.approval_status = 1
        project.tasksActive -= 1
        project.tasksCompleted += 1
        
        # Create activity
        activity = Activity(
            userId=current_user.id,
            projectId=project.id,
            taskId=task.id,
            action="Task approved"
        )
        db.session.add(activity)
        db.session.commit()
    
    # Check if it's an AJAX request or a regular form submission
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({'status': 'success'})
    
    # Regular form submission - redirect back to inbox
    return redirect(url_for('routes.inbox'))

@routes.route('/rejectTask', methods=['POST'])
@login_required
def rejectTask():
    task_id = request.form.get('task_id')
    task = Task.query.get_or_404(task_id)
    project = Project.query.get_or_404(task.parentProject)
    
    # Security check - only owner can reject
    if project.owner_id != current_user.id:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403
        flash('You are not authorized to reject this task', 'error')
        return redirect(url_for('routes.inbox'))
        
    # Reset task status to in progress
    if task.approval_status == 0:  # Only update if pending
        task.approval_status = 2  # Rejected
        task.status = 0  # Back to in progress
        
        # Create activity
        activity = Activity(
            userId=current_user.id,
            projectId=project.id,
            taskId=task.id,
            action="Task completion rejected"
        )
        db.session.add(activity)
        db.session.commit()
    
    # Check if it's an AJAX request or a regular form submission
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({'status': 'success'})
    
    # Regular form submission - redirect back to inbox
    return redirect(url_for('routes.inbox'))

@routes.route('/toggle_project_approval/<int:project_id>', methods=['POST'])
@login_required
def toggle_project_approval(project_id):
    project = Project.query.get_or_404(project_id)
    
    # Security check - only owner can change settings
    if project.owner_id != current_user.id:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403
        
    # Toggle the setting
    project.approval_required = not project.approval_required
    db.session.commit()
    
    return jsonify({'status': 'success', 'approval_required': project.approval_required})

@routes.route('/revertTask', methods=['POST'])
@login_required
def revertTask():
    task_id = request.form.get('task_id')
    task = Task.query.get_or_404(task_id)
    project = Project.query.get_or_404(task.parentProject)
    
    # If task was completed and approved, adjust project counters
    if task.status == 1 and task.approval_status == 1:
        project.tasksActive += 1
        project.tasksCompleted -= 1
        
    # Reset task to in-progress state
    task.status = 0
    task.approval_status = 0
    
    # Create activity record
    revert_activity = Activity(
        userId=current_user.id,
        projectId=project.id,
        taskId=task.id,
        action="Task reverted to in-progress"
    )
    
    db.session.add(revert_activity)
    db.session.commit()
    
    return jsonify({'status': 'success', 'message': 'Task reverted to in-progress'})

@routes.route('/delete_subtask/<int:subtask_id>', methods=['POST'])
@login_required
def delete_subtask(subtask_id):
    subtask = Subtask.query.get_or_404(subtask_id)
    # Optional: Security check (ensure user has rights to delete)
    task = Task.query.get(subtask.taskId)
    project = Project.query.get(task.parentProject)
    if not (project.owner_id == current_user.id or current_user in project.collaborators):
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403

    # Delete all TaskFiles for this subtask and remove files from disk
    for file in subtask.files:
        try:
            os.remove(file.filepath)
        except Exception:
            pass
        db.session.delete(file)

    db.session.delete(subtask)
    db.session.commit()
    return jsonify({'status': 'success'})