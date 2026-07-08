const { getCategories, saveCategories } = require('./_lib/db');
const { requireAdmin } = require('./_lib/auth');

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const categories = await getCategories();
    res.status(200).json(categories);
    return;
  }

  if (!requireAdmin(req, res)) return;

  const categories = await getCategories();

  if (req.method === 'POST') {
    const { name } = req.body || {};
    if (!name) {
      res.status(400).json({ error: 'Nome da categoria é obrigatório.' });
      return;
    }
    const category = { id: randomId(), name };
    categories.push(category);
    await saveCategories(categories);
    res.status(201).json(category);
    return;
  }

  if (req.method === 'PUT') {
    const { id, name } = req.body || {};
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Categoria não encontrada.' });
      return;
    }
    categories[index] = { ...categories[index], name };
    await saveCategories(categories);
    res.status(200).json(categories[index]);
    return;
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const filtered = categories.filter((c) => c.id !== id);
    await saveCategories(filtered);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Método não permitido.' });
};
