const { getProducts, createOrder } = require('./_lib/db');

function randomId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido.' });
    return;
  }

  const { items } = req.body || {};
  // items esperado: [{ productId, quantity }, ...]
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Carrinho vazio.' });
    return;
  }

  const products = await getProducts();

  // IMPORTANTE: o preço nunca vem do navegador do cliente, sempre
  // do banco de dados. Isso evita que alguém edite o preço no
  // console do navegador e pague menos.
  const orderItems = [];
  let total = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || product.active === false) {
      res.status(400).json({ error: `Produto inválido: ${item.productId}` });
      return;
    }
    const quantity = Math.max(1, Number(item.quantity) || 1);
    orderItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });
    total += product.price * quantity;
  }

  total = Math.round(total * 100) / 100;
  const orderId = randomId();

  // Cria a cobrança PIX na Vye
  const vyeResponse = await fetch('https://api.vyepay.com.br/v1/payments/pix', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.VYEPAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: total,
      description: `Pedido #${orderId}`,
      // Se a Vye aceitar um campo de referência externa (ex: "externalId"
      // ou "reference"), vale a pena adicionar aqui com o valor de orderId
      // pra casar o webhook com o pedido certo. Confirme o nome exato do
      // campo na documentação de vocês e ajuste esta linha se precisar.
    }),
  });

  if (!vyeResponse.ok) {
    const errorText = await vyeResponse.text();
    console.error('Erro Vye:', vyeResponse.status, errorText);
    res.status(502).json({ error: 'Não foi possível gerar o pagamento PIX agora.' });
    return;
  }

  const vyeData = await vyeResponse.json();
  // vyeData deve conter algo como { qrCode, copyPaste, id }
  // Se a Vye devolver o pagamento com um id próprio, guardamos
  // também pra ajudar a casar com o webhook.

  const order = {
    id: orderId,
    vyeId: vyeData.id || vyeData.paymentId || null,
    items: orderItems,
    total,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  await createOrder(order);

  res.status(200).json({
    orderId: order.id,
    total: order.total,
    qrCode: vyeData.qrCode,
    copyPaste: vyeData.copyPaste,
  });
};
