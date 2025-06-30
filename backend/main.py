
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uuid
import json
import PyPDF2
from io import BytesIO
import docx
import re
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from fastapi.responses import StreamingResponse

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
resumes_db = {}

# Data models
class SectionEnhancementRequest(BaseModel):
    section: str
    content: str

class Experience(BaseModel):
    id: str
    company: str
    position: str
    duration: str
    description: List[str]

class Education(BaseModel):
    id: str
    institution: str
    degree: str
    field: str
    duration: str
    grade: str

class Skill(BaseModel):
    id: str
    name: str
    category: str

class Resume(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    phone: str
    location: str
    summary: str
    experiences: List[Experience]
    education: List[Education]
    skills: List[Skill]

# Helper functions
def extract_text_from_pdf(file: UploadFile):
    pdf_reader = PyPDF2.PdfReader(BytesIO(file.file.read()))
    text = "\n".join([page.extract_text() for page in pdf_reader.pages])
    return text

def extract_text_from_docx(file: UploadFile):
    doc = docx.Document(BytesIO(file.file.read()))
    return "\n".join([para.text for para in doc.paragraphs])

def extract_contact_info(text: str):
    name = text.split('\n')[0].strip()
    email = re.search(r'[\w\.-]+@[\w\.-]+', text)
    phone = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    
    return {
        "name": name,
        "email": email.group(0) if email else "email@example.com",
        "phone": phone.group(0) if phone else "+1234567890",
        "location": "City, Country"
    }

def parse_resume_text(text: str):
    contact_info = extract_contact_info(text)
    
    # Parse experiences
    experiences = []
    exp_match = re.search(r'(EXPERIENCE|WORK HISTORY)(.+?)(?=EDUCATION|SKILLS|$)', text, re.DOTALL | re.IGNORECASE)
    if exp_match:
        exp_text = exp_match.group(2)
        bullet_points = [line.strip() for line in exp_text.split('\n') if line.strip() and len(line.strip()) > 10]
        if bullet_points:
            experiences.append({
                "id": str(uuid.uuid4()),
                "company": "Company Name",
                "position": "Job Title",
                "duration": "2025 - Present",
                "description": bullet_points[:3]
            })
    
    # Parse education
    education = []
    edu_match = re.search(r'EDUCATION(.+?)(?=EXPERIENCE|SKILLS|$)', text, re.DOTALL | re.IGNORECASE)
    if edu_match:
        edu_text = edu_match.group(1)
        education.append({
            "id": str(uuid.uuid4()),
            "institution": "University Name",
            "degree": "Degree Name",
            "field": "Field of Study",
            "duration": "2021 - 2025",
            "grade": "CGPA: 7.5/10.0"
        })
    
    # Parse skills
    skills = []
    skills_match = re.search(r'SKILLS(.+?)(?=EXPERIENCE|EDUCATION|$)', text, re.DOTALL | re.IGNORECASE)
    if skills_match:
        skills_text = skills_match.group(1)
        skills_list = [s.strip() for s in re.split(r'[,•\-•\n]', skills_text) if s.strip()]
        skills = [{
            "id": str(uuid.uuid4()),
            "name": skill,
            "category": "Technical" if any(word in skill.lower() for word in ['programming', 'software', 'developer']) else "Professional"
        } for skill in skills_list[:5]]
    
    return {
        **contact_info,
        "summary": "Experienced professional with demonstrated skills...",
        "experiences": experiences,
        "education": education,
        "skills": skills
    }

def enhance_with_ai(content: str, section: str) -> str:
    enhancements = {
        "summary": [
            "Results-driven professional with",
            "Demonstrated ability to",
            "Strong track record of"
        ],
        "experience": [
            "Key achievements:",
            "Successfully implemented",
            "Led initiatives that resulted in"
        ],
        "education": [
            "Relevant coursework:",
            "Academic honors:",
            "Thesis focus:"
        ],
        "skills": [
            "Advanced proficiency in",
            "Certified in",
            "Specialized knowledge of"
        ]
    }
    
    enhanced = content
    for phrase in enhancements.get(section, []):
        if phrase not in enhanced:
            enhanced = f"{phrase} {enhanced}"
    
    return enhanced

def generate_pdf_content(resume_data: dict):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Header
    p.setFont("Helvetica-Bold", 18)
    p.drawString(72, height-72, resume_data["name"])
    
    p.setFont("Helvetica", 12)
    p.drawString(72, height-100, f"{resume_data['email']} | {resume_data['phone']} | {resume_data['location']}")
    
    # Sections
    y_position = height-140
    sections = [
        ("PROFESSIONAL SUMMARY", resume_data["summary"], False),
        ("WORK EXPERIENCE", resume_data["experiences"], True),
        ("EDUCATION", resume_data["education"], True),
        ("SKILLS", resume_data["skills"], False)
    ]
    
    for title, content, is_list in sections:
        p.setFont("Helvetica-Bold", 14)
        p.drawString(72, y_position, title)
        y_position -= 30
        
        p.setFont("Helvetica", 12)
        if is_list:
            for item in content:
                if 'company' in item:  # Experience
                    p.drawString(72, y_position, f"{item['position']}, {item['company']}")
                    p.drawString(400, y_position, item['duration'])
                    y_position -= 20
                    for desc in item['description']:
                        p.drawString(80, y_position, f"• {desc}")
                        y_position -= 15
                elif 'institution' in item:  # Education
                    p.drawString(72, y_position, f"{item['degree']} in {item['field']}")
                    p.drawString(400, y_position, item['duration'])
                    y_position -= 15
                    p.drawString(72, y_position, item['institution'])
                    y_position -= 20
                y_position -= 10
                if item.get('grade'):
                    p.drawString(72, y_position, item['grade'])
                    y_position -= 15
                y_position -= 10
        else:
            if isinstance(content, list):  # Skills
                skills = ", ".join([skill['name'] for skill in content])
                p.drawString(72, y_position, skills)
                y_position -= 30
            else:  # Summary
                lines = content.split('\n')
                for line in lines:
                    p.drawString(72, y_position, line)
                    y_position -= 15
                y_position -= 10
        
        if y_position < 100:
            p.showPage()
            y_position = height-72
    
    p.save()
    buffer.seek(0)
    return buffer

# API endpoints
@app.post("/ai-enhance")
async def ai_enhance(request: SectionEnhancementRequest):
    enhanced_content = enhance_with_ai(request.content, request.section.lower())
    return {"enhanced_content": enhanced_content}

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    try:
        if file.filename.endswith('.pdf'):
            text = extract_text_from_pdf(file)
        elif file.filename.endswith('.docx'):
            text = extract_text_from_docx(file)
        else:
            raise HTTPException(400, detail="Only PDF or DOCX files allowed")
        
        parsed_data = parse_resume_text(text)
        resume_id = str(uuid.uuid4())
        resume = Resume(id=resume_id, **parsed_data)
        resumes_db[resume_id] = resume.dict()
        
        return resume
    
    except Exception as e:
        raise HTTPException(500, detail=f"Error processing resume: {str(e)}")

@app.post("/save-resume")
async def save_resume(resume: Resume):
    if not resume.id:
        resume.id = str(uuid.uuid4())
    resumes_db[resume.id] = resume.dict()
    return {"message": "Resume saved", "resume_id": resume.id}

@app.get("/get-resume/{resume_id}")
async def get_resume(resume_id: str):
    if resume_id not in resumes_db:
        raise HTTPException(404, detail="Resume not found")
    return resumes_db[resume_id]

@app.get("/download-resume/{resume_id}")
async def download_resume(resume_id: str):
    if resume_id not in resumes_db:
        raise HTTPException(404, detail="Resume not found")
    
    return {
        "filename": f"resume_{resume_id}.json",
        "content": json.dumps(resumes_db[resume_id], indent=2)
    }

@app.get("/generate-pdf/{resume_id}")
async def generate_pdf(resume_id: str):
    if resume_id not in resumes_db:
        raise HTTPException(404, detail="Resume not found")
    
    pdf_buffer = generate_pdf_content(resumes_db[resume_id])
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=resume_{resume_id}.pdf"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)