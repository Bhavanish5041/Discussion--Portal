import React, { useState } from "react";
import './NewQuestion.css';

export default function NewQuestion({ addQuestion, goHome }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (title.trim() === "" || content.trim() === "") {
      setError("Please fill in both the title and content.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await addQuestion({
        title,
        content,
        category,
      });

      if (!result.success) {
        setError(result.message || "Failed to post question. Please try again.");
        return;
      }

      setTitle("");
      setContent("");
    } catch (err) {
      setError(err.message || "Failed to post question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="NewQuestion">
      <button onClick={goHome} className="back-button">
        ← Back
      </button>

      <h2 className="question-heading">Post a New Question</h2>

      <form onSubmit={handleSubmit} className="question-form">
        {error && <div className="error-message">{error}</div>}

        <input
          type="text"
          placeholder="Enter question title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="question-input"
          disabled={loading}
        />

        <textarea
          placeholder="Describe your question..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="question-textarea"
          disabled={loading}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="dropdown"
          disabled={loading}
        >
          <option>Web Development</option>
          <option>Backend</option>
          <option>AI</option>
          <option>Database</option>
          <option>Networking</option>
        </select>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Posting...' : 'Post Question'}
        </button>

      </form>
    </div>
  );
}
