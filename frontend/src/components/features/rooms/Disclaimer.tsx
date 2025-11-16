import React from 'react';
import { Warning, Robot, Crown, Flame, Play } from 'phosphor-react';
import { Button } from '../../ui/Button';

interface DisclaimerProps {
  onAgree: () => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ onAgree }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-blue-950/50 to-black flex items-center justify-center z-[100] p-4 animate-fade-in overflow-auto">
      {/* Efecto de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="glass-strong rounded-3xl p-6 md:p-8 max-w-6xl w-full border-2 border-cyan-500/20 shadow-2xl relative my-auto">
        {/* Header con icono y título */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-6">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center animate-float">
              <Warning className="w-10 h-10 md:w-12 md:h-12 text-white" weight="bold" />
            </div>
          </div>
          <div className="text-center md:text-left flex-grow">
            <h2 className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              ¡ADVERTENCIA!
            </h2>
            <p className="text-gray-400 text-sm">Lee esto antes de continuar</p>
          </div>
        </div>

        {/* Contenido en grid para aprovechar espacio horizontal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* ¿Qué es? */}
          <div className="glass-card rounded-xl p-4 border border-cyan-500/20">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Robot className="w-6 h-6 text-cyan-400" weight="bold" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¿Qué es esto?</h3>
                <p className="text-gray-300 text-sm mt-1 leading-relaxed">
                  Juego de cartas donde la IA genera respuestas hilarantes. Elige la personalidad de tu IA y compite creando las combinaciones más divertidas.
                </p>
              </div>
            </div>
          </div>

          {/* Cómo se juega */}
          <div className="glass-card rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 text-yellow-400" weight="bold" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¿Cómo jugar?</h3>
                <ul className="text-gray-300 text-sm space-y-1 mt-1 leading-relaxed">
                  <li>• Crea/únete a una sala</li>
                  <li>• Elige tema y personalidad IA</li>
                  <li>• Juega cartas para completar frases</li>
                  <li>• El "Maestro" elige ganadores</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Advertencia de contenido - Más compacta */}
        <div className="glass-card rounded-xl p-4 mb-6 border-2 border-red-500/30 bg-red-500/5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Flame className="w-6 h-6 text-red-400 flex-shrink-0" weight="bold" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-400 mb-1">Contenido para adultos +18</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Este juego puede contener <span className="font-bold text-white">humor negro</span>, lenguaje soez y temas para adultos. Todo el contenido es generado por IA y no representa las opiniones de nadie.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={onAgree}
          variant="danger"
          size="lg"
          className="w-full text-lg"
          icon={<Play weight="bold" />}
        >
          Soy un adulto irresponsable y acepto
        </Button>
      </div>
    </div>
  );
};