"use client";

export default function ErrorPage({ reset }) {
  return (
    <main className="section-large" id="main-content" tabIndex={-1}>
      <div className="container">
        <div className="error-page">
          <h1 className="h2">Something went wrong</h1>
          <p>We could not load this page. Please try again.</p>
          <button className="btn btn-primary" onClick={reset} type="button">
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}
