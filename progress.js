window.onload = () => loadProgress();

function loadProgress() {
  const resolvedList = document.getElementById("resolvedList");
  resolvedList.innerHTML = "";

  let problems = JSON.parse(localStorage.getItem("problems")) || [];
  // Filter only resolved problems
  let resolved = problems.filter(p => p.status === "Resolved");

  if (resolved.length === 0) {
    resolvedList.innerHTML = `
      <div class="empty-state">
        <div class="icon">✅</div>
        <h3>No Resolved Issues Yet</h3>
        <p>Issues marked as resolved will appear here. Keep up the great work in making our community better!</p>
        <a href="request.html" class="btn btn-primary" style="margin-top: 1rem; display: inline-block; text-decoration: none;">Report New Issue</a>
      </div>
    `;
    return;
  }
  
  // Add progress stats at the top
  const totalProblems = problems.length;
  const resolvedCount = resolved.length;
  const resolutionRate = totalProblems > 0 ? Math.round((resolvedCount / totalProblems) * 100) : 0;
  
  const statsHTML = `
    <div class="progress-stats">
      <div class="stat-card">
        <div class="stat-number">${resolvedCount}</div>
        <div class="stat-label">Issues Resolved</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${totalProblems}</div>
        <div class="stat-label">Total Reports</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${resolutionRate}%</div>
        <div class="stat-label">Success Rate</div>
      </div>
    </div>
  `;
  
  resolvedList.innerHTML = statsHTML;

  // Create container for resolved problems
  const resolvedContainer = document.createElement('div');
  resolvedContainer.style.marginTop = '2rem';
  resolvedContainer.style.display = 'grid';
  resolvedContainer.style.gap = '1.5rem';
  resolvedContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(400px, 1fr))';
  
  resolved.forEach((problem) => {
    const div = document.createElement("div");
    div.className = "resolved";

    let imageHTML = "";
    if (problem.images && problem.images.length > 0) {
      const imagesToShow = problem.images.slice(0, 3); // Show max 3 thumbnails
      imageHTML = imagesToShow.map((img, index) => {
        const imgSrc = typeof img === 'string' ? img : img.data;
        return `<img src="${imgSrc}" class="thumb" onclick="openModal('${imgSrc}')" alt="Resolved problem image ${index + 1}">`;
      }).join("");
      
      if (problem.images.length > 3) {
        imageHTML += `<span class="more-images">+${problem.images.length - 3} more</span>`;
      }
    }

    div.innerHTML = `
      <div class="resolved-header">
        <h3>${problem.description}</h3>
        <span class="resolved-date">✅ ${problem.resolvedOn}</span>
      </div>
      ${imageHTML ? `<div class="resolved-images">${imageHTML}</div>` : ""}
      <div class="resolved-info">
        <p><b>Category:</b> ${problem.category || 'Not specified'}</p>
        <p><b>Priority:</b> ${problem.priority || 'Not set'}</p>
        <p><b>Originally submitted:</b> ${problem.submittedOn}</p>
        <p><b>Resolved on:</b> ${problem.resolvedOn}</p>
        ${problem.manualLocation ? `<p><b>Location:</b> ${problem.manualLocation}</p>` : ""}
      </div>
    `;

    resolvedContainer.appendChild(div);
  });
  
  resolvedList.appendChild(resolvedContainer);
}

// Modal functions
function openModal(src) {
  const modal = document.getElementById("imgModal");
  const modalImg = document.getElementById("modalImage");
  modal.style.display = "flex";
  modalImg.src = src;
}

function closeModal() {
  document.getElementById("imgModal").style.display = "none";
}
