/*
  content-data.js
  ----------------
  This is the single source of truth for everything shown on the site.
  Edit these values directly to permanently update your live portfolio,
  OR use the Admin panel on the site (secret login) to edit in-browser,
  then click "Export content.js" to download an updated version of this
  file, replace this file in your project, and push to GitHub.
*/

const DEFAULT_CONTENT = {
  hero: {
    name: "Your Name",
    titles: ["IT Student", "Aspiring Full-Stack Developer", "Problem Solver", "Lifelong Learner"],
    tagline: "Building things for the web, one commit at a time."
  },
  about: {
    text: "I'm an IT student passionate about building clean, functional, and thoughtful software — from full-stack web apps to automation scripts that make life easier. I like breaking things down to understand how they work, then rebuilding them better.",
    json: {
      role: "IT Student",
      focus: ["web dev", "systems", "networks"],
      status: "open to opportunities"
    },
    stats: [
      { label: "Projects Shipped", value: 8 },
      { label: "Years Learning", value: 3 },
      { label: "Cups of Coffee", value: 999 }
    ]
  },
  skills: [
    { name: "HTML / CSS", level: 90 },
    { name: "JavaScript", level: 80 },
    { name: "Python", level: 75 },
    { name: "Java", level: 65 },
    { name: "SQL / Databases", level: 70 },
    { name: "Git / GitHub", level: 85 },
    { name: "Networking", level: 60 },
    { name: "Linux", level: 65 }
  ],
  projects: [
    {
      title: "Project One",
      description: "A short, punchy description of what this project does and the problem it solves.",
      tech: ["JavaScript", "HTML", "CSS"],
      github: "#",
      live: "#"
    },
    {
      title: "Project Two",
      description: "A short, punchy description of what this project does and the problem it solves.",
      tech: ["Python", "Flask"],
      github: "#",
      live: "#"
    },
    {
      title: "Project Three",
      description: "A short, punchy description of what this project does and the problem it solves.",
      tech: ["Java", "MySQL"],
      github: "#",
      live: "#"
    }
  ],
  timeline: [
    {
      type: "education",
      role: "BS Information Technology",
      org: "Your University",
      period: "2023 — Present",
      description: "Focused on software development, networking, and systems administration."
    },
    {
      type: "experience",
      role: "IT Intern",
      org: "Company Name",
      period: "2025",
      description: "Assisted with internal tooling, network maintenance, and technical support."
    }
  ],
  contact: {
    email: "you@example.com",
    github: "https://github.com/yourname",
    linkedin: "https://linkedin.com/in/yourname"
  }
};

// Do not edit below this line — this exposes the data to the rest of the app.
if (typeof module !== "undefined" && module.exports) {
  module.exports = DEFAULT_CONTENT;
}
