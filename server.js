// server.js
import express from 'express';

const app = express();
const PORT = 3000;

// Middleware per leggere JSON nel body
app.use(express.json());

// API GET
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Ciao dal server Node.js!' });
});

// API POST echo
app.post('/api/echo', (req, res) => {
  const data = req.body;
  res.json({ received: data });
});

// API POST invert string
app.post('/api/invert', (req, res) => {
  const { text } = req.body;  // legge la proprietà "text" dal JSON
  if (typeof text !== 'string') {
    return res.status(400).json({ error: 'Devi fornire una stringa in "text"' });
  }

  const reversed = text.split('').reverse().join('');
  res.json({ original: text, reversed });
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
