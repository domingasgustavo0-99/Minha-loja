const { getProducts, saveProducts } = require('./_lib/db');
const { requireAdmin } = require('./_lib/auth');

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const products = await getProducts();
    res.status(200).json(products);
    return;
  }

  // Todo o resto (criar, editar, apagar) exige senha de admin
  if (!requireAdmin(req, res)) return;

  const products = await getProducts();

  if (req.method === 'POST') {
    const { name, description, price, imageUrl, categoryId, active } = req.body || {};
    if (!name || price === undefined) {
      res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
      return;
    }
    const product = {
      id: randomId(),
      name,
      description: description || '',
      price: Number(price),
      imageUrl: imageUrl || '',
      categoryId: categoryId || null,
      active: active !== false,
    };
    products.push(product);
    await saveProducts(products);
    res.status(201).json(product);
    return;
  }

  if (req.method === 'PUT') {
    const { id, ...patch } = req.body || {};
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Produto não encontrado.' });
      return;
    }
    if (patch.price !== undefined) patch.price = Number(patch.price);
    products[index] = { ...products[index], ...patch };
    await saveProducts(products);
    res.status(200).json(products[index]);
    return;
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const filtered = products.filter((p) => p.id !== id);
    await saveProducts(filtered);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Método não permitido.' });
};
