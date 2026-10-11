/**
 * Makes the rock's relief off the main thread: it takes about a second, and
 * the page should not stop for it. Rock.tsx sends nothing and receives both
 * tiles, their pixels handed over rather than copied.
 */
import { reliefTile } from "@/lib/rock";

const forms = reliefTile("forms", 512, 7);
const grain = reliefTile("grain", 256, 3);
(self as unknown as Worker).postMessage({ forms, grain }, [forms.data.buffer, grain.data.buffer]);
