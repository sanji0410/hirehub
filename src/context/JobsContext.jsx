// context/JobsContext.jsx
// Manages jobs, applications, and related operations

import { createContext, useContext, useState, useEffect } from 'react';

const JobsContext = createContext(null);

// ——— Seed Jobs ———
const SEED_JOBS = [
  {
    id: 'j1',
    employerId: 'u2',
    company: 'TechNova Solutions',
    title: 'Senior React Developer',
    location: 'Bengaluru, India',
    type: 'Full-time',
    salary: '₹18-25 LPA',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    description: 'We are looking for an experienced React developer to lead our frontend team. You will architect scalable UI solutions and mentor junior developers. Strong understanding of component design, performance optimization, and testing required.',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'j2',
    employerId: 'u2',
    company: 'TechNova Solutions',
    title: 'Backend Engineer (Node.js)',
    location: 'Remote',
    type: 'Full-time',
    salary: '₹15-22 LPA',
    skills: ['Node.js', 'Express', 'MongoDB', 'AWS'],
    description: 'Join our platform team to build highly scalable APIs and microservices. You will work on our core product infrastructure, handling millions of requests daily. Experience with cloud platforms and distributed systems is a plus.',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'j3',
    employerId: 'u2',
    company: 'TechNova Solutions',
    title: 'UI/UX Designer',
    location: 'Mumbai, India',
    type: 'Part-time',
    salary: '₹8-12 LPA',
    skills: ['Figma', 'Prototyping', 'User Research', 'Design Systems'],
    description: 'Create delightful user experiences for our growing product suite. You will own end-to-end design from user research to high-fidelity prototypes. Collaborate closely with engineers to ensure pixel-perfect implementation.',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'j4',
    employerId: 'u2',
    company: 'TechNova Solutions',
    title: 'DevOps Engineer',
    location: 'Hyderabad, India',
    type: 'Contract',
    salary: '₹20-30 LPA',
    skills: ['Kubernetes', 'Docker', 'CI/CD', 'Terraform', 'AWS'],
    description: 'Automate and optimize our deployment pipelines and cloud infrastructure. You will manage Kubernetes clusters, implement monitoring, and drive reliability improvements. Strong scripting skills required.',
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'j5',
    employerId: 'u2',
    company: 'TechNova Solutions',
    title: 'Data Scientist',
    location: 'Remote',
    type: 'Full-time',
    salary: '₹22-35 LPA',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics'],
    description: 'Drive data-driven decision making across the organization. You will build predictive models, design experiments, and uncover business insights from our large datasets. PhD or equivalent research experience preferred.',
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ——— Seed Applications ———
const SEED_APPS = [
  {
    id: 'a1',
    jobId: 'j1',
    seekerId: 'u1',
    seekerName: 'Priya Sharma',
    seekerEmail: 'priya@example.com',
    status: 'shortlisted',
    appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    coverLetter: 'I am very excited about this opportunity...',
  },
  {
    id: 'a2',
    jobId: 'j3',
    seekerId: 'u1',
    seekerName: 'Priya Sharma',
    seekerEmail: 'priya@example.com',
    status: 'applied',
    appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    coverLetter: 'Design has been my passion since college...',
  },
];

export function JobsProvider({ children }) {
  const [jobs, setJobs]               = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const storedJobs = localStorage.getItem('hh_jobs');
    const storedApps = localStorage.getItem('hh_applications');
    setJobs(storedJobs ? JSON.parse(storedJobs) : SEED_JOBS);
    setApplications(storedApps ? JSON.parse(storedApps) : SEED_APPS);
    if (!storedJobs) localStorage.setItem('hh_jobs', JSON.stringify(SEED_JOBS));
    if (!storedApps) localStorage.setItem('hh_applications', JSON.stringify(SEED_APPS));
  }, []);

  // ——— Post a new job ———
  const postJob = (jobData, employer) => {
    const newJob = {
      id: `j${Date.now()}`,
      employerId: employer.id,
      company: employer.company || employer.name,
      ...jobData,
      postedAt: new Date().toISOString(),
    };
    const updated = [newJob, ...jobs];
    setJobs(updated);
    localStorage.setItem('hh_jobs', JSON.stringify(updated));
    return newJob;
  };

  // ——— Delete a job ———
  const deleteJob = (jobId) => {
    const updated = jobs.filter(j => j.id !== jobId);
    setJobs(updated);
    localStorage.setItem('hh_jobs', JSON.stringify(updated));
  };

  // ——— Apply to a job ———
  const applyToJob = (jobId, seeker, coverLetter) => {
    const already = applications.find(a => a.jobId === jobId && a.seekerId === seeker.id);
    if (already) return { success: false, error: 'Already applied to this job.' };

    // Read the seeker's uploaded resume from localStorage (saved by Profile page).
    // hh_resume_url_<id>  — the object URL created via URL.createObjectURL()
    // hh_resume_name_<id> — the original filename for display purposes
    const resume     = localStorage.getItem(`hh_resume_url_${seeker.id}`) || null;
    const resumeName = localStorage.getItem(`hh_resume_name_${seeker.id}`) || null;

    const newApp = {
      id: `a${Date.now()}`,
      jobId,
      seekerId: seeker.id,
      seekerName: seeker.name,
      seekerEmail: seeker.email,
      status: 'applied',
      appliedAt: new Date().toISOString(),
      coverLetter,
      resume,      // object URL — viewable in the same browser session
      resumeName,  // shown to employer even after session ends
    };
    const updated = [newApp, ...applications];
    setApplications(updated);
    localStorage.setItem('hh_applications', JSON.stringify(updated));
    return { success: true };
  };

  // ——— Update application status (employer) ———
  const updateAppStatus = (appId, status) => {
    const updated = applications.map(a => a.id === appId ? { ...a, status } : a);
    setApplications(updated);
    localStorage.setItem('hh_applications', JSON.stringify(updated));
  };

  // ——— Helpers ———
  const getJobsByEmployer  = (empId) => jobs.filter(j => j.employerId === empId);
  const getAppsBySeeker    = (seekId) => applications.filter(a => a.seekerId === seekId);
  const getAppsByJob       = (jobId)  => applications.filter(a => a.jobId === jobId);
  const getAppsByEmployer  = (empId)  => {
    const empJobIds = jobs.filter(j => j.employerId === empId).map(j => j.id);
    return applications.filter(a => empJobIds.includes(a.jobId));
  };
  const hasApplied = (jobId, seekerId) =>
    !!applications.find(a => a.jobId === jobId && a.seekerId === seekerId);

  return (
    <JobsContext.Provider value={{
      jobs, applications,
      postJob, deleteJob, applyToJob, updateAppStatus,
      getJobsByEmployer, getAppsBySeeker, getAppsByJob,
      getAppsByEmployer, hasApplied,
    }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error('useJobs must be used inside <JobsProvider>');
  return ctx;
}
