from website import db
from website.models import User  # Make sure to import the User model

# Clear all users from the database
def clear_user_data():
    try:
        # Delete all users from the User table
        db.session.query(User).delete()
        db.session.commit()  # Commit the changes to the database
        print("All user data has been cleared.")
    except Exception as e:
        db.session.rollback()  # Rollback in case of any errors
        print(f"An error occurred: {e}")

# Call the function to clear user data
if __name__ == "__main__":
    clear_user_data()