import Footer from '../components/Footer';
import BunkerStatusClient from '../components/BunkerStatusClient';
import { BunkerStatus } from '../types/bunker';

// Força a página a ser dinâmica e não usar cache
export const dynamic = 'force-dynamic';

export default function Home() {
  // Dados iniciais vazios para evitar chamadas duplicadas
  const initialData: BunkerStatus = {
    bunkers: [],
    lastUpdate: Date.now()
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex flex-col">
      <div className="sticky top-0 z-10 backdrop-blur-md bg-gray-900/80 border-b border-gray-800">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                SCUM Bunkers
              </h1>
              <p className="text-gray-400 mt-1 text-sm md:text-base">Sistema de Monitoramento em Tempo Real</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <BunkerStatusClient initialData={initialData} />
      </div>

      <Footer />
    </main>
  );
}
