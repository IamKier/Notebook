import { useState } from "react";

type HomeworkItem = {
  id: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High";
  completed: boolean;
  proofImage?: string;
  completedAt?: string;
};

type Subject = {
  id: string;
  name: string;
};

const STORAGE_KEY = "notebook-homework";
const SUBJECTS_STORAGE_KEY = "notebook-subjects";

function Homework() {
  // =========================
  // HOMEWORK
  // =========================

  const [homework, setHomework] = useState<HomeworkItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved) as HomeworkItem[];
    } catch {
      return [];
    }
  });

  // =========================
  // SUBJECTS
  // =========================

  const [subjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(
      SUBJECTS_STORAGE_KEY
    );

    if (!saved) {
      return [];
    }

    try {
      const parsed = JSON.parse(saved);

      return parsed.map((subject: Subject) => ({
        id: subject.id,
        name: subject.name,
      }));
    } catch {
      return [];
    }
  });

  // =========================
  // ADD HOMEWORK FORM
  // =========================

  const [showForm, setShowForm] = useState(false);

  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] =
    useState<HomeworkItem["priority"]>("Medium");

  // =========================
  // PROOF
  // =========================

  const [proofHomeworkId, setProofHomeworkId] =
    useState<string | null>(null);

  const [proofImage, setProofImage] =
    useState<string>("");

  const [proofFileName, setProofFileName] =
    useState("");

  // =========================
  // SAVE HOMEWORK
  // =========================

  const saveHomework = () => {
    if (!subject || !title.trim() || !dueDate) {
      alert(
        "Please select a subject, enter a title, and choose a due date."
      );

      return;
    }

    const newHomework: HomeworkItem = {
      id: crypto.randomUUID(),
      subject,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
      completed: false,
    };

    const updatedHomework = [
      newHomework,
      ...homework,
    ];

    setHomework(updatedHomework);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedHomework)
    );

    resetForm();
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setSubject("");
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("Medium");
    setShowForm(false);
  };

  // =========================
  // START PROOF SUBMISSION
  // =========================

  const startProofSubmission = (
    homeworkId: string
  ) => {
    setProofHomeworkId(homeworkId);
    setProofImage("");
    setProofFileName("");
  };

  // =========================
  // CANCEL PROOF
  // =========================

  const cancelProofSubmission = () => {
    setProofHomeworkId(null);
    setProofImage("");
    setProofFileName("");
  };

  // =========================
  // HANDLE IMAGE
  // =========================

  const handleProofImage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Only allow images
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");

      event.target.value = "";

      return;
    }

    setProofFileName(file.name);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProofImage(reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  // =========================
  // SUBMIT PROOF
  // =========================

  const submitProof = () => {
    if (!proofHomeworkId) {
      return;
    }

    if (!proofImage) {
      alert(
        "Please take or select a photo of your completed homework first."
      );

      return;
    }

    const updatedHomework = homework.map(
      (item) =>
        item.id === proofHomeworkId
          ? {
              ...item,
              completed: true,
              proofImage,
              completedAt:
                new Date().toISOString(),
            }
          : item
    );

    setHomework(updatedHomework);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedHomework)
    );

    cancelProofSubmission();
  };

  // =========================
  // DELETE HOMEWORK
  // =========================

  const deleteHomework = (id: string) => {
    const updatedHomework = homework.filter(
      (item) => item.id !== id
    );

    setHomework(updatedHomework);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedHomework)
    );

    if (proofHomeworkId === id) {
      cancelProofSubmission();
    }
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date: string) => {
    if (!date) {
      return "";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // =========================
  // FORMAT COMPLETION DATE
  // =========================

  const formatCompletedDate = (
    date?: string
  ) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  // =========================
  // HOMEWORK FILTERS
  // =========================

  const activeHomework = homework.filter(
    (item) => !item.completed
  );

  const completedHomework = homework.filter(
    (item) => item.completed
  );

  // =========================
  // RENDER
  // =========================

  return (
    <main className="content">
      {/* =========================
          HEADER
          ========================= */}

      <div className="section-title">
        <div>
          <h2>📚 Homework</h2>

          <p className="muted">
            Keep track of your assignments.
          </p>
        </div>

        <button
          onClick={() =>
            setShowForm(!showForm)
          }
        >
          {showForm ? "Cancel" : "+ Add"}
        </button>
      </div>

      {/* =========================
          ADD HOMEWORK FORM
          ========================= */}

      {showForm && (
        <section className="card">
          <h3>New Homework</h3>

          {/* SUBJECT */}

          <label htmlFor="homework-subject">
            Subject
          </label>

          {subjects.length === 0 ? (
            <div className="empty-subject-message">
              <p className="muted">
                You don't have any subjects yet.
              </p>

              <p className="muted">
                Go to Subjects and create a
                subject first.
              </p>
            </div>
          ) : (
            <select
              id="homework-subject"
              className="text-input"
              value={subject}
              onChange={(event) =>
                setSubject(event.target.value)
              }
            >
              <option value="">
                Select a subject
              </option>

              {subjects.map((item) => (
                <option
                  key={item.id}
                  value={item.name}
                >
                  {item.name}
                </option>
              ))}
            </select>
          )}

          {/* HOMEWORK TITLE */}

          <label htmlFor="homework-title">
            Homework
          </label>

          <input
            id="homework-title"
            className="text-input"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="e.g. Chapter 3 exercises"
          />

          {/* DESCRIPTION */}

          <label htmlFor="homework-description">
            Description
          </label>

          <textarea
            id="homework-description"
            className="text-area"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            placeholder="Additional instructions or notes..."
            rows={5}
          />

          {/* DUE DATE */}

          <label htmlFor="homework-due-date">
            Due Date
          </label>

          <input
            id="homework-due-date"
            className="text-input"
            type="date"
            value={dueDate}
            onChange={(event) =>
              setDueDate(event.target.value)
            }
          />

          {/* PRIORITY */}

          <label htmlFor="homework-priority">
            Priority
          </label>

          <select
            id="homework-priority"
            className="text-input"
            value={priority}
            onChange={(event) =>
              setPriority(
                event.target
                  .value as HomeworkItem["priority"]
              )
            }
          >
            <option value="Low">
              Low
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="High">
              High
            </option>
          </select>

          <div className="form-actions">
            <button
              className="secondary-button"
              onClick={resetForm}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              onClick={saveHomework}
              disabled={subjects.length === 0}
            >
              Save Homework
            </button>
          </div>
        </section>
      )}

      {/* =========================
          NO HOMEWORK
          ========================= */}

      {homework.length === 0 ? (
        <section className="card empty-state">
          <div>📚</div>

          <h3>No homework yet</h3>

          <p className="muted">
            Add an assignment to start
            keeping track.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              setShowForm(true)
            }
          >
            + Add Homework
          </button>
        </section>
      ) : (
        <>
          {/* =========================
              ACTIVE HOMEWORK
              ========================= */}

          {activeHomework.length > 0 && (
            <section>
              <div className="section-title">
                <h2>Active</h2>

                <span className="muted">
                  {activeHomework.length}
                </span>
              </div>

              <div className="homework-list">
                {activeHomework.map(
                  (item) => (
                    <article
                      className="card homework-card"
                      key={item.id}
                    >
                      <div className="homework-header">
                        <div>
                          <span className="homework-subject">
                            {item.subject}
                          </span>

                          <h3>
                            {item.title}
                          </h3>
                        </div>

                        <button
                          className="delete-button"
                          onClick={() =>
                            deleteHomework(
                              item.id
                            )
                          }
                          aria-label={`Delete ${item.title}`}
                          title="Delete homework"
                        >
                          🗑️
                        </button>
                      </div>

                      {item.description && (
                        <p className="homework-description">
                          {item.description}
                        </p>
                      )}

                      <div className="homework-meta">
                        <span>
                          📅{" "}
                          {formatDate(
                            item.dueDate
                          )}
                        </span>

                        <span
                          className={`priority priority-${item.priority.toLowerCase()}`}
                        >
                          {item.priority} Priority
                        </span>
                      </div>

                      {/* =========================
                          PROOF BUTTON
                          ========================= */}

                      {proofHomeworkId !==
                        item.id && (
                        <button
                          className="primary-button proof-button"
                          onClick={() =>
                            startProofSubmission(
                              item.id
                            )
                          }
                        >
                          📷 Submit Homework
                        </button>
                      )}

                      {/* =========================
                          PROOF FORM
                          ========================= */}

                      {proofHomeworkId ===
                        item.id && (
                        <div className="proof-form">
                          <h4>
                            📸 Submit Homework
                          </h4>

                          <p className="muted">
                            Take a photo or
                            choose an image of
                            your completed
                            homework.
                          </p>

                          {/* CAMERA / FILE INPUT */}

                          <label
                            htmlFor={`proof-${item.id}`}
                            className="proof-upload"
                          >
                            <span>
                              📷
                            </span>

                            <strong>
                              Take Photo /
                              Choose Image
                            </strong>

                            <small>
                              JPG, PNG, WEBP
                            </small>
                          </label>

                          <input
                            id={`proof-${item.id}`}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={
                              handleProofImage
                            }
                            hidden
                          />

                          {/* IMAGE PREVIEW */}

                          {proofImage && (
                            <div className="proof-preview">
                              <img
                                src={
                                  proofImage
                                }
                                alt="Homework proof preview"
                              />

                              <div className="proof-file-info">
                                <span>
                                  📎{" "}
                                  {
                                    proofFileName
                                  }
                                </span>
                              </div>
                            </div>
                          )}

                          {/* ACTIONS */}

                          <div className="form-actions">
                            <button
                              className="secondary-button"
                              onClick={
                                cancelProofSubmission
                              }
                            >
                              Cancel
                            </button>

                            <button
                              className="primary-button"
                              onClick={
                                submitProof
                              }
                              disabled={
                                !proofImage
                              }
                            >
                              ✓ Submit Proof
                            </button>
                          </div>

                          {!proofImage && (
                            <p className="proof-required">
                              ⚠️ A photo is required
                              to complete this
                              homework.
                            </p>
                          )}
                        </div>
                      )}
                    </article>
                  )
                )}
              </div>
            </section>
          )}

          {/* =========================
              COMPLETED HOMEWORK
              ========================= */}

          {completedHomework.length >
            0 && (
            <section>
              <div className="section-title">
                <h2>Completed</h2>

                <span className="muted">
                  {completedHomework.length}
                </span>
              </div>

              <div className="homework-list">
                {completedHomework.map(
                  (item) => (
                    <article
                      className="card homework-card completed"
                      key={item.id}
                    >
                      <div className="homework-header">
                        <div>
                          <span className="homework-subject">
                            {item.subject}
                          </span>

                          <h3>
                            {item.title}
                          </h3>
                        </div>

                        <button
                          className="delete-button"
                          onClick={() =>
                            deleteHomework(
                              item.id
                            )
                          }
                          aria-label={`Delete ${item.title}`}
                          title="Delete homework"
                        >
                          🗑️
                        </button>
                      </div>

                      {item.description && (
                        <p className="homework-description">
                          {item.description}
                        </p>
                      )}

                      <div className="homework-meta">
                        <span>
                          📅{" "}
                          {formatDate(
                            item.dueDate
                          )}
                        </span>

                        <span>
                          ✓ Completed
                        </span>

                        {item.completedAt && (
                          <span>
                            on{" "}
                            {formatCompletedDate(
                              item.completedAt
                            )}
                          </span>
                        )}
                      </div>

                      {/* =========================
                          PROOF IMAGE
                          ========================= */}

                      {item.proofImage && (
                        <div className="saved-proof">
                          <h4>
                            📷 Homework Proof
                          </h4>

                          <img
                            src={
                              item.proofImage
                            }
                            alt={`Proof for ${item.title}`}
                          />
                        </div>
                      )}
                    </article>
                  )
                )}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default Homework;
