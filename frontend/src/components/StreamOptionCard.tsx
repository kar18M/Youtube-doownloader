import type { StreamOption } from '../types';
import { motion } from 'framer-motion';
import { Download, Video, Music } from 'lucide-react';
import clsx from 'clsx';

interface StreamOptionCardProps {
    option: StreamOption;
    onDownload: (option: StreamOption) => void;
}

export const StreamOptionCard: React.FC<StreamOptionCardProps> = ({ option, onDownload }) => {
    const isAudio = option.type === 'audio';
    const isVideoOnly = option.type === 'video' && !option.isProgressive;

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-mk-card rounded-2xl p-5 border border-neutral-100 shadow-soft-lg hover:shadow-soft-2xl transition-all flex flex-col justify-between group h-full"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={clsx(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isAudio ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                )}>
                    {isAudio ? <Music size={20} /> : <Video size={20} />}
                </div>
                <span className="text-xs font-bold text-mk-muted uppercase tracking-wider">
                    {option.mimeType.split('/')[1]}
                </span>
            </div>

            <div>
                <h3 className="text-2xl mb-1 flex items-center gap-2">
                    {option.resolution}
                    {isVideoOnly && (
                        <span className="text-[10px] bg-mk-black text-white px-1.5 py-0.5 rounded ml-1 font-inter font-normal tracking-normal -translate-y-0.5">
                            NO AUDIO
                        </span>
                    )}
                </h3>
                <p className="text-sm text-mk-muted font-medium mb-6">
                    {option.type === 'video' ? 'Video Stream' : 'Audio Stream'} • {option.sizeMatches}
                </p>
            </div>

            <button
                onClick={() => onDownload(option)}
                className="w-full py-3 rounded-xl bg-mk-smoke text-mk-black font-bold flex items-center justify-center gap-2 group-hover:bg-mk-black group-hover:text-white transition-colors"
            >
                <Download size={18} />
                <span>Download</span>
            </button>
        </motion.div>
    );
};
