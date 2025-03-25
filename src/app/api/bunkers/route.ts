import { NextResponse } from 'next/server';
import { Bunker, BunkerStatus } from '@/types/bunker';
import { mockBunkerData } from '@/mocks/bunkerData';

// Constantes para a API do Discord
const DISCORD_API_URL = 'https://discord.com/api/v10';
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

// Variável para controlar o tempo da última requisição
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 5000; // 5 segundos entre requisições

// Flag para controlar se devemos usar dados de mock
const USE_MOCK_DATA = false; // Definir como false para usar a API real do Discord

// Função para extrair timestamp de um formato Discord <t:timestamp:R>
function extractTimestamp(text: string): number {
  const match = text.match(/<t:(\d+):R>/);
  if (match && match[1]) {
    return parseInt(match[1], 10) * 1000; // Converter para milissegundos
  }
  return 0;
}

// Função para verificar se podemos fazer uma nova requisição
function canMakeRequest(): boolean {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  return timeSinceLastRequest >= MIN_REQUEST_INTERVAL;
}

export async function GET() {
  try {
    // Verificar se podemos fazer uma nova requisição
    if (!canMakeRequest()) {
      const waitTime = Math.ceil((lastRequestTime + MIN_REQUEST_INTERVAL - Date.now()) / 1000);
      return NextResponse.json(
        { error: `Aguarde ${waitTime} segundos antes de fazer uma nova requisição.` },
        { status: 429 }
      );
    }

    // Atualizar o tempo da última requisição
    lastRequestTime = Date.now();

    // Se estamos usando dados de mock, retornar diretamente
    if (USE_MOCK_DATA) {
      console.log('Usando dados de mock para simular a API do Discord');
      return NextResponse.json({
        ...mockBunkerData,
        lastUpdate: Date.now(), // Atualizar o timestamp para o momento atual
        source: 'Mock Data (Simulado)'
      });
    }

    // Verificar se temos as variáveis de ambiente necessárias
    console.log('Verificando variáveis de ambiente:');
    console.log('DISCORD_TOKEN definido:', !!DISCORD_TOKEN);
    console.log('DISCORD_CHANNEL_ID definido:', !!DISCORD_CHANNEL_ID);
    console.log('DISCORD_CHANNEL_ID valor:', DISCORD_CHANNEL_ID);
    
    if (!DISCORD_TOKEN || !DISCORD_CHANNEL_ID) {
      console.error('Variáveis de ambiente DISCORD_TOKEN ou DISCORD_CHANNEL_ID não definidas');
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta. Contate o administrador.' },
        { status: 500 }
      );
    }

    // Buscar as mensagens do canal do Discord
    console.log(`Buscando mensagens do canal ${DISCORD_CHANNEL_ID}...`);
    
    // Tentar diferentes formatos de autenticação
    const authFormats = [
      `Bot ${DISCORD_TOKEN}`,      // Formato para bot tokens
      `Bearer ${DISCORD_TOKEN}`,   // Formato para OAuth2 tokens
      `${DISCORD_TOKEN}`           // Formato simples
    ];
    
    let response;
    let errorData;
    
    // Tentar cada formato de autenticação
    for (const authFormat of authFormats) {
      console.log(`Tentando formato de autenticação: ${authFormat.split(' ')[0] || 'Token simples'}`);
      
      try {
        response = await fetch(`${DISCORD_API_URL}/channels/${DISCORD_CHANNEL_ID}/messages?limit=10`, {
          headers: {
            Authorization: authFormat,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          console.log('Autenticação bem-sucedida!');
          break; // Sair do loop se a autenticação for bem-sucedida
        } else {
          errorData = await response.json();
          console.error(`Erro com formato "${authFormat.split(' ')[0] || 'Token simples'}":`, errorData);
        }
      } catch (error) {
        console.error(`Erro na requisição com formato "${authFormat.split(' ')[0] || 'Token simples'}":`, error);
      }
    }
    
    // Se nenhum formato funcionou
    if (!response || !response.ok) {
      // Em caso de erro de autorização, usar dados de mock
      if (!response || response.status === 401 || response.status === 403) {
        console.log('Usando dados de mock devido a erro de autorização na API do Discord');
        return NextResponse.json({
          ...mockBunkerData,
          lastUpdate: Date.now(),
          source: `Mock Data (Erro de autorização: ${response ? response.status + ' ' + response.statusText : 'Falha na conexão'})`
        });
      }
      
      return NextResponse.json(
        { error: `Erro ao buscar dados: ${response ? response.statusText : 'Falha na conexão'}` },
        { status: response ? response.status : 500 }
      );
    }

    const messages = await response.json();
    console.log(`Total de mensagens recebidas: ${messages.length}`);

    // Filtrar mensagens que contêm embeds com o título "BUNKER STATUS"
    const bunkerStatusMessages = messages.filter((message: { embeds?: Array<{ title?: string }> }) => {
      return message.embeds && message.embeds.some((embed: { title?: string }) => 
        embed.title && embed.title.includes('BUNKER STATUS')
      );
    });

    console.log(`Mensagens com BUNKER STATUS: ${bunkerStatusMessages.length}`);

    // Processar as mensagens para extrair informações dos bunkers
    const bunkers: Bunker[] = [];
    let processedCount = 0;

    bunkerStatusMessages.forEach((message: { id: string; embeds?: Array<{ title?: string; fields?: Array<{ value: string }> }> }, messageIndex: number) => {
      console.log(`Processando mensagem ${messageIndex + 1}/${bunkerStatusMessages.length} (ID: ${message.id})`);
      
      message.embeds?.forEach((embed: { title?: string; fields?: Array<{ value: string }> }, embedIndex: number) => {
        if (embed.title && embed.title.includes('BUNKER STATUS') && embed.fields) {
          console.log(`Embed ${embedIndex + 1} - Campos: ${embed.fields.length}`);
          
          // Processar os campos em grupos de 3 (nome, status, tempo)
          for (let i = 0; i < embed.fields.length; i += 3) {
            if (i + 2 < embed.fields.length) {
              const sectorField = embed.fields[i];
              const statusField = embed.fields[i + 1];
              const timeField = embed.fields[i + 2];
              
              if (sectorField && statusField && timeField) {
                const group = i / 3 + 1;
                console.log(`Grupo ${group}: Bunker Sector=${sectorField.value}, Status=${statusField.value}, Time=${timeField.value}`);
                
                const bunkerName = sectorField.value.trim();
                const isActive = statusField.value.trim() === 'Active';
                let timestamp = 0;
                
                // Extrair o timestamp dependendo do status
                if (isActive) {
                  timestamp = extractTimestamp(timeField.value);
                } else if (timeField.value.includes('Next Activation:')) {
                  timestamp = extractTimestamp(timeField.value);
                }
                
                if (timestamp > 0) {
                  const date = new Date(timestamp);
                  console.log(`Timestamp extraído: ${timestamp} (${date.toISOString()})`);
                }
                
                // Adicionar o bunker à lista
                bunkers.push({
                  name: bunkerName,
                  isActive,
                  timestamp
                });
                
                console.log(`Bunker adicionado: ${bunkerName}, ativo: ${isActive}, timestamp: ${timestamp}`);
                processedCount++;
              }
            }
          }
        }
      });
    });

    console.log(`Total de bunkers processados: ${processedCount}`);

    // Criar o objeto de resposta
    const bunkerStatus: BunkerStatus = {
      bunkers,
      lastUpdate: Date.now(),
      source: 'Discord API',
      messageCount: bunkerStatusMessages.length
    };

    return NextResponse.json(bunkerStatus);
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
