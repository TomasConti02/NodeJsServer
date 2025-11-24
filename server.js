/*
curl -X POST https://nodejsserver-l0yd.onrender.com/api/invert      -H "Content-Type: application/json"      -d '{"text":"Finocchietto"}'
sudo apt install nodejs npm -y -> su ubuntu 22.04 installiamo ambiente run time nodejs e gestore pacchetti npm(simile a pip)

npm init -> creo file fondamentale di ogni progetto Node.js: package.json.

package.json: È un file di configurazione in formato JSON che contiene metadati sul 
tuo progetto (nome, versione, autore, licenza) e, soprattutto, l'elenco di tutte 
le dipendenze (le librerie esterne necessarie, come Express) e gli script di avvio.

npm install express body-parser xml2js multer

 node server.js -> facciamo partire tutto

 per provare le osTicket API:
 JSON Example:
curl -X POST http://localhost:3000/api/tickets.json \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Test Ticket",
    "message": "data:text/html,This is a test",
    "phone": "3185558634",
    "ip": "192.168.1.1"
  }'
  
XML Example:
curl -X POST http://localhost:3000/api/tickets.xml \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0" encoding="UTF-8"?>
<ticket alert="true" autorespond="true" source="API">
  <n>John Doe</n>
  <email>john@example.com</email>
  <subject>Test Ticket</subject>
  <message type="text/plain"><![CDATA[This is a test message]]></message>
</ticket>'
*/
import express from 'express'; //importo express come libreria 
const app = express(); //creo instanza app web

// richiesti per implementare la ticket API
import multer from 'multer';
import bodyParser from 'body-parser';
import xml2js from 'xml2js';


const PORT = 3000; //porta di ascolto e aggancio 
app.use(express.json()); //middleware di gestione POST body in formato json

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text({ type: 'application/xml' }));

//posso raccogliere le richieste con req.body
// Log in memoria
const invertLogs = [];
const feedbackLogs = []; // log in memoria per feedback per il recupero
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
// ----------------------------------------------------
// API #3: Info Utente Fissa (MODIFICATA: GET /api/userInfo)
// ----------------------------------------------------
app.get('/api/userInfo', (req, res) => {
  // Valori fissati come richiesto
  const userInfo = {
    nome: "Tomas",
    cognome: "Conti"
  };
  
  // Risposta JSON al client
  res.json(userInfo);
});

const users = new Map();

function createSomeUsers() {

    const user1 = {
        nome: "Tomas",
        cognome: "Conti"
    };
    users.set("1", user1);

    const user2 = {
        nome: "Enrico",
        cognome: "Fermi"
    };
    users.set("2", user2);

    const user3 = {
        nome: "Rita",
        cognome: "Levi Montalcini"
    };
    users.set("3", user3);

    const user4 = {
        nome: "Giovanni",
        cognome: "Parisi"
    };
    users.set("4", user4);

    const user5 = {
        nome: "Marie",
        cognome: "Curie"
    };
    users.set("5", user5);

    console.log(users.get("5"));

}

// GET /api/userInfo/:id - Retrieve user by id
app.get('/api/userInfo/:id', (req, res) => {
    const user = users.get(req.params.id);

    if (!user) {
        return res.status(404).send('User not found');
    }

    res.json(user);
});

// In-memory storage for tickets
const tickets = new Map();
let ticketCounter = 100000;


// Helper function to generate ticket ID
function generateTicketId() {
    return (++ticketCounter).toString();
}

// Helper function to validate required fields
function validateTicketData(data) {
    const errors = [];

    if (!data.email) errors.push('Email is required');
    if (!data.name) errors.push('Name is required');
    if (!data.subject) errors.push('Subject is required');
    if (!data.message) errors.push('Message is required');

    // Validate email format
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Invalid email format');
    }

    return errors;
}

// Helper function to parse data URL (RFC 2397)
function parseDataUrl(dataUrl) {
    if (!dataUrl || !dataUrl.startsWith('data:')) {
        return { type: 'text/plain', content: dataUrl };
    }

    const match = dataUrl.match(/^data:([^;,]+)?(;base64)?,(.*)$/);
    if (!match) {
        return { type: 'text/plain', content: dataUrl };
    }

    const type = match[1] || 'text/plain';
    const isBase64 = match[2] === ';base64';
    const content = match[3];

    return {
        type,
        content: isBase64 ? Buffer.from(content, 'base64').toString('utf-8') : decodeURIComponent(content)
    };
}

// Helper function to process attachments from JSON
function processJsonAttachments(attachments) {
    if (!Array.isArray(attachments)) return [];

    return attachments.map(attachment => {
        const fileName = Object.keys(attachment)[0];
        const dataUrl = attachment[fileName];
        const parsed = parseDataUrl(dataUrl);

        return {
            name: fileName,
            type: parsed.type,
            data: parsed.content
        };
    });
}

// Helper function to process attachments from XML
function processXmlAttachments(attachments) {
    if (!attachments || !Array.isArray(attachments.file)) return [];

    return attachments.file.map(file => {
        const encoding = file.$.encoding;
        const content = encoding === 'base64'
            ? Buffer.from(file._.trim(), 'base64').toString('utf-8')
            : file._.trim();

        return {
            name: file.$.name,
            type: file.$.type || 'text/plain',
            data: content
        };
    });
}

