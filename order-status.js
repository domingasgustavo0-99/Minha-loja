const { getOrder } = require('./_lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método não permitido.' });
    return;
  }
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Informe o id do pedido.' });
    return;
  }
  const order = await getOrder(id);
  if (!order) {
    res.status(404).json({ error: 'Pedido não encontrado.' });
    return;
  }
  res.status(200).json({ status: order.status });
};
