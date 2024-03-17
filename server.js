const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve the notes.html file when /notes route is accessed
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'));
});

// API endpoint to get notes from db.json
app.get('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    const notes = JSON.parse(data);
    res.json(notes);
  });
});

// API endpoint to save a new note to db.json
app.post('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    const notes = JSON.parse(data);
    const newNote = {
      id: uuidv4(),
      title: req.body.title,
      text: req.body.text
    };
    notes.push(newNote);
    fs.writeFile(path.join(__dirname, '/db/db.json'), JSON.stringify(notes), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(newNote);
    });
  });
});

// Serve the index.html file when the root route is accessed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
