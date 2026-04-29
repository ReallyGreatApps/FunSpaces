const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// File path for storing posts
const postsFilePath = path.join(__dirname, 'posts.json');

// Initialize posts file if it doesn't exist
if (!fs.existsSync(postsFilePath)) {
  fs.writeFileSync(postsFilePath, JSON.stringify([]));
}

// Helper function to read posts from file
function getPosts() {
  try {
    const data = fs.readFileSync(postsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Helper function to write posts to file
function savePosts(posts) {
  fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2));
}

// API Endpoints

// GET /posts - Get all posts (newest first)
app.get('/posts', (req, res) => {
  try {
    const posts = getPosts();
    // Sort by timestamp (newest first)
    posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// POST /posts - Create a new post
app.post('/posts', (req, res) => {
  try {
    const { username, content } = req.body;

    // Validation
    if (!username || !content) {
      return res.status(400).json({ error: 'Username and content are required' });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({ error: 'Post content cannot be empty' });
    }

    const posts = getPosts();

    // Create new post object
    const newPost = {
      id: Date.now(), // Simple ID using timestamp
      username: username,
      content: content,
      likes: 0,
      likedBy: [], // Track which users liked this post
      timestamp: new Date().toISOString()
    };

    posts.push(newPost);
    savePosts(posts);

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// POST /like/:id - Like a post (prevent duplicate likes from same user)
app.post('/like/:id', (req, res) => {
  try {
    const { username } = req.body;
    const postId = parseInt(req.params.id);

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const posts = getPosts();
    const post = posts.find(p => p.id === postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user already liked this post
    if (post.likedBy.includes(username)) {
      return res.status(400).json({ error: 'You already liked this post' });
    }

    // Add like
    post.likes += 1;
    post.likedBy.push(username);
    savePosts(posts);

    res.json({ id: postId, likes: post.likes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🎉 FunSpaces Server running on http://localhost:${PORT}`);
  console.log(`📍 Make sure your React app is running on http://localhost:3000`);
});