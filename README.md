# ProveIt

ProveIt is a Flask-based web application for project tracking, task and team management, and contribution. It allows you to work together with team members, documenting your progress as you tick off goals. 
## Core Technical Features
- Flask-implemented web interface
- SQLAlchemy Database Implementation
- Supports Database Migration 
- Comprehensive Test Suite with Selenium

## Pros of ProveIt
- Sleek and simple UI to make complex tasks approachable
- Task, subtask and project layers to break down your goals
- User-sharable data and project access
- An analytics page to stay on top of your contributions

## Installation

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install the requirements for ProveIt after cloning into the repository:

```bash
# Clone the repository
git clone https://github.com/Oliverr48/proveit
cd proveit

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt


```

## Usage - Running the Server
Simple: all you need to do is start the server from the proveit directory through the app file:
```python
python3 app.py 
```

## Getting the Most Out of Proveit

Once you've signed up and logged into your dashboard, getting started with Proveit is simple! Simply navigate to the 'Projects' page and follow the easy-to use UI to create your first goal and start setting your deadlines!

Inside the project, you're able to create and assign tasks, invite users, and upload files to document your progress. *You're not just a contributor with ProveIt:* it helps you delegate and build as a team.
Note that to invite your team members into your ProveIt project, they'll have to have a ProveIt account set up as well. 

To see how well you're contributing and getting your tasks done, simply navigate to the 'Analytics'

## License

[MIT](https://choosealicense.com/licenses/mit/)
