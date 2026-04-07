import { useEffect, useState } from "react";
import type { LyricLine, SongInfo } from "../types";
import { parseLRC } from "../utils";

export default function useLyrics(track: string, artist: string) {
    const [lines, setLines] = useState<LyricLine[]>([]);
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
    const [songInfo, setSongInfo] = useState<SongInfo>({ trackName: "", artistName: "" });

    useEffect(() => {
        setStatus("loading");
        const url = `https://lrclib.net/api/search?q=${encodeURIComponent(`${track} ${artist}`)}`;
        fetch(url)
            .then((r) => r.json())
            .then((data) => {
                const match = data?.find((item: any) => item.syncedLyrics) ?? data?.[0];
                if (match?.syncedLyrics) {
                    setSongInfo({
                        trackName: match.trackName,
                        artistName: match.artistName,
                        duration: match.duration,
                    });
                    setLines(parseLRC(match.syncedLyrics));
                    setStatus("done");
                } else {
                    setStatus("error");
                }
            })
            .catch(() => setStatus("error"));
    }, [track, artist]);

    return { lines, status, songInfo };
}