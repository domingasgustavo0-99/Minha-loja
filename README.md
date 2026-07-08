# Minha Loja — site de vendas com PIX + aviso no Discord

Site próprio de vendas: vitrine com categorias, checkout PIX pela **Vye**, e um
aviso automático no **Discord** toda vez que uma venda é confirmada. Editar
produtos e categorias é feito num painel simples em `/admin`.

## O que tem aqui

- `public/` → o site (loja + painel admin), em HTML/CSS/JS puro.
- `api/` → as funções que rodam no servidor (produtos, categorias, checkout, webhook).
- Banco de dados: **Vercel KV** (gratuito) — é o que guarda os produtos e pedidos.

## Passo a passo pra colocar no ar (Vercel, de graça)

### 1. Suba este projeto pro GitHub
Crie um repositório novo e suba esta pasta inteira nele.

### 2. Importe na Vercel
- Acesse [vercel.com](https://vercel.com), crie uma conta grátis (dá pra usar o GitHub).
- Clique em **Add New → Project** e escolha o repositório que você acabou de subir.
- Pode deixar as configurações padrão e clicar em **Deploy**. Vai dar erro de
  primeira porque faltam as variáveis de ambiente — é normal, ajusta no próximo passo.

### 3. Crie o banco de dados (Vercel KV)
- Dentro do projeto na Vercel, vá na aba **Storage**.
- Clique em **Create Database → KV** (é gratuito no plano Hobby).
- Depois de criar, clique em **Connect Project** e conecte no seu projeto.
- Isso já preenche sozinho as variáveis `KV_REST_API_URL` e `KV_REST_API_TOKEN`.

### 4. Configure as outras variáveis de ambiente
Ainda na Vercel, vá em **Settings → Environment Variables** e adicione:

| Nome | O que colocar |
|---|---|
| `ADMIN_PASSWORD` | Uma senha forte, só você vai saber |
| `VYEPAY_API_KEY` | Sua chave da Vye, em https://vyepay.com/dashboard/credentials |
| `DISCORD_WEBHOOK_URL` | O link do webhook do canal do Discord (veja abaixo como criar) |

Depois de adicionar, vá na aba **Deployments** e clique em **Redeploy** pra
aplicar as variáveis novas.

### 5. Crie o webhook do Discord
No canal do Discord onde você quer receber os avisos:
1. Configurações do canal → **Integrações** → **Webhooks** → **Novo Webhook**.
2. Copie a **URL do Webhook** e cole na variável `DISCORD_WEBHOOK_URL` (passo 4).

### 6. Configure o webhook na Vye
No painel da Vye, cadastre a URL de notificação de pagamento apontando para:

```
https://SEU-SITE.vercel.app/api/webhook/vyepay
```

⚠️ **Atenção:** eu não consegui acessar a página de documentação completa da
Vye (pede login), então montei o recebimento desse webhook de um jeito
flexível, tentando reconhecer os formatos mais comuns de payload. Se depois
de uma venda de teste o Discord não avisar, me manda o print da doc da Vye
(seção de Webhooks) ou o JSON que aparece nos **Logs** do seu projeto na
Vercel, que eu ajusto o arquivo `api/webhook/vyepay.js` certinho pro formato
exato de vocês.

## Como usar no dia a dia

- **Loja**: `https://SEU-SITE.vercel.app`
- **Painel de produtos**: `https://SEU-SITE.vercel.app/admin` (pede a senha
  que você configurou em `ADMIN_PASSWORD`)

No painel você cria categorias, cria produtos (nome, descrição, preço, imagem
e categoria), edita e apaga — tudo sem mexer em código.

## Rodando localmente (opcional, pra quem quiser testar antes)

```bash
npm install -g vercel
npm install
vercel dev
```

Você vai precisar criar um arquivo `.env` (copie o `.env.example`) com suas
próprias chaves de teste.
