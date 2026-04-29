import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:4000';

function App() {
  const [username, setUsername] = useState(localStorage.getItem('funspacesUser') || '');
  const [nameInput, setNameInput] = useState('');
  const [posts, setPosts] = useState([]);
  const [postInput, setPostInput] = useState('');
  const [error, setError] = useState('');

  // Load posts whenever user is logged in.
  useEffect(() => {
    if (username) fetchPosts();
  }, [username]);

  async function fetchPosts() {
    try {
      setError('');
      const response = await fetch(`${API_URL}/posts`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch posts.');
      setPosts(data);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    if (!nameInput.trim()) return;
    const cleaned = nameInput.trim();
    localStorage.setItem('funspacesUser', cleaned);
    setUsername(cleaned);
    setNameInput('');
  }

  async function handleCreatePost(e) {
    e.preventDefault();
    if (!postInput.trim()) return;

    try {
      setError('');
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, content: postInput }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create post.');

      setPostInput('');
      // Instant update: prepend new post.
      setPosts((prev) => [data, ...prev]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLike(postId) {
    try {
      setError('');
      const response = await fetch(`${API_URL}/like/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to like post.');

      // Update the liked post in local state.
      setPosts((prev) => prev.map((post) => (post.id === postId ? data : post)));
    } catch (err) {
      setError(err.message);
    }
  }

  function logout() {
    localStorage.removeItem('funspacesUser');
    setUsername('');
    setPosts([]);
  }

  if (!username) {
    return (
      <div className="page login-page">
        <div className="card login-card">
          <h1>🎉 FunSpaces</h1>
          <p>Enter a username to jump into the fun!</p>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Your username"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
            <button type="submit">Enter</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <div className="dashboard-header card">
        <h2>✨ Welcome, {username}!</h2>
        <button onClick={logout} className="logout-btn">Log out</button>
      </div>

      <div className="card create-post-card">
        <form onSubmit={handleCreatePost}>
          <textarea
            placeholder="Share something fun... 😄🌈"
            value={postInput}
            onChange={(e) => setPostInput(e.target.value)}
            rows={3}
          />
          <button type="submit">Post 🚀</button>
        </form>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="feed">
        {posts.map((post) => {
          const likedAlready = post.likedBy?.includes(username);
          return (
            <div key={post.id} className="card post-card">
              <div className="post-top">
                <strong>@{post.username}</strong>
                <span>{new Date(post.timestamp).toLocaleString()}</span>
              </div>
              <p>{post.content}</p>
              <button onClick={() => handleLike(post.id)} disabled={likedAlready}>
                ❤️ {post.likes}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
