// portfolio-loader.js
async function loadPortfolioFromSupabase() {
  try {
    const { data, error } = await supabaseClient
      .from("portfolio_content")
      .select("content")
      .eq("id", "main")
      .maybeSingle();

    if (error || !data || !data.content) return;
    const c = data.content;

    // 1. Hero Section
    if (c.heroKicker) document.querySelector(".hero-kicker").textContent = c.heroKicker;
    if (c.heroTitle) document.querySelector(".hero-content h1").textContent = c.heroTitle;
    if (c.heroText) document.querySelector(".hero-text").textContent = c.heroText;

    // 2. Profile Card
    if (c.profileName) document.querySelector(".profile-card h1").textContent = c.profileName;
    if (c.profileRole) document.querySelector(".profile-card h2").textContent = c.profileRole;
    if (c.profileBio) document.querySelector(".profile-card p").textContent = c.profileBio;
    // 2.5 Documents (Resume, CV, Semester Marks)
    if (c.resumeUrl) document.querySelector(".profile-card a.btn-primary").href = c.resumeUrl;
    if (c.cvUrl) document.querySelector(".profile-card a.btn-outline").href = c.cvUrl;
    if (c.semesterMarksUrl) document.querySelector(".profile-card a.btn-secondary").href = c.semesterMarksUrl;

    // 3. About Section
    if (c.aboutText) document.querySelector("#about p").textContent = c.aboutText;

    // 4. Skills Section
    if (Array.isArray(c.skills) && c.skills.length > 0) {
      const skillsGrid = document.querySelector("#skills .grid");
      skillsGrid.innerHTML = c.skills
        .map(skill => `<div class="card">${escapeHtml(skill)}</div>`)
        .join("");
    }

    // 5. Projects Section
    if (Array.isArray(c.projects) && c.projects.length > 0) {
      const projectsSection = document.getElementById("projects");
      const projectsHtml = c.projects
        .map(p => `
          <div class="project">
            <h4>${escapeHtml(p.title)}</h4>
            <p>${escapeHtml(p.description)}</p>
            <div class="project-actions">
              ${p.codeUrl ? `<a href="${escapeAttr(p.codeUrl)}" target="_blank" class="project-link">Code</a>` : ""}
              ${p.liveUrl ? `<a href="${escapeAttr(p.liveUrl)}" target="_blank" class="project-link live">Live</a>` : ""}
            </div>
          </div>
        `)
        .join("");

      projectsSection.innerHTML = `
        <h3>Projects</h3>
        ${projectsHtml}
        <a href="#linkedin" class="project-link linkedin-work">My LinkedIn Work</a>
      `;
    }
  } catch (err) {
    console.error("Portfolio load error:", err);
  }
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(str = "") {
  return escapeHtml(str).replace(/'/g, "&#39;");
}

document.addEventListener("DOMContentLoaded", loadPortfolioFromSupabase);