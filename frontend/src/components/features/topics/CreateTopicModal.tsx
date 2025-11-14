import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Card } from '../../ui/Card';
import * as apiService from '../../../services/apiService';
import { Topic } from '../../../types';
import { FloppyDisk, BookOpen, GlobeHemisphereWest, Lock } from 'phosphor-react';

interface CreateTopicModalProps {
  onClose: () => void;
  onTopicCreated: (newTopic: Topic) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const CreateTopicModal: React.FC<CreateTopicModalProps> = ({ onClose, onTopicCreated, showToast }) => {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.length < 4) {
      setError('El título debe tener al menos 4 caracteres');
      return;
    }
    if (prompt.length < 10) {
      setError('El prompt debe tener al menos 10 caracteres');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const response = await apiService.createTopic(title, prompt, isPublic);
      showToast('¡Tema creado con éxito!', 'success');
      onTopicCreated(response.data);
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Error al crear el tema', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} size="lg">
      <Card className="glass-strong p-8 border-0">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 mb-4 shadow-lg shadow-purple-500/30">
            <BookOpen className="w-8 h-8 text-white" weight="bold" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Crear Nuevo Tema</h2>
          <p className="text-gray-400 text-sm">La IA usará este tema para generar cartas únicas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Título del Tema"
            type="text"
            value={title}
            onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
            placeholder="Ej: Humor negro sobre videojuegos"
            icon={<BookOpen className="w-5 h-5" weight="bold" />}
            minLength={4}
            maxLength={100}
            required
          />

          <Input
            label="Descripción para la IA"
            multiline
            rows={6}
            value={prompt}
            onChange={(e) => setPrompt((e.target as HTMLTextAreaElement).value)}
            placeholder="Describe en detalle la temática. La IA usará esto para generar las cartas. Ejemplo: 'Genera respuestas cómicas sobre situaciones absurdas en videojuegos, con referencias a bugs famosos y mecánicas de juego.'"
            minLength={20}
            maxLength={2000}
            required
          />

          <div className="glass-card rounded-xl p-4 flex items-center gap-3 border border-white/10">
            <input
              id="is_public"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-5 h-5 rounded bg-transparent border-2 border-purple-500/50 text-purple-500 focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
            />
            <label htmlFor="is_public" className="flex items-center gap-2 text-white cursor-pointer flex-1">
              {isPublic ? (
                <>
                  <GlobeHemisphereWest className="w-5 h-5 text-green-400" weight="bold" />
                  <span>Tema público - Visible para todos</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-gray-400" weight="bold" />
                  <span>Tema privado - Solo tú puedes usarlo</span>
                </>
              )}
            </label>
          </div>

          {error && (
            <div className="glass-card p-3 rounded-xl border border-red-500/30 bg-red-500/10">
              <p className="text-red-400 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            icon={<FloppyDisk weight="bold" />}
            className="w-full"
          >
            Crear Tema
          </Button>
        </form>
      </Card>
    </Modal>
  );
};

export default CreateTopicModal;