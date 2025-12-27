import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';

export function EditableText({
  value,
  onSave,
  className,
  multiline = false,
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
      onSave(localValue.trim() || placeholder); // Prevent empty save if desired, or allow
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
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={clsx("cursor-text hover:bg-white/5 rounded", className)}
    >
      {value || <span className="opacity-50 italic">{placeholder}</span>}
    </div>
  );
}
