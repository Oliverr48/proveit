from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate  # Import Flask-Migrate
import os

# Need to create this instance first to be imported in models.py
db = SQLAlchemy()
migrate = None  # Declare migrate globally

def create_app(testing=False):
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your_secret_key'

    # Require DATABASE_URL explicitly, no fallback to 'sqlite:///site.db'
    if testing:
        # Use an in-memory SQLite DB for testing
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # In-memory DB
    else:
        # Use site.db for the main app
        app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///site.db')

    # Initialise the database but with the actual app
    db.init_app(app)

    # Initialize Flask-Migrate
    global migrate
    migrate = Migrate(app, db)

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'  # Redirect to login page if not logged in
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        from .models import User
        return User.query.get(int(user_id))  # Ensure this returns a valid user or None

    # Import and register blueprints
    from .routes import routes
    app.register_blueprint(routes)

    from .auth import auth
    app.register_blueprint(auth)

    from .routes import upload 
    app.register_blueprint(upload)

    return app
