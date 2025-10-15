const notesContainer = document.getElementById("notes");
const newNoteBtn = document.getElementById("new-note");
const searchInput = document.getElementById("search");
const exportBtn = document.getElementById("export-notes");
const importBtn = document.getElementById("import-btn");
const importInput = document.getElementById("import-notes");

let notes = JSON.parse(localStorage.getItem("notes:v1") || "[]");

function saveNotes() {
  localStorage.setItem("notes:v1", JSON.stringify(notes));
}

function createNote(title = "Untitled", body = "") {
  return {
    id: Date.now().toString(),
    title,
    body,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function renderNotes(filter = "") {
  notesContainer.innerHTML = "";
  const filtered = notes
    .filter(n =>
      n.title.toLowerCase().includes(filter.toLowerCase()) ||
      n.body.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);

  filtered.forEach(note => {
    const div = document.createElement("div");
    div.className = "note";

    const title = document.createElement("h2");
    title.contentEditable = true;
    title.textContent = note.title;

    const textarea = document.createElement("textarea");
    textarea.value = note.body;

    const footer = document.createElement("div");
    footer.className = "note-footer";

    const time = document.createElement("small");
    time.textContent = new Date(note.updatedAt).toLocaleString();

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";

    title.addEventListener("input", () => {
      note.title = title.textContent;
      note.updatedAt = Date.now();
      saveNotes();
      renderNotes(searchInput.value);
    });

    textarea.addEventListener("input", () => {
      note.body = textarea.value;
      note.updatedAt = Date.now();
      saveNotes();
    });

    delBtn.addEventListener("click", () => {
      notes = notes.filter(n => n.id !== note.id);
      saveNotes();
      renderNotes(searchInput.value);
    });

    footer.append(time, delBtn);
    div.append(title, textarea, footer);
    notesContainer.appendChild(div);
  });
}

newNoteBtn.addEventListener("click", () => {
  const note = createNote();
  notes.push(note);
  saveNotes();
  renderNotes();
});

searchInput.addEventListener("input", e => {
  renderNotes(e.target.value);
});

exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "notes.json";
  a.click();
});

importBtn.addEventListener("click", () => importInput.click());

importInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = evt => {
    try {
      const imported = JSON.parse(evt.target.result);
      imported.forEach(n => {
        if (!notes.some(existing => existing.id === n.id)) {
          notes.push(n);
        }
      });
      saveNotes();
      renderNotes();
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
});

renderNotes();
