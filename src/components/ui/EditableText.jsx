import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';

export function EditableText({
  value,
  onSave,
  className,
  multiline = false,
  activationMode = 'click', // 'click' | 'double-click'
  placeholder = 'Type here...'
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (localValue.trim() !== value) {
      onSave(localValue.trim() || placeholder);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave();
    }
    if (e.key === 'Escape') {
      setLocalValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    const Component = multiline ? 'textarea' : 'input';
    return (
      <Component
        ref={inputRef}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={clsx(
          "bg-transparent outline-none border-b border-text-gold text-inherit w-full",
          className
        )}
        placeholder={placeholder}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div
      onClick={(e) => {
        if (activationMode === 'click') {
          e.stopPropagation();
          setIsEditing(true);
        }
      }}
      onDoubleClick={(e) => {
        if (activationMode === 'double-click') {
          e.stopPropagation();
          setIsEditing(true);
        }
      }}
      className={clsx("cursor-text hover:bg-white/5 rounded", className)}
    >
      {value || <span className="opacity-50 italic">{placeholder}</span>}
    </div>
  );
}
