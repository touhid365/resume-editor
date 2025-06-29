
import React from 'react';
import { FiDownload } from 'react-icons/fi';
import './ResumePreview.css';

const ResumePreview = ({ resume }) => {
  return (
    <div className="resume-preview">
      <div className="resume-paper">
        <header className="resume-header">
          <h1>{resume.name}</h1>
          <div className="contact-info">
            <p>{resume.email}</p>
            <p>{resume.phone}</p>
            <p>{resume.location}</p>
          </div>
        </header>
        
        <section className="resume-section">
          <h2>PROFESSIONAL SUMMARY</h2>
          <div className="section-content">
            <p>{resume.summary}</p>
          </div>
        </section>
        
        <section className="resume-section">
          <h2>WORK EXPERIENCE</h2>
          <div className="section-content">
            {resume.experiences.map((exp, idx) => (
              <div key={idx} className="experience-item">
                <div className="experience-header">
                  <h3>{exp.position}</h3>
                  <span className="experience-duration">{exp.duration}</span>
                </div>
                <h4 className="experience-company">{exp.company}</h4>
                <ul className="experience-description">
                  {exp.description.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
        
        <section className="resume-section">
          <h2>EDUCATION</h2>
          <div className="section-content">
            {resume.education.map((edu, idx) => (
              <div key={idx} className="education-item">
                <h3>{edu.degree} in {edu.field}</h3>
                <div className="education-details">
                  <span className="education-institution">{edu.institution}</span>
                  <span className="education-duration">{edu.duration}</span>
                </div>
                {edu.grade && <div className="education-grade">{edu.grade}</div>}
              </div>
            ))}
          </div>
        </section>
        
        <section className="resume-section">
          <h2>SKILLS</h2>
          <div className="section-content skills-container">
            {resume.skills.map((skill, idx) => (
              <span key={idx} className="skill-tag">{skill.name}</span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResumePreview;