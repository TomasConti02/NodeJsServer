import express from "express";

const app = express();

// Middleware per JSON
app.use(express.json());

// Rotta base
app.get("/", (req, res) => {
  res.send("Ciao dal server con Node 20 e Express 5! 🚀");
});

// Render (e altri host) useranno questa variabile d’ambiente per la porta
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
