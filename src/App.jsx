import { useState, useEffect } from 'react';
import Beams from './beams';
import SignupForm from './SignUpForm';
import LoginForm from './LoginForm';
import HomePage from './HomePage';
import NewQuestion from './NewQuestion';
import AnswerPage from './AnswerPage';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState('');

  const normalizeQuestion = (question) => ({
    ...question,
    id: question.id ?? question._id ?? question.id,
    votes: question.votes ?? 0,
    userVote: question.userVote ?? 0,
    answers: (question.answers ?? []).map((answer) => ({
      ...answer,
      id: answer.id ?? answer._id ?? answer.id,
      votes: answer.votes ?? 0,
      userVote: answer.userVote ?? 0,
    })),
  });

  const fetchQuestions = async () => {
    try {
      setQuestionsLoading(true);
      setQuestionsError('');
      const response = await fetch(`${API_BASE_URL}/questions`);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please check if the server is running on port 5000.');
      }
      
      if (!response.ok) {
        throw new Error('Failed to load questions.');
      }
      const data = await response.json();
      setQuestions(data.map(normalizeQuestion));
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestionsError(error.message || 'Unable to load questions. Make sure the server is running.');
    } finally {
      setQuestionsLoading(false);
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchQuestions();
    } else {
      setQuestions([]);
    }
  }, [isAuthenticated]);

  const handleSignupSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setShowNewQuestion(false);
    setSelectedQuestion(null);
  };

  const handleVote = async (questionId, vote) => {
    // Optimistically update UI
    const currentQuestion = questions.find(q => q.id === questionId);
    if (!currentQuestion) return;

    const oldVote = currentQuestion.userVote || 0;
    // Toggle: if clicking the same vote, remove it (set to 0)
    const newVote = oldVote === vote ? 0 : vote;
    const voteChange = newVote - oldVote;
    
    const optimisticUpdate = {
      ...currentQuestion,
      userVote: newVote,
      votes: (currentQuestion.votes || 0) + voteChange
    };

    setQuestions((prevQuestions) => prevQuestions.map((q) => {
      if (q.id === questionId) {
        return optimisticUpdate;
      }
      return q;
    }));

    if (selectedQuestion && selectedQuestion.id === questionId) {
      setSelectedQuestion(optimisticUpdate);
    }

    // Save to backend
    try {
      const response = await fetch(`${API_BASE_URL}/questions/${questionId}/vote`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote: newVote }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from vote endpoint:', text);
        throw new Error('Server returned an invalid response. Please restart the server.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to save vote' }));
        throw new Error(errorData.message || 'Failed to save vote');
      }

      const data = await response.json();
      const normalized = normalizeQuestion(data);

      // Update with server response
      setQuestions((prevQuestions) => prevQuestions.map((q) => {
        if (q.id === questionId) {
          return normalized;
        }
        return q;
      }));

      if (selectedQuestion && selectedQuestion.id === questionId) {
        setSelectedQuestion(normalized);
      }
    } catch (error) {
      console.error('Error saving vote:', error);
      // Revert optimistic update on error
      setQuestions((prevQuestions) => prevQuestions.map((q) => {
        if (q.id === questionId) {
          return currentQuestion;
        }
        return q;
      }));

      if (selectedQuestion && selectedQuestion.id === questionId) {
        setSelectedQuestion(currentQuestion);
      }
    }
  };

  const handleQuestionVote = (questionId, vote) => {
    handleVote(questionId, vote);
  };

  const handleAnswerVote = async (questionId, answerId, vote) => {
    // Optimistically update UI
    const currentQuestion = questions.find(q => q.id === questionId);
    if (!currentQuestion || !currentQuestion.answers) return;

    const currentAnswer = currentQuestion.answers.find(a => a.id === answerId);
    if (!currentAnswer) return;

    const oldVote = currentAnswer.userVote || 0;
    // Toggle: if clicking the same vote, remove it (set to 0)
    const newVote = oldVote === vote ? 0 : vote;
    const voteChange = newVote - oldVote;

    const optimisticUpdate = {
      ...currentQuestion,
      answers: currentQuestion.answers.map((a) => {
        if (a.id === answerId) {
          return {
            ...a,
            userVote: newVote,
            votes: (a.votes || 0) + voteChange
          };
        }
        return a;
      })
    };

    setQuestions((prevQuestions) => prevQuestions.map((q) => {
      if (q.id === questionId) {
        return optimisticUpdate;
      }
      return q;
    }));

    if (selectedQuestion && selectedQuestion.id === questionId) {
      setSelectedQuestion(optimisticUpdate);
    }

    // Save to backend
    try {
      const response = await fetch(`${API_BASE_URL}/questions/${questionId}/answers/${answerId}/vote`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote: newVote }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from answer vote endpoint:', text);
        throw new Error('Server returned an invalid response. Please restart the server.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to save vote' }));
        throw new Error(errorData.message || 'Failed to save vote');
      }

      const data = await response.json();
      const normalized = normalizeQuestion(data);

      // Update with server response
      setQuestions((prevQuestions) => prevQuestions.map((q) => {
        if (q.id === questionId) {
          return normalized;
        }
        return q;
      }));

      if (selectedQuestion && selectedQuestion.id === questionId) {
        setSelectedQuestion(normalized);
      }
    } catch (error) {
      console.error('Error saving answer vote:', error);
      // Revert optimistic update on error
      setQuestions((prevQuestions) => prevQuestions.map((q) => {
        if (q.id === questionId) {
          return currentQuestion;
        }
        return q;
      }));

      if (selectedQuestion && selectedQuestion.id === questionId) {
        setSelectedQuestion(currentQuestion);
      }
    }
  };

  const openQuestion = async (question) => {
    try {
      setQuestionsError('');
      const response = await fetch(`${API_BASE_URL}/questions/${question.id}`);
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        const fallback = questions.find((q) => q.id === question.id);
        if (fallback) {
          setSelectedQuestion(fallback);
          return;
        }
        throw new Error('Server returned an invalid response.');
      }
      
      if (!response.ok) {
        throw new Error('Failed to load question details.');
      }
      const data = await response.json();
      setSelectedQuestion(normalizeQuestion(data));
    } catch (error) {
      console.error('Error loading question:', error);
      setQuestionsError(error.message || 'Unable to load question details.');
      const fallback = questions.find((q) => q.id === question.id);
      if (fallback) {
        setSelectedQuestion(fallback);
      }
    }
  };

  const openAddQuestion = () => {
    setShowNewQuestion(true);
    setSelectedQuestion(null);
  };

  const addQuestion = async ({ title, content, category }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, category }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please check if the server is running.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create question.');
      }

      const normalized = normalizeQuestion(data);
      setQuestions((prevQuestions) => [normalized, ...prevQuestions]);
      setShowNewQuestion(false);
      setSelectedQuestion(null);

      return { success: true, question: normalized };
    } catch (error) {
      console.error('Error creating question:', error);
      return { success: false, message: error.message || 'Failed to create question. Please try again.' };
    }
  };

  const addAnswer = async (questionId, content) => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/${questionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please check if the server is running.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit answer.');
      }

      const normalized = normalizeQuestion(data);

      setQuestions((prevQuestions) =>
        prevQuestions.map((q) => (q.id === normalized.id ? normalized : q))
      );
      setSelectedQuestion(normalized);

      return { success: true };
    } catch (error) {
      console.error('Error adding answer:', error);
      return { success: false, message: error.message || 'Failed to submit answer. Please try again.' };
    }
  };

  const goHome = () => {
    setShowNewQuestion(false);
    setSelectedQuestion(null);
    setQuestionsError('');
  };

  if (isAuthenticated) {
    if (selectedQuestion) {
      return (
        <div style={{ width: '100%', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            <Beams
              beamWidth={3}
              beamHeight={20}
              beamNumber={12}
              lightColor="#ffffff"
              speed={2}
              noiseIntensity={1.75}
              scale={0.2}
              rotation={45}
            />
          </div>
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '100vh',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '20px', textAlign: 'right', position: 'relative', zIndex: 11 }}>
              <span style={{ marginRight: '20px', color: 'white', fontWeight: '500' }}>
                Welcome, {user?.name}!
              </span>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Logout
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 20px' }}>
              {questionsError && (
                <div
                  style={{
                    color: '#fca5a5',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    textAlign: 'center',
                  }}
                >
                  {questionsError}
                </div>
              )}
              <AnswerPage
                question={selectedQuestion}
                goHome={goHome}
                handleQuestionVote={handleQuestionVote}
                handleAnswerVote={handleAnswerVote}
                addAnswer={addAnswer}
              />
            </div>
          </div>
        </div>
      );
    }

    if (showNewQuestion) {
      return (
        <div style={{ width: '100%', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            <Beams
              beamWidth={3}
              beamHeight={20}
              beamNumber={12}
              lightColor="#ffffff"
              speed={2}
              noiseIntensity={1.75}
              scale={0.2}
              rotation={45}
            />
          </div>
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '100vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <NewQuestion addQuestion={addQuestion} goHome={goHome} />
          </div>
        </div>
      );
    }

    return (
      <div style={{ width: '100%', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <Beams
            beamWidth={3}
            beamHeight={20}
            beamNumber={12}
            lightColor="#ffffff"
            speed={2}
            noiseIntensity={1.75}
            scale={0.2}
            rotation={45}
          />
        </div>
        <div
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '100vh',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: '20px', textAlign: 'right', position: 'relative', zIndex: 11 }}>
            <span style={{ marginRight: '20px', color: 'white', fontWeight: '500' }}>
              Welcome, {user?.name}!
            </span>
            <button 
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Logout
            </button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', position: 'relative', zIndex: 10 }}>
          {questionsLoading && (
            <div
              style={{
                color: 'white',
                textAlign: 'center',
                marginBottom: '16px',
                fontWeight: 500,
              }}
            >
              Loading questions...
            </div>
          )}
          {questionsError && !questionsLoading && (
            <div
              style={{
                color: '#fca5a5',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '12px 16px',
                borderRadius: '8px',
                margin: '0 20px 16px',
                textAlign: 'center',
              }}
            >
              {questionsError}
            </div>
          )}
            <HomePage
              questions={questions}
              handleVote={handleVote}
              openQuestion={openQuestion}
              openAddQuestion={openAddQuestion}
            />
          </div>
          <button 
            onClick={openAddQuestion}
            style={{
              position: 'fixed',
              bottom: '30px',
              left: '40px',
              padding: '14px 32px',
              borderRadius: '9999px',
              background: 'white',
              color: 'black',
              border: 'none',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              letterSpacing: '0.5px',
              zIndex: 1000,
              pointerEvents: 'auto',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
              e.currentTarget.style.background = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.background = 'white';
            }}
          >
            Ask Question
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Beams
        beamWidth={3}
        beamHeight={20}
        beamNumber={12}
        lightColor="#ffffff"
        speed={2}
        noiseIntensity={1.75}
        scale={0.2}
        rotation={45}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        {showLogin ? (
          <LoginForm 
            onSwitch={() => setShowLogin(false)} 
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <SignupForm 
            onSwitch={() => setShowLogin(true)} 
            onSignupSuccess={handleSignupSuccess}
          />
        )}
      </div>
    </div>
  );
}

export default App;
