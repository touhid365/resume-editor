# Resume Editor

A web-based Resume Editor that allows users to upload, edit, enhance, and download their resumes. The application features a React frontend and a FastAPI backend with mock AI enhancement capabilities.

## Features

- Upload resume files (PDF/DOCX)
- Edit resume sections:
  - Personal Information
  - Summary
  - Experience
  - Education
  - Skills
- AI-powered enhancement for each section
- Save resume data
- Download resume as JSON

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the backend server:
```bash
uvicorn main:app --reload
```

The backend will be running at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be running at http://localhost:3000

## Usage

1. Open http://localhost:3000 in your browser
2. Upload a resume file (PDF or DOCX)
3. Edit the parsed information in each section
4. Use the "Enhance" buttons to improve section content
5. Save your changes
6. Download the final resume as JSON

## Project Structure

```
resume-editor/
├── backend/
│   ├── main.py              # FastAPI backend
│   └── requirements.txt     # Python dependencies
└── frontend/
    ├── public/              # Static files
    └── src/
        ├── components/      # React components
        │   ├── ResumePreview.js
        │   ├── ResumePreview.css
        │   
        │   
        ├── App.js           # Main React component
        └── App.css       # Global styles
```

## Technologies Used

- Frontend:
  - React
  - Modern CSS
- Backend:
  - FastAPI
  - Pydantic
  - Python 3.8+ #
