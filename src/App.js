import React, { useState } from 'react';
import axios from 'axios';
import { FiUpload, FiSave, FiDownload, FiEye, FiX, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ResumePreview from './components/ResumePreview';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await axios.post(
        'http://localhost:8000/upload-resume',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setResume(data);
      toast.success('Resume uploaded successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Upload failed';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setResume(prev => ({ ...prev, [field]: value }));
  };

  const handleExperienceChange = (id, field, value) => {
    setResume(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const handleEducationChange = (id, field, value) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const handleSkillChange = (id, field, value) => {
    setResume(prev => ({
      ...prev,
      skills: prev.skills.map(skill =>
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const addExperience = () => {
    setResume(prev => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          id: Date.now().toString(),
          company: '',
          position: '',
          duration: '',
          description: ['']
        }
      ]
    }));
    toast.info('Added new experience section');
  };

  const addEducation = () => {
    setResume(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Date.now().toString(),
          institution: '',
          degree: '',
          field: '',
          duration: ''
        }
      ]
    }));
    toast.info('Added new education section');
  };

  const addSkill = () => {
    setResume(prev => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          id: Date.now().toString(),
          name: '',
          category: ''
        }
      ]
    }));
    toast.info('Added new skill');
  };

  const removeExperience = (id) => {
    setResume(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id)
    }));
    toast.warning('Experience removed');
  };

  const removeEducation = (id) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
    toast.warning('Education removed');
  };

  const removeSkill = (id) => {
    setResume(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }));
    toast.warning('Skill removed');
  };

  const enhanceSection = async (section, content) => {
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:8000/ai-enhance', {
        section,
        content
      });
      toast.success('Content enhanced with AI');
      return data.enhanced_content;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Enhancement failed';
      toast.error(errorMsg);
      return content;
    } finally {
      setLoading(false);
    }
  };

  const saveResume = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/save-resume', resume);
      toast.success('Resume saved successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Save failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/generate-pdf/${resume.id}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume_${resume.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded successfully');
    } catch (err) {
      toast.error('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = async () => {
    const dataStr = JSON.stringify(resume, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume_${resume.id}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('JSON downloaded successfully');
  };

  if (!resume) {
    return (
      <div className="upload-container">
        <div className="upload-card">
          <div className="upload-icon">
            <FiUpload size={48} />
          </div>
          <h2>Upload Your Resume</h2>
          <p>Get started by uploading your resume in PDF or DOCX format</p>
          <label className="file-upload">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />
            Choose File
          </label>
          {file && <p className="file-name">{file.name}</p>}
          <button
            className="upload-button"
            onClick={handleUpload}
            disabled={!file || loading}
          >
            {loading ? 'Processing...' : 'Upload & Parse'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    );
  }

  return (
    <div className="editor-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="gradient-text">Resume</span> Editor
          </h1>
          <div className="action-buttons">
            <button
              className="preview-btn"
              onClick={() => setShowPreview(!showPreview)}
            >
              <FiEye /> {showPreview ? 'Hide Preview' : 'Preview'}
            </button>
            <button
              className="save-btn"
              onClick={saveResume}
              disabled={loading}
            >
              <FiSave /> {loading ? 'Saving...' : 'Save'}
            </button>
            <div className="dropdown">
              <button className="download-btn">
                <FiDownload /> Download <span className="chevron">▾</span>
              </button>
              <div className="dropdown-content">
                <button onClick={downloadPDF} disabled={loading}>
                  <FiDownload /> PDF
                </button>
                <button onClick={downloadJSON}>
                  <FiDownload /> JSON
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="progress-bar" style={{ width: loading ? '100%' : '0%' }}></div>
      </header>

      <div className="editor-content">
        <nav className="editor-tabs">
          <button
            className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <FiEdit2 /> Personal
          </button>
          <button
            className={`tab-button ${activeTab === 'experience' ? 'active' : ''}`}
            onClick={() => setActiveTab('experience')}
          >
            <FiEdit2 /> Experience
          </button>
          <button
            className={`tab-button ${activeTab === 'education' ? 'active' : ''}`}
            onClick={() => setActiveTab('education')}
          >
            <FiEdit2 /> Education
          </button>
          <button
            className={`tab-button ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <FiEdit2 /> Skills
          </button>
        </nav>

        <div className="tab-content">
          {activeTab === 'personal' && (
            <div className="personal-info">
              <h2 className="section-title">Personal Information</h2>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={resume.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={resume.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  value={resume.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={resume.location}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Professional Summary</label>
                <textarea
                  className="form-control"
                  value={resume.summary}
                  onChange={(e) => handleFieldChange('summary', e.target.value)}
                  rows={5}
                />
                <button
                  className="ai-enhance-btn"
                  onClick={async () => {
                    const enhanced = await enhanceSection('summary', resume.summary);
                    handleFieldChange('summary', enhanced);
                  }}
                  disabled={loading}
                >
                  {loading ? 'Enhancing...' : 'Enhance with AI'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="experience-section">
              <h2 className="section-title">Work Experience</h2>
              {resume.experiences.map((exp) => (
                <div key={exp.id} className="section-item">
                  <div className="item-actions">
                    <button
                      className="remove-btn"
                      onClick={() => removeExperience(exp.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  <div className="form-group">
                    <label>Company</label>
                    <input
                      type="text"
                      className="form-control"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Position</label>
                    <input
                      type="text"
                      className="form-control"
                      value={exp.position}
                      onChange={(e) => handleExperienceChange(exp.id, 'position', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      className="form-control"
                      value={exp.duration}
                      onChange={(e) => handleExperienceChange(exp.id, 'duration', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    {exp.description.map((desc, idx) => (
                      <div key={idx} className="description-item">
                        <input
                          type="text"
                          className="form-control"
                          value={desc}
                          onChange={(e) => {
                            const newDesc = [...exp.description];
                            newDesc[idx] = e.target.value;
                            handleExperienceChange(exp.id, 'description', newDesc);
                          }}
                        />
                        <button
                          className="ai-enhance-btn"
                          onClick={async () => {
                            const enhanced = await enhanceSection('experience', desc);
                            const newDesc = [...exp.description];
                            newDesc[idx] = enhanced;
                            handleExperienceChange(exp.id, 'description', newDesc);
                          }}
                          disabled={loading}
                        >
                          {loading ? 'Enhancing...' : 'Enhance'}
                        </button>
                      </div>
                    ))}
                    <button
                      className="add-btn"
                      onClick={() => {
                        const newDesc = [...exp.description, ''];
                        handleExperienceChange(exp.id, 'description', newDesc);
                      }}
                    >
                      <FiPlus /> Add Description
                    </button>
                  </div>
                </div>
              ))}
              <button className="add-btn" onClick={addExperience}>
                <FiPlus /> Add Experience
              </button>
            </div>
          )}

          {activeTab === 'education' && (
            <div className="education-section">
              <h2 className="section-title">Education</h2>
              {resume.education.map((edu) => (
                <div key={edu.id} className="section-item">
                  <div className="item-actions">
                    <button
                      className="remove-btn"
                      onClick={() => removeEducation(edu.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  <div className="form-group">
                    <label>Institution</label>
                    <input
                      type="text"
                      className="form-control"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(edu.id, 'institution', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Degree</label>
                    <input
                      type="text"
                      className="form-control"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Field of Study</label>
                    <input
                      type="text"
                      className="form-control"
                      value={edu.field}
                      onChange={(e) => handleEducationChange(edu.id, 'field', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      className="form-control"
                      value={edu.duration}
                      onChange={(e) => handleEducationChange(edu.id, 'duration', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Grade (CGPA/Percentage)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={edu.grade}
                      onChange={(e) => handleEducationChange(edu.id, 'grade', e.target.value)}
                      placeholder="e.g. CGPA: 3.8/4.0 or 92%"
                    />
                  </div>
                </div>
              ))}
              <button className="add-btn" onClick={addEducation}>
                <FiPlus /> Add Education
              </button>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="skills-section">
              <h2 className="section-title">Skills</h2>
              {resume.skills.map((skill) => (
                <div key={skill.id} className="section-item">
                  <div className="item-actions">
                    <button
                      className="remove-btn"
                      onClick={() => removeSkill(skill.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  <div className="form-group">
                    <label>Skill Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={skill.name}
                      onChange={(e) => handleSkillChange(skill.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      className="form-control"
                      value={skill.category}
                      onChange={(e) => handleSkillChange(skill.id, 'category', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <button className="add-btn" onClick={addSkill}>
                <FiPlus /> Add Skill
              </button>
            </div>
          )}
        </div>
      </div>

      {showPreview && (
        <div className="preview-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowPreview(false)}>
              <FiX />
            </button>
            <ResumePreview resume={resume} />
            <div className="preview-actions">
              <button onClick={downloadPDF} disabled={loading}>
                <FiDownload /> Download PDF
              </button>
              <button onClick={downloadJSON}>
                <FiDownload /> Download JSON
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default App;