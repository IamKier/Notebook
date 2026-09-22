import { useState } from "react";
import "./index.css";

import Journal from "./pages/Journal";
import Homework from "./pages/Homework";
import Subjects from "./pages/Subjects";

type Page =
  | "home"
  | "journal"
  | "homework"
  | "subjects";

function App() {
  const [page, setPage] = useState<Page>("home");

  const today = new Date();

  const formattedDate = today.toLocaleDateString(
    undefined,
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  const hour = today.getHours();

  const greeting =
    hour < 12
      ? "Good morning!"
      : hour < 18
        ? "Good afternoon!"
        : "Good evening!";

  const renderPage = () => {
    switch (page) {
      case "journal":
        return <Journal />;

      case "homework":
        return <Homework />;

      case "subjects":
        return <Subjects />;

      case "home":
      default:
        return (
          <main className="content home-page">
            {/* =========================
                WELCOME
            ========================= */}

            <section className="home-welcome">
              <p className="home-date">
                {formattedDate}
              </p>

              <h2>{greeting}</h2>

              <p className="home-subtitle">
                Ready to get things done today?
              </p>
            </section>

            {/* =========================
                QUICK STATS
            ========================= */}

            <section className="quick-stats">
              <button
                className="stat-card"
                onClick={() =>
                  setPage("homework")
                }
              >
                <span className="stat-icon">
                  📚
                </span>

                <span className="stat-info">
                  <strong>Homework</strong>
                  <small>View assignments</small>
                </span>

                <span className="stat-arrow">
                  →
                </span>
              </button>

              <button
                className="stat-card"
                onClick={() =>
                  setPage("subjects")
                }
              >
                <span className="stat-icon">
                  📖
                </span>

                <span className="stat-info">
                  <strong>Subjects</strong>
                  <small>View your subjects</small>
                </span>

                <span className="stat-arrow">
                  →
                </span>
              </button>
            </section>

            {/* =========================
                JOURNAL
            ========================= */}

            <section className="home-section">
              <div className="section-title">
                <div>
                  <h2>Today's Journal</h2>

                  <p className="muted">
                    Take a moment to write about
                    your day.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setPage("journal")
                  }
                >
                  View
                </button>
              </div>

              <div className="card home-journal-card">
                <div className="home-card-icon">
                  📝
                </div>

                <div className="home-card-content">
                  <h3>How was your day?</h3>

                  <p className="muted">
                    Write down what happened,
                    what you learned, or anything
                    you want to remember.
                  </p>

                  <button
                    className="primary-button"
                    onClick={() =>
                      setPage("journal")
                    }
                  >
                    + Write Today's Journal
                  </button>
                </div>
              </div>
            </section>

            {/* =========================
                HOMEWORK
            ========================= */}

            <section className="home-section">
              <div className="section-title">
                <div>
                  <h2>Homework</h2>

                  <p className="muted">
                    Keep track of your assignments.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setPage("homework")
                  }
                >
                  View All
                </button>
              </div>

              <div className="card home-empty-card">
                <div className="home-empty-icon">
                  📚
                </div>

                <h3>No homework shown here yet</h3>

                <p className="muted">
                  Add an assignment to keep track
                  of your upcoming school work.
                </p>

                <button
                  className="primary-button"
                  onClick={() =>
                    setPage("homework")
                  }
                >
                  + Add Homework
                </button>
              </div>
            </section>

            {/* =========================
                SUBJECTS
            ========================= */}

            <section className="home-section">
              <div className="section-title">
                <div>
                  <h2>Subjects</h2>

                  <p className="muted">
                    Organize your classes and topics.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setPage("subjects")
                  }
                >
                  View All
                </button>
              </div>

              <div className="card home-empty-card">
                <div className="home-empty-icon">
                  📖
                </div>

                <h3>Manage your subjects</h3>

                <p className="muted">
                  Create subjects and organize
                  your notes into topics.
                </p>

                <button
                  className="primary-button"
                  onClick={() =>
                    setPage("subjects")
                  }
                >
                  + Manage Subjects
                </button>
              </div>
            </section>

            {/* =========================
                MOTIVATION
            ========================= */}

            <section className="home-tip">
              <span>💡</span>

              <div>
                <strong>Small progress counts.</strong>

                <p>
                  Keep your journal updated,
                  finish your homework, and stay
                  organized one day at a time.
                </p>
              </div>
            </section>
          </main>
        );
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>📓 Notebook</h1>

          <p>
            Your personal school notebook
          </p>
        </div>

        {page === "home" && (
          <button
            className="menu-button"
            aria-label="Menu"
          >
            ☰
          </button>
        )}
      </header>

      {renderPage()}

      <nav className="bottom-nav">
        <button
          className={
            page === "home" ? "active" : ""
          }
          onClick={() => setPage("home")}
        >
          🏠
          <span>Home</span>
        </button>

        <button
          className={
            page === "journal" ? "active" : ""
          }
          onClick={() => setPage("journal")}
        >
          📝
          <span>Journal</span>
        </button>

        <button
          className={
            page === "homework" ? "active" : ""
          }
          onClick={() => setPage("homework")}
        >
          📚
          <span>Homework</span>
        </button>

        <button
          className={
            page === "subjects" ? "active" : ""
          }
          onClick={() => setPage("subjects")}
        >
          📖
          <span>Subjects</span>
        </button>
      </nav>
    </div>
  );
}

export default App;

