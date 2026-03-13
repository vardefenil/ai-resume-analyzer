from pymongo import MongoClient
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()
client = MongoClient(os.getenv("MONGODB_URI"))
db = client.get_default_database()

jobs = db["jobs"]

job_data = {
    "job_title": "Python Developer",
    "job_description": "Looking for a Python developer skilled in Flask and MongoDB.",
    "posted_date": datetime.utcnow(),
    "skills_required": ["Python", "Flask", "MongoDB"]
}

res = jobs.insert_one(job_data)
print("✅ Job inserted with ID:", res.inserted_id)

print("\n📋 All jobs:")
for j in jobs.find():
    print(j)
