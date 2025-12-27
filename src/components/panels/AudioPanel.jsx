import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Play, Pause, Plus, Trash2, SkipForward, Shuffle, GripVertical, Volume2, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStores } from '../../contexts/StoreContext';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ATMOSPHERES } from '../../lib/audio/AmbientEngine';

// Sortable playlist item component
const SortablePlaylistItem = observer(function SortablePlaylistItem({ item, index, audioStore, onPlay }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: audioStore.currentIndex === index && audioStore.isPlaying ? 'var(--gold-muted)' : 'var(--panel)',
    color: audioStore.currentIndex === index && audioStore.isPlaying ? 'white' : 'var(--ink-secondary)'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer group"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 opacity-30 hover:opacity-70 transition-opacity"
        title="Drag to reorder"
      >
        <GripVertical size={12} />
      </div>

      {/* Index/Playing indicator */}
      <div
        className="w-4 h-4 flex items-center justify-center text-[10px] font-mono opacity-50"
        onClick={() => onPlay(index)}
      >
        {audioStore.currentIndex === index && audioStore.isPlaying ? (
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>▶</motion.div>
        ) : (
          index + 1
        )}
      </div>

      {/* Title with tooltip */}
      <div
        className="flex-1 text-xs font-medium truncate cursor-pointer"
        onClick={() => onPlay(index)}
        title={item.title}
      >
        {item.title}
      </div>

      {/* Video ID */}
      <div className="text-[10px] opacity-50 font-mono">{item.id.substring(0, 6)}...</div>

      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); audioStore.removeFromPlaylist(item.id); }}
        className="opacity-0 group-hover:opacity-60 transition-opacity p-1 hover:text-red-400"
        title="Remove"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
});

