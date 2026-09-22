import { useState } from "react";

type Topic = {
  id: string;
  name: string;
  notes: string;
};

type Subject = {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
};

const STORAGE_KEY = "notebook-subjects";

function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved) as Subject[];
    } catch {
      return [];
    }
  });

  const [selectedSubjectId, setSelectedSubjectId] =
    useState<string | null>(null);

  const [showSubjectForm, setShowSubjectForm] =
    useState(false);

  const [showTopicForm, setShowTopicForm] =
    useState(false);

  const [subjectName, setSubjectName] = useState("");
  const [subjectDescription, setSubjectDescription] =
    useState("");

  const [topicName, setTopicName] = useState("");
  const [topicNotes, setTopicNotes] = useState("");

  const selectedSubject = subjects.find(
    (subject) => subject.id === selectedSubjectId
  );

  // =========================
  // SUBJECT FUNCTIONS
  // =========================

  const saveSubject = () => {
    if (!subjectName.trim()) {
      alert("Please enter a subject name.");
      return;
    }

    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name: subjectName.trim(),
      description: subjectDescription.trim(),
      topics: [],
    };

    const updatedSubjects = [
      ...subjects,
      newSubject,
    ];

    setSubjects(updatedSubjects);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedSubjects)
    );

    setSubjectName("");
    setSubjectDescription("");
    setShowSubjectForm(false);
  };

  const deleteSubject = (id: string) => {
    const confirmed = window.confirm(
      "Delete this subject and all of its topics?"
    );

    if (!confirmed) {
      return;
    }

    const updatedSubjects = subjects.filter(
      (subject) => subject.id !== id
    );

    setSubjects(updatedSubjects);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedSubjects)
    );

    if (selectedSubjectId === id) {
      setSelectedSubjectId(null);
    }
  };

  // =========================
  // TOPIC FUNCTIONS
  // =========================

  const saveTopic = () => {
    if (!selectedSubjectId) {
      return;
    }

    if (!topicName.trim()) {
      alert("Please enter a topic name.");
      return;
    }

    const newTopic: Topic = {
      id: crypto.randomUUID(),
      name: topicName.trim(),
      notes: topicNotes.trim(),
    };

    const updatedSubjects = subjects.map((subject) =>
      subject.id === selectedSubjectId
        ? {
            ...subject,
            topics: [...subject.topics, newTopic],
          }
        : subject
    );

    setSubjects(updatedSubjects);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedSubjects)
    );

    setTopicName("");
    setTopicNotes("");
    setShowTopicForm(false);
  };

  const deleteTopic = (topicId: string) => {
    if (!selectedSubjectId) {
      return;
    }

    const updatedSubjects = subjects.map((subject) =>
      subject.id === selectedSubjectId
        ? {
            ...subject,
            topics: subject.topics.filter(
              (topic) => topic.id !== topicId
            ),
          }
        : subject
    );

    setSubjects(updatedSubjects);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedSubjects)
    );
  };

  // =========================
  // SUBJECT DETAIL VIEW
  // =========================

  if (selectedSubject) {
    return (
      <main className="content">
        <button
          className="back-button"
          onClick={() => {
            setSelectedSubjectId(null);
            setShowTopicForm(false);
          }}
        >
          ← Back to Subjects
        </button>

        <section className="card subject-detail">
          <div className="subject-detail-header">
            <div>
              <span className="subject-icon">
                📖
              </span>

              <h2>{selectedSubject.name}</h2>

              {selectedSubject.description && (
                <p className="muted">
                  {selectedSubject.description}
                </p>
              )}
            </div>

            <button
              className="delete-button"
              onClick={() =>
                deleteSubject(selectedSubject.id)
              }
              aria-label={`Delete ${selectedSubject.name}`}
              title="Delete subject"
            >
              🗑️
            </button>
          </div>
        </section>

        <div className="section-title">
          <div>
            <h2>Topics</h2>

            <p className="muted">
              {selectedSubject.topics.length} topic
              {selectedSubject.topics.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          <button
            onClick={() =>
              setShowTopicForm(!showTopicForm)
            }
          >
            {showTopicForm ? "Cancel" : "+ Add"}
          </button>
        </div>

        {showTopicForm && (
          <section className="card">
            <h3>New Topic</h3>

            <label htmlFor="topic-name">
              Topic Name
            </label>

            <input
              id="topic-name"
              className="text-input"
              value={topicName}
              onChange={(event) =>
                setTopicName(event.target.value)
              }
              placeholder="e.g. Variables and Data Types"
            />

            <label htmlFor="topic-notes">
              Notes
            </label>

            <textarea
              id="topic-notes"
              className="text-area"
              value={topicNotes}
              onChange={(event) =>
                setTopicNotes(event.target.value)
              }
              placeholder="Add notes about this topic..."
              rows={5}
            />

            <div className="form-actions">
              <button
                className="secondary-button"
                onClick={() => {
                  setTopicName("");
                  setTopicNotes("");
                  setShowTopicForm(false);
                }}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={saveTopic}
              >
                Save Topic
              </button>
            </div>
          </section>
        )}

        {selectedSubject.topics.length === 0 ? (
          <section className="card empty-state">
            <div>📖</div>

            <h3>No topics yet</h3>

            <p className="muted">
              Add your first topic for this subject.
            </p>

            <button
              className="primary-button"
              onClick={() =>
                setShowTopicForm(true)
              }
            >
              + Add Topic
            </button>
          </section>
        ) : (
          <div className="topic-list">
            {selectedSubject.topics.map((topic) => (
              <article
                className="card topic-card"
                key={topic.id}
              >
                <div className="topic-header">
                  <div>
                    <h3>{topic.name}</h3>
                  </div>

                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteTopic(topic.id)
                    }
                    aria-label={`Delete ${topic.name}`}
                    title="Delete topic"
                  >
                    🗑️
                  </button>
                </div>

                {topic.notes && (
                  <p className="topic-notes">
                    {topic.notes}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    );
  }

  // =========================
  // SUBJECT LIST VIEW
  // =========================

  return (
    <main className="content">
      <div className="section-title">
        <div>
          <h2>📖 Subjects</h2>

          <p className="muted">
            Organize your school subjects and topics.
          </p>
        </div>

        <button
          onClick={() =>
            setShowSubjectForm(!showSubjectForm)
          }
        >
          {showSubjectForm ? "Cancel" : "+ Add"}
        </button>
      </div>

      {showSubjectForm && (
        <section className="card">
          <h3>New Subject</h3>

          <label htmlFor="subject-name">
            Subject Name
          </label>

          <input
            id="subject-name"
            className="text-input"
            value={subjectName}
            onChange={(event) =>
              setSubjectName(event.target.value)
            }
            placeholder="e.g. Mathematics"
          />

          <label htmlFor="subject-description">
            Description
          </label>

          <textarea
            id="subject-description"
            className="text-area"
            value={subjectDescription}
            onChange={(event) =>
              setSubjectDescription(
                event.target.value
              )
            }
            placeholder="What is this subject about?"
            rows={4}
          />

          <div className="form-actions">
            <button
              className="secondary-button"
              onClick={() => {
                setSubjectName("");
                setSubjectDescription("");
                setShowSubjectForm(false);
              }}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              onClick={saveSubject}
            >
              Save Subject
            </button>
          </div>
        </section>
      )}

      {subjects.length === 0 ? (
        <section className="card empty-state">
          <div>📚</div>

          <h3>No subjects yet</h3>

          <p className="muted">
            Add your school subjects to get started.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              setShowSubjectForm(true)
            }
          >
            + Add Subject
          </button>
        </section>
      ) : (
        <div className="subject-list">
          {subjects.map((subject) => (
            <article
              className="card subject-card"
              key={subject.id}
              onClick={() =>
                setSelectedSubjectId(subject.id)
              }
            >
              <div className="subject-card-content">
                <div className="subject-icon">
                  📖
                </div>

                <div className="subject-info">
                  <h3>{subject.name}</h3>

                  {subject.description && (
                    <p className="muted">
                      {subject.description}
                    </p>
                  )}

                  <span className="topic-count">
                    {subject.topics.length} topic
                    {subject.topics.length !== 1
                      ? "s"
                      : ""}
                  </span>
                </div>

                <span className="subject-arrow">
                  →
                </span>
              </div>

              <button
                className="delete-subject-button"
                onClick={(event) => {
                  event.stopPropagation();
                  deleteSubject(subject.id);
                }}
                aria-label={`Delete ${subject.name}`}
                title="Delete subject"
              >
                🗑️
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default Subjects;