// POST /api/tickets.json - Create ticket with JSON payload
app.post('/api/tickets.json', (req, res) => {
    try {
        const data = req.body;

        // Validate required fields
        const errors = validateTicketData(data);
        if (errors.length > 0) {
            return res.status(400).send(errors.join(', '));
        }

        // Parse message if it's a data URL
        const messageData = parseDataUrl(data.message);

        // Process attachments
        const attachments = data.attachments ? processJsonAttachments(data.attachments) : [];

        // Create ticket object
        const ticket = {
            id: generateTicketId(),
            email: data.email,
            name: data.name,
            subject: data.subject,
            message: {
                type: messageData.type,
                content: messageData.content
            },
            phone: data.phone || null,
            ip: data.ip || null,
            priority: data.priority || null,
            source: data.source || 'API',
            topicId: data.topicId || null,
            alert: data.alert !== undefined ? data.alert : true,
            autorespond: data.autorespond !== undefined ? data.autorespond : true,
            attachments: attachments,
            notes: data.notes || null,
            createdAt: new Date().toISOString()
        };

        // Store ticket
        tickets.set(ticket.id, ticket);

        console.log(`Ticket created: ${ticket.id}`);
        console.log(JSON.stringify(ticket, null, 2));

        // Return ticket ID with 201 status
        res.status(201).send(ticket.id);

    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(400).send('Bad Request: ' + error.message);
    }
});

// POST /api/tickets.xml - Create ticket with XML payload
app.post('/api/tickets.xml', async (req, res) => {
    try {
        const xmlData = req.body;

        // Parse XML
        const parser = new xml2js.Parser({
            explicitArray: false,
            mergeAttrs: true
        });

        const result = await parser.parseStringPromise(xmlData);
        const data = result.ticket;

        // Map XML fields to standard format
        const ticketData = {
            email: data.email,
            name: data.n || data.name,
            subject: data.subject,
            message: typeof data.message === 'object' ? data.message._ : data.message,
            messageType: data.message?.type || 'text/plain',
            phone: data.phone,
            ip: data.ip,
            priority: data.priority,
            source: data.source || 'API',
            topicId: data.topicId,
            alert: data.alert !== 'false',
            autorespond: data.autorespond !== 'false'
        };

        // Validate required fields
        const errors = validateTicketData(ticketData);
        if (errors.length > 0) {
            return res.status(400).send(errors.join(', '));
        }

        // Process attachments
        const attachments = data.attachments ? processXmlAttachments(data.attachments) : [];

        // Create ticket object
        const ticket = {
            id: generateTicketId(),
            email: ticketData.email,
            name: ticketData.name,
            subject: ticketData.subject,
            message: {
                type: ticketData.messageType,
                content: ticketData.message
            },
            phone: ticketData.phone || null,
            ip: ticketData.ip || null,
            priority: ticketData.priority || null,
            source: ticketData.source,
            topicId: ticketData.topicId || null,
            alert: ticketData.alert,
            autorespond: ticketData.autorespond,
            attachments: attachments,
            createdAt: new Date().toISOString()
        };

        // Store ticket
        tickets.set(ticket.id, ticket);

        console.log(`Ticket created: ${ticket.id}`);
        console.log(JSON.stringify(ticket, null, 2));

        // Return ticket ID with 201 status
        res.status(201).send(ticket.id);

    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(400).send('Incorrectly formatted content (bad XML)');
    }
});

// GET /api/tickets/:id - Retrieve ticket (bonus endpoint for testing)
app.get('/api/tickets/:id', (req, res) => {
    const ticket = tickets.get(req.params.id);

    if (!ticket) {
        return res.status(404).send('Ticket not found');
    }

    res.json(ticket);
});

// GET /api/tickets - List all tickets (bonus endpoint for testing)
app.get('/api/tickets', (req, res) => {
    res.json(Array.from(tickets.values()));
});
// ----------------------------------------------------
// API POST feedback, user send to the server the feedback message
// ----------------------------------------------------
app.post('/api/feedback', (req, res) => {
    const { message } = req.body;
    //validation feedback message
    //Salva nel log
    feedbackLogs.push(`Feedback: ${message}`);
    res.json({ status: 'Feedback registrato', ricevuto: message });
});
// API GET feedback, get feedback log 
app.get('/api/feedback', (req, res) => {
    res.json(feedbackLogs);
});
// ----------------------------------------------------
// Start server
app.listen(PORT, () => {
    createSomeUsers();
    console.log('users created');
    console.log(`Server in ascolto su http://localhost:${PORT}`);
    console.log(`\nEndpoints:`);
    console.log(`  POST /api/tickets.json - Create ticket (JSON)`);
    console.log(`  POST /api/tickets.xml  - Create ticket (XML)`);
    console.log(`  GET  /api/tickets/:id  - Get ticket by ID`);
    console.log(`  GET  /api/tickets      - List all tickets`);
    console.log('\n');
    console.log('  GET /api/userInfo      - Get User Info');


});

