// Simple Express backend for FunSpaces.
// Uses a JSON file for storage so setup stays beginner-friendly.

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const dataFile = path.join(__dirname, 'posts.json');

// Ensure the data file exists when server starts.
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify({ posts: [] }, null, 2));
}

// Read posts from disk.
function readPosts() {
  const raw = fs.readFileSync(dataFile, 'utf-8');
  const data = JSON.parse(raw);
  return data.posts || [];
}

// Write posts to disk.
function writePosts(posts) {
  fs.writeFileSync(dataFile, JSON.stringify({ posts }, null, 2));
}

// GET /posts -> return all posts (newest first).
app.get('/posts', (req, res) => {
  try {
    const posts = readPosts().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load posts.' });
  }
});

// POST /posts -> create a new post.
app.post('/posts', (req, res) => {
  try {
    const { username, content } = req.body;

    if (!username || !content || !content.trim()) {
      return res.status(400).json({ error: 'Username and content are required.' });
    }

    const posts = readPosts();
    const newPost = {
      id: Date.now().toString(),
      username,
      content: content.trim(),
      likes: 0,
      likedBy: [], // Stores usernames that already liked this post.
      timestamp: new Date().toISOString(),
    };

    posts.push(newPost);
    writePosts(posts);

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post.' });
  }
});

// POST /like/:id -> like a post, prevent duplicate likes from same username.
app.post('/like/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required.' });
    }

    const posts = readPosts();
    const post = posts.find((p) => p.id === id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    if (post.likedBy.includes(username)) {
      return res.status(400).json({ error: 'You already liked this post.' });
    }

    post.likes += 1;
    post.likedBy.push(username);

    writePosts(posts);

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to like post.' });
  }
});

app.listen(PORT, () => {
  console.log(`FunSpaces backend running on http://localhost:${PORT}`);
});
