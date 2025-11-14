import React, { useState } from 'react';
import { Topic, Personality } from '../../../types';
import { Input } from '../../ui/Input';
import { MagnifyingGlass, Robot, BookOpen, Check } from 'phosphor-react';
import clsx from 'clsx';

interface SelectableCardProps {
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
  icon?: React.ReactNode;
}

const SelectableCard: React.FC<SelectableCardProps> = ({ 
  title, 
  description, 
  isSelected, 
  onSelect,
  icon 
}) => {
  return (
    <div
      onClick={onSelect}
      className={clsx(
        'glass-card rounded-xl p-4 border-2 cursor-pointer transition-all duration-300 hover-lift relative overflow-hidden',
        isSelected 
          ? 'border-purple-500 ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/20' 
          : 'border-white/10 hover:border-purple-500/30'
      )}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
          <Check className="w-4 h-4 text-white" weight="bold" />
        </div>
      )}
      
      <div className="flex items-start gap-3">
        {icon && (
          <div className={clsx(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            isSelected ? 'bg-purple-500/20' : 'bg-white/5'
          )}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-lg text-white mb-1 truncate">{title}</h4>
          <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">{description}</p>
        </div>
      </div>
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
  const [topicFilter, setTopicFilter] = useState('');
  const [personalityFilter, setPersonalityFilter] = useState('');

  const filteredTopics = availableTopics.filter(t => 
    t.title.toLowerCase().includes(topicFilter.toLowerCase())
  );
  
  const filteredPersonalities = availablePersonalities.filter(p => 
    p.title.toLowerCase().includes(personalityFilter.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Columna de Personalidades */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Robot className="w-5 h-5 text-purple-400" weight="bold" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">1. Personalidad IA</h3>
            <p className="text-sm text-gray-400">¿Cómo debe actuar la IA?</p>
          </div>
        </div>
        
        <Input
          type="text"
          placeholder="Buscar personalidad..."
          value={personalityFilter}
          onChange={(e) => setPersonalityFilter((e.target as HTMLInputElement).value)}
          icon={<MagnifyingGlass className="w-5 h-5" weight="bold" />}
        />
        
        <div className="max-h-96 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent pr-2">
          {filteredPersonalities.map(p => (
            <SelectableCard
              key={p.id}
              title={p.title}
              description={p.description}
              isSelected={selectedPersonalityId === p.id}
              onSelect={() => onPersonalitySelect(p.id)}
              icon={<Robot className="w-5 h-5 text-purple-400" weight="bold" />}
            />
          ))}
        </div>
      </div>

      {/* Columna de Temas */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-400" weight="bold" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">2. Tema de Juego</h3>
            <p className="text-sm text-gray-400">¿De qué hablarán las cartas?</p>
          </div>
        </div>
        
        <Input
          type="text"
          placeholder="Buscar tema..."
          value={topicFilter}
          onChange={(e) => setTopicFilter((e.target as HTMLInputElement).value)}
          icon={<MagnifyingGlass className="w-5 h-5" weight="bold" />}
        />
        
        <div className="max-h-96 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent pr-2">
          {filteredTopics.map(t => (
            <SelectableCard
              key={t.id}
              title={t.title}
              description={t.prompt}
              isSelected={selectedTopicId === t.id}
              onSelect={() => onTopicSelect(t.id)}
              icon={<BookOpen className="w-5 h-5 text-blue-400" weight="bold" />}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameSettingsSelector;