// Utility to parse resume.txt into a structured JS object for the React app
// This is a simple parser for the provided resume.txt format

export function parseResume(text) {
  const lines = text.split(/\r?\n/);
  let i = 0;
  const resume = {
    name: '',
    contact: '',
    title: '',
    summary: '',
    technicalSkills: [],
    experience: [],
    coreCompetencies: [],
    education: ''
  };

  // Header
  resume.name = lines[i++]?.trim() || '';
  resume.contact = lines[i++]?.trim() || '';
  // Skip blank lines
  while (lines[i] && lines[i].trim() === '') i++;

  // Find section indices
  const sectionIndices = {};
  for (let idx = 0; idx < lines.length; idx++) {
    const l = lines[idx].toLowerCase();
    if (l.includes('technical skills')) sectionIndices.technicalSkills = idx;
    if (l.includes('experience')) sectionIndices.experience = idx;
    if (l.includes('core competencies')) sectionIndices.coreCompetencies = idx;
    if (l.includes('education')) sectionIndices.education = idx;
  }

  // Title and summary (between contact and technical skills)
  let titleLine = '';
  let summaryLines = [];
  for (; i < (sectionIndices.technicalSkills ?? lines.length); i++) {
    if (lines[i].trim() === '') continue;
    if (!titleLine) {
      titleLine = lines[i].trim();
    } else if (lines[i].startsWith('-')) {
      summaryLines.push(lines[i].replace(/^-	*/, ''));
    }
  }
  resume.title = titleLine;
  resume.summary = summaryLines.join(' ');

  // Technical Skills: Only lines between 'Technical Skills' and 'Experience' headers (or next section)
  resume.technicalSkills = [];
  if (sectionIndices.technicalSkills !== undefined) {
    const endIdx = sectionIndices.experience ?? sectionIndices.coreCompetencies ?? sectionIndices.education ?? lines.length;
    for (let j = sectionIndices.technicalSkills + 1; j < endIdx; j++) {
      const line = lines[j].trim();
      if (!line) continue;
      // Only include lines that start with '-' or contain ':'
      if (line.startsWith('-')) {
        resume.technicalSkills.push(line.replace(/^-[ \t]*/, ''));
      } else if (line.includes(':')) {
        resume.technicalSkills.push(line);
      }
    }
  }

  // Experience: Robustly group company and role as job title, handle blank lines/indentation
  resume.experience = [];
  if (sectionIndices.experience !== undefined) {
    const end = sectionIndices.coreCompetencies ?? sectionIndices.education ?? lines.length;
    let currentJob = null;
    let titleLines = [];
    let inTitle = false;
    for (let j = sectionIndices.experience + 1; j < end; j++) {
      const rawLine = lines[j];
      const line = rawLine.trim();
      // Skip section headers
      if (line.toLowerCase().includes('core competencies') || line.toLowerCase().includes('education')) continue;
      if (!line) {
        // Blank line: if we were collecting a title, finalize it
        if (titleLines.length > 0) {
          currentJob = { title: titleLines.join(' — '), bullets: [] };
          titleLines = [];
          inTitle = false;
        }
        continue;
      }
      if (!line.startsWith('-')) {
        // Non-bullet: collect as part of job title
        if (currentJob) {
          resume.experience.push(currentJob);
          currentJob = null;
        }
        titleLines.push(line);
        inTitle = true;
        // If next line is a bullet or end, finalize the job title
        const nextLine = lines[j+1]?.trim();
        if (!nextLine || nextLine.startsWith('-')) {
          currentJob = { title: titleLines.join(' — '), bullets: [] };
          titleLines = [];
          inTitle = false;
        }
      } else if (currentJob) {
        // Bullet point for current job
        currentJob.bullets.push(line.replace(/^-[ \t]*/, ''));
      }
    }
    // If we have a job in progress, push it
    if (currentJob) resume.experience.push(currentJob);
  }

  // Core Competencies
  resume.coreCompetencies = [];
  if (sectionIndices.coreCompetencies !== undefined) {
    for (let j = sectionIndices.coreCompetencies + 1; j < (sectionIndices.education ?? lines.length); j++) {
      if (lines[j].startsWith('-')) {
        resume.coreCompetencies = lines[j].replace(/^-	*/, '').split('•').map(s => s.trim()).filter(Boolean);
        break;
      }
    }
  }

  // Education
  resume.education = '';
  if (sectionIndices.education !== undefined) {
    let eduLines = [];
    for (let j = sectionIndices.education + 1; j < lines.length; j++) {
      if (lines[j].startsWith('-')) {
        eduLines.push(lines[j].replace(/^-	*/, ''));
      } else if (lines[j].trim() !== '') {
        eduLines.push(lines[j].trim());
      }
    }
    resume.education = eduLines.join(' ');
  }

  return resume;
}
