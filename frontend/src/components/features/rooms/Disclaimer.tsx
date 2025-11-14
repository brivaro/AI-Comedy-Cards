import React from 'react';
import { Warning, Robot, Crown, Flame } from 'phosphor-react';
import { Button } from '../../ui/Button';

interface DisclaimerProps {
  onAgree: () => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ onAgree }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-950/50 to-black flex items-center justify-center z-[100] p-4 animate-fade-in">
      {/* Efecto de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="glass-strong rounded-3xl p-8 md:p-12 max-w-2xl w-full border border-white/20 shadow-2xl relative">
        {/* Icono de advertencia animado */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center animate-float">
              <Warning className="w-12 h-12 text-white" weight="bold" />
            </div>
          </div>
        </div>

        <h2 className="text-4xl md:text-5xl font-black text-center mb-6 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
          ¡ADVERTENCIA!
        </h2>

        {/* Descripción del juego */}
        <div className="glass-card rounded-2xl p-6 mb-6 space-y-4">
          <div className="flex items-start gap-3">
            <Robot className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" weight="bold" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">¿Qué es AI Comedy Cards?</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Un juego de cartas hilarante donde la IA genera respuestas y temas únicos. 
                Elige la personalidad de tu IA favorita y compite con tus amigos para crear 
                las combinaciones más divertidas.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Crown className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" weight="bold" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">¿Cómo se juega?</h3>
              <ul className="text-gray-300 text-sm space-y-1 leading-relaxed">
                <li>• Crea o únete a una sala con amigos</li>
                <li>• Elige un tema y una personalidad para la IA</li>
                <li>• Juega tus mejores cartas para completar frases divertidas</li>
                <li>• El "Maestro del Tema" elige las respuestas ganadoras</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Advertencia de contenido */}
        <div className="glass-card rounded-2xl p-6 mb-6 border-2 border-red-500/30">
          <div className="flex items-start gap-3 mb-4">
            <Flame className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" weight="bold" />
            <div>
              <h3 className="text-xl font-bold text-red-400 mb-2">Contenido para adultos</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Este juego puede contener <span className="font-bold text-white">humor negro</span>, 
                lenguaje soez y temas para adultos. Todo el contenido es generado por IA 
                y no representa opiniones reales.
              </p>
            </div>
          </div>
          <p className="text-gray-400 text-xs italic">
            Si eres menor de edad o te ofendes fácilmente, te recomendamos no continuar.
          </p>
        </div>

        <Button
          onClick={onAgree}
          variant="danger"
          size="lg"
          className="w-full text-xl"
        >
          Soy mayor de edad y acepto
        </Button>
      </div>
    </div>
  );
};