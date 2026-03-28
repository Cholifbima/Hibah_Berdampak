const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware biar frontend bisa ngobrol sama backend tanpa diblokir
app.use(cors());
app.use(express.json());

// Rute tes pertama (Pintu masuk)
app.get('/', (req, res) => {
  res.json({ message: "Halo! Server Top Production sudah menyala 🚀" });
});

// Nyalakan mesinnya
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});