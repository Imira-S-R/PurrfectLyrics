import type { LyricLine } from "../types";

export function useActiveIndex(lines: LyricLine[], currentTime: number): number {
    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (currentTime >= lines[i].time) idx = i;
        else break;
    }
    return idx;
}