export interface LyricLine {
    time: number;
    text: string;
}

export interface PlaylistSong {
    trackName: string,
    artistName: string
}

export interface SongInfo {
    trackName: string;
    artistName: string;
    duration?: number;
}