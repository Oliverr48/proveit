# ProveIt

ProveIt is a sophisticated **Flask-based** project‑management platform that enables seamless team collaboration, task tracking, and evidence‑based progress documentation. Teams can break down complex projects into manageable tasks, assign responsibilities, and verify completion with uploaded evidence.

---

## 🌟 Key Features

* **Hierarchical Project Organization** – Projects → Tasks → Sub‑tasks
* **Task Approval Workflow** – Owners can approve / reject submitted evidence
* **Team Collaboration** – Invite members with granular permissions
* **Evidence Documentation** – Secure file uploads as proof of completion
* **Real‑time Analytics** – Project progress, team performance, contribution metrics
* **Notification System** – Unified area for invites, approvals, and other alerts
* **Responsive Design** – Clean Tailwind UI that works on any device

---

## 💻 Technical Architecture

| Layer         | Tech / Library         | Notes                               |
| ------------- | ---------------------- | ----------------------------------- |
| **Backend**   | Flask (Blueprints)     | Modular routing & business logic    |
| **Database**  | SQLAlchemy ORM         | Alembic migrations                  |
| **Front‑end** | Tailwind CSS           | Modern, responsive components       |
| **Auth**      | Flask‑Login            | Session management & access control |
| **Testing**   | `pytest`, Selenium     | Unit + E2E coverage                 |
| **Uploads**   | Werkzeug secure upload | MIME/type validation & safe storage |

---

## 🚀 Getting Started

### Prerequisites

* **Python 3.9+**
* **pip**
* **Git**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Oliverr48/proveit
cd proveit

# 2. Create & activate a virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Initialize the database
flask db upgrade
```

### Running the Application

```bash
# Start the development server
python app.py
```

Visit **[http://127.0.0.1:5000](http://127.0.0.1:5000)** in your browser.

---

## 📱 Using ProveIt

1. **Sign Up & Log In** – Create an account to access your dashboard.
2. **Create a Project** – Define deadlines and high‑level goals.
3. **Add Tasks & Sub‑tasks** – Break work into actionable items.
4. **Invite Collaborators** – Share the workload with teammates.
5. **Track Progress** – Upload evidence; owners approve or request changes.
6. **Analyze Performance** – Head to **Analytics** for visual insights.

---

## 🔧 Advanced Features

* **Task Evidence** – Any file type with server‑side validation
* **Task Reversion** – Move “Done” tasks back to “In‑Progress” when needed
* **Approval System** – Owner sign‑off ensures quality control
* **Performance Metrics** – Time‑to‑completion and individual contribution stats

---

## 👥 Development Team

| Student ID | Name             |
| ---------- | ---------------- |
| 23197683   | Oliver King      |
| 23959437   | Michelle Prayogo |
| 24128968   | David Pang       |
| 23724703   | Sam Dockery      |

---

## 📄 License

This project is licensed under the **MIT License** – see the `LICENSE` file for details.

<br/>

Made with ❤️ by **Team ProveIt**
