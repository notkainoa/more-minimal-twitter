/** @type {import('next').NextConfig} */
module.exports = {
  // Avoid walking up the tree for package-lock.json / yarn.lock (Next hashes them
  // for server output tracing). A lockfile in a parent folder outside this repo
  // can be unreadable on macOS (EPERM) and break `next build`.
  outputFileTracing: false,
};
