import React from 'react';
import { Card } from '../common/Card';

interface DisclaimerProps {
  onAgree: () => void;
}

const Disclaimer: React.FC<DisclaimerProps> = ({ onAgree }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in p-4">
      <Card color="black" className="p-8 max-w-2xl w-full">
        <h2 className="text-3xl font-bold mb-4 text-red-500 text-center">🔞 ¡ADVERTENCIA! 😈</h2>
        <p className="text-lg mb-6 text-brand-secondary">
          Este juego contiene humor negro ⬛, lenguaje soez 🤬, temas para adultos 🍆💦 y contenido que puede ser considerado ofensivo. Todo el contenido es generado por una inteligencia artificial 🤖 y no representa las opiniones de nadie.
        </p>
        <p className="mb-8 font-semibold">
          Si eres fácilmente ofendible, menor de edad, o simplemente una persona decente, probablemente deberías cerrar esta página ahora.
        </p>
        <button
          onClick={onAgree}
          className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 text-xl"
        >
          Soy un adulto irresponsable y acepto
        </button>
      </Card>
    </div>
  );
};

export default Disclaimer;