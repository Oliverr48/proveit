import pytest
import time
import multiprocessing
import tempfile
import os
from multiprocessing import Process
import selenium
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import WebDriverException
from website import create_app, db
from website.models import User, Project, Task
from werkzeug.security import generate_password_hash
from threading import Thread
import urllib.request
import urllib.error

# Skip all selenium tests by default
#pytestmark = pytest.mark.skip(reason="Skipping Selenium tests due to WebDriver issues")

def run_app(db_path):
    #app = create_app()
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': db_path,
        'WTF_CSRF_ENABLED': False,
        'DEBUG': True,
        'SERVER_NAME': None,  # Required for test server to work
    })
    with app.app_context():
        db.create_all()
    print("Starting the Flask app...")
    app.run(port=5000, use_reloader=False)

def check_if_server_is_up():
    try:
        with urllib.request.urlopen("http://127.0.0.1:5000") as response:
            return response.status == 200
    except urllib.error.URLError as e:
        print(f"Server not up yet: {e}")
        return False

@pytest.fixture(scope='module')
def browser_and_server():
    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    db_fd, db_path = tempfile.mkstemp()
    os.close(db_fd)

    # Create app for DB setup only
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///{db_path}',
        'WTF_CSRF_ENABLED': False,
    })

    # Setup DB and test user in *main thread's* app
    with app.app_context():
        db.drop_all()
        db.create_all()
        user = User(
            email='selenium@example.com',
            username='seleniumuser',
            firstName='Selenium',
            lastName='User',
            password=generate_password_hash('seleniumpass')
        )
        inviteUser = User(
            email= 'inviteselenium@example.com',
            username='inviteseleniumuser',
            firstName='InviteSelenium', 
            lastName='User',
            password=generate_password_hash('seleniumpass2')
        )
        db.session.add(user)
        db.session.add(inviteUser)
        db.session.commit()

    # Start the Flask server in subprocess (it'll init its own fresh app/db)
    server = Process(target=run_app, args=(f'sqlite:///{db_path}',))
    server.start()

    # Wait for the server to boot up
    if check_if_server_is_up():
        print("Flask server started successfully.")
    else:
        print("Flask server did not start.")
        server.terminate()
        pytest.skip("Flask server did not start.")

    try:
        driver = webdriver.Chrome(options=chrome_options)
        yield driver, app
    except WebDriverException as e:
        print(f"WebDriver error: {e}")
        pytest.skip("WebDriver could not be initialized")
    finally:
        if server.is_alive():
            server.terminate()
            server.join()
        if driver:
            try:
                driver.quit()
            except Exception as e:
                print(f"Driver quit failed: {e}")


def test_login_flow(browser_and_server):
    """Test the login process using Selenium."""
    driver, app = browser_and_server
    if driver is None:
        pytest.skip("WebDriver not available")
    
    # Navigate to the login page
    driver.get("http://localhost:5000/")
    
    # Find login form elements
    email_input = driver.find_element(By.ID, 'login-email')
    password_input = driver.find_element(By.ID, 'login-password')
    submit_button = driver.find_element(By.XPATH, '//button[@type="submit"]')
    
    # Fill in credentials and submit
    email_input.send_keys('selenium@example.com')
    password_input.send_keys('seleniumpass')
    submit_button.click()
    

    print("Ok, we are here...!! Searching for Dashboard..."),
    # Wait for page to load and check for Dashboard
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//h2[contains(text(), 'Dashboard')]"))
    )
    print("Found dashboard!")
    # Assert that we're on the dashboard
    assert 'Dashboard' in driver.page_source

def test_create_project_flow(browser_and_server):
    """Test creating a project using Selenium."""
    driver, app = browser_and_server
    if driver is None:
        pytest.skip("WebDriver not available")
    
    # Login first
    driver.get('http://localhost:5000/')
    email_input = driver.find_element(By.ID, 'login-email')
    password_input = driver.find_element(By.ID, 'login-password')
    submit_button = driver.find_element(By.XPATH, '//button[@type="submit"]')
    
    email_input.send_keys('selenium@example.com')
    password_input.send_keys('seleniumpass')
    submit_button.click()
    
    # Wait for dashboard to load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//h2[contains(text(), 'Dashboard')]"))
    )
    

    # Navigate to projects page
    driver.get('http://localhost:5000/projects')
    
    print("Opened projects page, now looking for newProjectBtn...")
    # Wait for projects page to load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'newProjectBtn'))
    )
    
    # Click the new project button
    new_project_btn = driver.find_element(By.ID, 'newProjectBtn')
    new_project_btn.click()
    
    # Wait for modal to appear
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, 'projectName'))
    )
    
    # Fill in project details
    project_name = driver.find_element(By.ID, 'projectName')
    project_desc = driver.find_element(By.ID, 'projectDescription')
    project_date = driver.find_element(By.ID, 'projectDueDate')
    
    project_name.send_keys('Selenium Project')
    project_desc.send_keys('Created with Selenium')
    project_date.send_keys('12312025')  # MM/DD/YYYY format
    
    # Submit the form
    submit_project = driver.find_element(By.XPATH, '//button[@type="submit"]')
    submit_project.click()
    
    # Wait for page to reload
    time.sleep(2)
    
    # Verify project appears in the list
    assert 'Selenium Project' in driver.page_source

