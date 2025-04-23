from flask import Blueprint, render_template

app = Blueprint('app', __name__)

@app.route('/')
def render_index():
    # Render the index.html template
    return render_template('index.html')

@app.route('/dashboard')
def render_home():
    # Render the dashboard.html template
    return render_template('dashboard.html')