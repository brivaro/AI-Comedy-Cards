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
  
  // Estados locales para los selectores del host, para no mutar el estado global hasta confirmar.
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(room.topic_id);
  const [selectedPersonalityId, setSelectedPersonalityId] = useState<number | null>(room.personality_id);

  const isHost = room.players.find(p => p.username === currentUser.username)?.is_host || false;
  
  // La configuración confirmada en la sala
  const confirmedTopic = availableTopics.find(t => t.id === room.topic_id);
  const confirmedPersonality = room.personality;
  
  // Lógica para habilitar botones
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

        // Si la sala ya tiene configuración, la respetamos en los selectores locales
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
  
  // Sincroniza los selectores locales si el estado de la sala cambia desde el servidor
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
    // Selecciona automáticamente el tema recién creado
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
      <div className="w-full max-w-7xl mx-auto animate-fade-in space-y-6">
        {/* Fila superior: Código y Salir */}
        <Card className="glass-strong p-4 md:p-6 border-2 border-cyan-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Users className="w-6 h-6 text-white" weight="bold" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">CÓDIGO DE SALA</p>
                <div onClick={handleCopyCode} className="flex items-center gap-2 cursor-pointer group">
                  <span className="text-3xl font-black tracking-widest text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                    {room.code}
                  </span>
                  <Copy className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" weight="bold" />
                </div>
              </div>
            </div>
            <Button onClick={onLeave} variant="danger" size="sm" icon={<SignOut weight="bold" />}>
              Salir de la Sala
            </Button>
          </div>
        </Card>

        {/* Layout principal de 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda (Info) */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card p-6 border-2 border-cyan-500/10">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                <Users className="w-5 h-5 text-cyan-400" />
                Jugadores ({room.players.length}/{MAX_PLAYERS})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {room.players.map(player => (
                  <div key={player.id} className="glass-strong rounded-xl p-3 border-2 border-cyan-500/10 flex items-center gap-2">
                    {player.is_host && <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" weight="bold" />}
                    <p className="font-bold text-white truncate">{player.username}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="glass-card p-6 border-2 border-cyan-500/10 space-y-4">
               <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Robot className="w-5 h-5 text-cyan-400" weight="bold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 font-medium">Personalidad IA</p>
                    <p className="text-lg font-bold text-white truncate">{confirmedPersonality?.title || "No seleccionada"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-blue-400" weight="bold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 font-medium">Tema del Juego</p>
                    <p className="text-lg font-bold text-white truncate">{confirmedTopic?.title || "No seleccionado"}</p>
                  </div>
                </div>
            </Card>
          </div>

          {/* Columna Derecha (Controles o Espera) */}
          <div className="lg:col-span-2">
            {isHost ? (
              <Card className="glass-strong p-6 border-2 border-cyan-500/20">
                {isLoading ? (
                  <Spinner text="Cargando opciones de partida..." />
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
                    
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6 pt-6 border-t border-cyan-500/20">
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
                        {settingsChanged ? 'Guardar Cambios' : 'Ajustes Guardados'}
                      </Button>
                      <div className="flex-grow" />
                      <Button
                        onClick={handleStartGame}
                        disabled={!canStart || settingsChanged}
                        variant="primary"
                        size="md"
                        icon={<Play weight="bold" />}
                        className="flex-grow sm:flex-grow-0 min-w-[200px]"
                      >
                        {settingsChanged 
                          ? 'Guarda los cambios primero' 
                          : canStart 
                            ? '¡Iniciar Partida!' 
                            : `Faltan ${MIN_PLAYERS - room.players.length} jugadores`}
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            ) : (
              <Card className="glass-card p-8 border-2 border-cyan-500/10 text-center h-full flex items-center justify-center">
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