import React, { useState } from 'react';
import { SearchHero } from '../components/SearchHero';
import { PreviewCard } from '../components/PreviewCard';
import { StreamOptionCard } from '../components/StreamOptionCard';
import { ProgressModal } from '../components/ProgressModal';
import type { VideoMeta, StreamOption } from '../types';
import { motion } from 'framer-motion';

export const Home: React.FC = () => {
    const [data, setData] = useState<VideoMeta | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);
    const [filename, setFilename] = useState("video.mp4");

    const [currentUrl, setCurrentUrl] = useState('');
    const API_URL = '/api';

    const handleSearch = async (url: string) => {
        setLoading(true);
        setError('');
        setData(null);
        setCurrentUrl(url); // Store for later use

        try {
            const response = await fetch(`${API_URL}/video-info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch video info');
            }

            const rawData = await response.json();

            // Adapt API response to our Frontend Types
            const adaptedData: VideoMeta = {
                title: rawData.title,
                author: rawData.author,
                thumbnailUrl: rawData.thumbnail_url,
                views: rawData.views,
                duration: "Unknown", // API doesn't send duration yet
                license: 'standard', // Defaulting as API doesn't send license
                streams: rawData.streams.map((s: any) => ({
                    itag: s.itag,
                    resolution: s.resolution,
                    mimeType: s.mime_type,
                    sizeMatches: s.filesize_approx ? `${(s.filesize_approx / (1024 * 1024)).toFixed(1)} MB` : 'Unknown',
                    type: s.type,
                    isProgressive: s.type === 'progressive'
                }))
            };

            setData(adaptedData);
        } catch (err: any) {
            // Show detailed error for debugging
            let msg = 'Could not find video.';
            if (err.message) msg += ` Details: ${err.message}`;
            setError(msg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (option: StreamOption) => {
        setCurrentJobId(null);
        setShowModal(true);

        const fName = `video.${option.mimeType.split('/')[1]}`;
        setFilename(fName);

        try {
            const response = await fetch(`${API_URL}/start-download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: currentUrl,
                    itag: option.itag,
                    type: option.type
                })
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentJobId(data.job_id);
            } else {
                console.error("Failed to start download");
                setError("Failed to start download process.");
                setShowModal(false);
            }
        } catch (e: any) {
            console.error("Start download failed", e);
            setError(`Start download failed: ${e.message}`);
            setShowModal(false);
        }
    };

    return (
        <div className="min-h-screen pb-20">
            <div className="container mx-auto px-4 pt-12 md:pt-20">
                <SearchHero onSearch={handleSearch} isLoading={loading} />

                {error && (
                    <div className="text-center text-red-500 font-bold mb-8 bg-red-50 p-4 rounded-xl max-w-lg mx-auto border border-red-100">
                        {error}
                    </div>
                )}

                {data && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <PreviewCard data={data} />

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            initial="hidden"
                            animate="show"
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.05
                                    }
                                }
                            }}
                        >
                            {data.streams.map((stream) => (
                                <motion.div
                                    key={stream.itag}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        show: { opacity: 1, y: 0 }
                                    }}
                                >
                                    <StreamOptionCard
                                        option={stream}
                                        onDownload={handleDownload}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </div>

            <ProgressModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                jobId={currentJobId}
                filename={filename}
            />

            {/* Simple Footer */}
            <footer className="text-center text-mk-muted text-sm mt-20 pb-8">
                <div className="flex justify-center gap-6 mb-2">
                    <a href="#" className="hover:text-mk-black">Terms</a>
                    <a href="#" className="hover:text-mk-black">Privacy</a>
                    <a href="#" className="hover:text-mk-black">DMCA</a>
                </div>
                <p>&copy; {new Date().getFullYear()} YouTube Downloader. All rights reserved.</p>
            </footer>
        </div>
    );
};