def test_create_task(browser_and_server):
    """Test creating a task using Selenium."""
    driver, app = browser_and_server
    if driver is None:
        pytest.skip("WebDriver not available")
    
    # Login first
    driver.get('http://localhost:5000/')
    email_input = driver.find_element(By.ID, 'login-email')
    password_input = driver.find_element(By.ID, 'login-password')
    submit_button = driver.find_element(By.XPATH, '//button[@type="submit"]')

    email_input.send_keys('selenium@example.com')
    password_input.send_keys('seleniumpass')
    submit_button.click()

     # Wait for dashboard to load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//h2[contains(text(), 'Dashboard')]"))
    )
    
    # Navigate to projects page
    driver.get('http://localhost:5000/projects')
    
    # Wait for projects page to load
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, 'newProjectBtn'))
    )
    
    # Click the new project button
    new_project_btn = driver.find_element(By.ID, 'newProjectBtn')
    new_project_btn.click()

    project_name = driver.find_element(By.ID, 'projectName')
    project_desc = driver.find_element(By.ID, 'projectDescription')
    project_date = driver.find_element(By.ID, 'projectDueDate')
    
    project_name.send_keys('Selenium Project')
    project_desc.send_keys('Created with Selenium')
    project_date.send_keys('12312025')  # MM/DD/YYYY format
    
    # Submit the form
    submit_project = driver.find_element(By.XPATH, '//button[@type="submit"]')
    submit_project.click()
    
    time.sleep(2)  # Wait for the project to be created
    driver.get("http://localhost:5000/project_view/1")  # Adjust the URL to match your project view

   # Step 1: Wait for the page to fully load by checking for a known static element
    WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Task Management')]"))
    )

    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'newTaskBtn'))
    )
    
    # Click the new project button
    new_task_btn = driver.find_element(By.ID, 'newTaskBtn')
    new_task_btn.click()

    btn = driver.find_element(By.ID, "newTaskBtn")
    print("Button display:", btn.is_displayed(), "enabled:", btn.is_enabled())

    print("Clicked newTaskBtn, now looking for modalAddTask...")
    # Step 2: Fill the form
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "modalAddTask")))

    task_name_input = driver.find_element(By.ID, "taskName")
    due_date_input = driver.find_element(By.ID, "taskDueDate")
    task_description = driver.find_element(By.ID, "taskDescription")

    task_name_input.send_keys("Selenium Test Task")
    due_date_input.send_keys("2060-06-01")  # Format: YYYY-MM-DD
    task_description.send_keys("selenium test task description")

    # Step 3: Submit the form
    submit_button = driver.find_element(By.CSS_SELECTOR, "form#addTaskForm button[type='submit']")
    submit_button.click()

    # Step 4: Wait for page to reload or success state
    time.sleep(2)  # Better to wait for specific condition if possible
    assert "Selenium Test Task" in driver.page_source  # Very basic check


