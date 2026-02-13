import React, { useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchHeroProps {
    onSearch: (url: string) => void;
    isLoading: boolean;
}

export const SearchHero: React.FC<SearchHeroProps> = ({ onSearch, isLoading }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                // Common search shortcut, though user asked for 'S'
            }
            if (e.key.toLowerCase() === 's' && document.activeElement !== inputRef.current) {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputRef.current?.value) {
            onSearch(inputRef.current.value);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto mb-12 text-center">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl mb-6 text-mk-black"
            >
                Youtube <span className="text-mk-blood-red">Downloader</span>
            </motion.h1>

            <motion.form
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                onSubmit={handleSubmit}
                className="relative group"
            >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-mk-muted group-focus-within:text-mk-blood-red transition-colors" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Paste YouTube Link (Press 'S' to focus)"
                    className="w-full pl-12 pr-4 py-5 text-lg rounded-2xl bg-mk-card shadow-soft-lg border-2 border-transparent focus:border-mk-blood-red transition-all"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute inset-y-2 right-2 px-6 bg-mk-black text-white rounded-xl font-bebas text-xl tracking-wider hover:bg-mk-blood-red transition-colors disabled:opacity-70"
                >
                    {isLoading ? '...' : 'GO'}
                </button>
            </motion.form>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-4 text-mk-muted text-sm font-medium"
            >
                Only Creative Commons & verified owner downloads allowed.
            </motion.p>
        </div>
    );
};
