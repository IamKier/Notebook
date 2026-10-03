import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type JournalEntry = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

type JournalProps = { childId: string };

function Journal({ childId }: JournalProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase || !childId) return;
    supabase.from("journals").select("id, title, content, created_at").eq("child_id", childId).order("created_at", { ascending: false }).then(({ data, error: loadError }) => {
      if (loadError) setError(loadError.message);
      else setEntries(data ?? []);
    });
  }, [childId]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showForm, setShowForm] = useState(false);

  const saveJournal = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Please enter a title and journal content.");
      return;
    }

    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      title: title.trim(),
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    if (!supabase) return;
    const { data, error: saveError } = await supabase.from("journals").insert({ child_id: childId, title: newEntry.title, content: newEntry.content }).select().single();
    if (saveError) { setError(saveError.message); return; }
    setEntries([data, ...entries]);

    setTitle("");
    setContent("");
    setShowForm(false);
  };

  const deleteJournal = async (id: string) => {
    if (!supabase) return;
    const { error: deleteError } = await supabase.from("journals").delete().eq("id", id);
    if (deleteError) { setError(deleteError.message); return; }
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  return (
    <main className="content">
      <div className="section-title">
        <div>
          <h2>📝 Journal</h2>
          <p className="muted">Write about your day.</p>
          {error && <p className="auth-error">{error}</p>}
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

                  <small>{new Date(entry.created_at).toLocaleDateString()}</small>
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


