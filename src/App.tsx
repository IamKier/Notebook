import { useEffect, useState } from "react";
import "./index.css";
import { supabase, supabaseConfigError } from "./lib/supabase";

import Journal from "./pages/Journal";
import Homework from "./pages/Homework";
import Subjects from "./pages/Subjects";

type Page =
  | "home"
  | "journal"
  | "homework"
  | "subjects";

type Child = {
  id: string;
  name: string;
};

const ADMIN_EMAIL = "kenjicondez32@gmail.com";

function App() {
  const [session, setSession] = useState<Awaited<ReturnType<NonNullable<typeof supabase>["auth"]["getSession"]>>["data"]["session"]>(null);
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const [authError, setAuthError] = useState(supabaseConfigError ?? "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [childName, setChildName] = useState("");
  const [selectedChildId, setSelectedChildId] = useState("");
  const [childError, setChildError] = useState("");
  const [page, setPage] = useState<Page>("home");

  const isAdmin = session?.user.email?.toLowerCase() === ADMIN_EMAIL;

  const loadChildren = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("children")
      .select("id, name")
      .order("created_at");
    if (error) {
      setChildError(error.message);
      return;
    }
    setChildren(data ?? []);
    setSelectedChildId(data?.[0]?.id ?? "");
  };

  useEffect(() => {
    if (!supabase) {
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
      if (data.session) loadChildren();
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
      if (nextSession) void loadChildren();
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const addChild = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !childName.trim()) return;
    const { data: userData } = await supabase.auth.getUser();
    const parentId = userData.user?.id;

    if (!parentId) {
      setChildError("Your session has expired. Please sign in again.");
      return;
    }

    const { error } = await supabase.from("children").insert({
      parent_id: parentId,
      name: childName.trim(),
    });
    if (error) {
      setChildError(error.message);
      return;
    }
    setChildName("");
    setChildError("");
    await loadChildren();
  };

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    if (!supabase) {
      setAuthError(supabaseConfigError ?? "Supabase is unavailable.");
      return;
    }
    const result = isSignUp
      ? await supabase.auth.signUp({ email, password, options: { data: { role: "parent" } } })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      setAuthError(result.error.message);
    } else if (isSignUp && !result.data.session) {
      setAuthError("Check your email to confirm your account, then sign in.");
    }
  };

  if (authLoading) return <main className="auth-page"><p>Connecting to Supabase...</p></main>;

  if (!session) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <p className="auth-kicker">Notebook</p>
          <h1>{isSignUp ? "Create your account" : "Welcome back"}</h1>
          <p className="muted">Parent account required. You will add your child after signing in.</p>
          {supabaseConfigError && <p className="auth-error" role="alert">{supabaseConfigError}</p>}
          <form onSubmit={handleAuth}>
            <label htmlFor="auth-email">Email</label>
            <input id="auth-email" className="text-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <label htmlFor="auth-password">Password</label>
            <input id="auth-password" className="text-input" type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required />
            {authError && <p className="auth-error" role="alert">{authError}</p>}
            <button className="primary-button" type="submit">{isSignUp ? "Create account" : "Sign in"}</button>
          </form>
          <button className="auth-switch" onClick={() => { setIsSignUp(!isSignUp); setAuthError(""); }}>
            {isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>
        </section>
      </main>
    );
  }

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
        return <Journal childId={selectedChildId} />;

      case "homework":
        return <Homework childId={selectedChildId} />;

      case "subjects":
        return <Subjects childId={selectedChildId} isAdmin={isAdmin} />;

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

            <section className="card family-card">
              <div className="section-title">
                <div>
                  <h2>Children</h2>
                  <p className="muted">Choose whose notebook is open.</p>
                </div>
                {selectedChildId && <strong>{children.find((child) => child.id === selectedChildId)?.name}</strong>}
              </div>
              <div className="child-picker">
                {children.map((child) => (
                  <button key={child.id} className={child.id === selectedChildId ? "child-button selected" : "child-button"} onClick={() => setSelectedChildId(child.id)}>
                    {child.name}
                  </button>
                ))}
              </div>
              <form className="child-form" onSubmit={addChild}>
                <input className="text-input" value={childName} onChange={(event) => setChildName(event.target.value)} placeholder="Child's name" required />
                <button className="primary-button" type="submit">Add child</button>
              </form>
              {childError && <p className="auth-error" role="alert">{childError}</p>}
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
            {isAdmin ? "Admin view" : "Your personal school notebook"}
          </p>
        </div>

        <div className="header-actions">
          {page === "home" && <button className="menu-button" aria-label="Menu">☰</button>}
          <button className="sign-out-button" onClick={() => supabase?.auth.signOut()}>Sign out</button>
        </div>
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

