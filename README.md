# ProveIt

ProveIt is a sophisticated Flask-based project management platform designed for seamless team collaboration, task tracking, and evidence-based progress documentation. The system empowers teams to break down complex projects into manageable tasks, assign responsibilities, and document completion with verifiable evidence.
🌟 Key Features

Hierarchical Project Organization: Structure work with projects, tasks, and subtasks
Task Approval Workflow: Complete tasks with evidence that project owners can approve or reject
Team Collaboration: Invite team members to projects with specific permissions
Evidence Documentation: Upload and manage files as proof of task completion
Real-time Analytics: Track project progress, team performance, and contribution metrics
Notification System: Stay updated with a unified notifications area for invites and approvals
Responsive Design: Access your projects on any device with a clean, intuitive interface

💻 Technical Architecture

Backend: Python Flask with blueprints for modular organization
Database: SQLAlchemy ORM with migration support
Frontend: Tailwind CSS for responsive and modern UI components
Authentication: Flask-Login for secure user management
Testing: Comprehensive test suite with Selenium for E2E testing
File Management: Secure file uploads with type validation and storage

🚀 Getting Started
Prerequisites

Python 3.9 or higher
pip (Python package manager)
Git

Installation
bash# Clone the repository
git clone https://github.com/Oliverr48/proveit
cd proveit

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up the database
flask db upgrade
Running the Application
bash# Start the development server
python app.py

# The application will be available at http://127.0.0.1:5000/
📱 Using ProveIt

Sign Up & Login: Create your account and access your personalized dashboard
Create a Project: Navigate to Projects and set up your first project with deadlines
Add Tasks: Break down your project into manageable tasks and subtasks
Invite Collaborators: Add team members to contribute to your projects
Track Progress: Complete tasks, upload evidence, and approve contributions
Analyze Performance: Visit the Analytics page to visualize project progress and team performance

🔧 Advanced Features

Task Evidence: Upload files to document and verify task completion
Task Reversion: Move completed tasks back to in-progress when needed
Approval System: Ensure quality with owner approval workflows
Performance Metrics: Track time-to-completion and team contribution statistics

👥 Development Team
IDName23197683Oliver King23959437Michelle Prayogo24128968David Pang23724703Sam Dockery
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

Made with ❤️ by Team ProveIt
