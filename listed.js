// Global variables
let allProblems = [];
let filteredProblems = [];

window.onload = () => {
  allProblems = JSON.parse(localStorage.getItem("problems")) || [];
  filteredProblems = [...allProblems];
  
  initializeFilters();
  updateStats();
  displayProblems();
};

function initializeFilters() {
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const categoryFilter = document.getElementById("categoryFilter");
  const priorityFilter = document.getElementById("priorityFilter");
  const sortBy = document.getElementById("sortBy");
  const exportCSV = document.getElementById("exportCSV");
  const showStats = document.getElementById("showStats");
  
  // Add event listeners for real-time filtering
  searchInput.addEventListener("input", applyFilters);
  statusFilter.addEventListener("change", applyFilters);
  categoryFilter.addEventListener("change", applyFilters);
  priorityFilter.addEventListener("change", applyFilters);
  sortBy.addEventListener("change", applyFilters);
  
  // Add export and stats functionality
  exportCSV.addEventListener("click", exportToCSV);
  showStats.addEventListener("click", showStatistics);
}

function applyFilters() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const statusFilter = document.getElementById("statusFilter").value;
  const categoryFilter = document.getElementById("categoryFilter").value;
  const priorityFilter = document.getElementById("priorityFilter").value;
  const sortBy = document.getElementById("sortBy").value;
  
  // Start with all problems
  filteredProblems = allProblems.filter(problem => {
    // Text search
    const matchesSearch = !searchTerm || 
      problem.description.toLowerCase().includes(searchTerm) ||
      (problem.manualLocation && problem.manualLocation.toLowerCase().includes(searchTerm));
    
    // Status filter
    const matchesStatus = statusFilter === "all" || 
      problem.status.toLowerCase() === statusFilter;
    
    // Category filter
    const matchesCategory = categoryFilter === "all" || 
      problem.category === categoryFilter;
    
    // Priority filter
    const matchesPriority = priorityFilter === "all" || 
      problem.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });
  
  // Apply sorting
  sortProblems(sortBy);
  
  // Update display
  updateStats();
  displayProblems();
}

function sortProblems(sortBy) {
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  
  switch (sortBy) {
    case "oldest":
      filteredProblems.sort((a, b) => a.id - b.id);
      break;
    case "priority":
      filteredProblems.sort((a, b) => {
        const aPriority = priorityOrder[a.priority] || 0;
        const bPriority = priorityOrder[b.priority] || 0;
        return bPriority - aPriority; // High priority first
      });
      break;
    case "category":
      filteredProblems.sort((a, b) => (a.category || "").localeCompare(b.category || ""));
      break;
    case "newest":
    default:
      filteredProblems.sort((a, b) => b.id - a.id);
      break;
  }
}

function updateStats() {
  const totalCount = document.getElementById("totalCount");
  const pendingCount = document.getElementById("pendingCount");
  const resolvedCount = document.getElementById("resolvedCount");
  
  const pending = filteredProblems.filter(p => p.status === "Pending").length;
  const resolved = filteredProblems.filter(p => p.status === "Resolved").length;
  const total = filteredProblems.length;
  
  totalCount.textContent = `${total} problem${total !== 1 ? 's' : ''}`;
  pendingCount.textContent = `${pending} pending`;
  resolvedCount.textContent = `${resolved} resolved`;
}

