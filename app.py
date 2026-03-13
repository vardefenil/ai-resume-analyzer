from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import pdfplumber
import re
import io
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from database import engine, SessionLocal
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# -------------------------
# DATABASE SESSION
# -------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------
# CORS
# -------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# SKILL DATABASE
# -------------------------

ALL_SKILLS = [
"python","java","c++","sql","mysql","mongodb",
"pandas","numpy","matplotlib","seaborn",
"machine learning","deep learning","tensorflow","keras","pytorch",
"data analysis","data visualization",
"react","javascript","html","css","node","express",
"flask","fastapi",
"docker","kubernetes","aws","git","linux"
]

# -------------------------
# JOB ROLE SKILLS
# -------------------------

JOB_ROLE_SKILLS = {

"data scientist":[
"python","pandas","numpy","machine learning",
"data analysis","tensorflow","deep learning","sql"
],

"python developer":[
"python","flask","fastapi","sql","git","docker"
],

"frontend developer":[
"react","javascript","html","css","node"
],

"machine learning engineer":[
"python","machine learning","tensorflow","pytorch","deep learning"
]

}

# -------------------------
# PDF TEXT EXTRACTION
# -------------------------

def extract_text_from_pdf(file_bytes):

    text = ""

    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:

            for page in pdf.pages:

                page_text = page.extract_text(x_tolerance=1, y_tolerance=3)

                if page_text:
                    text += "\n" + page_text

    except Exception as e:
        print("PDF extraction error:", e)

    text = re.sub(r'\r', '\n', text)

    return text.lower()

# -------------------------
# SKILL EXTRACTION
# -------------------------

def extract_resume_skills(text):

    found = []

    for skill in ALL_SKILLS:

        pattern = r"\b" + re.escape(skill) + r"\b"

        if re.search(pattern, text):
            found.append(skill)

    return found

# -------------------------
# SKILL SCORE
# -------------------------

def calculate_skill_score(resume_skills, job_skills):

    matched = []

    for skill in job_skills:
        if skill in resume_skills:
            matched.append(skill)

    if len(job_skills) == 0:
        return 0, []

    score = (len(matched) / len(job_skills)) * 100

    return score, matched

# -------------------------
# EXPERIENCE DETECTION
# -------------------------

def calculate_experience_score(text):

    years = re.findall(r'(\d+)\+?\s*(year|years|yr|yrs)', text)

    if years:

        nums = [int(y[0]) for y in years]

        exp = max(nums)

        if exp >= 5:
            return 90
        elif exp >= 3:
            return 70
        elif exp >= 1:
            return 50

    return 30

# -------------------------
# EDUCATION EXTRACTION
# -------------------------

def extract_education(text):

    education = []

    lines = [l.strip() for l in text.split("\n") if l.strip()]

    i = 0

    while i < len(lines):

        line = lines[i].lower()

        if "b.e" in line or "b.tech" in line or "bachelor" in line:

            degree = lines[i]
            institution = ""
            gpa = ""
            year = ""

            if i+1 < len(lines):
                institution = lines[i+1]

            if i+2 < len(lines):
                g = re.search(r"\d\.\d+", lines[i+2])
                if g:
                    gpa = g.group()

            y = re.search(r"20\d{2}\s*[-–]\s*20\d{2}", degree)
            if y:
                year = y.group()

            education.append({
                "degree": degree,
                "institution": institution,
                "year": year if year else "N/A",
                "gpa": gpa
            })

            i += 3
            continue

        i += 1

    return education

# -------------------------
# JOB SIMILARITY
# -------------------------

def job_similarity_score(resume_text, job_role, job_skills):

    job_text = job_role + " " + " ".join(job_skills)

    vectorizer = TfidfVectorizer()

    vectors = vectorizer.fit_transform([resume_text, job_text])

    similarity = cosine_similarity(vectors[0], vectors[1])[0][0]

    return similarity * 100

# -------------------------
# FINAL SCORE
# -------------------------

def calculate_final_score(skill_score, job_score, exp_score):

    return (skill_score * 0.5) + (job_score * 0.3) + (exp_score * 0.2)

# -------------------------
# SUGGESTIONS
# -------------------------

def generate_suggestions(missing_skills, exp_score):

    suggestions = []

    for skill in missing_skills:
        suggestions.append(f"Add skill: {skill}")

    if exp_score < 40:
        suggestions.append("Add measurable achievements with numbers")

    return suggestions

# -------------------------
# MAIN API
# -------------------------

@app.post("/analyze-resume-role")
async def analyze_resume_role(
    job_role: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    try:

        file_bytes = await file.read()

        resume_text = extract_text_from_pdf(file_bytes)

        job_role = job_role.lower().strip()

        if job_role not in JOB_ROLE_SKILLS:
            return {"error": "Invalid job role"}

        job_skills = JOB_ROLE_SKILLS[job_role]

        resume_skills = extract_resume_skills(resume_text)

        skill_score, matched_skills = calculate_skill_score(
            resume_skills,
            job_skills
        )

        missing_skills = [s for s in job_skills if s not in matched_skills]

        exp_score = calculate_experience_score(resume_text)

        job_score = job_similarity_score(
            resume_text,
            job_role,
            job_skills
        )

        final_score = calculate_final_score(
            skill_score,
            job_score,
            exp_score
        )

        education = extract_education(resume_text)

        suggestions = generate_suggestions(
            missing_skills,
            exp_score
        )

        # -------------------------
        # SAVE TO DATABASE
        # -------------------------

        new_resume = models.Resume(
            file_name=file.filename,
            job_role=job_role,
            final_score=round(final_score,2),
            experience_score=exp_score,
            job_match_score=round(job_score,2)
        )

        db.add(new_resume)
        db.commit()

        return {

            "status": "success",
            "job_role": job_role,
            "final_score": round(final_score,2),
            "skills_found": matched_skills,
            "skills_missing": missing_skills,
            "job_match_score": round(job_score,2),
            "experience_score": exp_score,
            "education": education,
            "suggestions": suggestions

        }

    except Exception as e:

        return {
            "status":"error",
            "message":str(e)
        }

# -------------------------
# GET SAVED RESUMES
# -------------------------

@app.get("/resumes")
def get_resumes(db: Session = Depends(get_db)):

    resumes = db.query(models.Resume).all()

    return resumes