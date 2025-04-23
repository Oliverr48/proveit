from flask import Flask, render_template, request

app = Flask(__name__)

""" -- UPDATED: Removed as contained in routes.py

@app.route('/')
def index():
    return render_template('index.html') """

# Added below line to import the routes from a singular file to resolve no dashboard route 
from routes import *

if __name__ == '__main__':
    app.run(debug=True)
    