from flask import Blueprint, render_template, request, redirect, url_for
from .models import Project
from flask_login import login_required, current_user

routes = Blueprint('routes', __name__)

@routes.route('/')
def index():
    return render_template('index.html')

@routes.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', user=current_user)

@routes.route('/projects')
@login_required
def projects():
    # Get the projects from the DB 
    projects = Project.query.all()
    print("Got the projects!")
    return render_template('project.html', projects=projects, user=current_user)
