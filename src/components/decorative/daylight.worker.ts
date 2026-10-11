/**
 * Makes the paper's relief off the main thread, so the page never waits for
 * it. Daylight.tsx sends nothing and receives the tile, its pixels handed
 * over rather than copied.
 */
import { reliefTile } from "@/lib/rock";

const paper = reliefTile("paper", 256, 11);
(self as unknown as Worker).postMessage(paper, [paper.data.buffer]);
