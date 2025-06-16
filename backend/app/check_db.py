from sqlalchemy import inspect, text
from app.database import engine
from app.models.user import User
from app.database import Base

def check_database():
    """Check database connection and table existence"""
    try:
        # Try to connect
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("Database connection successful!")
            
            # Get all tables
            inspector = inspect(engine)
            existing_tables = inspector.get_table_names()
            print("\nExisting tables:", existing_tables)
            
            # Check if tables need to be created
            if not existing_tables:
                print("\nCreating tables...")
                Base.metadata.create_all(bind=engine)
                print("Tables created successfully!")
            
            # Print users table structure
            if 'users' in existing_tables:
                columns = inspector.get_columns('users')
                print("\nUsers table structure:")
                for column in columns:
                    print(f"- {column['name']}: {column['type']}")

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    check_database()
