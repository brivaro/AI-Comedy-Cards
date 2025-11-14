import React from 'react';
import { Topic, Personality } from '../../types';

// Atributos de las "tarjetas" de selección
interface SelectableCardProps {
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

// Componente visual para una tarjeta de selección
const SelectableCard: React.FC<SelectableCardProps> = ({ title, description, isSelected, onSelect }) => {
  const baseClasses = "bg-gray-700 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200";
  const selectedClasses = isSelected ? "border-brand-accent ring-2 ring-brand-accent shadow-lg" : "border-gray-600 hover:border-gray-500";

  return (
    <div className={`${baseClasses} ${selectedClasses}`} onClick={onSelect}>
      <h4 className="font-bold text-lg text-brand-secondary">{title}</h4>
      <p className="text-sm text-gray-400 mt-1 line-clamp-3">{description}</p>
    </div>
  );
};

interface GameSettingsSelectorProps {
  availableTopics: Topic[];
  availablePersonalities: Personality[];
  selectedTopicId: number | null;
  selectedPersonalityId: number | null;
  onTopicSelect: (id: number) => void;
  onPersonalitySelect: (id: number) => void;
}

const GameSettingsSelector: React.FC<GameSettingsSelectorProps> = ({
  availableTopics,
  availablePersonalities,
  selectedTopicId,
  selectedPersonalityId,
  onTopicSelect,
  onPersonalitySelect
}) => {
  const [topicFilter, setTopicFilter] = React.useState('');
  const [personalityFilter, setPersonalityFilter] = React.useState('');

  const filteredTopics = availableTopics.filter(t => t.title.toLowerCase().includes(topicFilter.toLowerCase()));
  const filteredPersonalities = availablePersonalities.filter(p => p.title.toLowerCase().includes(personalityFilter.toLowerCase()));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 border-t border-gray-700 pt-6">
      {/* Columna de Personalidades */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-center">1. Elige una Personalidad para la IA</h3>
        <input
          type="text"
          placeholder="Buscar personalidad..."
          value={personalityFilter}
          onChange={(e) => setPersonalityFilter(e.target.value)}
          className="w-full bg-gray-800 border-gray-600 rounded-lg p-3"
        />
        <div className="max-h-96 overflow-y-auto space-y-3 p-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {filteredPersonalities.map(p => (
            <SelectableCard
              key={p.id}
              title={p.title}
              description={p.description}
              isSelected={selectedPersonalityId === p.id}
              onSelect={() => onPersonalitySelect(p.id)}
            />
          ))}
        </div>
      </div>

      {/* Columna de Temas */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-center">2. Elige un Tema para la Partida</h3>
        <input
          type="text"
          placeholder="Buscar tema..."
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="w-full bg-gray-800 border-gray-600 rounded-lg p-3"
        />
        <div className="max-h-96 overflow-y-auto space-y-3 p-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {filteredTopics.map(t => (
            <SelectableCard
              key={t.id}
              title={t.title}
              description={t.prompt} // Usamos el prompt como descripción
              isSelected={selectedTopicId === t.id}
              onSelect={() => onTopicSelect(t.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameSettingsSelector;