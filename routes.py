# For directories, data handling and rendering various pages

from app import app 
from flask import render_template, request, redirect, url_for

# maybe importing a file here for classes we want to design; maybe a project/task class? 

@app.route('/')
def render_index():
  # any args we may need should be specified render_template('index.html', classes etc. here)
  return render_template('index.html')
