'use client';

import { useEffect, useState } from 'react';
import { BunkerStatus } from '../types/bunker';
import { fetchBunkerStatus } from '../services/discordApi';
import BunkerCard from './BunkerCard';

export default function BunkerContent() {
  const [bunkerStatus, setBunkerStatus] = useState<BunkerStatus>({ 
    bunkers: [],
    lastUpdate: Date.now(),
    source: 'initial'
  });
  const [loading, setLoading] = useState(false);
  const [nextUpdate, setNextUpdate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = async () => {
    try {
      setIsUpdating(true);
      const data = await fetchBunkerStatus();
      
      if (data.bunkers) {
        data.bunkers.sort((a, b) => a.timestamp - b.timestamp);
        setBunkerStatus(data);
        setError(null);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError('Erro ao carregar dados. Tentando novamente...');
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();

    const scheduleNextUpdate = () => {
      const now = new Date();
      const next = new Date();
      next.setHours(now.getHours() + (now.getMinutes() >= 10 ? 1 : 0));
      next.setMinutes(10);
      next.setSeconds(0);
      next.setMilliseconds(0);

      const timeUntilNext = next.getTime() - now.getTime();
      setNextUpdate(next.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

      return setTimeout(() => {
        fetchData();
        const nextTimer = scheduleNextUpdate();
        return () => clearTimeout(nextTimer);
      }, timeUntilNext);
    };
    
    // Agenda próxima atualização
    const timer = scheduleNextUpdate();
    
    // Cleanup
    return () => clearTimeout(timer);
  }, []);

  const activeBunkers = bunkerStatus.bunkers?.filter(b => b.isActive) || [];
  const inactiveBunkers = bunkerStatus.bunkers?.filter(b => !b.isActive) || [];
  const hasExtraBunkers = activeBunkers.length > 3;

  return (
    <>
      {/* Header com gradiente e efeito de vidro */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-gray-900/80 border-b border-gray-800">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                SCUM Bunkers
              </h1>
              <p className="text-gray-400 mt-1 text-sm md:text-base">Sistema de Monitoramento em Tempo Real</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => fetchData()}
                disabled={isUpdating}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2
                  ${isUpdating 
                    ? 'bg-blue-500/20 cursor-wait' 
                    : 'bg-blue-500/20 hover:bg-blue-500/30 hover:scale-105'
                  }`}
              >
                <svg
                  className={`w-4 h-4 ${isUpdating ? 'animate-spin' : 'animate-none'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="text-blue-400">
                  {isUpdating ? 'Atualizando...' : 'Atualizar Agora'}
                </span>
              </button>
              <div className="w-full sm:w-auto bg-gray-800 rounded-lg px-4 py-2 flex items-center space-x-2 text-sm md:text-base">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"/>
                <span className="text-gray-300 whitespace-nowrap">Próxima atualização:</span>
                <span className="text-green-400 font-mono">{nextUpdate}</span>
              </div>
              <div className="w-full sm:w-auto bg-gray-800 rounded-lg px-4 py-2 text-sm md:text-base text-center">
                <span className="text-gray-300">Total: </span>
                <span className="text-white font-bold">{bunkerStatus.bunkers?.length || 0}</span>
              </div>
            </div>
          </div>
          
          {/* Informação sobre bunkers */}
          <div className="mt-4 text-center md:text-left">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm md:text-base">
              <p className="text-yellow-300">
                <span className="font-bold">ℹ️ Importante:</span> Normalmente, apenas 3 bunkers estão ativos por vez.
                {hasExtraBunkers && (
                  <span className="text-red-400 ml-1">
                    Atualmente existem {activeBunkers.length} bunkers ativos - os extras foram abertos com cartão de Killbox!
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-gray-700 border-t-green-500 animate-spin"/>
              <div className="mt-4 text-gray-400 text-center">Carregando dados...</div>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button 
                onClick={() => fetchData()}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 md:space-y-12">
            {/* Seção de Bunkers Ativos */}
            {activeBunkers.length > 0 && (
              <section>
                <div className="flex items-center space-x-4 mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-green-400">Bunkers Ativos</h2>
                  <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50">
                    <span className="text-green-400 font-mono">{activeBunkers.length}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                  {activeBunkers.map((bunker, index) => (
                    <BunkerCard key={`${bunker.name}-${index}`} bunker={bunker} />
                  ))}
                </div>
              </section>
            )}

            {/* Seção de Bunkers Inativos */}
            {inactiveBunkers.length > 0 && (
              <section>
                <div className="flex items-center space-x-4 mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-red-400">Bunkers Bloqueados</h2>
                  <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50">
                    <span className="text-red-400 font-mono">{inactiveBunkers.length}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                  {inactiveBunkers.map((bunker, index) => (
                    <BunkerCard key={`${bunker.name}-${index}`} bunker={bunker} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}
