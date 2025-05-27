import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Obrigado() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <CheckCircle className="h-20 w-20 text-green-600 mb-6" />
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Inscrição Confirmada!</h1>
      <p className="text-lg text-gray-700 mb-6 text-center max-w-md">
        Obrigado por se inscrever na nossa newsletter! A partir de agora você receberá mensalmente as novidades mais importantes sobre fotônica no Brasil.
      </p>
      <Link 
        to="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg hover:bg-blue-700 transition"
      >
        Voltar para a Página Inicial
      </Link>
    </div>
  );
}
