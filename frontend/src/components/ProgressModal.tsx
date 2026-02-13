import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';

interface ProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProgressModal: React.FC<ProgressModalProps & { jobId: string | null; filename?: string }> = ({ isOpen, onClose, jobId, filename = "video.mp4" }) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'initializing' | 'downloading' | 'processing' | 'complete' | 'error'>('initializing');
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    // Use environment variable if set, otherwise fallback to the known working backend
    const API_URL = import.meta.env.VITE_API_URL || 'https://youtube-downloader-1-6e7a.onrender.com/api';

    useEffect(() => {
        if (isOpen && jobId) {
            // Reset state on open
            setProgress(0);
            setStatus('initializing');
            setDownloadUrl(null);

            const pollInterval = setInterval(async () => {
                try {
                    const res = await fetch(`${API_URL}/progress/${jobId}`);
                    if (!res.ok) {
                        // Maybe handle 404 if job cleared?
                        return;
                    }
                    const data = await res.json();

                    if (data.status === 'error') {
                        setStatus('error');
                        clearInterval(pollInterval);
                        return;
                    }

                    setStatus(data.status);
                    setProgress(data.progress || 0);

                    if (data.status === 'complete') {
                        clearInterval(pollInterval);
                        setDownloadUrl(`${API_URL}/get-file/${jobId}`);
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 500);

            return () => clearInterval(pollInterval);
        } else {
            // Reset if closed or no job yet
            setProgress(0);
        }
    }, [isOpen, jobId]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 md:left-auto md:right-8 md:bottom-8 md:w-[400px] bg-mk-card md:rounded-2xl rounded-t-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl">
                                    {status === 'complete' ? 'Download Ready' : 'Processing...'}
                                </h3>
                                <button onClick={onClose} className="p-1 hover:bg-mk-smoke rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {status !== 'complete' ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-mk-muted uppercase">
                                        <span>
                                            {status === 'processing' ? 'Merging Audio...'
                                                : status === 'initializing' ? 'Starting...'
                                                    : 'Downloading Stream...'}
                                        </span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="h-3 bg-mk-smoke rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-mk-blood-red to-orange-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ ease: "linear" }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle size={24} />
                                    </div>
                                    <p className="text-mk-muted mb-6">Your file has been prepared successfully.</p>
                                    <a
                                        href={downloadUrl || '#'}
                                        download={filename}
                                        className="w-full py-3 bg-mk-black text-white font-bold rounded-xl text-lg hover:bg-mk-blood-red transition-colors flex items-center justify-center gap-2"
                                        onClick={(e) => {
                                            if (!downloadUrl) e.preventDefault();
                                        }}
                                    >
                                        <DownloadIcon /> Save to Device
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Draggable handle for mobile look */}
                        <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-neutral-200 rounded-full" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const DownloadIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);
