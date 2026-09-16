import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFileCounter } from "./file";

let dir: string;
let path: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "visits-"));
  // A directory that does not exist yet, as on a fresh checkout.
  path = join(dir, "nested", "visits.json");
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("file counter", () => {
  it("starts at zero when nothing has been written", async () => {
    await expect(createFileCounter(path).getCount()).resolves.toBe(0);
  });

  it("creates its directory and records each increment", async () => {
    const counter = createFileCounter(path);

    await expect(counter.increment()).resolves.toBe(1);
    await expect(counter.increment()).resolves.toBe(2);
    await expect(counter.getCount()).resolves.toBe(2);

    expect(JSON.parse(await readFile(path, "utf8"))).toEqual({ count: 2 });
  });

  it("persists across instances, as it must across restarts", async () => {
    await createFileCounter(path).increment();
    await createFileCounter(path).increment();

    await expect(createFileCounter(path).getCount()).resolves.toBe(2);
  });

  it("reading does not change the count", async () => {
    const counter = createFileCounter(path);
    await counter.increment();

    await counter.getCount();
    await counter.getCount();

    await expect(counter.getCount()).resolves.toBe(1);
  });

  it("loses no increments when many arrive at once", async () => {
    const counter = createFileCounter(path);

    const results = await Promise.all(
      Array.from({ length: 50 }, () => counter.increment()),
    );

    // Every caller saw a different total, and together they account for
    // every visit — which is only true if no two read the same value.
    expect([...results].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 50 }, (_, i) => i + 1),
    );
    await expect(counter.getCount()).resolves.toBe(50);
  });

  it("keeps reads and writes in order when they are interleaved", async () => {
    const counter = createFileCounter(path);

    const [a, readBetween, b] = await Promise.all([
      counter.increment(),
      counter.getCount(),
      counter.increment(),
    ]);

    expect([a, readBetween, b]).toEqual([1, 1, 2]);
  });

  describe("refuses a file it cannot trust, rather than reading it as zero", () => {
    // Reading any of these as zero would let the next visit write 1 over
    // whatever the real total was.
    it.each([
      ["malformed JSON", "{ count: 3"],
      ["an array", "[3]"],
      ["null", "null"],
      ["a bare number", "3"],
      ["an object with no count", "{}"],
      ["a null count", '{"count":null}'],
      ["a non-numeric count", '{"count":"lots"}'],
      ["a negative count", '{"count":-3}'],
    ])("%s", async (_, contents) => {
      await createFileCounter(path).increment(); // creates the directory
      await writeFile(path, contents, "utf8");
      const counter = createFileCounter(path);

      await expect(counter.getCount()).rejects.toThrow();
      await expect(counter.increment()).rejects.toThrow();

      // And nothing was written over it.
      expect(await readFile(path, "utf8")).toBe(contents);
    });
  });

  it("recovers once the file is repaired — one failure does not jam the queue", async () => {
    const counter = createFileCounter(path);
    await counter.increment();
    await writeFile(path, "not json", "utf8");

    await expect(counter.increment()).rejects.toThrow();

    await writeFile(path, '{"count":41}', "utf8");
    await expect(counter.increment()).resolves.toBe(42);
  });
});
