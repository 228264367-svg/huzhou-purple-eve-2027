import { build } from "esbuild";
import { copyFile, writeFile } from "node:fs/promises";
await copyFile(
  "node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2",
  "assets/instrument.woff2",
);
const result = await build({
  entryPoints: ["src/main.jsx"],
  bundle: true,
  minify: true,
  metafile: true,
  format: "iife",
  target: "es2020",
  entryNames: "invitation-[hash]",
  outdir: "assets",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
});
const script = Object.keys(result.metafile.outputs)[0];
const page = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>午夜花火 · 湖州跨年邀请函</title><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f4f0e9"><meta name="robots" content="noindex,nofollow"><meta name="description" content="穿一抹紫，去湖州泡温泉，在午夜给朋友颁个奖。"><meta property="og:title" content="午夜花火 · 湖州好友跨年"><meta property="og:image" content="assets/share-cover.jpg"><link rel="icon" href="data:,"><link rel="stylesheet" href="invitation.css?v=13"><link rel="preload" as="font" type="font/woff2" crossorigin href="assets/instrument.woff2"><script defer src="${script}"></script></head><body><div id="root"></div><noscript>湖州好友跨年，12 月 31 日至元旦。请开启 JavaScript 体验互动邀请函。</noscript></body></html>`;
await Promise.all(
  ["index.html", "awards.html", "bath.html"].map((name) =>
    writeFile(name, page),
  ),
);
