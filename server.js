require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const alunosRoutes = require('./routes/alunos');
const instrutoresRoutes = require('./routes/instrutores');
const planosRoutes = require('./routes/planos');
const matriculasRoutes = require('./routes/matriculas');
const pagamentosRoutes = require('./routes/pagamentos');
const treinosRoutes = require('./routes/treinos');
const checkinsRoutes = require('./routes/checkins');

const app = express();

app.use(cors());
app.use(express.json());

const clientDist = path.join(__dirname, 'client', 'dist');

app.use('/api/alunos', alunosRoutes);
app.use('/api/instrutores', instrutoresRoutes);
app.use('/api/planos', planosRoutes);
app.use('/api/matriculas', matriculasRoutes);
app.use('/api/pagamentos', pagamentosRoutes);
app.use('/api/treinos', treinosRoutes);
app.use('/api/checkins', checkinsRoutes);

app.get('/api', (req, res) => {
  res.json({
    sistema: 'Sistema de Academia',
    status: 'online',
    endpoints: [
      '/api/alunos',
      '/api/instrutores',
      '/api/planos',
      '/api/matriculas',
      '/api/pagamentos',
      '/api/treinos',
      '/api/checkins'
    ]
  });
});

app.use('/api', (req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error.message);
    process.exit(1);
  });
