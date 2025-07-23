

import React, { useEffect, useState } from 'react';
import './App.css';
import { parseResume } from './parseResume';


function Section({ title, children }) {
  return (
    <section className="section">
      <h2 className="section-title">{title}</h2>
      <div>{children}</div>
    </section>
  );
}


function App() {
  const [resume, setResume] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/resume.txt')
      .then(res => res.text())
      .then(text => setResume(parseResume(text)))
      .catch(e => setError('Could not load resume.'));
  }, []);

  if (error) return <div className="resume-container"><p>{error}</p></div>;
  if (!resume) return <div className="resume-container"><p>Loading...</p></div>;

  return (
    <div className="resume-container">
      <header className="resume-header">
        <h1>{resume.name}</h1>
        <p>{resume.contact}</p>
        <h2>{resume.title}</h2>
        <p className="summary">{resume.summary}</p>
      </header>

      <Section title="Technical Skills">
        <ul>
          {resume.technicalSkills.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </Section>

      <Section title="Experience">
        <ul>
          {resume.experience.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </Section>

      <Section title="Core Competencies">
        <div className="core-competencies">
          {resume.coreCompetencies.map((c, i) => (
            <button className="competency-btn" key={i} type="button">{c}</button>
          ))}
        </div>
      </Section>

      <Section title="Education">
        <div className="education">{resume.education}</div>
      </Section>
    </div>
  );
}

export default App;
