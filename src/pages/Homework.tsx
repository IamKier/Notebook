import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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

type HomeworkProps = {
  childId: string;
};

function Homework({ childId }: HomeworkProps) {
  // =========================
  // HOMEWORK
  // =========================

  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [error, setError] = useState("");

  // =========================
  // SUBJECTS
  // =========================

  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!supabase || !childId) {
        setHomework([]);
        setSubjects([]);
        return;
      }

      const [{ data: homeworkData, error: homeworkError }, { data: subjectData, error: subjectError }] = await Promise.all([
        supabase.from("homework").select("id, subject, title, description, due_date, priority, completed, proof_image, completed_at").eq("child_id", childId).order("due_date"),
        supabase.from("subjects").select("id, name").eq("child_id", childId).order("created_at"),
      ]);

      if (homeworkError || subjectError) {
        setError(homeworkError?.message ?? subjectError?.message ?? "Unable to load homework.");
        return;
      }

      setError("");
      setHomework((homeworkData ?? []).map((item) => ({
        id: item.id,
        subject: item.subject,
        title: item.title,
        description: item.description,
        dueDate: item.due_date,
        priority: item.priority as HomeworkItem["priority"],
        completed: item.completed,
        proofImage: item.proof_image ?? undefined,
        completedAt: item.completed_at ?? undefined,
      })));
      setSubjects(subjectData ?? []);
    };

    void loadData();
  }, [childId]);

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

  const saveHomework = async () => {
    if (!subject || !title.trim() || !dueDate) {
      alert(
        "Please select a subject, enter a title, and choose a due date."
      );

      return;
    }

    if (!supabase || !childId) return;

    const { data, error: saveError } = await supabase.from("homework").insert({
      child_id: childId,
      subject,
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate,
      priority,
    }).select("id, subject, title, description, due_date, priority, completed, proof_image, completed_at").single();

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setHomework((current) => [{
      id: data.id,
      subject: data.subject,
      title: data.title,
      description: data.description,
      dueDate: data.due_date,
      priority: data.priority as HomeworkItem["priority"],
      completed: data.completed,
    }, ...current]);

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

  const submitProof = async () => {
    if (!proofHomeworkId) {
      return;
    }

    if (!proofImage) {
      alert(
        "Please take or select a photo of your completed homework first."
      );

      return;
    }

    if (!supabase) return;
    const completedAt = new Date().toISOString();
    const { error: proofError } = await supabase.from("homework").update({
      completed: true,
      proof_image: proofImage,
      completed_at: completedAt,
    }).eq("id", proofHomeworkId);

    if (proofError) {
      setError(proofError.message);
      return;
    }

    setHomework((current) => current.map((item) => item.id === proofHomeworkId
      ? { ...item, completed: true, proofImage, completedAt }
      : item));

    cancelProofSubmission();
  };

  // =========================
  // DELETE HOMEWORK
  // =========================

  const deleteHomework = async (id: string) => {
    if (!supabase) return;
    const { error: deleteError } = await supabase.from("homework").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setHomework((current) => current.filter((item) => item.id !== id));

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
    <main className="content" data-child-id={childId}>
      {error && <p className="auth-error">{error}</p>}
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
