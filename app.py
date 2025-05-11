from website import create_app, db
from flask_migrate import Migrate  # Import Flask-Migrate

print("app.py is being run — __name__ =", __name__)

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)