// Community Hub Main Script
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("problemForm");
  const message = document.getElementById("message");
  const problemsList = document.getElementById("problemsList");
  const progressList = document.getElementById("progressList");

  // ✅ Handle Problem Submission (Request Page)
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const description = document.getElementById("description").value.trim();
      const photoInput = document.getElementById("photo");

      if (!description) {
        alert("⚠ Please enter a description!");
        return;
      }

      let photo = "";

      // Convert uploaded image to Base64
      if (photoInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(event) {
          photo = event.target.result;
          saveProblem(description, photo);
        };
        reader.readAsDataURL(photoInput.files[0]);
      } else {
        saveProblem(description, photo);
      }
    });
  }

  // 📌 Save Problem to localStorage
  function saveProblem(description, photo) {
    const problems = JSON.parse(localStorage.getItem("problems")) || [];
    const newProblem = {
      id: Date.now(),
      description,
      photo,
      status: "Pending",
      submittedOn: new Date().toLocaleDateString(),
      resolvedOn: null
    };

    problems.push(newProblem);
    localStorage.setItem("problems", JSON.stringify(problems));

    // Success Message
    if (message) {
      message.textContent = "✅ Your request has been submitted successfully!";
      message.classList.remove("hidden");
    }

    // Browser Notification (only if enabled and permission granted)
    const notificationsDisabled = localStorage.getItem('notificationsDisabled') === 'true';
    if (!notificationsDisabled && Notification.permission === "granted") {
      new Notification("Community Hub", { 
        body: "Your problem has been submitted successfully!",
        tag: "problem-submitted", // Prevents duplicate notifications
        requireInteraction: false // Don't force user interaction
      });
    }

    form.reset();
  }

  // 📋 Load Problems on Listed Page
  if (problemsList) {
    loadListedProblems();
  }

  function loadListedProblems() {
    const problems = JSON.parse(localStorage.getItem("problems")) || [];
    problemsList.innerHTML = problems.map(p =>
      `<li>
        <strong>${p.description}</strong><br>
        Status: <span class="badge ${p.status.toLowerCase()}">${p.status}</span><br>
        Submitted On: ${p.submittedOn}
        ${p.photo ? `<br><img src="${p.photo}" width="150">` : ""}
        ${p.status !== "Resolved" ? 
          `<br><button onclick="markResolved(${p.id})">Mark as Resolved</button>` : ""}
      </li>`
    ).join("");
  }

  // ✅ Load Resolved Problems on Progress Page
  if (progressList) {
    loadResolvedProblems();
  }

  function loadResolvedProblems() {
    const problems = JSON.parse(localStorage.getItem("problems")) || [];
    const resolved = problems.filter(p => p.status === "Resolved");

    progressList.innerHTML = resolved.map(p =>
      `<li>
        <strong>${p.description}</strong><br>
        Resolved On: ${p.resolvedOn}<br>
        ${p.photo ? `<img src="${p.photo}" width="150">` : ""}
      </li>`
    ).join("");
  }

  // 📌 Expose markResolved for Listed Page
  window.markResolved = function(id) {
    let problems = JSON.parse(localStorage.getItem("problems")) || [];
    problems = problems.map(p => {
      if (p.id === id) {
        p.status = "Resolved";
        p.resolvedOn = new Date().toLocaleDateString();
      }
      return p;
    });
    localStorage.setItem("problems", JSON.stringify(problems));
    loadListedProblems();
    alert("✅ Problem marked as resolved!");
  };
});