def test_create_subtask_flow(browser_and_server):
    """Test creating a task using Selenium."""
    driver, app = browser_and_server
    if driver is None:
        pytest.skip("WebDriver not available")
    
    # Login first
    driver.get('http://localhost:5000/')
    email_input = driver.find_element(By.ID, 'login-email')
    password_input = driver.find_element(By.ID, 'login-password')
    submit_button = driver.find_element(By.XPATH, '//button[@type="submit"]')

    email_input.send_keys('selenium@example.com')
    password_input.send_keys('seleniumpass')
    submit_button.click()

     # Wait for dashboard to load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//h2[contains(text(), 'Dashboard')]"))
    )
    
    # Navigate to projects page
    driver.get('http://localhost:5000/projects')
    
    # Wait for projects page to load
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, 'newProjectBtn'))
    )
    
    # Click the new project button
    new_project_btn = driver.find_element(By.ID, 'newProjectBtn')
    new_project_btn.click()

    project_name = driver.find_element(By.ID, 'projectName')
    project_desc = driver.find_element(By.ID, 'projectDescription')
    project_date = driver.find_element(By.ID, 'projectDueDate')
    
    project_name.send_keys('Selenium Project')
    project_desc.send_keys('Created with Selenium')
    project_date.send_keys('12312025')  # MM/DD/YYYY format
    
    # Submit the form
    submit_project = driver.find_element(By.XPATH, '//button[@type="submit"]')
    submit_project.click()
    
    time.sleep(2)  # Wait for the project to be created
    driver.get("http://localhost:5000/project_view/1")  # Adjust the URL to match your project view

   # Step 1: Wait for the page to fully load by checking for a known static element
    WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Task Management')]"))
    )

    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'newTaskBtn'))
    )
    
    # Click the new project button
    new_task_btn = driver.find_element(By.ID, 'newTaskBtn')
    new_task_btn.click()

    btn = driver.find_element(By.ID, "newTaskBtn")
    print("Button display:", btn.is_displayed(), "enabled:", btn.is_enabled())

    print("Clicked newTaskBtn, now looking for modalAddTask...")
    # Step 2: Fill the form
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "modalAddTask")))

    task_name_input = driver.find_element(By.ID, "taskName")
    due_date_input = driver.find_element(By.ID, "taskDueDate")
    task_description = driver.find_element(By.ID, "taskDescription")

    task_name_input.send_keys("Selenium Test Task")
    due_date_input.send_keys("2060-06-01")  # Format: YYYY-MM-DD
    task_description.send_keys("selenium test task description")

    # Step 3: Submit the form
    submit_button = driver.find_element(By.CSS_SELECTOR, "form#addTaskForm button[type='submit']")
    submit_button.click()

    # Step 4: Wait for page to reload or success state
    time.sleep(2)  # Better to wait for specific condition if possible
    assert "Selenium Test Task" in driver.page_source  # Very basic check
    # Step 4: Navigate to task detail view
    driver.get("http://localhost:5000/task/1")  # adjust if needed

    # Step 5: Add a subtask
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, '.add-subtask-form'))
    )
    form = driver.find_element(By.CSS_SELECTOR, '.add-subtask-form')
    input_box = form.find_element(By.NAME, 'subtaskName')
    input_box.clear()
    input_box.send_keys('Selenium Subtask')

    form.find_element(By.XPATH, './/button[@type="submit"]').click()

    # Step 6: Confirm it appears in the list
    WebDriverWait(driver, 10).until(
        EC.text_to_be_present_in_element(
            (By.CSS_SELECTOR, '.space-y-4'), 'Selenium Subtask'
        )
    )
    
def test_invite_user_flow(browser_and_server):
    
    driver, app = browser_and_server
    if driver is None:
        pytest.skip("WebDriver not available")

    # Step 1: Login
    driver.get("http://localhost:5000/")
    driver.find_element(By.ID, 'login-email').send_keys('selenium@example.com')
    driver.find_element(By.ID, 'login-password').send_keys('seleniumpass')
    driver.find_element(By.XPATH, '//button[@type="submit"]').click()

    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//h2[contains(text(), 'Dashboard')]"))
    )

    # Step 2: Create a project
    driver.get("http://localhost:5000/projects")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, 'newProjectBtn')))
    driver.find_element(By.ID, 'newProjectBtn').click()

    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, 'projectName')))
    driver.find_element(By.ID, 'projectName').send_keys('Invite Test Project')
    driver.find_element(By.ID, 'projectDescription').send_keys('Testing invite functionality')
    driver.find_element(By.ID, 'projectDueDate').send_keys('12312025')
    driver.find_element(By.XPATH, '//button[@type="submit"]').click()

    time.sleep(1)
    driver.get("http://localhost:5000/project_view/1")  # You may adjust this to use a dynamic ID

    # Step 3: Open invite modal
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'openInviteModalBtn'))
    )
    driver.find_element(By.ID, 'openInviteModalBtn').click()

    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, 'inviteUserForm'))
    )

    # Step 4: Fill in and submit invite form
    user_input = driver.find_element(By.ID, 'userSearch')
    user_input.clear()
    user_input.send_keys('inviteselenium@example.com')  # The second user

    # Send the invite
    driver.find_element(By.CSS_SELECTOR, "#inviteUserForm button[type='submit']").click()

    # Step 5: Confirm invitation was sent
    WebDriverWait(driver, 5).until(EC.alert_is_present())
    alert = driver.switch_to.alert
    assert 'successfully invited' in alert.text.lower()
    alert.accept()





# TODO for teammates:
# Implement additional Selenium tests for:
# - Subtask operations