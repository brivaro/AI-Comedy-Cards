import React, { useState, useEffect } from 'react';
import { MIN_PLAYERS, MAX_PLAYERS } from '../../constants';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Room, User, Topic, Personality } from '../../types';
import { websocketService } from '../../services/websocketService';
import * as apiService from '../../services/apiService';
import { Spinner } from '../ui/Spinner';
import CreateTopicModal from '../features/topics/CreateTopicModal';
import GameSettingsSelector from '../features/topics/GameSettingsSelector';
import { Copy, SignOut, Play, Users, Robot, BookOpen, Check, Crown } from 'phosphor-react';

interface LobbyProps {
  room: Room;
  currentUser: User;
  onLeave: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const Lobby: React.FC<LobbyProps> = ({ room, currentUser, onLeave, showToast }) => {
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [availablePersonalities, setAvailablePersonalities] = useState<Personality[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(room.topic_id);
  const [selectedPersonalityId, setSelectedPersonalityId] = useState<number | null>(room.personality_id);

  const isHost = room.players.find(p => p.username === currentUser.username)?.is_host || false;
  
  const confirmedTopic = availableTopics.find(t => t.id === room.topic_id);
  const confirmedPersonality = room.personality;
  
  const settingsChanged = selectedTopicId !== room.topic_id || selectedPersonalityId !== room.personality_id;
  const canConfirm = selectedTopicId !== null && selectedPersonalityId !== null;
  const canStart = room.players.length >= MIN_PLAYERS && room.topic_id !== null && room.personality_id !== null;

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

        if (room.topic_id) setSelectedTopicId(room.topic_id);
        if (room.personality_id) setSelectedPersonalityId(room.personality_id);

      } catch (error) {
        showToast("Error al cargar los datos de la sala", 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLobbyData();
  }, [showToast]);
  
  useEffect(() => {
    setSelectedTopicId(room.topic_id);
    setSelectedPersonalityId(room.personality_id);
  }, [room.topic_id, room.personality_id]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    showToast("¡Código de sala copiado!", 'success');
  };

  const handleStartGame = () => {
    if (isHost && canStart && !settingsChanged) {
      websocketService.sendMessage('start_game', {});
    }
  };
  
  const handleTopicCreated = (newTopic: Topic) => {
    setAvailableTopics(prev => [newTopic, ...prev]);
    setSelectedTopicId(newTopic.id); 
  };

  const handleConfirmSettings = () => {
    if (isHost && selectedTopicId && selectedPersonalityId) {
      websocketService.sendMessage('set_game_settings', {
        topic_id: selectedTopicId,
        personality_id: selectedPersonalityId
      });
      showToast("¡Ajustes de la partida guardados!", 'success');
    }
  };

  return (
    <>
      <div className="w-full mx-auto animate-fade-in space-y-4">
        <Card className="glass-strong p-4 border-2 border-cyan-500/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Users className="w-5 h-5 text-white" weight="bold" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">CÓDIGO DE SALA</p>
                <div onClick={handleCopyCode} className="flex items-center gap-2 cursor-pointer group">
                  <span className="text-xl sm:text-2xl font-black tracking-widest text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                    {room.code}
                  </span>
                  <Copy className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors" weight="bold" />
                </div>
              </div>
            </div>
            <Button onClick={onLeave} variant="danger" size="sm" icon={<SignOut weight="bold" />}>
              Salir
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:items-start">
          <div className="lg:col-span-1 space-y-4">
            <Card className="glass-card p-4 border-2 border-cyan-500/10">
              <h3 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2 text-white">
                <Users className="w-5 h-5 text-cyan-400" />
                Jugadores ({room.players.length}/{MAX_PLAYERS})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {room.players.map(player => (
                  <div key={player.id} className="glass-strong rounded-lg p-2.5 border-2 border-cyan-500/10 flex items-center gap-2">
                    {player.is_host && <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" weight="bold" />}
                    <p className="font-bold text-white truncate text-xs sm:text-sm">{player.username}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="glass-card p-4 border-2 border-cyan-500/10 space-y-3">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Robot className="w-4 h-4 text-cyan-400" weight="bold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-medium">Personalidad IA</p>
                    <p className="text-sm sm:text-base font-bold text-white truncate">{confirmedPersonality?.title || "No seleccionada"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-blue-400" weight="bold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-medium">Tema del Juego</p>
                    <p className="text-sm sm:text-base font-bold text-white truncate">{confirmedTopic?.title || "No seleccionado"}</p>
                  </div>
                </div>
            </Card>

            {isHost && (
              <Card className="glass-card p-4 border-2 border-cyan-500/10 space-y-3">
                <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3">
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    variant="secondary" size="sm" icon={<BookOpen weight="bold" />}
                    className="w-full sm:w-auto"
                  >
                    Crear Tema
                  </Button>
                  <Button
                    onClick={handleConfirmSettings}
                    disabled={!settingsChanged || !canConfirm}
                    variant="success" size="sm" icon={<Check weight="bold" />}
                    className="w-full sm:w-auto"
                  >
                    {settingsChanged ? 'Guardar Cambios' : 'Ajustes Guardados'}
                  </Button>
                </div>
                <Button
                  onClick={handleStartGame}
                  disabled={!canStart || settingsChanged}
                  variant="primary" size="md" icon={<Play weight="bold" />}
                  className="w-full"
                >
                  {settingsChanged 
                    ? 'Guarda los cambios para empezar' 
                    : canStart 
                      ? '¡Iniciar Partida!' 
                      : `Faltan ${MIN_PLAYERS - room.players.length} jugadores`}
                </Button>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2 h-full">
            {isHost ? (
              <Card className="glass-strong p-4 md:p-6 border-2 border-cyan-500/20 h-full flex flex-col">
                {isLoading ? (
                  <Spinner text="Cargando opciones de partida..." />
                ) : (
                  <GameSettingsSelector
                    availableTopics={availableTopics}
                    availablePersonalities={availablePersonalities}
                    selectedTopicId={selectedTopicId}
                    selectedPersonalityId={selectedPersonalityId}
                    onTopicSelect={setSelectedTopicId}
                    onPersonalitySelect={setSelectedPersonalityId}
                  />
                )}
              </Card>
            ) : (
              <Card className="glass-card p-8 border-2 border-cyan-500/10 text-center h-full flex items-center justify-center min-h-[400px]">
                <Spinner text={`Esperando a que ${room.players.find(p => p.is_host)?.username} inicie la partida...`} size="sm" />
              </Card>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateTopicModal 
          onClose={() => setShowCreateModal(false)}
          onTopicCreated={handleTopicCreated}
          showToast={showToast}
        />
      )}
    </>
  );
};

export default Lobby;