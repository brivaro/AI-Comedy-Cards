import React, { useState } from 'react';
import { MagnifyingGlass, Robot, BookOpen, Check } from 'phosphor-react';

interface Topic {
  id: number;
  title: string;
  prompt: string;
  is_public: boolean;
  owner_username: string;
}

interface Personality {
  id: number;
  title: string;
  description: string;
}

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
      className={`glass-card rounded-xl p-4 border-2 cursor-pointer transition-all duration-300 relative group overflow-hidden ${
        isSelected 
          ? 'border-cyan-400 ring-2 ring-cyan-500/50 shadow-xl shadow-cyan-500/30 scale-[1.02]' 
          : 'border-slate-600/30 hover:border-cyan-500/50 hover:scale-[1.01] hover:shadow-lg hover:shadow-cyan-500/10'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
      
      {isSelected && (
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg animate-pop-in">
          <Check className="w-4 h-4 text-white" weight="bold" />
        </div>
      )}
      
      <div className="flex items-start gap-3 relative z-10">
        {icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
            isSelected ? 'bg-cyan-500/30 shadow-lg shadow-cyan-500/20' : 'bg-slate-700/50 group-hover:bg-cyan-500/20'
          }`}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold text-base mb-1.5 truncate transition-colors ${
            isSelected ? 'text-cyan-300' : 'text-white group-hover:text-cyan-200'
          }`}>
            {title}
          </h4>
          <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
            {description}
          </p>
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

  const filteredTopics = availableTopics.filter(t => {
    const searchTerm = topicFilter.toLowerCase();
    return (
      t.title.toLowerCase().includes(searchTerm) || 
      t.prompt.toLowerCase().includes(searchTerm)
    );
  });
  
  const filteredPersonalities = availablePersonalities.filter(p => {
    const searchTerm = personalityFilter.toLowerCase();
    return (
      p.title.toLowerCase().includes(searchTerm) || 
      p.description.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Robot className="w-6 h-6 text-white" weight="bold" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-white leading-tight">1. Personalidad</h3>
            <p className="text-xs text-gray-400 leading-tight">¿Cómo actuará la IA?</p>
          </div>
        </div>
        
        <div className="relative flex-shrink-0">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none">
            <MagnifyingGlass className="w-5 h-5" weight="bold" />
          </div>
          <input
            type="text"
            placeholder="Buscar..."
            value={personalityFilter}
            onChange={(e) => setPersonalityFilter(e.target.value)}
            className="w-full bg-slate-900/90 border-2 border-slate-600/50 rounded-xl pl-11 pr-4 py-3 text-white"
          />
        </div>

        <div className="space-y-2.5 lg:max-h-[50vh] lg:overflow-y-auto px-4 py-4 lg:pr-4 scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent">
          {filteredPersonalities.length > 0 ? (
            filteredPersonalities.map(p => (
              <SelectableCard
                key={p.id}
                title={p.title}
                description={p.description}
                isSelected={selectedPersonalityId === p.id}
                onSelect={() => onPersonalitySelect(p.id)}
                icon={<Robot className="w-5 h-5 text-cyan-400" weight="bold" />}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No se encontraron personalidades</p>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2 flex flex-col space-y-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <BookOpen className="w-6 h-6 text-white" weight="bold" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-white leading-tight">2. Tema del Juego</h3>
            <p className="text-xs text-gray-400 leading-tight">¿De qué hablarán las cartas?</p>
          </div>
        </div>
        
        <div className="relative flex-shrink-0">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
            <MagnifyingGlass className="w-5 h-5" weight="bold" />
          </div>
          <input
            type="text"
            placeholder="Buscar por título o descripción..."
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="w-full bg-slate-900/90 border-2 border-slate-600/50 rounded-xl pl-11 pr-4 py-3 text-white"
          />
        </div>

        <div className="space-y-2.5 lg:max-h-[50vh] lg:overflow-y-auto px-4 py-4 lg:pr-4 scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-transparent">
          {filteredTopics.length > 0 ? (
            filteredTopics.map(t => (
              <SelectableCard
                key={t.id}
                title={t.title}
                description={t.prompt}
                isSelected={selectedTopicId === t.id}
                onSelect={() => onTopicSelect(t.id)}
                icon={<BookOpen className="w-5 h-5 text-blue-400" weight="bold" />}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No se encontraron temas</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default GameSettingsSelector;