export default function Footer() {
  return (
    <footer className="w-full bg-gray-900/80 border-t border-gray-800 backdrop-blur-md py-4 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-gray-400 text-sm">
            Desenvolvido com ❤️ por{' '}
            <span className="font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Nereu Jr (pombo)
            </span>
          </p>
          <p className="text-gray-500 text-xs mt-1">
            © {new Date().getFullYear()} - Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}
