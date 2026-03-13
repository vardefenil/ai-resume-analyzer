from pymongo import MongoClient
from dotenv import load_dotenv
import os
from bson import ObjectId

load_dotenv()
client = MongoClient(os.getenv("MONGODB_URI"))
db = client.get_default_database()

# Pick one resume and one job (get the first ones for now)
resume = db.resumes.find_one()
job = db.jobs.find_one()

if not resume or not job:
    print("❌ No data found. Please insert resume and job first.")
else:
    resume_skills = set(resume.get("skills", []))
    job_skills = set(job.get("skills_required", []))

    matched = resume_skills.intersection(job_skills)
    missing = job_skills - resume_skills
    score = round(len(matched) / len(job_skills) * 100, 2) if job_skills else 0

    print("📄 Resume:", resume["file_name"])
    print("💼 Job:", job["job_title"])
    print("✅ Matched Skills:", list(matched))
    print("⚠️ Missing Skills:", list(missing))
    print("⭐ Match Score:", score, "%")

    # Save result in new collection
    db.analyses.insert_one({
        "resume_id": resume["_id"],
        "job_id": job["_id"],
        "match_score": score,
        "matched_keywords": list(matched),
        "missing_keywords": list(missing)
    })
    print("\n✅ Match analysis saved to 'analyses' collection.")
