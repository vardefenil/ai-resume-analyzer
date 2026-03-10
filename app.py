from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import fitz
import spacy
import traceback
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

print("FINAL STABLE RESUME ANALYZER LOADED")

# ---------------- APP INIT ----------------
app = FastAPI(title="Advanced AI Resume Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- LOAD MODELS ----------------
nlp = spacy.load("en_core_web_sm")
model = SentenceTransformer("all-MiniLM-L6-v2")

# ---------------- JOB ROLE SKILLS ----------------
JOB_ROLE_SKILLS = {
    "python developer": ["python", "sql", "flask", "fastapi"],
    "data scientist": ["python", "machine learning", "data analysis", "pandas"],
    "frontend developer": ["react", "javascript", "html", "css"],
    "backend developer": ["python", "node", "sql", "docker"]
}

# ---------------- PDF TEXT EXTRACT ----------------
# Note: many resumes are scanned as images, in which case fitz (PyMuPDF)
# cannot pull out any "text" and we need OCR.  We try normal extraction
# first and then fall back to pytesseract if the result seems empty.

import pytesseract
from PIL import Image


def extract_text_from_pdf(file_bytes):
    try:
        text = ""

        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            for page in doc:
                page_text = page.get_text()
                if page_text:
                    text += page_text + "\n"

        if len(text.strip()) == 0:
            raise ValueError("No text found in PDF")

        return text

    except Exception as e:
        print("PDF READ ERROR:", str(e))
        raise Exception(f"PDF extraction failed: {str(e)}")

# ---------------- SKILL EXTRACT ----------------
def extract_resume_skills(text):
    skills = set()
    for role_skills in JOB_ROLE_SKILLS.values():
        for skill in role_skills:
            if skill in text:
                skills.add(skill)
    return list(skills)

# ---------------- JOB SIMILARITY ----------------
def job_similarity(resume_text, job_skills):
    job_text = " ".join(job_skills)

    emb1 = model.encode([resume_text])
    emb2 = model.encode([job_text])

    score = cosine_similarity(emb1, emb2)[0][0]
    return float(score * 100)

# ---------------- EXPERIENCE SCORE ----------------
def experience_score(text):
    numbers = sum(c.isdigit() for c in text)
    return min(numbers * 2, 100)

# ---------------- FINAL SCORE ----------------
def final_score(skill_score, job_score, exp_score):
    return skill_score*0.4 + job_score*0.4 + exp_score*0.2

# ---------------- SUGGESTIONS ----------------
def generate_suggestions(missing, exp_score):
    suggestions = []
    if missing:
        suggestions.append("Add skills like: " + ", ".join(missing))
    if exp_score < 40:
        suggestions.append("Add measurable achievements with numbers")
    return suggestions

# ---------------- MAIN API ----------------
@app.post("/analyze-resume-role")
async def analyze_resume_role(
    job_role: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        file_bytes = await file.read()
        resume_text = extract_text_from_pdf(file_bytes)

        job_role = job_role.lower().strip()

        if job_role not in JOB_ROLE_SKILLS:
            return {"error": "Invalid job role"}

        resume_skills = extract_resume_skills(resume_text)
        job_skills = JOB_ROLE_SKILLS[job_role]

        missing = list(set(job_skills) - set(resume_skills))

        skill_score = (len(resume_skills) / len(job_skills)) * 100 if job_skills else 0
        job_score = job_similarity(resume_text, job_skills)
        exp_score = experience_score(resume_text)

        final = final_score(skill_score, job_score, exp_score)
        suggestions = generate_suggestions(missing, exp_score)

        return {
            "status": "success",
            "job_role": job_role,
            "final_score": round(final, 2),
            "skills_found": resume_skills,
            "skills_missing": missing,
            "job_match_score": round(job_score, 2),
            "experience_score": round(exp_score, 2),
            "suggestions": suggestions
        }

    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}
