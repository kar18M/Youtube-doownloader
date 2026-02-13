export interface StreamOption {
    itag: number;
    resolution: string;
    mimeType: string;
    sizeMatches: string; // e.g., "14.5 MB"
    type: 'video' | 'audio';
    isProgressive: boolean; // "Fast Download"
}

export interface VideoMeta {
    title: string;
    author: string;
    thumbnailUrl: string;
    views: number;
    duration: string;
    license: 'cc' | 'standard';
    streams: StreamOption[];
}
