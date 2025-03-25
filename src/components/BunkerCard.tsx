'use client';

import { useEffect, useState } from 'react';
import { Bunker } from '@/types/bunker';

interface BunkerCardProps {
  bunker: Bunker;
}

export default function BunkerCard({ bunker }: BunkerCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = bunker.timestamp - now;

      if (diff <= 0) {
        setTimeLeft(bunker.isActive ? 'Ativo agora' : 'Disponível');
        setProgress(100);
        return;
      }

      const totalTime = 24 * 60 * 60;
      const elapsed = totalTime - diff;
      const progressValue = Math.min(100, (elapsed / totalTime) * 100);
      setProgress(progressValue);

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [bunker.timestamp, bunker.isActive]);

  const statusColor = bunker.isActive
    ? 'from-green-500 to-green-700 border-green-400'
    : 'from-red-500 to-red-700 border-red-400';

  const cardStyle = bunker.isActive
    ? 'transform scale-105 shadow-2xl ring-2 ring-green-400 ring-opacity-50'
    : 'hover:scale-102 transition-transform duration-300';

  return (
    <div className={`rounded-2xl p-1 ${cardStyle} bg-gradient-to-br ${statusColor}`}>
      <div className="relative overflow-hidden rounded-xl bg-gray-900 p-4 sm:p-6">
        {/* Faixa de status */}
        {bunker.isActive && (
          <div className="absolute -right-16 -top-3 rotate-45 bg-gradient-to-r from-green-500 to-green-600 px-16 py-1.5 text-xs sm:text-sm font-bold text-white shadow-lg">
            ATIVO
          </div>
        )}
        
        {/* Cabeçalho do card */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{bunker.name}</h2>
            <p className={`text-xs sm:text-sm font-medium ${bunker.isActive ? 'text-green-400' : 'text-red-400'}`}>
              {bunker.isActive ? 'Bunker Ativo' : 'Bunker Bloqueado'}
            </p>
          </div>
          <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full border-4 ${
            bunker.isActive ? 'border-green-500 bg-green-500/20' : 'border-red-500 bg-red-500/20'
          } flex items-center justify-center`}>
            <span className="text-xl sm:text-2xl">{bunker.isActive ? '⚡' : '🔒'}</span>
          </div>
        </div>
        
        {/* Barra de progresso */}
        <div className="mb-4">
          <div className="h-1.5 sm:h-2 w-full rounded-full bg-gray-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                bunker.isActive ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Timer */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <span className="text-gray-400 font-medium text-sm sm:text-base">
              {bunker.isActive ? 'Tempo Restante:' : 'Próxima Ativação:'}
            </span>
            <div className={`px-3 sm:px-4 py-1 rounded-lg ${
              bunker.isActive 
                ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                : 'bg-red-500/20 text-red-400 border border-red-500/50'
            }`}>
              <span className="font-mono text-lg sm:text-xl font-bold">
                {timeLeft}
              </span>
            </div>
          </div>
          
          {/* Status adicional */}
          <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-500">
              Status: {bunker.isActive ? 'Em operação' : 'Em espera'}
            </span>
            <span className={`inline-flex items-center ${
              bunker.isActive ? 'text-green-400' : 'text-red-400'
            }`}>
              {bunker.isActive ? (
                <>
                  <span className="mr-1.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-green-500 animate-pulse"/>
                  Online
                </>
              ) : (
                <>
                  <span className="mr-1.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-red-500"/>
                  Offline
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
