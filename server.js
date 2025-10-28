/*
curl -X POST https://nodejsserver-l0yd.onrender.com/api/invert      -H "Content-Type: application/json"      -d '{"text":"Finocchietto"}'
sudo apt install nodejs npm -y -> su ubuntu 22.04 installiamo ambiente run time nodejs e gestore pacchetti npm(simile a pip)

npm init -> creo file fondamentale di ogni progetto Node.js: package.json.

package.json: È un file di configurazione in formato JSON che contiene metadati sul 
tuo progetto (nome, versione, autore, licenza) e, soprattutto, l'elenco di tutte 
le dipendenze (le librerie esterne necessarie, come Express) e gli script di avvio.

npm install express -> scarico express come frame work

 node server.js -> facciamo partire tutto
*/
import express from 'express'; //importo express come libreria 
const app = express(); //creo instanza app web 
const PORT = 3000; //porta di ascolto e aggancio 
app.use(express.json()); //middleware di gestione POST body in formato json
//posso raccogliere le richieste con req.body
// Log in memoria
const invertLogs = [];
// La get su root deve restituire una semplice pagina di log al browser client 
app.get('/', (req, res) => {
  res.send(` //risposta alla get
    <h1>Log API /api/invert</h1>
    <pre>${invertLogs.join('\n')}</pre>
  `);
});
// API POST invert string
app.post('/api/invert', (req, res) => {
  const { text } = req.body; //prendo il body della request
  if (typeof text !== 'string') {
    return res.status(400).json({ error: 'Devi fornire una stringa in "text"' });
  } 
  const reversed = text.split('').reverse().join('')+'_ok';
  // Salva il log
  invertLogs.push(`Input: ${text} → Output: ${reversed}`);
  res.json({ original: text, reversed });//json di risposta al client che chiama api
});
//bound applicazione
app.listen(PORT, () => { console.log(`Server in ascolto su http://localhost:${PORT}`); });
