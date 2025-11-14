import React, { useState } from "react";
import './AnswerPage.css';

export default function AnswerPage({ question, goHome, handleQuestionVote, handleAnswerVote, addAnswer }) {
  const [answerText, setAnswerText] = useState("");
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!question) {
    return null;
  }

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (answerText.trim() === "") {
      setError("Please enter an answer.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await addAnswer(question.id, answerText);
      if (!result.success) {
        setError(result.message || "Failed to submit answer. Please try again.");
        return;
      }
      setAnswerText("");
      setShowAnswerForm(false);
    } catch (err) {
      setError(err.message || "Failed to submit answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="answer-page-container">
      <button onClick={goHome} className="back-button">
        ← Back to Home
      </button>

      <div className="question-section">
        <div className="question-header">
          <div className="vote-column">
            <button
              onClick={() => handleQuestionVote(question.id, 1)}
              className={question.userVote === 1 ? "vote-button active-up" : "vote-button"}
            >
              ▲
            </button>
            <span className="vote-count">{question.votes}</span>
            <button
              onClick={() => handleQuestionVote(question.id, -1)}
              className={question.userVote === -1 ? "vote-button active-down" : "vote-button"}
            >
              ▼
            </button>
          </div>
          <div className="question-content">
            <h1 className="question-title">{question.title}</h1>
            <p className="question-body">{question.content}</p>
            <div className="question-meta">
              <span className="category-tag">{question.category}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="answers-section">
        <div className="answers-header">
          <h2 className="answers-title">
            {question.answers && question.answers.length > 0 
              ? `${question.answers.length} Answer${question.answers.length !== 1 ? 's' : ''}`
              : 'No answers yet'}
          </h2>
          <button 
            onClick={() => setShowAnswerForm(!showAnswerForm)}
            className="add-answer-button"
          >
            {showAnswerForm ? 'Cancel' : '+ Add Answer'}
          </button>
        </div>

        {showAnswerForm && (
          <form onSubmit={handleSubmitAnswer} className="answer-form">
            {error && <div className="error-message">{error}</div>}
            <textarea
              placeholder="Write your answer here..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="answer-textarea"
              rows="6"
              disabled={loading}
            />
            <div className="answer-form-actions">
              <button type="submit" className="submit-answer-button" disabled={loading}>
                {loading ? 'Posting...' : 'Post Answer'}
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowAnswerForm(false);
                  setAnswerText("");
                  setError("");
                }}
                className="cancel-answer-button"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="answers-list">
          {question.answers && question.answers.length > 0 ? (
            [...question.answers]
              .sort((a, b) => b.votes - a.votes)
              .map((answer) => (
                <div key={answer.id} className="answer-card">
                  <div className="vote-column">
                    <button
                      onClick={() => handleAnswerVote(question.id, answer.id, 1)}
                      className={answer.userVote === 1 ? "vote-button active-up" : "vote-button"}
                    >
                      ▲
                    </button>
                    <span className="vote-count">{answer.votes}</span>
                    <button
                      onClick={() => handleAnswerVote(question.id, answer.id, -1)}
                      className={answer.userVote === -1 ? "vote-button active-down" : "vote-button"}
                    >
                      ▼
                    </button>
                  </div>
                  <div className="answer-content">
                    <p className="answer-text">{answer.content}</p>
                  </div>
                </div>
              ))
          ) : (
            <p className="no-answers">Be the first to answer this question!</p>
          )}
        </div>
      </div>
    </div>
  );
}

