from flask import Blueprint, render_template, redirect, url_for, flash, request
from .models import User
from . import db  # Import the db object
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, login_required, logout_user, current_user

auth = Blueprint('auth', __name__)



@auth.route('/')
def home():
    # If already logged in, redirect to dashboard
    if current_user.is_authenticated:
        return redirect(url_for('routes.dashboard'))
    
    # Otherwise show the landing page
    return render_template('index.html')
@auth.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        user = User.query.filter_by(email=email).first()
        
        if user and check_password_hash(user.password, password):
            flash('Logged in successfully!', category='success')
            login_user(user, remember=True)
            
            # This is the important line - redirect directly to dashboard
            return redirect(url_for('routes.dashboard'))
        else:
            flash('Login failed. Check your email and password.', category='error')
            
            # When login fails, redirect back to the index page with the login form
            return redirect('/')
    
    # For GET requests to /login, redirect to the index page
    # This prevents someone from accessing /login directly
    return redirect('/')

@auth.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form.get('email')
        username = request.form.get('userName')
        password1 = request.form.get('password1')
        password2 = request.form.get('password2')
        
        # Validate all inputs at once
        error = False
        
        # Check if email already exists
        user = User.query.filter_by(email=email).first()
        if user:
            flash('Email already exists.', category='error')
            error = True
            
        # Add all validation checks
        if len(email) < 4:
            flash('Email must be greater than 3 characters.', category='error')
            error = True
        
        if password1 != password2:
            flash('Passwords don\'t match.', category='error')
            error = True
            
        if len(password1) < 7:
            flash('Password must be at least 7 characters.', category='error')
            error = True
            
        # If any errors occurred, render signup page again
        if error:
            return render_template('signup.html')
            
        # If no errors, create the user and redirect
        new_user = User(email=email, 
                      username=username, 
                      password=generate_password_hash(password1, method='pbkdf2:sha256', salt_length=16))
        
        try:
            db.session.add(new_user)
            db.session.commit()
            flash('Account created successfully! Please log in.', category='success')
            # The critical fix - use the most direct and reliable redirect
            return redirect('/')
        except Exception as e:
            db.session.rollback()
            flash(f'An error occurred while creating your account: {str(e)}', category='error')
            return render_template('signup.html')
    
    # GET request - just show the signup form
    return render_template('signup.html')

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Logged out successfully!', category='success')
    return redirect(url_for('auth.login'))
