import type { LyricLine, PlaylistSong } from "./types";

export const findCurrentIndex = (trackName: string, playlist: PlaylistSong[]) => {
    return playlist.findIndex(song => song.trackName === trackName);
};

export function parseLRC(raw: string): LyricLine[] {
    const regex = /\[(\d{2}):(\d{2}\.\d+)\](.*)/;
    return raw
        .split("\n")
        .map((line) => {
            const m = line.match(regex);
            if (!m) return null;
            const time = parseInt(m[1]) * 60 + parseFloat(m[2]);
            return { time, text: m[3].trim() };
        })
        .filter((l): l is LyricLine => l !== null && l.text.length > 0);
}

