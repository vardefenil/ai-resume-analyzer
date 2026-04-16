from pymongo import MongoClient
from dotenv import load_dotenv
import os
from datetime import datetime
from bson import ObjectId

# Load env
load_dotenv()
client = MongoClient(os.getenv("MONGODB_URI"))
db = client.get_default_database()

resumes = db["resumes"]

# Example resume data
resume_data = {
    "user_id": ObjectId(),  # replace later with actual user ID from users collection
    "file_name": "resume_fenil.pdf",
    "file_path": "./uploads/resume_fenil.pdf",
    "upload_date": datetime.utcnow(),
    "skills": ["Python", "Flask", "NLP", "AI"],
    "education": {"degree": "BE", "year": 2024, "institute": "LDRP"},
    "experience": 1.5,
    "extracted_text": "Experienced Python developer skilled in Flask and NLP."
}

res = resumes.insert_one(resume_data)
print("✅ Resume inserted with ID:", res.inserted_id)

# Show all resumes
print("\n📋 All resumes:")
for r in resumes.find():
    print(r)
