from flask import Blueprint, render_template, request, redirect, url_for

routes = Blueprint('routes', __name__)

@routes.route('/')
def index():
    return render_template('index.html')

@routes.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@routes.route('/projects')
def projects():
    return render_template('project.html')
