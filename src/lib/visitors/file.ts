import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { parseCount, type VisitorCounter } from "./types";

/**
 * A counter kept in a JSON file. For development only.
 *
 * Increments are serialised through a promise chain, so two concurrent calls
 * in this process cannot both read the same value and write the same total.
 * That guarantee stops at the process boundary: two server instances sharing
 * no disk would each keep their own number. Production wants the Redis
 * counter, and index.ts says so out loud when it does not get one.
 */
export function createFileCounter(path: string): VisitorCounter {
  let queue: Promise<unknown> = Promise.resolve();

  function serialise<T>(task: () => Promise<T>): Promise<T> {
    const run = queue.then(task, task);
    // Swallow failures on the chain itself so one error does not poison every
    // later call; the caller still sees its own rejection through `run`.
    queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  /**
   * A missing file is a counter that has never been incremented. Anything
   * else that is not `{ "count": <n> }` is corrupt, and is refused rather
   * than read as zero — reading it as zero would let the next visit write 1
   * over whatever the real total was.
   */
  async function read(): Promise<number> {
    let raw: string;
    try {
      raw = await readFile(path, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return 0;
      throw error;
    }

    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed) ||
      !("count" in parsed)
    ) {
      throw new Error(`Visit file is not a count record: ${path}`);
    }
    const count = (parsed as { count: unknown }).count;
    if (count === null) {
      throw new Error(`Visit file holds a null count: ${path}`);
    }
    return parseCount(count);
  }

  return {
    increment() {
      return serialise(async () => {
        const next = (await read()) + 1;
        await mkdir(dirname(path), { recursive: true });
        await writeFile(path, `${JSON.stringify({ count: next })}\n`, "utf8");
        return next;
      });
    },
    getCount() {
      return serialise(read);
    },
  };
}
