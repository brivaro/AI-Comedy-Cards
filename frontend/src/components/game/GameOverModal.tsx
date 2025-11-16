import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Room, User } from '../../types';
import { Trophy, Gift } from 'phosphor-react';

interface GameOverModalProps {
  room: Room;
  currentUser: User;
  onClose: () => void;
}

// --- LÓGICA DE CONFETI ---

// Efecto para el GANADOR: Cañones laterales con estrellas
const triggerSideCannonsWithStars = () => {
  const duration = 3 * 1000;
  const end = Date.now() + duration;
  const colors = ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"];

  const frame = () => {
    if (Date.now() > end) return;

    // Cañón izquierdo
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: colors,
      shapes: ["star"],
      scalar: 1.2
    });
    // Cañón derecho
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: colors,
      shapes: ["star"],
      scalar: 1.2
    });

    requestAnimationFrame(frame);
  };
  frame();
};

// Efecto para el RESTO: Formas personalizadas
const triggerCustomShapes = () => {
  const scalar = 2;
  const triangle = confetti.shapeFromPath({ path: "M0 10 L5 0 L10 10z" });
  const square = confetti.shapeFromPath({ path: "M0 0 L10 0 L10 10 L0 10 Z" });
  const coin = confetti.shapeFromPath({ path: "M5 0 A5 5 0 1 0 5 10 A5 5 0 1 0 5 0 Z" });

  const defaults = {
    spread: 360,
    ticks: 60,
    gravity: 0,
    decay: 0.96,
    startVelocity: 20,
    shapes: [triangle, square, coin],
    scalar,
  };

  const shoot = () => {
    confetti({ ...defaults, particleCount: 30 });
    confetti({ ...defaults, particleCount: 15, scalar: scalar / 2, shapes: ["circle"] });
  };
  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
};


// --- COMPONENTE PRINCIPAL ---

const GameOverModal: React.FC<GameOverModalProps> = ({ room, currentUser, onClose }) => {
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isCurrentUserWinner = currentUser.username === winner?.username;

  // Disparar un pequeño efecto inicial solo para el ganador al abrir la modal
  useEffect(() => {
    if (isCurrentUserWinner) {
      setTimeout(() => triggerSideCannonsWithStars(), 300);
    }
  }, [isCurrentUserWinner]);

  if (!winner) {
    return null; // No mostrar nada si no se puede determinar un ganador
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col items-center p-4">
        {isCurrentUserWinner ? (
          // --- VISTA DEL GANADOR ---
          <>
            <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-bounce" weight="fill" />
            <h2 className="text-3xl font-black text-yellow-300 mb-2">¡Enhorabuena, {winner.username}!</h2>
            <p className="text-xl text-white font-bold mb-6">¡Has ganado la partida con {winner.score} puntos!</p>
            <Button 
              onClick={() => {
                triggerSideCannonsWithStars();
                onClose();
              }} 
              variant="primary" 
              size="lg"
            >
              Celebrar y Salir 🎉
            </Button>
          </>
        ) : (
          // --- VISTA DE LOS DEMÁS JUGADORES ---
          <>
            <Trophy className="w-20 h-20 text-gray-400 mx-auto mb-4" weight="bold" />
            <h2 className="text-3xl font-black text-white mb-2">¡Partida Finalizada!</h2>
            <p className="text-xl text-gray-300 mb-2">
              El ganador es <span className="font-bold text-yellow-400">{winner.username}</span> con {winner.score} puntos.
            </p>
            <Button 
              onClick={() => {
                triggerCustomShapes();
                onClose();
              }} 
              variant="secondary" 
              size="lg" 
              className="mt-6"
              icon={<Gift weight="bold" />}
            >
              Felicitar y Salir
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default GameOverModal;