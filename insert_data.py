from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
uri = os.getenv("MONGODB_URI")

# Connect to MongoDB
client = MongoClient(uri)
db = client.get_default_database()

# Create a new collection (like a table)
users = db["users"]

# Example data (document)
user_data = {
    "name": "Fenil Varde",
    "email": "fenil@example.com",
    "role": "candidate",
    "skills": ["Python", "Flask", "MongoDB"],
    "experience": 1,
}

# Insert the data
result = users.insert_one(user_data)
print("✅ User inserted with ID:", result.inserted_id)
