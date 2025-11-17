import React, { useEffect, useState } from 'react';

interface Shape {
  id: number;
  type: 'square' | 'circle' | 'triangle';
  color: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  opacity: number;
}

export default function CookingRobotLoader() {
  const [armRotation, setArmRotation] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [eyeBlink, setEyeBlink] = useState(false);
  const [shapes, setShapes] = useState<Shape[]>([]);

  const messages = [
    "Preparando los ingredientes...",
    "Cocinando personalidades...",
    "Mezclando el humor negro...",
    "Añadiendo sarcasmo al gusto...",
    "Salteando las cartas...",
    "Ajustando el punto de sal...",
    "Decorando el caos...",
    "Sirviendo la diversión...",
    "¡Bon appétit!"
  ];

  // Movimiento del brazo de la sartén - más realista
  useEffect(() => {
    const armInterval = setInterval(() => {
      setArmRotation(prev => {
        const newRotation = prev + 3;
        if (newRotation >= 360) return 0;
        return newRotation;
      });
    }, 30);
    return () => clearInterval(armInterval);
  }, []);

  // Generar formas geométricas salteando
  useEffect(() => {
    const shapeInterval = setInterval(() => {
      if (Math.random() > 0.3) {
        const shapes_types = ['square', 'circle', 'triangle'];
        const colors = ['#a855f7', '#ec4899', '#06b6d4', '#f59e0b', '#10b981'];
        
        const newShape: Shape = {
          id: Date.now() + Math.random(),
          type: shapes_types[Math.floor(Math.random() * shapes_types.length)] as Shape['type'],
          color: colors[Math.floor(Math.random() * colors.length)],
          x: 0,
          y: (Math.random() - 0.5) * 80, // Dispersión inicial
          velocityX: -12 - Math.random() * 5, // Principalmente hacia la IZQUIERDA
          velocityY: -8 - Math.random() * 6, // Salen hacia ARRIBA con variación
          rotation: Math.random() * 270,
          rotationSpeed: (Math.random() - 0.5) * 15,
          size: 14 + Math.random() * 15,
          opacity: 1
        };
        
        setShapes(prev => [...prev.slice(-15), newShape]);
      }
    }, 50);
    return () => clearInterval(shapeInterval);
  }, []);

  // Animar formas (movimiento horizontal hacia la izquierda + gravedad)
  useEffect(() => {
    const animateInterval = setInterval(() => {
      setShapes(prev =>
        prev.map((shape: Shape) => {
          const newY = shape.y + shape.velocityY;
          const newVelocityY = shape.velocityY + 1.5; // Gravedad hacia abajo
          
          // Calcular opacidad: se desvanece cuando cae mucho
          const opacity = newY > 50 ? Math.max(0, 1 - (newY - 80) / 50) : 1;
          
          return {
            ...shape,
            x: shape.x + shape.velocityX,
            y: newY,
            velocityX: shape.velocityX + 0.2, // Desaceleración suave horizontal
            velocityY: newVelocityY,
            rotation: shape.rotation + shape.rotationSpeed,
            opacity
          };
        }).filter(shape => shape.x > -400 && shape.y < 150) // Elimina cuando sale muy lejos o cae demasiado
      );
    }, 30);
    return () => clearInterval(animateInterval);
  }, []);

  // Parpadeo de ojos
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyeBlink(true);
      setTimeout(() => setEyeBlink(false), 150);
    }, 2500);
    return () => clearInterval(blinkInterval);
  }, []);

  // Cambiar mensajes
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(messageInterval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen overflow-hidden relative">
      
      {/* Robot cocinero */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Cabeza del robot */}
        <div className="relative bg-gradient-to-br from-gray-700 to-gray-800 w-28 h-28 rounded-3xl border-4 border-gray-600 shadow-2xl mb-2">
          {/* Antena */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-1 h-6 bg-gray-600">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
          </div>
          
          {/* Ojos */}
          <div className="absolute top-10 left-5 flex gap-7">
            {eyeBlink ? (
              <>
                <div className="w-6 h-1 bg-cyan-400 rounded-full" />
                <div className="w-6 h-1 bg-cyan-400 rounded-full" />
              </>
            ) : (
              <>
                <div className="w-6 h-6 bg-cyan-400 rounded-sm shadow-lg shadow-cyan-400/50" />
                <div className="w-6 h-6 bg-cyan-400 rounded-sm shadow-lg shadow-cyan-400/50" />
              </>
            )}
          </div>
          
          {/* Boca concentrada */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-1 bg-cyan-400 rounded-full" />
        </div>

        {/* Cuerpo con brazos (posicionamiento relativo) */}
        <div className="relative w-32 h-24">
          {/* Cuerpo (solo mitad superior) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-gradient-to-br from-gray-700 to-gray-800 w-32 h-24 rounded-t-2xl border-4 border-gray-600 border-b-0 shadow-2xl">
            {/* Panel decorativo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 space-y-1">
              <div className="w-12 h-1.5 bg-cyan-500/30 rounded-full animate-pulse" />
              <div className="w-12 h-1.5 bg-purple-500/30 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
              <div className="w-12 h-1.5 bg-cyan-500/30 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>

          {/* Brazo izquierdo - sartén (horizontal hacia la DERECHA) */}
          <div 
            className="absolute left-2 top-4 w-5 h-20 bg-gradient-to-b from-gray-700 to-gray-800 rounded-full border-2 border-gray-600 origin-top transition-transform duration-75 ease-out"
            style={{ 
              transform: `rotate(${70 + Math.sin(armRotation * Math.PI / 180) * 20}deg)`,
              transformOrigin: 'top center'
            }}
          >
            {/* Mano con sartén */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-600 rounded-full border-2 border-gray-500">
              {/* Mango de la sartén */}
              <div className="absolute w-1 h-10 bg-gray-700 rounded-full" style={{ 
                left: '8px', 
                top: '2px', 
                transform: `rotate(${20 + Math.sin(armRotation * Math.PI / 180) * 15}deg)` 
              }}>
                {/* Sartén */}
                <div className="absolute left-1/2 top-8 -translate-x-1/2 w-20 h-14 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full border-3 border-gray-700 shadow-lg">
                  {/* Interior de la sartén */}
                  <div className="absolute inset-2 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full" />
                  
                  {/* Brillo en la sartén */}
                  <div className="absolute top-2 left-4 w-8 h-3 bg-white/20 rounded-full blur-sm" />
                  
                  {/* Contenedor de formas - AQUÍ SALEN */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    {shapes.map((shape: Shape) => (
                      <div
                        key={shape.id}
                        className="absolute"
                        style={{
                          left: `${shape.x}px`,
                          top: `${shape.y}px`,
                          width: `${shape.size}px`,
                          height: `${shape.size}px`,
                          transform: `rotate(${shape.rotation}deg)`,
                          opacity: shape.opacity,
                          transition: 'all 0.03s linear'
                        }}
                      >
                        {shape.type === 'square' && (
                          <div
                            className="w-full h-full rounded-sm"
                            style={{
                              backgroundColor: shape.color,
                              boxShadow: `0 0 10px ${shape.color}80`
                            }}
                          />
                        )}
                        {shape.type === 'circle' && (
                          <div
                            className="w-full h-full rounded-full"
                            style={{
                              backgroundColor: shape.color,
                              boxShadow: `0 0 10px ${shape.color}80`
                            }}
                          />
                        )}
                        {shape.type === 'triangle' && (
                          <div
                            style={{
                              width: 0,
                              height: 0,
                              borderLeft: `${shape.size / 2}px solid transparent`,
                              borderRight: `${shape.size / 2}px solid transparent`,
                              borderBottom: `${shape.size}px solid ${shape.color}`,
                              filter: `drop-shadow(0 0 8px ${shape.color}80)`
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Efecto de calor/vapor */}
                  <div className="absolute left-1/2 -top-8 -translate-x-1/2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-8 bg-gradient-to-t from-white/30 to-transparent rounded-full animate-pulse"
                        style={{
                          left: `${(i - 1) * 8}px`,
                          animation: `pulse ${1 + i * 0.3}s ease-in-out infinite`,
                          animationDelay: `${i * 0.2}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Brazo derecho - se mueve también */}
          <div 
            className="absolute right-2 top-4 w-5 h-20 bg-gradient-to-b from-gray-700 to-gray-800 rounded-full border-2 border-gray-600 origin-top transition-transform duration-75 ease-out"
            style={{ 
              transform: `rotate(${15 + Math.sin((armRotation + 90) * Math.PI / 180) * 10}deg)`,
              transformOrigin: 'top center'
            }}
          >
            {/* Mano */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-600 rounded-full border-2 border-gray-500" />
          </div>
        </div>
      </div>

      {/* Mensaje de carga */}
      <div className="mt-16 z-10">
        <div className="relative">
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 text-center px-8 py-4">
            {messages[messageIndex]}
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-6 w-80 h-2 bg-gray-800/30 rounded-full overflow-hidden mx-auto relative">
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${((messageIndex + 1) / messages.length) * 100}%`,
                background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.8), rgba(236, 72, 153, 0.8), rgba(34, 211, 238, 0.8))',
                boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)'
              }}
            />
          </div>

          {/* Puntos animados */}
          <div className="flex justify-center gap-2 mt-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                  boxShadow: '0 0 8px rgba(168, 85, 247, 0.6)'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}