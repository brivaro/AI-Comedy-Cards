import React, { useState, useEffect } from 'react';
import { MIN_PLAYERS, MAX_PLAYERS } from '../../constants';
import { Card } from '../common/Card';
import { Room, User, Topic, Personality } from '../../types';
import { websocketService } from '../../services/websocketService';
import * as apiService from '../../services/apiService';
import Spinner from '../common/Spinner';
import CreateTopicModal from '../common/CreateTopicModal';
import GameSettingsSelector from '../common/GameSettingsSelector';


interface LobbyProps {
  room: Room;
  currentUser: User;
  onLeave: () => void;
  showToast: (message: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ room, currentUser, onLeave, showToast }) => {
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [availablePersonalities, setAvailablePersonalities] = useState<Personality[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(room.topic_id);
  const [selectedPersonalityId, setSelectedPersonalityId] = useState<number | null>(room.personality_id);

  const isHost = room.players.find(p => p.username === currentUser.username)?.is_host || false;
  const canStart = room.players.length >= MIN_PLAYERS && room.topic_id !== null && room.personality_id !== null;

  const selectedTopic = availableTopics.find(t => t.id === room.topic_id);
  const selectedPersonality = room.personality;

  useEffect(() => {
    const fetchLobbyData = async () => {
      setIsLoading(true);
      try {
        const [myTopicsRes, publicTopicsRes, personalitiesRes] = await Promise.all([
          apiService.getMyTopics(),
          apiService.getPublicTopics(),
          apiService.getPersonalities()
        ]);
        
        const allTopics = [...myTopicsRes.data, ...publicTopicsRes.data];
        const uniqueTopics = Array.from(new Map(allTopics.map(t => [t.id, t])).values());
        setAvailableTopics(uniqueTopics);
        setAvailablePersonalities(personalitiesRes.data);

      } catch (error) {
        showToast("Error al cargar los datos de la sala.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLobbyData();

  }, [showToast]);
  
  // ### NUEVO ###: Sincronizamos el estado local con el de la sala que llega por WS
  useEffect(() => {
    setSelectedTopicId(room.topic_id);
    setSelectedPersonalityId(room.personality_id);
  }, [room.topic_id, room.personality_id]);

  const handleStartGame = () => {
    if (isHost && canStart) websocketService.sendMessage('start_game', {});
  };
  
  const handleTopicCreated = (newTopic: Topic) => {
    setAvailableTopics(prev => [newTopic, ...prev]);
    // Seleccionamos automáticamente el nuevo tema
    setSelectedTopicId(newTopic.id);
  };

  const handleConfirmSettings = () => {
    if (isHost && selectedTopicId && selectedPersonalityId) {
      websocketService.sendMessage('set_game_settings', {
        topic_id: selectedTopicId,
        personality_id: selectedPersonalityId
      });
      showToast("¡Ajustes guardados!");
    }
  };

  const renderHostControls = () => {
    const settingsChanged = selectedTopicId !== room.topic_id || selectedPersonalityId !== room.personality_id;
    const canConfirm = selectedTopicId !== null && selectedPersonalityId !== null;

    return (
      <div className="mt-6">
        {isLoading ? <Spinner text="Cargando temas y personalidades..." /> : (
          <>
            <GameSettingsSelector
              availableTopics={availableTopics}
              availablePersonalities={availablePersonalities}
              selectedTopicId={selectedTopicId}
              selectedPersonalityId={selectedPersonalityId}
              onTopicSelect={setSelectedTopicId}
              onPersonalitySelect={setSelectedPersonalityId}
            />
            
            <div className="flex flex-col md:flex-row items-center gap-4 mt-6 pt-6 border-t border-gray-700">
                <button onClick={() => setShowCreateModal(true)} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 font-bold py-3 px-6 rounded-lg">
                    Crear Tema Nuevo
                </button>
                <button onClick={handleConfirmSettings} disabled={!settingsChanged || !canConfirm} className="w-full md:w-auto bg-green-600 hover:bg-green-500 font-bold py-3 px-6 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed">
                    {settingsChanged ? 'Confirmar Opciones' : 'Opciones Guardadas'}
                </button>
                <button onClick={handleStartGame} disabled={!canStart || settingsChanged} className="w-full flex-grow bg-brand-accent hover:bg-brand-accent-hover font-bold py-3 text-xl rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                    {settingsChanged ? 'Confirma tus opciones' : (canStart ? 'Empezar Partida' : `Faltan ${MIN_PLAYERS - room.players.length} jugadores`)}
                </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-5xl mx-auto animate-fade-in"> {/* Aumentamos el ancho máximo */}
        <Card color="black" className="p-8">
          <button onClick={onLeave} className="absolute top-2 left-2 text-sm bg-red-800 hover:bg-red-700 p-2 rounded">Salir</button>
          <div className="text-center mb-6">
            <p className="text-gray-400">Código de Sala:</p>
            <div className="text-4xl font-bold tracking-widest bg-gray-800 inline-block px-6 py-3 rounded-lg cursor-pointer" onClick={() => navigator.clipboard.writeText(room.code).then(() => showToast("Código copiado!"))}>
              {room.code}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center mb-6">
            <div>
              <p className="text-gray-400">Tema Seleccionado:</p>
              <p className="text-2xl font-bold text-brand-secondary min-h-[40px]">{selectedTopic ? selectedTopic.title : "Esperando al host..."}</p>
            </div>
            <div>
              <p className="text-gray-400">Personalidad de la IA:</p>
              <p className="text-2xl font-bold text-brand-secondary min-h-[40px]">{selectedPersonality ? selectedPersonality.title : "Esperando al host..."}</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4 text-center">Jugadores ({room.players.length}/{MAX_PLAYERS})</h3>
          <div className="flex flex-wrap justify-center gap-4 mb-8 min-h-[6rem]">
            {room.players.map(player => (
              <div key={player.id} className="bg-gray-700 p-3 rounded-lg text-center w-48">
                {player.username} {player.is_host && '👑'}
              </div>
            ))}
          </div>

          {isHost ? renderHostControls() : <p className="text-center text-lg text-gray-400 mt-6">Esperando a que el host elija los ajustes y empiece la partida...</p>}
        </Card>
      </div>
      {showCreateModal && <CreateTopicModal onClose={() => setShowCreateModal(false)} onTopicCreated={handleTopicCreated} showToast={showToast}/>}
    </>
  );
};

export default Lobby;