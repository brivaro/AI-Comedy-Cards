import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Spinner } from '../../ui/Spinner';
import { Topic } from '../../../types';
import * as apiService from '../../../services/apiService';
import CreateTopicModal from './CreateTopicModal';
import { Plus, GlobeHemisphereWest, Lock, BookOpen } from 'phosphor-react';

interface MyTopicsProps {
  onClose: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const MyTopics: React.FC<MyTopicsProps> = ({ onClose, showToast }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchMyTopics = async () => {
      try {
        const response = await apiService.getMyTopics();
        setTopics(response.data);
      } catch (err) {
        showToast("No se pudieron cargar tus temas", 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyTopics();
  }, [showToast]);

  const handleTopicCreated = (newTopic: Topic) => {
    setTopics(prevTopics => [newTopic, ...prevTopics]);
  };

  return (
    <>
      <Modal onClose={onClose} size="xl">
        <Card className="glass-strong p-8 border-0 max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <BookOpen className="w-6 h-6 text-white" weight="bold" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white">Mis Temas</h2>
                <p className="text-gray-400 text-sm">Gestiona tus temas personalizados</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="md"
              icon={<Plus weight="bold" />}
            >
              Nuevo Tema
            </Button>
          </div>
          
          <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
            {isLoading ? (
              <Spinner text="Cargando tus temas..." />
            ) : topics.length > 0 ? (
              <div className="space-y-3">
                {topics.map(topic => (
                  <div key={topic.id} className="glass-card rounded-2xl p-6 border border-white/10 hover-lift">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white mb-1 truncate">{topic.title}</h3>
                        <p className="text-sm text-gray-500 font-medium">Por {topic.owner_username}</p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs ${
                        topic.is_public 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {topic.is_public ? (
                          <>
                            <GlobeHemisphereWest className="w-4 h-4" weight="bold" />
                            Público
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" weight="bold" />
                            Privado
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">{topic.prompt}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                  <BookOpen className="w-10 h-10 text-purple-400" weight="bold" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No tienes temas aún</h3>
                <p className="text-gray-400 mb-6">¡Crea tu primer tema personalizado!</p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  variant="primary"
                  size="md"
                  icon={<Plus weight="bold" />}
                >
                  Crear Primer Tema
                </Button>
              </div>
            )}
          </div>
        </Card>
      </Modal>

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

export default MyTopics;