import React, { useEffect, useState } from 'react';

export default function AIRobotLoader() {
  const [position, setPosition] = useState(0);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState(1);
  const [headTilt, setHeadTilt] = useState(0);
  const [armRotation, setArmRotation] = useState(0);
  const [legPhase, setLegPhase] = useState(0);
  const headRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Función de throttling para limitar la frecuencia de ejecución de un evento
    const throttle = <T extends (...args: any[]) => void>(func: T, limit: number) => {
      let inThrottle: boolean;
      return function(this: any, ...args: Parameters<T>) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    };

    // Mueve el cálculo de la posición de los ojos directamente al manejador del mouse
    const handleMouseMove = (e: MouseEvent) => {
      if (headRef.current) {
        const headRect = headRef.current.getBoundingClientRect();
        const headCenterX = headRect.left + headRect.width / 2;
        const headCenterY = headRect.top + headRect.height / 2;

        const deltaX = e.clientX - headCenterX;
        const deltaY = e.clientY - headCenterY;
        
        const angle = Math.atan2(deltaY, deltaX);
        // Aumentamos el divisor para que el movimiento del ojo sea más sutil y menos "nervioso"
        const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 70, 4);

        setEyePosition({
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance
        });
      }
    };

    // Aplica throttling al manejador del mouse para mejorar el rendimiento
    const throttledMouseMove = throttle(handleMouseMove, 30); // Actualiza cada 30ms

    window.addEventListener('mousemove', throttledMouseMove);

    // Movimiento del robot de lado a lado
    const moveInterval = setInterval(() => {
      setPosition(prev => {
        const newPos = prev + (direction * 2);
        if (newPos >= 40 || newPos <= -40) {
          setDirection(d => -d);
        }
        return newPos;
      });
    }, 50);

    // Inclinación de cabeza
    const headInterval = setInterval(() => {
      setHeadTilt(Math.random() * 10 - 5);
    }, 1300);

    // Movimiento de brazos
    const armInterval = setInterval(() => {
      setArmRotation(prev => {
        const newRotation = prev + 8;
        return newRotation > 360 ? 0 : newRotation;
      });
    }, 60);

    // Movimiento de piernas (caminar)
    const legInterval = setInterval(() => {
      setLegPhase(prev => (prev + 2) % 360);
    }, 30);

    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
      clearInterval(moveInterval);
      clearInterval(headInterval);
      clearInterval(armInterval);
      clearInterval(legInterval);
    };
  }, [direction]);

  const leftLegRotation = Math.sin(legPhase * Math.PI / 180) * 15;
  const rightLegRotation = Math.sin((legPhase + 180) * Math.PI / 180) * 15;
  const leftArmSwing = Math.sin(armRotation * Math.PI / 180) * 20;
  const rightArmSwing = Math.sin((armRotation + 180) * Math.PI / 180) * 20;

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className="relative transition-transform duration-100 ease-linear"
        style={{ transform: `translateX(${position}px)` }}
      >
        {/* Antena CENTRADA */}
        <div className="flex justify-center mb-2">
          <div className="w-1 h-8 bg-gradient-to-t from-purple-400 to-transparent rounded-full">
            <div className="w-3 h-3 bg-purple-400 rounded-full -ml-1 animate-pulse shadow-lg shadow-purple-500/50" />
          </div>
        </div>

        {/* Cabeza del robot con inclinación */}
        <div 
          ref={headRef}
          className="relative bg-gradient-to-br from-gray-700 to-gray-800 w-32 h-28 rounded-3xl shadow-2xl border-4 border-gray-600 mb-2 transition-transform duration-500"
          style={{ transform: `rotate(${headTilt}deg)` }}
        >
          {/* Detalle superior */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-purple-500 rounded-full opacity-60" />
          
          {/* Ojos */}
          <div className="flex justify-center items-center gap-6 mt-8">
            {/* Ojo izquierdo */}
            <div className="relative w-10 h-10 bg-white rounded-xl shadow-inner overflow-hidden">
              <div 
                className="absolute w-5 h-5 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg transition-all duration-300 shadow-lg"
                style={{ 
                  left: `${12 + eyePosition.x}px`,
                  top: `${10 + eyePosition.y}px`
                }}
              >
                <div className="absolute w-2 h-2 bg-white rounded-full top-1 left-1 opacity-80" />
              </div>
            </div>
            
            {/* Ojo derecho */}
            <div className="relative w-10 h-10 bg-white rounded-xl shadow-inner overflow-hidden">
              <div 
                className="absolute w-5 h-5 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg transition-all duration-300 shadow-lg"
                style={{ 
                  left: `${12 + eyePosition.x}px`,
                  top: `${10 + eyePosition.y}px`
                }}
              >
                <div className="absolute w-2 h-2 bg-white rounded-full top-1 left-1 opacity-80" />
              </div>
            </div>
          </div>

          {/* Boca/panel */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 h-1 bg-purple-500 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Cuello */}
        <div className="flex justify-center">
          <div className="w-8 h-3 bg-gray-700 rounded-lg border-2 border-gray-600" />
        </div>

        {/* Cuerpo */}
        <div className="relative bg-gradient-to-br from-gray-700 to-gray-800 w-36 h-32 rounded-2xl shadow-2xl border-4 border-gray-600 mt-1">
          {/* Panel central con luces */}
          <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-lg shadow-purple-500/50"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
            
            {/* Líneas decorativas */}
            <div className="space-y-1 w-full">
              <div className="h-1.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full animate-pulse" />
              <div className="h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="h-1.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Más indicadores */}
            <div className="flex gap-1">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i}
                  className="w-1 h-4 bg-gray-600 rounded-full"
                >
                  <div 
                    className="w-1 bg-gradient-to-t from-purple-500 to-transparent rounded-full animate-pulse"
                    style={{ 
                      height: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.2}s` 
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Brazos con movimiento */}
          <div 
            className="absolute top-8 -left-5 w-5 h-24 bg-gradient-to-b from-gray-700 to-gray-800 rounded-full border-2 border-gray-600 shadow-xl origin-top transition-transform duration-100"
            style={{ 
              transform: `rotate(${12 + leftArmSwing}deg)`,
              transformOrigin: 'top center'
            }}
          >
            {/* Mano izquierda */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-500" />
          </div>
          
          <div 
            className="absolute top-8 -right-5 w-5 h-24 bg-gradient-to-b from-gray-700 to-gray-800 rounded-full border-2 border-gray-600 shadow-xl origin-top transition-transform duration-100"
            style={{ 
              transform: `rotate(${-12 + rightArmSwing}deg)`,
              transformOrigin: 'top center'
            }}
          >
            {/* Mano derecha */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-500" />
          </div>
        </div>

        {/* Piernas con movimiento de caminar */}
        <div className="flex justify-center gap-6 mt-1">
          {/* Pierna izquierda */}
          <div 
            className="w-5 h-20 bg-gradient-to-b from-gray-700 to-gray-800 rounded-full border-2 border-gray-600 shadow-xl origin-top transition-transform duration-100"
            style={{ 
              transform: `rotate(${leftLegRotation}deg)`,
              transformOrigin: 'top center'
            }}
          >
            {/* Pie izquierdo */}
            <div className="absolute -bottom-1 -left-2 w-8 h-3 bg-gray-600 rounded-full border-2 border-gray-500" />
          </div>
          
          {/* Pierna derecha */}
          <div 
            className="w-5 h-20 bg-gradient-to-b from-gray-700 to-gray-800 rounded-full border-2 border-gray-600 shadow-xl origin-top transition-transform duration-100"
            style={{ 
              transform: `rotate(${rightLegRotation}deg)`,
              transformOrigin: 'top center'
            }}
          >
            {/* Pie derecho */}
            <div className="absolute -bottom-1 -left-2 w-8 h-3 bg-gray-600 rounded-full border-2 border-gray-500" />
          </div>
        </div>
      </div>

      {/* Texto de carga */}
      <div className="mt-12 text-center">
        <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse">
          Pensando...
        </p>
        <div className="flex justify-center gap-1 mt-4">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}