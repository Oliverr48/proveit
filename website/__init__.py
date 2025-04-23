from flask import Flask

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your_secret_key'

    # Import and register blueprints
    from .routes import routes
    app.register_blueprint(routes)

    return app
