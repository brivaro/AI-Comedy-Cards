import React, { useEffect, useState } from 'react';

export default function GameBackgroundCharacter() {
  const [phase, setPhase] = useState('walking'); // walking, peeking, hidingHead
  const [position, setPosition] = useState(-200);
  const [armSwing, setArmSwing] = useState(0);
  const [eyeBlink, setEyeBlink] = useState(false);
  const [waving, setWaving] = useState(false);
  const [waveAnimation, setWaveAnimation] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    
    const animate = () => {
      setPosition(prev => {
        if (prev >= window.innerWidth + 200) {
          setPhase('peeking');
          setWaving(true);
          return window.innerWidth - 60;
        }
        return prev + 3;
      });
      animationFrame = requestAnimationFrame(animate);
    };

    if (phase === 'walking') {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [phase]);

  // Después de asomar, mover la cabeza a la derecha
  useEffect(() => {
    if (phase === 'peeking') {
      const peekTimer = setTimeout(() => {
        setPhase('hidingHead'); // Mueve la cabeza a la derecha
      }, 2000);
      
      return () => clearTimeout(peekTimer);
    } else if (phase === 'hidingHead') {
        setPosition(window.innerWidth + 100);

        const resetTimer = setTimeout(() => {
            setPhase('walking');
            setWaving(false);
            setPosition(-200);
        }, 500); // Transition duration

        return () => clearTimeout(resetTimer);
    }
  }, [phase]);

  // Movimiento de brazos
  useEffect(() => {
    if (phase === 'walking') {
      const armInterval = setInterval(() => {
        setArmSwing(prev => (prev + 10) % 360);
      }, 50);
      
      return () => clearInterval(armInterval);
    }
  }, [phase]);

  // Parpadeo de ojos
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyeBlink(true);
      setTimeout(() => setEyeBlink(false), 150);
    }, 2000); // Parpadea cada 2 segundos (antes era 3000)
    
    return () => clearInterval(blinkInterval);
  }, []);

  const leftArmRotation = Math.sin(armSwing * Math.PI / 180) * 25;
  const rightArmRotation = Math.sin((armSwing + 180) * Math.PI / 180) * 25;

  const isPeeking = phase === 'peeking' || phase === 'hidingHead';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute"
        style={{
          left: `${position}px`,
          bottom: isPeeking ? '0px' : '0px',
          transition: isPeeking ? 'left 0.5s ease-out' : 'none'
        }}
      >
        {isPeeking ? (
          // Solo la cabeza asomando desde el borde
          <div className="relative" style={{ marginBottom: '100px' }}>
            <div className="relative bg-gradient-to-br from-slate-700 to-slate-800 w-20 h-20 rounded-2xl border-3 border-slate-600 shadow-xl">
              {/* Antena */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-1 h-6 bg-slate-600">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
              </div>
              
              {/* Ojos */}
              <div className="absolute top-6 left-3 flex gap-4">
                {eyeBlink ? (
                  <>
                    <div className="w-4 h-1 bg-cyan-400 rounded-full" />
                    <div className="w-4 h-1 bg-cyan-400 rounded-full" />
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 bg-cyan-400 rounded-sm shadow-lg shadow-cyan-400/50 animate-pulse" />
                    <div className="w-4 h-4 bg-cyan-400 rounded-sm shadow-lg shadow-cyan-400/50 animate-pulse" />
                  </>
                )}
              </div>
              
              {/* Boca sonriente */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-cyan-400 rounded-full" />
            </div>
          </div>
        ) : (
          // Personaje completo caminando
          <div className="relative">
            {/* Cabeza */}
            <div className="relative bg-gradient-to-br from-slate-700 to-slate-800 w-24 h-24 rounded-2xl border-3 border-slate-600 shadow-xl mb-1">
              {/* Antena */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-1 h-6 bg-slate-600">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
              </div>
              
              {/* Ojos */}
              <div className="absolute top-8 left-4 flex gap-6">
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
              
              {/* Boca */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                <div className="w-2 h-1 bg-cyan-400 rounded-full" />
                <div className="w-2 h-1 bg-cyan-400 rounded-full" />
                <div className="w-2 h-1 bg-cyan-400 rounded-full" />
              </div>
            </div>

            {/* Cuerpo */}
            <div className="relative bg-gradient-to-br from-slate-700 to-slate-800 w-28 h-32 rounded-xl border-3 border-slate-600 shadow-xl">
              {/* Panel central */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 space-y-2">
                <div className="w-12 h-2 bg-cyan-500/30 rounded-full animate-pulse" />
                <div className="w-12 h-2 bg-purple-500/30 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                <div className="w-12 h-2 bg-cyan-500/30 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
              </div>

              {/* Brazos con movimiento */}
              <div 
                className="absolute top-8 -left-5 w-4 h-20 bg-gradient-to-b from-slate-700 to-slate-800 rounded-full border-2 border-slate-600 origin-top transition-transform duration-100"
                style={{ 
                  transform: waving 
                    ? `rotate(${-45 + Math.sin(waveAnimation * Math.PI / 180) * 15}deg)` 
                    : `rotate(${leftArmRotation}deg)` 
                }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-600 rounded-full" />
              </div>
              <div 
                className="absolute top-8 -right-5 w-4 h-20 bg-gradient-to-b from-slate-700 to-slate-800 rounded-full border-2 border-slate-600 origin-top transition-transform duration-100"
                style={{ 
                  transform: waving 
                    ? `rotate(${-45 + Math.sin((waveAnimation + 180) * Math.PI / 180) * 15}deg)` 
                    : `rotate(${rightArmRotation}deg)` 
                }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-600 rounded-full" />
              </div>
            </div>

            {/* Piernas */}
            <div className="flex justify-center gap-4 mt-1">
              <div className="relative w-4 h-16 bg-gradient-to-b from-slate-700 to-slate-800 rounded-full border-2 border-slate-600">
                {/* Pie izquierdo */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-slate-700 rounded-full border-2 border-slate-600" />
              </div>
              <div className="relative w-4 h-16 bg-gradient-to-b from-slate-700 to-slate-800 rounded-full border-2 border-slate-600">
                {/* Pie derecho */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-slate-700 rounded-full border-2 border-slate-600" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}