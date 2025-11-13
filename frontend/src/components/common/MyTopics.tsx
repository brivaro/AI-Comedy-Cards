import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Card } from './Card';
import { Topic } from '../../types';
import * as apiService from '../../services/apiService';
import Spinner from './Spinner';
import CreateTopicModal from './CreateTopicModal';

interface MyTopicsProps {
  onClose: () => void;
  showToast: (message: string) => void;
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
        showToast("No se pudieron cargar tus temas.");
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
      <Modal onClose={onClose}>
        <Card color="black" className="p-8 border-0 max-h-[80vh] flex flex-col w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Mis Temas</h2>
            <button onClick={() => setShowCreateModal(true)} className="bg-brand-accent hover:bg-brand-accent-hover font-bold py-2 px-4 rounded-lg">
              Crear Tema
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {isLoading ? <Spinner /> : (
              topics.length > 0 ? (
                <ul className="space-y-3">
                  {topics.map(topic => (
                    <li key={topic.id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-brand-secondary">{topic.title}</h3>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${topic.is_public ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-200'}`}>
                          {topic.is_public ? 'Público' : 'Privado'}
                        </span>
                      </div>
                      <p className="text-gray-400 mt-2 text-sm italic line-clamp-2">{topic.prompt}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-400 py-8">Aún no has creado ningún tema. ¡Anímate a crear el primero!</p>
              )
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