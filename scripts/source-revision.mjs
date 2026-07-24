import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

export async function sourceRevision(root) {
  const roots = ["book", "dsl", "content/podcast"];
  const entries = [];

  async function visit(relative) {
    for (const entry of await readdir(join(root, relative), { withFileTypes: true })) {
      const child = join(relative, entry.name);
      if (
        entry.isDirectory() &&
        (entry.name === "_book" || entry.name.endsWith("_files"))
      ) {
        continue;
      }
      if (entry.isDirectory()) await visit(child);
      else if (entry.isFile()) entries.push(child);
    }
  }

  for (const relative of roots) await visit(relative);
  entries.sort();
  const digest = createHash("sha256");
  for (const relative of entries) {
    digest.update(relative);
    digest.update("\0");
    digest.update(await readFile(join(root, relative)));
    digest.update("\0");
  }
  return { algorithm: "sha256", digest: digest.digest("hex"), inputs: roots };
}
