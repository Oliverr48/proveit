from website import create_app, db
from website.models import Project, Task

print("🔍 app.py is being run — __name__ =", __name__)

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        #used this to make some sample data - just check it's not already there if you're running it again, otherwise the app fails. 
        if not Project.query.filter_by(name='Project 1').first():
            db.session.add(Project(
            name='Project 1',
            description='Make something blah blah blah',
            dueDate='2023-10-01',
            tasksActive=4,
            tasksCompleted=1
         ))
            db.session.commit()
            print("Project added!")
        else:
            print("[!] Project already exists!")
        
        if not Task.query.filter_by(name='Task 1 for Project 1').first():
            db.session.add(Task(
            parentProject=1,
            name='Task 1 for Project 1',
            description='Specific task',
            dueDate='2023-10-01',
            status=1
         ))
            db.session.commit()
            print("Project added!")
        else:
            print("[!] Project already exists!")

        if not Task.query.filter_by(name='Task 2 for Project 1').first():
            db.session.add(Task(
            parentProject=1,
            name='Task 2 for Project 1',
            description='Specific task',
            dueDate='2023-10-01',
            status=0
         ))
            db.session.commit()
            print("Project added!")
        else:
            print("[!] Project already exists!")

    app.run(debug=True)