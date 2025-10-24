import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

// Log in memoria
const invertLogs = [];

// Serve una semplice pagina per vedere i log
app.get('/', (req, res) => {
  res.send(`
    <h1>Log API /api/invert</h1>
    <pre>${invertLogs.join('\n')}</pre>
  `);
});

// API POST invert string
app.post('/api/invert', (req, res) => {
  const { text } = req.body;
  if (typeof text !== 'string') {
    return res.status(400).json({ error: 'Devi fornire una stringa in "text"' });
  }
  const reversed = text.split('').reverse().join('');
  
  // Salva il log
  invertLogs.push(`Input: ${text} → Output: ${reversed}`);
  
  res.json({ original: text, reversed });
});

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
