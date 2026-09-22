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
          <main className="content">
            <section className="welcome">
              <p>
                {new Date().toLocaleDateString(
                  undefined,
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </p>

              <h2>Good afternoon!</h2>
            </section>

            {/* JOURNAL */}

            <section className="card journal-card">
              <div className="card-header">
                <div>
                  <span className="icon">📝</span>
                  <h3>Today's Journal</h3>
                </div>
              </div>

              <p className="muted">
                What happened today?
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  setPage("journal")
                }
              >
                + Write today's journal
              </button>
            </section>

            {/* HOMEWORK */}

            <section>
              <div className="section-title">
                <h2>Homework</h2>

                <button
                  onClick={() =>
                    setPage("homework")
                  }
                >
                  + Add
                </button>
              </div>

              <div className="homework-list">
                <div className="homework-item">
                  <input type="checkbox" />

                  <div>
                    <strong>
                      Mathematics assignment
                    </strong>

                    <span>
                      Due tomorrow
                    </span>
                  </div>
                </div>

                <div className="homework-item">
                  <input type="checkbox" />

                  <div>
                    <strong>
                      Programming project
                    </strong>

                    <span>
                      Due Friday
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* SUBJECTS */}

            <section>
              <div className="section-title">
                <h2>Subjects</h2>

                <button
                  onClick={() =>
                    setPage("subjects")
                  }
                >
                  + Add
                </button>
              </div>

              <div className="subjects">
                <button
                  onClick={() =>
                    setPage("subjects")
                  }
                >
                  📖 Subjects
                </button>
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
          <p>Your personal school notebook</p>
        </div>

        {page === "home" && (
          <button className="menu-button">
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
