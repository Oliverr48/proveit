from flask import Flask

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your_secret_key'

    # Import and register blueprints or routes
    from .routes import app as routes_blueprint
    app.register_blueprint(routes_blueprint)

    return app