// Atmosphere option component (compact version for collapsed view)
const AtmosphereOption = observer(function AtmosphereOption({ atmosphere, isActive, onSelect }) {
  return (
    <button
      onClick={() => onSelect(atmosphere.id)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left group ${isActive ? 'ring-1 ring-[var(--gold-muted)]' : ''
        }`}
      style={{
        background: isActive ? 'var(--gold-muted)' : 'var(--panel)',
        color: isActive ? 'white' : 'var(--ink-secondary)'
      }}
    >
      <span className="text-base">{atmosphere.icon}</span>
      <div className="flex-1">
        <div className={`text-xs font-medium ${isActive ? 'text-white' : 'text-ink-primary'}`}>
          {atmosphere.name}
        </div>
      </div>
      {isActive && (
        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      )}
    </button>
  );
});

export const AudioPanel = observer(function AudioPanel() {
  const { audioStore } = useStores();
  const [urlInput, setUrlInput] = useState('');
  const [atmosphereExpanded, setAtmosphereExpanded] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleAddToPlaylist = () => {
    if (!urlInput.trim()) return;
    const success = audioStore.addToPlaylist(urlInput.trim());
    if (success) {
      setUrlInput('');
    } else {
      alert('Invalid URL or already in playlist');
    }
  };

  const handlePlay = (index) => {
    audioStore.play(index);
  };

  const handleStop = () => {
    audioStore.stop();
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = audioStore.playlist.findIndex(item => item.id === active.id);
    const newIndex = audioStore.playlist.findIndex(item => item.id === over.id);
    audioStore.reorderPlaylist(oldIndex, newIndex);
  };

  const atmosphereList = Object.values(ATMOSPHERES);
  const currentAtmosphere = ATMOSPHERES[audioStore.activeAtmosphere];

  return (
    <div className="flex flex-col h-full bg-bg-panel text-text-main p-6 overflow-y-auto">

      {/* MUSIC SECTION - NOW ON TOP */}
      <div className="mb-6">
        <div className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-4 pb-2"
          style={{ borderBottom: '1px solid var(--toggle-border)' }}>
          Music
        </div>

        {/* Visualizer - Calm Breathing */}
        <div className="mb-4 shrink-0 rounded-xl flex items-center justify-center gap-1.5 overflow-hidden"
          style={{ height: 80, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--toggle-border)' }}>
          {audioStore.isPlaying && Array.from({ length: 14 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ height: [10, 30 + (i % 4) * 10, 10] }}
              transition={{
                repeat: Infinity,
                duration: 2.5 + (i % 3) * 0.4,
                ease: "easeInOut",
                delay: i * 0.12
              }}
              style={{
                width: 6,
                minWidth: 6,
                borderRadius: 3,
                backgroundColor: '#A8915A'
              }}
            />
          ))}
          {!audioStore.isPlaying && <div className="text-ink-muted text-xs uppercase tracking-wide">Paused</div>}
        </div>

        {/* Master Control */}
        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={() => audioStore.isPlaying ? handleStop() : handlePlay()}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg"
            style={{ background: 'var(--gold-muted)', color: 'var(--bg)' }}
          >
            {audioStore.isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
          </button>
          <button
            onClick={() => audioStore.next()}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all self-center"
            style={{ background: 'var(--panel)', border: '1px solid var(--btn-border-subtle)', color: 'var(--icon-on-bg)' }}
            title="Next Track"
          >
            <SkipForward size={14} />
          </button>
          <button
            onClick={() => audioStore.shufflePlaylist()}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all self-center"
            style={{ background: 'var(--panel)', border: '1px solid var(--btn-border-subtle)', color: 'var(--icon-on-bg)' }}
            title="Shuffle"
          >
            <Shuffle size={14} />
          </button>
        </div>

        {/* Music Volume Control */}
        <div className="flex items-center gap-3 px-2 py-2 mb-4 rounded-lg" style={{ background: 'var(--panel)' }}>
          <Volume2 size={14} className="text-ink-muted" />
          <div className="flex-1 h-1.5 rounded-full relative" style={{ background: 'var(--toggle-border)' }}>
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all"
              style={{
                width: `${audioStore.musicVolume * 100}%`,
                background: 'var(--gold-muted)'
              }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={audioStore.musicVolume * 100}
              onChange={(e) => audioStore.setMusicVolume(Number(e.target.value) / 100)}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-[10px] text-ink-muted font-mono w-8">
            {Math.round(audioStore.musicVolume * 100)}%
          </span>
        </div>

        {/* Add URL Input */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Paste YouTube URL"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddToPlaylist()}
            className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--btn-border-subtle)',
              color: 'var(--ink-primary)'
            }}
          />
          <button
            onClick={handleAddToPlaylist}
            className="px-3 rounded-lg transition-all"
            style={{ background: 'var(--gold-muted)', color: 'white' }}
            title="Add to playlist"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Playlist Items with Drag-and-Drop */}
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {audioStore.playlist.length === 0 ? (
            <div className="text-center text-ink-muted text-xs py-4">
              No videos in playlist
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={audioStore.playlist.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {audioStore.playlist.map((item, index) => (
                  <SortablePlaylistItem
                    key={item.id}
                    item={item}
                    index={index}
                    audioStore={audioStore}
                    onPlay={handlePlay}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* ATMOSPHERE SECTION - NOW ON BOTTOM, COLLAPSIBLE */}
      <div>
        {/* Collapsible Header */}
        <button
          onClick={() => setAtmosphereExpanded(!atmosphereExpanded)}
          className="w-full flex items-center justify-between text-xs font-medium text-ink-muted uppercase tracking-wide mb-3 pb-2 hover:text-ink-primary transition-colors"
          style={{ borderBottom: '1px solid var(--toggle-border)' }}
        >
          <div className="flex items-center gap-2">
            {atmosphereExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>Atmosphere</span>
          </div>
          {/* Show current atmosphere when collapsed */}
          {!atmosphereExpanded && audioStore.activeAtmosphere !== 'silence' && (
            <span className="text-[10px] normal-case font-normal px-2 py-0.5 rounded"
              style={{ background: 'var(--gold-muted)', color: 'white' }}>
              {currentAtmosphere?.icon} {currentAtmosphere?.name}
            </span>
          )}
        </button>

        {/* Collapsible Content */}
        <AnimatePresence>
          {atmosphereExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* Atmosphere Options Grid */}
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {atmosphereList.map((atm) => (
                  <AtmosphereOption
                    key={atm.id}
                    atmosphere={atm}
                    isActive={audioStore.activeAtmosphere === atm.id}
                    onSelect={(id) => audioStore.setAtmosphere(id)}
                  />
                ))}
              </div>

              {/* Atmosphere Volume */}
              {audioStore.isAtmosphereActive && (
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg" style={{ background: 'var(--panel)' }}>
                  <Volume2 size={14} className="text-ink-muted" />
                  <div className="flex-1 h-1.5 rounded-full relative" style={{ background: 'var(--toggle-border)' }}>
                    <div
                      className="absolute top-0 left-0 h-full rounded-full transition-all"
                      style={{
                        width: `${audioStore.atmosphereVolume * 100}%`,
                        background: 'var(--gold-muted)'
                      }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={audioStore.atmosphereVolume * 100}
                      onChange={(e) => audioStore.setAtmosphereVolume(Number(e.target.value) / 100)}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <span className="text-[10px] text-ink-muted font-mono w-8">
                    {Math.round(audioStore.atmosphereVolume * 100)}%
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
