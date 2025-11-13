import React, { useState } from 'react';
import { Card } from './Card';
import Modal from './Modal';
import * as apiService from '../../services/apiService';
import { Topic } from '../../types';
import Spinner from './Spinner';

interface CreateTopicModalProps {
  onClose: () => void;
  onTopicCreated: (newTopic: Topic) => void;
  showToast: (message: string) => void;
}

const CreateTopicModal: React.FC<CreateTopicModalProps> = ({ onClose, onTopicCreated, showToast }) => {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.length < 5 || prompt.length < 20) {
      setError('El título debe tener al menos 5 caracteres y el prompt al menos 20.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const response = await apiService.createTopic(title, prompt, isPublic);
      showToast('¡Tema creado con éxito!');
      onTopicCreated(response.data);
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Error al crear el tema.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <Card color="black" className="p-8 border-0 w-full">
        <h2 className="text-3xl font-bold mb-6 text-center">Crear Nuevo Tema</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Título del Tema</label>
            <input
              id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Humor negro sobre videojuegos"
              className="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white"
              minLength={5} maxLength={100} required
            />
          </div>
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-1">Prompt para la IA</label>
            <textarea
              id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe en detalle la temática. La IA usará esto para generar las cartas."
              className="w-full bg-gray-700 border-gray-600 rounded-lg p-3 h-32 text-white"
              minLength={20} maxLength={2000} required
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              id="is_public" type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)}
              className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-brand-accent focus:ring-brand-accent"
            />
            <label htmlFor="is_public" className="text-gray-300">Hacer este tema público</label>
          </div>
          
          {error && <p className="text-red-400 text-center">{error}</p>}

          <div className="pt-4">
            <button type="submit" disabled={isLoading} className="w-full bg-brand-accent hover:bg-brand-accent-hover font-bold py-3 rounded-lg text-lg disabled:bg-gray-600">
              {isLoading ? <Spinner text="Creando..."/> : 'Guardar Tema'}
            </button>
          </div>
        </form>
      </Card>
    </Modal>
  );
};

export default CreateTopicModal;