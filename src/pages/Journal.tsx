import { useState } from "react";

type JournalEntry = {
  id: string;
  title: string;
  content: string;
  date: string;
};

const STORAGE_KEY = "notebook-journals";

function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved) as JournalEntry[];
    } catch {
      return [];
    }
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showForm, setShowForm] = useState(false);

  const saveJournal = () => {
    if (!title.trim() || !content.trim()) {
      alert("Please enter a title and journal content.");
      return;
    }

    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      title: title.trim(),
      content: content.trim(),
      date: new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };

    const updatedEntries = [newEntry, ...entries];

    setEntries(updatedEntries);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedEntries)
    );

    setTitle("");
    setContent("");
    setShowForm(false);
  };

  const deleteJournal = (id: string) => {
    const updatedEntries = entries.filter(
      (entry) => entry.id !== id
    );

    setEntries(updatedEntries);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedEntries)
    );
  };

  return (
    <main className="content">
      <div className="section-title">
        <div>
          <h2>📝 Journal</h2>
          <p className="muted">Write about your day.</p>
        </div>

        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add"}
        </button>
      </div>

      {showForm && (
        <section className="card">
          <h3>New Journal Entry</h3>

          <label htmlFor="journal-title">
            Title
          </label>

          <input
            id="journal-title"
            className="text-input"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="What happened today?"
          />

          <label htmlFor="journal-content">
            Journal
          </label>

          <textarea
            id="journal-content"
            className="text-area"
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            placeholder="Write about your day..."
            rows={8}
          />

          <div className="form-actions">
            <button
              className="secondary-button"
              onClick={() => {
                setTitle("");
                setContent("");
                setShowForm(false);
              }}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              onClick={saveJournal}
            >
              Save Journal
            </button>
          </div>
        </section>
      )}

      {entries.length === 0 ? (
        <section className="card empty-state">
          <div>📔</div>

          <h3>No journal entries yet</h3>

          <p className="muted">
            Write about what happened today.
          </p>

          <button
            className="primary-button"
            onClick={() => setShowForm(true)}
          >
            + Write Your First Entry
          </button>
        </section>
      ) : (
        <div className="journal-list">
          {entries.map((entry) => (
            <article
              className="card"
              key={entry.id}
            >
              <div className="journal-header">
                <div>
                  <h3>{entry.title}</h3>

                  <small>{entry.date}</small>
                </div>

                <button
                  className="delete-button"
                  onClick={() =>
                    deleteJournal(entry.id)
                  }
                  aria-label={`Delete ${entry.title}`}
                  title="Delete journal entry"
                >
                  🗑️
                </button>
              </div>

              <p className="journal-content">
                {entry.content}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default Journal;


