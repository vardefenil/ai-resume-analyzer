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

    # Method 1: explicit "X years" mention
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

    # Method 2: detect date ranges like "2021 - 2024" or "June 2021 – present"
    date_years = re.findall(r'(20\d{2})', text)
    if len(date_years) >= 2:
        nums = [int(y) for y in date_years]
        span = max(nums) - min(nums)
        if span >= 4:
            return 80
        elif span >= 2:
            return 60
        elif span >= 1:
            return 45

    return 30

# -------------------------
# EDUCATION EXTRACTION
# -------------------------

def extract_education(text):

    education = []

    lines = [l.strip() for l in text.split("\n") if l.strip()]

    DEGREE_KEYWORDS = [
        "b.e", "b.tech", "bachelor", "b.sc", "b.s",
        "m.tech", "m.e", "master", "mba", "m.sc",
        "phd", "ph.d", "diploma", "higher secondary", "12th", "10th"
    ]

    # ── Helpers ────────────────────────────────────────────────────────────

    def find_gpa(line):
        """Return GPA string if found in a line, else empty string."""
        lower = line.lower()
        # labelled: GPA / CGPA / CPI / TPI / SGPA followed by the number
        m = re.search(r'(?:gpa|cgpa|cpi|tpi|sgpa)\s*[:\-]?\s*(\d+\.?\d*)', lower)
        if m:
            return m.group(1)
        # bare decimal like 7.50 or 8.9 that is plausibly a score
        m = re.search(r'\b(\d\.\d{1,2})\b', line)
        if m:
            val = float(m.group(1))
            if 0.0 < val <= 10.0:
                return m.group(1)
        return ""

    def find_year(line):
        """Return year-range string if found in a line, else empty string."""
        lower = line.lower()
        # e.g.  "June 2021 – June 2027"  or  "2021 - present"
        m = re.search(
            r'(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?'
            r'[a-z]*\.?\s*(20\d{2})\s*[-–to]+\s*'
            r'(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?'
            r'[a-z]*\.?\s*(20\d{2}|present|current)',
            lower
        )
        if m:
            # return the matched slice from the original (mixed-case) line
            start, end = m.span()
            return line[start:end].strip()
        return ""

    def is_gpa_line(line):
        lower = line.lower()
        if re.search(r'gpa|cgpa|cpi|tpi|sgpa', lower):
            return True
        # line is mainly a decimal number
        cleaned = re.sub(r'[^0-9.]', '', lower)
        if re.fullmatch(r'\d+\.\d+', cleaned):
            return True
        return False

    def is_year_line(line):
        return bool(find_year(line))

    def best_institution(lines, degree_idx):
        """Pick the most likely institution line from the neighbours."""
        candidates = []
        for offset in [1, 2, 3]:
            j = degree_idx + offset
            if j >= len(lines):
                break
            ln = lines[j]
            if is_gpa_line(ln) or is_year_line(ln):
                continue
            lower = ln.lower()
            # Skip lines that look like skill lists or short keywords
            if len(ln.split()) < 2:
                continue
            # Prefer lines with institution words
            score = 0
            if any(w in lower for w in ["university", "college", "institute",
                                        "school", "iit", "nit", "svit",
                                        "technology", "academic"]):
                score += 2
            if ln[0].isupper():
                score += 1
            candidates.append((score, ln))

        if not candidates:
            return ""
        candidates.sort(key=lambda x: -x[0])
        return candidates[0][1]

    # ── Main loop ──────────────────────────────────────────────────────────

    visited = set()

    for i, raw_line in enumerate(lines):
        if i in visited:
            continue

        lower_line = raw_line.lower()

        if not any(kw in lower_line for kw in DEGREE_KEYWORDS):
            continue

        degree = raw_line
        gpa    = ""
        year   = ""

        # Search a window of 6 lines after the degree for GPA and year
        window_end = min(len(lines), i + 7)
        for j in range(i, window_end):
            w = lines[j]
            if not year:
                yr = find_year(w)
                if yr:
                    year = yr
            if not gpa:
                gp = find_gpa(w)
                if gp:
                    gpa = gp
            if year and gpa:
                break

        # Also try the degree line itself for year
        if not year:
            year = find_year(degree)

        institution = best_institution(lines, i)

        education.append({
            "degree":      degree,
            "institution": institution,
            "year":        year if year else "N/A",
            "gpa":         gpa  if gpa  else "N/A"
        })

        visited.add(i)

    return education

# -------------------------
# JOB SIMILARITY
# -------------------------

def job_similarity_score(resume_text, job_role, job_skills):

    # Count how many job skill keywords appear in the resume text
    matched_count = sum(
        1 for skill in job_skills
        if re.search(r'\b' + re.escape(skill) + r'\b', resume_text)
    )

    # Base score from keyword density (0-70)
    keyword_score = (matched_count / len(job_skills)) * 70 if job_skills else 0

    # Bonus: TF-IDF cosine similarity scaled to 0-30
    try:
        job_text = job_role + " " + " ".join(job_skills)
        vectorizer = TfidfVectorizer()
        vectors = vectorizer.fit_transform([resume_text, job_text])
        raw_sim = cosine_similarity(vectors[0], vectors[1])[0][0]
        tfidf_bonus = min(raw_sim * 600, 30)  # scale up & cap at 30
    except Exception:
        tfidf_bonus = 0

    return round(min(keyword_score + tfidf_bonus, 100), 2)

# -------------------------
# FINAL SCORE
# -------------------------

def calculate_final_score(skill_score, job_score, exp_score):

    return round((skill_score * 0.5) + (job_score * 0.3) + (exp_score * 0.2), 2)

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
            final_score=float(round(final_score,2)),
            experience_score=int(exp_score),
            job_match_score=float(round(job_score,2))
        )

        db.add(new_resume)
        db.commit()

        return {

            "status": "success",
            "job_role": job_role,
            "final_score": float(round(final_score,2)),
            "skills_found": matched_skills,
            "skills_missing": missing_skills,
            "job_match_score": float(round(job_score,2)),
            "experience_score": int(exp_score),
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

# -------------------------
# STATS API
# -------------------------

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):

    from sqlalchemy import func, text

    # Total resume uploads
    total_uploads = db.query(func.count(models.Resume.id)).scalar() or 0

    # Uploads per job role
    role_counts = (
        db.query(models.Resume.job_role, func.count(models.Resume.id))
        .group_by(models.Resume.job_role)
        .all()
    )

    uploads_by_role = [
        {"role": role, "count": count}
        for role, count in role_counts
    ]

    # Average scores
    avg_final   = db.query(func.avg(models.Resume.final_score)).scalar()
    avg_job     = db.query(func.avg(models.Resume.job_match_score)).scalar()
    avg_exp     = db.query(func.avg(models.Resume.experience_score)).scalar()

    # Total registered users (logins) from Supabase auth schema
    try:
        result = db.execute(text("SELECT COUNT(*) FROM auth.users"))
        total_logins = result.scalar() or 0
    except Exception:
        total_logins = 0

    return {
        "total_uploads":   total_uploads,
        "total_logins":    total_logins,
        "uploads_by_role": uploads_by_role,
        "avg_final_score":     round(float(avg_final or 0), 2),
        "avg_job_match_score": round(float(avg_job  or 0), 2),
        "avg_experience_score":round(float(avg_exp  or 0), 2),
    }