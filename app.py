from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import fitz
import spacy
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import re

print("🚀 ADVANCED RESUME ANALYZER LOADED")

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
    "backend developer": ["python", "node", "sql", "docker"],
}

# ---------------- DOMAIN SKILLS ----------------
DOMAIN_SKILLS = {
    "data science": ["machine learning", "deep learning", "tensorflow", "pytorch"],
    "web development": ["react", "node", "javascript", "html", "css"],
    "cloud devops": ["aws", "docker", "kubernetes", "azure"],
}

# ---------------- PDF TEXT EXTRACT ----------------
def extract_text_from_pdf(file_bytes):
    text = ""
    pdf = fitz.open(stream=file_bytes, filetype="pdf")
    for page in pdf:
        text += page.get_text()
    return text.lower()

# ---------------- SKILL EXTRACT ----------------
def extract_skills(text):
    found = set()
    all_skills = set()

    for role in JOB_ROLE_SKILLS.values():
        all_skills.update(role)

    for domain in DOMAIN_SKILLS.values():
        all_skills.update(domain)

    for skill in all_skills:
        if skill in text:
            found.add(skill)

    return list(found)

# ---------------- DOMAIN DETECTION ----------------
def detect_domain(skills):
    best_domain = "general"
    best_score = 0

    for domain, domain_skills in DOMAIN_SKILLS.items():
        match = len(set(skills) & set(domain_skills))
        if match > best_score:
            best_score = match
            best_domain = domain

    return best_domain

# ---------------- EXPERIENCE DETECTION ----------------
def detect_experience(text):
    years = re.findall(r"\d+\s+years", text)
    if len(years) >= 2:
        return "experienced"
    elif len(years) == 1:
        return "intermediate"
    return "fresher"

# ---------------- SECTION SCORE ----------------
def resume_section_score(text):
    score = 0

    if "objective" in text or "summary" in text:
        score += 10
    if "education" in text:
        score += 15
    if "experience" in text:
        score += 20
    if "project" in text:
        score += 20
    if "skills" in text:
        score += 15
    if "certification" in text:
        score += 10
    if "achievement" in text:
        score += 10

    return min(score, 100)

# ---------------- SEMANTIC MATCH ----------------
def semantic_similarity(text1, text2):
    emb1 = model.encode([text1])
    emb2 = model.encode([text2])
    return float(cosine_similarity(emb1, emb2)[0][0] * 100)

# ---------------- SUGGESTIONS ----------------
def generate_suggestions(missing_skills, section_score):
    suggestions = []

    if missing_skills:
        suggestions.append("Add skills: " + ", ".join(missing_skills))

    if section_score < 60:
        suggestions.append("Improve resume sections like projects and achievements")

    return suggestions

# =====================================================
# 🚀 ENDPOINT 1 → RESUME + JOB ROLE
# =====================================================

@app.post("/analyze-resume-role")
async def analyze_resume_role(
    job_role: str = Form(...),
    file: UploadFile = File(...)
):

    file_bytes = await file.read()
    text = extract_text_from_pdf(file_bytes)

    job_role = job_role.lower().strip()
    if job_role not in JOB_ROLE_SKILLS:
        return {"error": "Invalid job role"}

    resume_skills = extract_skills(text)
    job_skills = JOB_ROLE_SKILLS[job_role]

    missing = list(set(job_skills) - set(resume_skills))

    skill_score = (len(resume_skills) / len(job_skills)) * 100 if job_skills else 0
    semantic_score = semantic_similarity(text, " ".join(job_skills))
    section_score = resume_section_score(text)

    final_score = skill_score * 0.3 + semantic_score * 0.4 + section_score * 0.3

    domain = detect_domain(resume_skills)
    exp_level = detect_experience(text)

    return {
        "job_role": job_role,
        "final_score": round(final_score, 2),
        "domain_detected": domain,
        "experience_level": exp_level,
        "skills_found": resume_skills,
        "skills_missing": missing,
        "suggestions": generate_suggestions(missing, section_score),
    }

# =====================================================
# 🚀 ENDPOINT 2 → RESUME + JOB DESCRIPTION
# =====================================================

@app.post("/analyze-resume-jd")
async def analyze_resume_jd(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):

    file_bytes = await file.read()
    resume_text = extract_text_from_pdf(file_bytes)
    jd_text = job_description.lower()

    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(jd_text)

    missing = list(set(jd_skills) - set(resume_skills))

    skill_score = (len(set(resume_skills) & set(jd_skills)) / len(jd_skills)) * 100 if jd_skills else 0
    semantic_score = semantic_similarity(resume_text, jd_text)
    section_score = resume_section_score(resume_text)

    final_score = skill_score * 0.3 + semantic_score * 0.4 + section_score * 0.3

    domain = detect_domain(resume_skills)
    exp_level = detect_experience(resume_text)

    return {
        "final_score": round(final_score, 2),
        "domain_detected": domain,
        "experience_level": exp_level,
        "skills_found": list(set(resume_skills) & set(jd_skills)),
        "skills_missing": missing,
        "suggestions": generate_suggestions(missing, section_score),
    }
