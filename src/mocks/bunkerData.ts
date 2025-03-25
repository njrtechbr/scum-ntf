import { BunkerStatus } from '@/types/bunker';

// Dados de mock para simular a resposta da API do Discord
export const mockBunkerData: BunkerStatus = {
  bunkers: [
    {
      name: 'A1 Bunker',
      isActive: false,
      timestamp: Date.now() + 1000 * 60 * 60 * 24 * 2 // 2 dias no futuro
    },
    {
      name: 'A3 Bunker',
      isActive: false,
      timestamp: Date.now() + 1000 * 60 * 60 * 12 // 12 horas no futuro
    },
    {
      name: 'A4 Bunker',
      isActive: true,
      timestamp: Date.now() + 1000 * 60 * 30 // 30 minutos no futuro
    },
    {
      name: 'B0 Bunker',
      isActive: true,
      timestamp: Date.now() + 1000 * 60 * 15 // 15 minutos no futuro
    },
    {
      name: 'B1 Bunker',
      isActive: true,
      timestamp: Date.now() + 1000 * 60 * 5 // 5 minutos no futuro
    },
    {
      name: 'B2 Bunker',
      isActive: false,
      timestamp: Date.now() + 1000 * 60 * 60 * 18 // 18 horas no futuro
    },
    {
      name: 'B3 Bunker',
      isActive: true,
      timestamp: Date.now() + 1000 * 60 * 45 // 45 minutos no futuro
    },
    {
      name: 'C0 Bunker',
      isActive: false,
      timestamp: Date.now() + 1000 * 60 * 60 * 10 // 10 horas no futuro
    },
    {
      name: 'C1 Bunker',
      isActive: false,
      timestamp: Date.now() + 1000 * 60 * 60 * 3 // 3 horas no futuro
    },
    {
      name: 'C3 Bunker',
      isActive: false,
      timestamp: Date.now() + 1000 * 60 * 60 * 6 // 6 horas no futuro
    },
    {
      name: 'C4 Bunker',
      isActive: false,
      timestamp: Date.now() + 1000 * 60 * 60 * 9 // 9 horas no futuro
    },
    {
      name: 'D1 Bunker',
      isActive: false,
      timestamp: Date.now() + 1000 * 60 * 60 * 6 // 6 horas no futuro
    },
    {
      name: 'D2 Bunker',
      isActive: false,
      timestamp: Date.now() + 1000 * 60 * 60 * 8 // 8 horas no futuro
    },
    {
      name: 'D4 Bunker',
      isActive: false,
      timestamp: Date.now() + 1000 * 60 * 60 * 18 // 18 horas no futuro
    },
    {
      name: 'Z1 Bunker',
      isActive: false,
      timestamp: Date.now() + 1000 * 60 * 60 * 2 // 2 horas no futuro
    },
    {
      name: 'Z2 Bunker',
      isActive: false,
      timestamp: Date.now() + 1000 * 60 * 60 * 2 // 2 horas no futuro
    },
    {
      name: 'Z3 Bunker',
      isActive: false,
      timestamp: Date.now() + 1000 * 60 * 60 * 24 * 1.5 // 1.5 dias no futuro
    }
  ],
  lastUpdate: Date.now(),
  source: 'Mock Data (Discord API Simulada)',
  messageCount: 3
};
