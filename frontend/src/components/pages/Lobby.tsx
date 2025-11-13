import React, { useState, useEffect } from 'react';
import { MIN_PLAYERS, MAX_PLAYERS } from '../../constants';
import { Card } from '../common/Card';
import { Room, User, Topic } from '../../types';
import { websocketService } from '../../services/websocketService';
import * as apiService from '../../services/apiService';
import Spinner from '../common/Spinner';
import CreateTopicModal from '../common/CreateTopicModal';

interface LobbyProps {
  room: Room;
  currentUser: User;
  onLeave: () => void;
  showToast: (message: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ room, currentUser, onLeave, showToast }) => {
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isHost = room.players.find(p => p.username === currentUser.username)?.is_host || false;
  const canStart = room.players.length >= MIN_PLAYERS && room.topic_id !== null;
  const selectedTopic = availableTopics.find(t => t.id === room.topic_id);

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoadingTopics(true);
      try {
        const [myTopicsRes, publicTopicsRes] = await Promise.all([
          apiService.getMyTopics(),
          apiService.getPublicTopics(),
        ]);
        const allTopics = [...myTopicsRes.data, ...publicTopicsRes.data];
        const uniqueTopics = Array.from(new Map(allTopics.map(t => [t.id, t])).values());
        setAvailableTopics(uniqueTopics);
      } catch (error) {
        showToast("Error al cargar los temas.");
      } finally {
        setIsLoadingTopics(false);
      }
    };
    if (isHost) fetchTopics(); else setIsLoadingTopics(false);
  }, [showToast, isHost]);

  const handleSelectTopic = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const topicId = parseInt(e.target.value, 10);
    if (topicId) websocketService.sendMessage('set_topic', { topic_id: topicId });
  };

  const handleStartGame = () => {
    if (isHost && canStart) websocketService.sendMessage('start_game');
  };
  
  const handleTopicCreated = (newTopic: Topic) => {
    setAvailableTopics(prev => [newTopic, ...prev]);
    // Seleccionar automáticamente el nuevo tema
    websocketService.sendMessage('set_topic', { topic_id: newTopic.id });
  };

  const renderHostControls = () => (
    <div className="mt-6 border-t border-gray-700 pt-6">
      <h3 className="text-xl font-bold text-center mb-4">Panel del Anfitrión</h3>
      {isLoadingTopics ? <Spinner text="Cargando temas..." /> : (
        <div className="flex flex-col items-center gap-4">
          <select id="topic-select" value={room.topic_id || ""} onChange={handleSelectTopic} className="w-full max-w-sm bg-gray-700 text-white p-3 rounded-lg">
            <option value="" disabled>Selecciona un tema...</option>
            {availableTopics.map(topic => <option key={topic.id} value={topic.id}>{topic.title} ({topic.owner_username})</option>)}
          </select>
          <button onClick={() => setShowCreateModal(true)} className="w-full max-w-sm bg-indigo-600 hover:bg-indigo-500 font-bold py-2 rounded-lg">
              Crear Tema Nuevo
          </button>
          <button onClick={handleStartGame} disabled={!canStart} className="w-full max-w-sm bg-brand-accent hover:bg-brand-accent-hover font-bold py-3 text-xl rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
            {room.topic_id === null ? 'Elige un tema primero' : canStart ? 'Empezar Partida' : `Faltan ${MIN_PLAYERS - room.players.length} jugadores`}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="w-full max-w-3xl mx-auto animate-fade-in">
        <Card color="black" className="p-8">
          <button onClick={onLeave} className="absolute top-2 left-2 text-sm bg-red-800 hover:bg-red-700 p-2 rounded">Salir</button>
          <div className="text-center mb-6">
            <p className="text-gray-400">Código de Sala:</p>
            <div className="text-4xl font-bold tracking-widest bg-gray-800 inline-block px-6 py-3 rounded-lg cursor-pointer" onClick={() => navigator.clipboard.writeText(room.code).then(() => showToast("Código copiado!"))}>
              {room.code}
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-gray-400">Tema Seleccionado:</p>
            <p className="text-2xl font-bold text-brand-secondary">{selectedTopic ? selectedTopic.title : "Esperando al host..."}</p>
          </div>

          <h3 className="text-xl font-semibold mb-4 text-center">Jugadores ({room.players.length}/{MAX_PLAYERS})</h3>
          <div className="flex flex-wrap justify-center gap-4 mb-8 min-h-[6rem]">
            {room.players.map(player => (
              <div key={player.id} className="bg-gray-700 p-3 rounded-lg text-center w-48">
                {player.username} {player.is_host && '👑'}
              </div>
            ))}
          </div>

          {isHost ? renderHostControls() : <p className="text-center text-lg text-gray-400 mt-6">Esperando a que el host elija un tema y empiece la partida...</p>}
        </Card>
      </div>
      {showCreateModal && <CreateTopicModal onClose={() => setShowCreateModal(false)} onTopicCreated={handleTopicCreated} showToast={showToast}/>}
    </>
  );
};

export default Lobby;