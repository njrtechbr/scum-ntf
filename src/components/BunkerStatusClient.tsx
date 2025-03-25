'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { BunkerStatus } from '@/types/bunker';
import { FaSync, FaClock, FaLock, FaUnlock, FaDiscord, FaInfoCircle } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  initialData: BunkerStatus;
}

// Constante para controlar o tempo mínimo entre requisições
const MIN_REQUEST_INTERVAL = 5000; // 5 segundos entre requisições

export default function BunkerStatusClient({ initialData }: Props) {
  const [data, setData] = useState<BunkerStatus>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [nextRefresh, setNextRefresh] = useState<number | null>(null);
  const [nextRequestTime, setNextRequestTime] = useState<number>(0);
  const [countdown, setCountdown] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showApiInfo, setShowApiInfo] = useState(false);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);
  
  // Função para formatar o tempo restante - executada apenas no cliente
  const formatTimeLeft = (diff: number): string => {
    if (diff === 0) return 'Agora';
    
    // Se for menos de um minuto
    if (diff < 60000) {
      return 'Menos de 1 min';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  };

  // Verifica se já passou tempo suficiente desde a última requisição
  const canMakeRequest = useCallback((): boolean => {
    return Date.now() >= nextRequestTime;
  }, [nextRequestTime]);

  // Função para buscar dados da API
  const fetchData = useCallback(async (): Promise<void> => {
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      if (!canMakeRequest()) {
        const waitTime = Math.ceil((nextRequestTime - Date.now()) / 1000);
        setError(`Aguarde ${waitTime} segundos antes de fazer uma nova requisição.`);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/bunkers');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao buscar dados dos bunkers');
      }

      console.log('Dados recebidos:', result);

      // Verifica se temos dados válidos
      if (result && Array.isArray(result.bunkers)) {
        setData(result);
        setNextRequestTime(Date.now() + MIN_REQUEST_INTERVAL);
        
        // Inicializa o countdown para cada bunker
        const now = Date.now();
        const newCountdown: { [key: string]: string } = {};
        
        result.bunkers.forEach((bunker: { name: string; isActive: boolean; timestamp: number }) => {
          if (bunker.timestamp > 0) {
            const diff = Math.max(0, bunker.timestamp - now);
            newCountdown[bunker.name] = formatTimeLeft(diff);
          } else {
            newCountdown[bunker.name] = 'Indisponível';
          }
        });
        
        setCountdown(newCountdown);
      } else {
        console.error('Formato de resposta inválido:', result);
        setError('Formato de resposta inválido da API');
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError((err as Error).message || 'Erro ao buscar dados dos bunkers');
    } finally {
      setIsLoading(false);
    }
  }, [canMakeRequest, isLoading, nextRequestTime]);

  // Efeito para gerenciar o auto-refresh
  useEffect(() => {
    if (!autoRefresh) {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      setNextRefresh(null);
      return;
    }

    const scheduleNextRefresh = (delay: number) => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      
      const refreshTime = Date.now() + delay;
      setNextRefresh(refreshTime);
      
      refreshTimerRef.current = setTimeout(() => {
        refreshTimerRef.current = null;
        fetchData();
      }, delay);
    };

    scheduleNextRefresh(30000); // 30 segundos para o próximo refresh

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [autoRefresh, fetchData]);

  // Efeito para iniciar o carregamento de dados na montagem do componente
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchData();
    }
    // Limpa os timers quando o componente é desmontado
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [fetchData]);

  // Efeito para atualizar o countdown a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      // Atualiza o countdown para cada bunker
      const now = Date.now();
      const newCountdown: { [key: string]: string } = {};
      
      data.bunkers.forEach(bunker => {
        if (bunker.timestamp > 0) {
          const diff = Math.max(0, bunker.timestamp - now);
          newCountdown[bunker.name] = formatTimeLeft(diff);
        } else {
          newCountdown[bunker.name] = 'Indisponível';
        }
      });
      
      setCountdown(newCountdown);
      
      // Atualiza o countdown para o próximo refresh
      if (nextRefresh && autoRefresh) {
        const seconds = Math.max(0, Math.floor((nextRefresh - Date.now()) / 1000));
        if (seconds <= 0 && autoRefresh) {
          fetchData();
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [data.bunkers, nextRefresh, autoRefresh, fetchData]);

  // Ordena os bunkers: ativos primeiro, depois por tempo (mais próximo primeiro)
  const sortedBunkers = [...data.bunkers].sort((a, b) => {
    // Primeiro critério: bunkers ativos primeiro
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    
    // Segundo critério: ordenar por tempo (timestamp menor = mais próximo de abrir/fechar)
    return a.timestamp - b.timestamp;
  });

  // Função para renderizar o tempo de forma segura (apenas no cliente)
  const renderTime = (): string => {
    if (typeof window === 'undefined') {
      return 'Carregando...';
    }
    return new Date(data.lastUpdate).toLocaleTimeString();
  };

  const getRefreshCountdown = (): string => {
    if (!nextRefresh) return '';
    const seconds = Math.max(0, Math.floor((nextRefresh - Date.now()) / 1000));
    return seconds > 0 ? `(${seconds}s)` : '';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Controles */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <button 
            onClick={() => setShowApiInfo(!showApiInfo)}
            className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2"
            title="Informações sobre a API"
          >
            <FaInfoCircle size={18} />
            <span className="text-sm">Informações da API</span>
          </button>
          
          <div className="flex items-center gap-3">
            <Button
              variant={autoRefresh ? "success" : "outline"}
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <FaSync className={autoRefresh ? "animate-spin" : ""} size={14} />
              {autoRefresh ? `Auto Refresh ${getRefreshCountdown()}` : 'Auto Refresh Off'}
            </Button>
            
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2"
              onClick={fetchData}
              disabled={isLoading || !canMakeRequest()}
            >
              {isLoading ? (
                <>
                  <FaSync className="animate-spin" size={14} />
                  Atualizando...
                </>
              ) : (
                <>
                  <FaSync size={14} />
                  Atualizar Agora
                </>
              )}
            </Button>
          </div>
        </div>

        {/* API Info Panel */}
        {showApiInfo && (
          <Card className="mb-6 bg-gray-800/80 backdrop-blur-sm border-gray-700/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-full">
                  <FaDiscord className="text-indigo-400" size={22} />
                </div>
                <CardTitle className="text-xl text-indigo-300">Dados da API do Discord</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-3">
                Os dados dos bunkers são obtidos diretamente da API oficial do Discord, processados e exibidos em tempo real.
                As informações são atualizadas periodicamente para garantir precisão.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <FaClock className="text-blue-400" />
                  <span>Última atualização: {renderTime()}</span>
                </div>
                {data.messageCount && (
                  <div className="flex items-center gap-2">
                    <FaInfoCircle className="text-blue-400" />
                    <span>Mensagens processadas: {data.messageCount}</span>
                  </div>
                )}
                {data.source && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <FaDiscord className="text-indigo-400" />
                      <span>Fonte: {data.source}</span>
                    </div>
                    {data.source.includes('Mock Data') && data.source.includes('Unauthorized') && (
                      <div className="mt-2 p-3 bg-amber-900/30 border border-amber-700/50 rounded-md text-sm">
                        <div className="flex items-start gap-2">
                          <FaInfoCircle className="text-amber-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-amber-400">Configuração necessária</p>
                            <p className="mt-1 text-amber-200/80">
                              Para usar dados reais do Discord, configure as variáveis de ambiente <code>DISCORD_TOKEN</code> e <code>DISCORD_CHANNEL_ID</code> no arquivo <code>.env.local</code>.
                            </p>
                            <p className="mt-1 text-amber-200/80">
                              Consulte o arquivo <code>SETUP_INSTRUCTIONS.md</code> para instruções detalhadas.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800/50 text-red-200 rounded-lg flex items-center gap-3 shadow-lg">
            <div className="p-2 bg-red-500/20 rounded-full">
              <FaInfoCircle size={18} />
            </div>
            <div>
              <p className="font-medium">Erro ao carregar dados</p>
              <p className="text-sm text-red-300/80">{error}</p>
            </div>
          </div>
        )}

        {/* Bunkers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sortedBunkers.length === 0 ? (
            <div className="col-span-full p-8 text-center text-gray-400 bg-gray-800/50 rounded-lg border border-gray-700/50 shadow-lg">
              <FaInfoCircle size={32} className="mx-auto mb-3 text-gray-500" />
              <p className="text-lg mb-2">Nenhum bunker encontrado</p>
              <p className="text-sm text-gray-500">Clique em &ldquo;Atualizar Agora&rdquo; para buscar os dados.</p>
            </div>
          ) : (
            sortedBunkers.map((bunker) => (
              <Card 
                key={bunker.name}
                className={cn(
                  "border shadow-lg",
                  bunker.isActive
                    ? "bg-gradient-to-br from-green-900/40 to-green-800/10 border-green-700/30 shadow-green-900/20"
                    : "bg-gradient-to-br from-red-900/30 to-gray-800/10 border-red-800/30 shadow-red-900/20"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {bunker.isActive ? (
                        <div className="p-1.5 bg-green-500/20 rounded-full">
                          <FaUnlock className="text-green-400" size={12} />
                        </div>
                      ) : (
                        <div className="p-1.5 bg-red-500/20 rounded-full">
                          <FaLock className="text-red-400" size={12} />
                        </div>
                      )}
                      <CardTitle className="text-lg">{bunker.name}</CardTitle>
                    </div>
                    <Badge variant={bunker.isActive ? "success" : "danger"}>
                      {bunker.isActive ? 'Ativo' : 'Bloqueado'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-full", 
                      bunker.isActive ? "bg-green-500/20" : "bg-amber-500/20"
                    )}>
                      <FaClock className={bunker.isActive ? "text-green-400" : "text-amber-400"} size={14} />
                    </div>
                    <div>
                      {bunker.isActive ? (
                        <div>
                          <span className="text-gray-400 text-sm">Tempo restante:</span>
                          <div className="font-mono text-lg font-semibold text-green-400">
                            {countdown[bunker.name] || formatTimeLeft(Math.max(0, bunker.timestamp - Date.now()))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-gray-400 text-sm">Próxima ativação:</span>
                          <div className="font-mono text-lg font-semibold text-amber-400">
                            {countdown[bunker.name] || formatTimeLeft(Math.max(0, bunker.timestamp - Date.now()))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-800 text-sm text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FaDiscord className="text-indigo-400" />
            <span>Dados obtidos via API do Discord</span>
          </div>
          <div className="flex items-center gap-2">
            <FaClock className="text-blue-400" />
            <span>Última atualização: {renderTime()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
