from sqlalchemy import Column, Integer, String, Float
from database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String)
    job_role = Column(String)
    final_score = Column(Float)
    experience_score = Column(Float)
    job_match_score = Column(Float)