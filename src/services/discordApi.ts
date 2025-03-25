import { Bunker, BunkerStatus } from '../types/bunker';

// Variável para controlar o tempo da última requisição
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 5000; // 5 segundos entre requisições
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Verifica se já passou tempo suficiente desde a última requisição
function canMakeRequest(): boolean {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  return timeSinceLastRequest >= MIN_REQUEST_INTERVAL;
}

export async function fetchBunkerStatus(): Promise<BunkerStatus> {
  try {
    // Verifica se já passou tempo suficiente desde a última requisição
    if (!canMakeRequest()) {
      const waitTime = Math.ceil((lastRequestTime + MIN_REQUEST_INTERVAL - Date.now()) / 1000);
      return {
        bunkers: [],
        lastUpdate: Date.now(),
        source: 'Cache (Rate Limited)',
        messageCount: 0
      };
    }

    // Atualiza o tempo da última requisição
    lastRequestTime = Date.now();

    const response = await fetch(`${BASE_URL}/api/bunkers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro na requisição:', errorData);
      
      // Tratamento específico para erro de rate limit
      if (response.status === 429) {
        return {
          bunkers: [],
          lastUpdate: Date.now(),
          source: 'Error: Rate Limited',
          messageCount: 0
        };
      }
      
      throw new Error(errorData.error || 'Erro desconhecido');
    }

    const data = await response.json();
    return data as BunkerStatus;
  } catch (error) {
    console.error('Erro ao buscar status dos bunkers:', error);
    return {
      bunkers: [],
      lastUpdate: Date.now(),
      source: `Error: ${(error as Error).message}`,
      messageCount: 0
    };
  }
}
