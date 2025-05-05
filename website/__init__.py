from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager 

# Need to create this instance first to be imported in models.py
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your_secret_key'

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'

    # Initialise the database but with the actual app
    db.init_app(app)


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

    return app
