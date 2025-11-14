import React, { useState } from "react";
import "./HomePage.css";

export default function HomePage({ questions, handleVote, openQuestion, openAddQuestion }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === "All" || q.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "Web Development", "Backend", "AI", "Database", "Networking"];

  return (
    <div className="home-container">
      <h1 className="home-heading">Discussion Portal</h1>

      <div className="filter-row">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="dropdown"
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {filteredQuestions.length === 0 ? (
        <p className="no-results">No questions found!</p>
      ) : (
        <div className="scroll-container">
          {filteredQuestions.map((q) => (
            <div key={q.id} className="question-card">
              <div className="vote-column">
                <button
                  onClick={() => handleVote(q.id, 1)}
                  className={q.userVote === 1 ? "vote-button active-up" : "vote-button"}
                >
                  ▲
                </button>
                <span className="vote-count">{q.votes}</span>
                <button
                  onClick={() => handleVote(q.id, -1)}
                  className={q.userVote === -1 ? "vote-button active-down" : "vote-button"}
                >
                  ▼
                </button>
              </div>

              <div className="question-info" onClick={() => openQuestion(q)}>
                <h3 className="question-title">{q.title}</h3>
                <p className="question-preview">{q.content}</p>
                <small className="category-tag">{q.category}</small>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
