import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface SRVAutoCompleteProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
}

export function SRVAutoComplete({
  options,
  value,
  onChange,
  placeholder = 'Buscar...',
  className,
  label,
  required
}: SRVAutoCompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal search term with external value
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset search term to value if nothing was selected
        setSearchTerm(value);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const handleSelect = (option: string) => {
    onChange(option);
    setSearchTerm(option);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onChange(e.target.value); // Allow free typing too
    if (!isOpen) setIsOpen(true);
  };

  return (
    <div className={cn("relative w-full space-y-1.5", className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
          <Search size={14} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all uppercase placeholder:normal-case font-medium"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                onChange('');
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <ChevronDown size={14} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
          </button>
        </div>
      </div>

      {isOpen && (filteredOptions.length > 0 || searchTerm !== '') && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded shadow-lg max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100">
          {filteredOptions.length > 0 ? (
            <div className="py-1">
              {filteredOptions.map((option, index) => (
                <button
                  key={`${option}-${index}`}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors uppercase font-medium",
                    value === option ? "text-brand-accent bg-brand-accent/5" : "text-slate-700"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-xs text-slate-400 italic">
              Nenhum ativo encontrado. Pressione Enter para adicionar "{searchTerm}".
            </div>
          )}
        </div>
      )}
    </div>
  );
}
