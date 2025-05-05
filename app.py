from website import create_app, db
from website.models import Project, Task

print("🔍 app.py is being run — __name__ =", __name__)

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        #used this to make some sample data - just check it's not already there if you're running it again, otherwise the app fails. 
       

    app.run(debug=True)