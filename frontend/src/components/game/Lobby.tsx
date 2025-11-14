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
import { Copy, SignOut, Play, Users, Robot, BookOpen, Check } from 'phosphor-react';

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
        showToast("Error al cargar los datos", 'error');
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
    showToast("¡Código copiado!", 'success');
  };

  const handleStartGame = () => {
    if (isHost && canStart) {
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
      showToast("¡Ajustes guardados!", 'success');
    }
  };

  const settingsChanged = selectedTopicId !== room.topic_id || selectedPersonalityId !== room.personality_id;
  const canConfirm = selectedTopicId !== null && selectedPersonalityId !== null;

  return (
    <>
      <div className="w-full max-w-6xl mx-auto animate-fade-in space-y-6">
        {/* Header de la sala */}
        <Card className="glass-strong p-6 border-2 border-cyan-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Users className="w-6 h-6 text-white" weight="bold" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Código de Sala</p>
                <div 
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <span className="text-3xl font-black tracking-widest text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                    {room.code}
                  </span>
                  <Copy className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" weight="bold" />
                </div>
              </div>
            </div>

            <Button
              onClick={onLeave}
              variant="danger"
              size="sm"
              icon={<SignOut weight="bold" />}
            >
              Salir
            </Button>
          </div>
        </Card>

        {/* Configuración actual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-card p-6 border-2 border-cyan-500/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Robot className="w-5 h-5 text-cyan-400" weight="bold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-400 font-medium mb-1">Personalidad IA</p>
                <p className="text-xl font-bold text-white truncate">
                  {selectedPersonality ? selectedPersonality.title : "No seleccionada"}
                </p>
                {selectedPersonality && (
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {selectedPersonality.description}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6 border-2 border-blue-500/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-blue-400" weight="bold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-400 font-medium mb-1">Tema</p>
                <p className="text-xl font-bold text-white truncate">
                  {selectedTopic ? selectedTopic.title : "No seleccionado"}
                </p>
                {selectedTopic && (
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {selectedTopic.prompt}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Jugadores */}
        <Card className="glass-card p-6 border-2 border-cyan-500/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
            <Users className="w-5 h-5" weight="bold" />
            Jugadores ({room.players.length}/{MAX_PLAYERS})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {room.players.map(player => (
              <div key={player.id} className="glass-strong rounded-xl p-3 border-2 border-cyan-500/10">
                <p className="font-bold text-white truncate">
                  {player.is_host && '👑 '}
                  {player.username}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Controles del host */}
        {isHost && (
          <Card className="glass-strong p-6 border-2 border-cyan-500/20">
            {isLoading ? (
              <Spinner text="Cargando opciones..." />
            ) : (
              <>
                <GameSettingsSelector
                  availableTopics={availableTopics}
                  availablePersonalities={availablePersonalities}
                  selectedTopicId={selectedTopicId}
                  selectedPersonalityId={selectedPersonalityId}
                  onTopicSelect={setSelectedTopicId}
                  onPersonalitySelect={setSelectedPersonalityId}
                />
                
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-cyan-500/20">
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    variant="secondary"
                    size="md"
                    icon={<BookOpen weight="bold" />}
                  >
                    Crear Tema
                  </Button>
                  
                  <Button
                    onClick={handleConfirmSettings}
                    disabled={!settingsChanged || !canConfirm}
                    variant="success"
                    size="md"
                    icon={<Check weight="bold" />}
                  >
                    {settingsChanged ? 'Guardar Cambios' : 'Guardado'}
                  </Button>
                  
                  <Button
                    onClick={handleStartGame}
                    disabled={!canStart || settingsChanged}
                    variant="primary"
                    size="md"
                    icon={<Play weight="bold" />}
                    className="flex-1"
                  >
                    {settingsChanged 
                      ? 'Guarda los cambios' 
                      : canStart 
                        ? 'Iniciar Partida' 
                        : `Faltan ${MIN_PLAYERS - room.players.length} jugadores`}
                  </Button>
                </div>
              </>
            )}
          </Card>
        )}

        {!isHost && (
          <Card className="glass-card p-8 border-2 border-cyan-500/10 text-center">
            <Spinner text="Esperando a que el host configure la partida..." size="sm" />
          </Card>
        )}
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