const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com')
    ? { rejectUnauthorized: false }
    : false
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS modelos (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      largura NUMERIC NOT NULL,
      comprimento NUMERIC NOT NULL DEFAULT 0
    )
  `);
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM modelos');
  if (rows[0].count === 0) {
    await pool.query(`
      INSERT INTO modelos (nome, largura, comprimento) VALUES
      ('Prime 30mm', 2, 25),
      ('Gold 30mm', 3, 25),
      ('Max 30mm', 4, 25)
    `);
  }
}

// ---- API do catálogo de modelos ----
app.get('/api/modelos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, nome, largura::float AS largura, comprimento::float AS comprimento FROM modelos ORDER BY id');
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Falha ao buscar modelos' });
  }
});

app.post('/api/modelos', async (req, res) => {
  const { nome, largura, comprimento } = req.body || {};
  if (!nome || !largura) return res.status(400).json({ error: 'nome e largura são obrigatórios' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO modelos (nome, largura, comprimento) VALUES ($1, $2, $3) RETURNING id, nome, largura::float AS largura, comprimento::float AS comprimento',
      [nome, largura, comprimento || 0]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Falha ao criar modelo' });
  }
});

app.delete('/api/modelos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM modelos WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Falha ao remover modelo' });
  }
});

const PORT = process.env.PORT || 3000;

init()
  .then(() => {
    app.listen(PORT, () => console.log('BrasilGrass rodando na porta ' + PORT));
  })
  .catch((e) => {
    console.error('Falha ao inicializar o banco de dados:', e);
    // sobe o servidor mesmo assim, pra não derrubar o deploy por completo
    app.listen(PORT, () => console.log('BrasilGrass rodando na porta ' + PORT + ' (sem banco inicializado)'));
  });