function displayProblems() {
  const problemList = document.getElementById("problemList");
  
  if (filteredProblems.length === 0) {
    problemList.innerHTML = `
      <div class="empty-state">
        <h3>No problems found</h3>
        <p>Try adjusting your filters or search terms</p>
      </div>
    `;
    return;
  }
  
  problemList.innerHTML = "";
  
  filteredProblems.forEach((problem) => {
    const div = document.createElement("div");
    div.className = "problem";
    div.dataset.priority = problem.priority || "";
    
    let imageHTML = "";
    if (problem.images && problem.images.length > 0) {
      const imagesToShow = problem.images.slice(0, 3); // Show max 3 thumbnails
      imageHTML = imagesToShow.map((img, index) => {
        const imgSrc = typeof img === 'string' ? img : img.data;
        return `<img src="${imgSrc}" class="thumb" onclick="openModal('${imgSrc}')" alt="Problem image ${index + 1}">`;
      }).join("");
      
      if (problem.images.length > 3) {
        imageHTML += `<span class="more-images">+${problem.images.length - 3} more</span>`;
      }
    }
    
    const priorityIcon = getPriorityIcon(problem.priority);
    const categoryIcon = getCategoryIcon(problem.category);
    
    div.innerHTML = `
      <div class="problem-header">
        <h3>${problem.description}</h3>
        <div class="badges">
          ${problem.priority ? `<span class="priority-badge priority-${problem.priority}">${priorityIcon} ${problem.priority}</span>` : ""}
          <span class="status-badge status-${problem.status.toLowerCase()}">${problem.status}</span>
        </div>
      </div>
      <div class="problem-meta">
        <div class="meta-row">
          ${problem.category ? `<span class="category">${categoryIcon} ${problem.category}</span>` : ""}
          <span class="date">📅 ${problem.submittedOn}</span>
        </div>
        ${problem.manualLocation ? `<div class="location">📍 ${problem.manualLocation}</div>` : ""}
        ${problem.resolvedOn ? `<div class="resolved-date">✅ Resolved: ${problem.resolvedOn}</div>` : ""}
      </div>
      ${imageHTML ? `<div class="problem-images">${imageHTML}</div>` : ""}
      ${problem.status !== "Resolved" ? `<button class="resolve-btn" onclick="markResolved(${problem.id})">Mark as Resolved</button>` : ""}
    `;
    
    problemList.appendChild(div);
  });
}

function getPriorityIcon(priority) {
  switch (priority) {
    case "high": return "🔴";
    case "medium": return "🟡";
    case "low": return "🟢";
    default: return "⚪";
  }
}

function getCategoryIcon(category) {
  switch (category) {
    case "waste": return "🗑️";
    case "infrastructure": return "🚧";
    case "environment": return "🌱";
    case "pollution": return "💨";
    default: return "📝";
  }
}

// Export functionality
function exportToCSV() {
  if (filteredProblems.length === 0) {
    alert("⚠️ No problems to export!");
    return;
  }
  
  // CSV headers
  const headers = [
    "ID", "Description", "Category", "Priority", "Status", 
    "Submitted Date", "Resolved Date", "Location", "Image Count"
  ];
  
  // Convert problems to CSV format
  const csvData = filteredProblems.map(problem => [
    problem.id,
    `"${problem.description.replace(/"/g, '""')}"`,
    problem.category || "",
    problem.priority || "",
    problem.status,
    problem.submittedOn,
    problem.resolvedOn || "",
    problem.manualLocation ? `"${problem.manualLocation.replace(/"/g, '""')}"` : "",
    problem.images ? problem.images.length : 0
  ]);
  
  // Create CSV content
  const csvContent = [headers, ...csvData]
    .map(row => row.join(","))
    .join("\n");
  
  // Download CSV file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `community-problems-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  alert(`✅ Exported ${filteredProblems.length} problems to CSV!`);
}

