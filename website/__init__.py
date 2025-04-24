from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Need to create this instance first to be imported in models.py
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your_secret_key'

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'

    # Initialise the database but with the actual app
    db.init_app(app)

    # Import and register blueprints
    from .routes import routes
    app.register_blueprint(routes)

    return app
