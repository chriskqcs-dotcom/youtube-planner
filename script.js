const ideaForm = document.getElementById("ideaForm");
const ideaList = document.getElementById("ideaList");
const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");
const exportJSONBtn = document.getElementById("exportJSON");
const importJSONBtn = document.getElementById("importJSON");

let ideas = JSON.parse(localStorage.getItem("ideas")) || [];
let filteredIdeas = [...ideas];

function renderIdeas() {
  ideaList.innerHTML = "";
  filteredIdeas.forEach((idea, ideaIndex) => {
    const li = document.createElement("li");
    li.className = "idea";
    li.innerHTML = `
      <strong>${idea.title}</strong>
      <p>${idea.description}</p>
      <div>${idea.tags.map(tag => `<span class='tag'>${tag}</span>`).join("")}</div>
      <p><em>${idea.category || "Uncategorized"}</em></p>

      <div class="scenes">
        <h4>Scenes</h4>
        <ul>
          ${idea.scenes
            .map(
              (scene, sceneIndex) => `
              <li>
                <input type="checkbox" ${scene.filmed ? "checked" : ""} 
                       onchange="toggleScene(${ideaIndex}, ${sceneIndex})">
                <span>${scene.description} ${scene.location ? `(${scene.location})` : ""}</span>
                <button onclick="deleteScene(${ideaIndex}, ${sceneIndex})">x</button>
              </li>`
            )
            .join("")}
        </ul>
        <form onsubmit="addScene(event, ${ideaIndex})">
          <input type="text" name="sceneDescription" placeholder="Scene description..." required />
          <input type="text" name="sceneLocation" placeholder="Location (optional)" />
          <button type="submit">Add Scene</button>
        </form>
      </div>

      <button onclick="deleteIdea(${ideaIndex})">Delete Idea</button>
    `;
    ideaList.appendChild(li);
  });
}

function addScene(event, ideaIndex) {
  event.preventDefault();
  const form = event.target;
  const desc = form.sceneDescription.value.trim();
  const loc = form.sceneLocation.value.trim();
  if (!desc) return;

  ideas[ideaIndex].scenes.push({ description: desc, location: loc, filmed: false });
  syncStorage();
  renderFiltered();
}

function toggleScene(ideaIndex, sceneIndex) {
  ideas[ideaIndex].scenes[sceneIndex].filmed = !ideas[ideaIndex].scenes[sceneIndex].filmed;
  syncStorage();
}

function deleteScene(ideaIndex, sceneIndex) {
  ideas[ideaIndex].scenes.splice(sceneIndex, 1);
  syncStorage();
  renderFiltered();
}

function deleteIdea(index) {
  ideas.splice(index, 1);
  syncStorage();
  renderFiltered();
}

ideaForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const tags = document
    .getElementById("tags")
    .value.split(",")
    .map(t => t.trim())
    .filter(t => t !== "");
  const category = document.getElementById("category").value;

  if (title && description) {
    ideas.push({ title, description, tags, category, scenes: [] });
    syncStorage();
    ideaForm.reset();
    renderFiltered();
  }
});

function syncStorage() {
  localStorage.setItem("ideas", JSON.stringify(ideas));
}

function renderFiltered() {
  const term = searchInput.value.toLowerCase();
  const categoryVal = categoryFilter.value;
  filteredIdeas = ideas.filter(
    idea =>
      (idea.title.toLowerCase().includes(term) ||
        idea.description.toLowerCase().includes(term) ||
        idea.tags.some(tag => tag.toLowerCase().includes(term))) &&
      (!categoryVal || idea.category === categoryVal)
  );
  renderIdeas();
}

searchInput.addEventListener("input", renderFiltered);
categoryFilter.addEventListener("change", renderFiltered);

exportJSONBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(ideas, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "youtube_planner_backup.json";
  a.click();
});

importJSONBtn.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          ideas = data;
          syncStorage();
          renderFiltered();
        } else {
          alert("Invalid file format");
        }
      } catch {
        alert("Error reading file");
      }
    };
    reader.readAsText(file);
  };
  input.click();
});

renderFiltered();