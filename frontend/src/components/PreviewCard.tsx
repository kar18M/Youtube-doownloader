import React from 'react';
import type { VideoMeta } from '../types';
import { motion } from 'framer-motion';
import { Eye, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';

interface PreviewCardProps {
    data: VideoMeta;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ data }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-mk-card rounded-2xl p-4 md:p-6 shadow-soft-lg flex flex-col md:flex-row gap-6 mb-8 border border-neutral-100"
        >
            <div className="w-full md:w-[320px] shrink-0 rounded-xl overflow-hidden shadow-md relative aspect-video group">
                <img
                    src={data.thumbnailUrl}
                    alt={`Thumbnail for ${data.title}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <h2 className="text-3xl leading-none line-clamp-2 md:line-clamp-none" title={data.title}>
                        {data.title}
                    </h2>

                    {data.license === 'cc' ? (
                        <div className="group relative">
                            <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide cursor-help">
                                <ShieldCheck size={14} /> CC
                            </span>
                            <div className="absolute bottom-full right-0 mb-2 w-max px-2 py-1 bg-mk-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Creative Commons
                            </div>
                        </div>
                    ) : (
                        <div className="group relative">
                            <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wide cursor-help">
                                <ShieldAlert size={14} /> Copyright
                            </span>
                            <div className="absolute bottom-full right-0 mb-2 w-max px-2 py-1 bg-mk-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Copyrighted Owner Only
                            </div>
                        </div>
                    )}
                </div>

                <p className="text-lg font-semibold text-mk-muted mb-4">{data.author}</p>

                <div className="flex items-center gap-6 text-sm text-mk-muted font-medium">
                    <div className="flex items-center gap-2">
                        <Eye size={16} />
                        <span>{data.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{data.duration}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
