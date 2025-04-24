from flask import Blueprint, render_template, request, redirect, url_for
from .models import Project


routes = Blueprint('routes', __name__)

@routes.route('/')
def index():
    return render_template('index.html')

@routes.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@routes.route('/projects')
def projects():
    #Get the projs from the DB 
    projects = Project.query.all()
    print("Got the projects!")
    return render_template('project.html', projects=projects)