function showStatistics() {
  const stats = calculateStatistics();
  const statsContent = document.getElementById("statsContent");
  
  statsContent.innerHTML = `
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <h3>Total Problems</h3>
          <div class="stat-number">${stats.total}</div>
        </div>
      </div>
      
      <div class="stat-item">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <h3>Pending</h3>
          <div class="stat-number pending">${stats.pending}</div>
        </div>
      </div>
      
      <div class="stat-item">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <h3>Resolved</h3>
          <div class="stat-number resolved">${stats.resolved}</div>
        </div>
      </div>
      
      <div class="stat-item">
        <div class="stat-icon">🎯</div>
        <div class="stat-info">
          <h3>Resolution Rate</h3>
          <div class="stat-number">${stats.resolutionRate}%</div>
        </div>
      </div>
    </div>
    
    <div class="charts-section">
      <div class="chart-container">
        <h4>Problems by Category</h4>
        <div class="category-chart">
          ${Object.entries(stats.byCategory).map(([category, count]) => `
            <div class="chart-bar">
              <div class="bar-label">${getCategoryIcon(category)} ${category}</div>
              <div class="bar-visual">
                <div class="bar-fill" style="width: ${(count / stats.total) * 100}%"></div>
              </div>
              <div class="bar-value">${count}</div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="chart-container">
        <h4>Problems by Priority</h4>
        <div class="priority-chart">
          ${Object.entries(stats.byPriority).map(([priority, count]) => `
            <div class="chart-bar">
              <div class="bar-label">${getPriorityIcon(priority)} ${priority}</div>
              <div class="bar-visual">
                <div class="bar-fill priority-${priority}" style="width: ${(count / stats.total) * 100}%"></div>
              </div>
              <div class="bar-value">${count}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    
    <div class="recent-activity">
      <h4>Recent Activity</h4>
      <div class="activity-list">
        ${stats.recentActivity.map(activity => `
          <div class="activity-item">
            <div class="activity-icon">${activity.type === 'submitted' ? '🆕' : '✅'}</div>
            <div class="activity-content">
              <div class="activity-description">${activity.description}</div>
              <div class="activity-date">${activity.date}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  document.getElementById("statsModal").style.display = "block";
}

function calculateStatistics() {
  const stats = {
    total: allProblems.length,
    pending: allProblems.filter(p => p.status === "Pending").length,
    resolved: allProblems.filter(p => p.status === "Resolved").length,
    byCategory: {},
    byPriority: {},
    recentActivity: []
  };
  
  stats.resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
  
  // Group by category
  allProblems.forEach(problem => {
    const category = problem.category || "other";
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
  });
  
  // Group by priority
  allProblems.forEach(problem => {
    const priority = problem.priority || "unset";
    stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
  });
  
  // Recent activity (last 10 items)
  const recentProblems = [...allProblems]
    .sort((a, b) => b.id - a.id)
    .slice(0, 10);
  
  stats.recentActivity = recentProblems.map(problem => ({
    type: problem.status === "Resolved" ? "resolved" : "submitted",
    description: problem.description.substring(0, 50) + (problem.description.length > 50 ? "..." : ""),
    date: problem.status === "Resolved" ? problem.resolvedOn : problem.submittedOn
  }));
  
  return stats;
}

function closeStatsModal() {
  document.getElementById("statsModal").style.display = "none";
}

// Close modal when clicking outside
window.addEventListener("click", function(event) {
  const statsModal = document.getElementById("statsModal");
  if (event.target === statsModal) {
    statsModal.style.display = "none";
  }
});

function markResolved(id) {
  let problems = JSON.parse(localStorage.getItem("problems")) || [];
  problems = problems.map(problem => {
    if (problem.id === id) {
      problem.status = "Resolved";
      problem.resolvedOn = new Date().toLocaleDateString();
    }
    return problem;
  });
  localStorage.setItem("problems", JSON.stringify(problems));
  
  // Use enhanced notification system
  if (window.showToast) {
    window.showToast('✅ Problem marked as resolved! Great work on making our community better.', 'success', 6000);
  }
  
  if (window.sendNotification) {
    window.sendNotification(
      'Issue Resolved! ✅',
      'A community problem has been successfully resolved. Thank you for your contribution!'
    );
  }
  
  // Reload with a slight delay to show the notification
  setTimeout(() => {
    window.location.reload();
  }, 1500);
}
// Open image modal
function openModal(src) {
  const modal = document.getElementById("imgModal");
  const modalImg = document.getElementById("modalImage");
  modal.style.display = "flex";
  modalImg.src = src;
}

// Close image modal
function closeModal() {
  document.getElementById("imgModal").style.display = "none";
}
