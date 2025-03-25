# Instruções de Configuração do SCUM Bunker Notifier

## Configuração das Variáveis de Ambiente

Para que a aplicação funcione corretamente com a API do Discord, você precisa configurar as seguintes variáveis de ambiente:

1. Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```
# Token do Bot do Discord
DISCORD_TOKEN=seu_token_do_discord_aqui

# ID do Canal do Discord que contém as mensagens de status dos bunkers
DISCORD_CHANNEL_ID=id_do_canal_aqui

# URL base da aplicação (opcional, padrão é http://localhost:3000)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Como obter um Token do Discord

1. Acesse o [Portal de Desenvolvedores do Discord](https://discord.com/developers/applications)
2. Clique em "New Application" e dê um nome para sua aplicação
3. Vá para a seção "Bot" no menu lateral
4. Clique em "Add Bot" e confirme
5. Na seção do Bot, clique em "Reset Token" para gerar um novo token
6. Copie o token gerado e adicione ao seu arquivo `.env.local`

## Como obter o ID do Canal

1. Ative o "Modo Desenvolvedor" nas configurações do Discord (Configurações > Avançado > Modo Desenvolvedor)
2. Clique com o botão direito no canal que contém as mensagens de status dos bunkers
3. Selecione "Copiar ID" e adicione ao seu arquivo `.env.local`

## Permissões necessárias para o Bot

O bot precisa das seguintes permissões:
- `Read Messages/View Channels`
- `Read Message History`

Certifique-se de que o bot tenha sido adicionado ao servidor e tenha acesso ao canal especificado.

## Usando Dados de Mock para Testes

Se você não tiver acesso a um token do Discord válido, a aplicação usará automaticamente dados de mock para testes. Você verá a mensagem "Usando dados de mock devido a erro de autorização na API do Discord" no console.

Para forçar o uso de dados reais, certifique-se de que as variáveis de ambiente estejam configuradas corretamente.
