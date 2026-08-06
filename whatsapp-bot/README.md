# WhatsApp Bot

Bot de WhatsApp usando [whatsapp-web.js](https://github.com/pedroslopece/whatsapp-web.js) que envia mensagens de boas-vindas automáticas para novos membros em grupos.

## Funcionalidades

- **Boas-vindas em grupos**: Envia uma mensagem automática quando alguém entra em um grupo
- **Comando `!ping`**: Responde com "Pong! 🏓"
- **QR Code no terminal**: Exibe o código QR para autenticação diretamente no terminal

## Pré-requisitos

- Node.js (v16 ou superior)
- Um número de celular com WhatsApp (para autenticação)

## Instalação

```bash
npm install
```

## Configuração

Edite o arquivo `.env` para personalizar a mensagem de boas-vindas:

```env
WELCOME_MESSAGE=Olá {user}! Seja muito bem-vindo(a) ao grupo!
```

Use `{user}` como placeholder para o nome do novo membro.

## Uso

### Produção

```bash
npm start
```

### Desenvolvimento (com reload automático)

```bash
npm run dev
```

## Como funciona

1. Ao iniciar o bot, um código QR será exibido no terminal
2. Abra o WhatsApp no celular e escaneie o código QR (WhatsApp > Aparelhos conectados)
3. O bot entrará em sincronia com sua conta do WhatsApp
4. Sempre que alguém entrar em um grupo onde o bot está presente, ele enviará a mensagem de boas-vindas

## Notas importantes

- O bot usa a conta do WhatsApp pessoal (não é a API oficial do WhatsApp Business)
- A sessão é salva automaticamente em `.wwebjs_auth_state/` para evitar a necessidade de escanear o QR code a cada reinicialização
- O bot só envia boas-vindas em grupos onde ele é administrador ou membro
- Uso de bibliotecas não oficiais pode resultar em bloqueio da conta pelo WhatsApp

## Comandos

| Comando  | Descrição                |
| -------- | ------------------------ |
| `!ping`  | Responde com "Pong! 🏓"  |

## Licença

MIT
