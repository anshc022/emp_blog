// Renders the /brag composition frame by frame.
//   node render.mjs stills 1.2,4.8,...   -> work/stills/t-<sec>.jpg
//   node render.mjs full                 -> work/frames/00000.jpg ...
import { chromium } from "/tmp/claude-0/-home-user-emp-blog/96c7d785-dfae-5f99-855e-7739c0ec0034/scratchpad/node_modules/playwright/index.mjs";
import fs from "node:fs";
import T from "./timeline.json" with { type: "json" };

const mode = process.argv[2] ?? "stills";
const wanted = (process.argv[3] ?? "").split(",").filter(Boolean).map(Number);
const FPS = T.fps;
const N = Math.round(T.duration * FPS);
const outDir = mode === "full" || mode === "fix" ? "frames" : "stills";
fs.mkdirSync(outDir, { recursive: true });
// "fix" takes frame numbers, "stills" takes seconds.
const wantFrames = new Set(mode === "fix" ? wanted : wanted.map((s) => Math.round(s * FPS)));
const last = mode === "full" ? N - 1 : Math.max(...wantFrames);

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--force-color-profile=srgb", "--hide-scrollbars", "--disable-gpu-rasterization", "--disable-zero-copy"],
});
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, colorScheme: "light", reducedMotion: "reduce" });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.error("pageerror", e.message));
// Keep a handle on the real rAF so we can wait for the compositor after each seek.
await page.addInitScript(() => { window.__realRAF = window.requestAnimationFrame.bind(window); });
await page.clock.install({ time: 0 });
await page.goto("http://localhost:3000/brag", { waitUntil: "load" });
// Let the app hydrate: step the fake clock while giving the event loop real time.
for (let i = 0; i < 80; i++) {
  await page.clock.runFor(250);
  await new Promise((r) => setTimeout(r, 150));
  if (await page.evaluate(() => window.__bragReady === true)) break;
}
if (!(await page.evaluate(() => window.__bragReady === true))) throw new Error("composition never became ready");
const cdp = await ctx.newCDPSession(page);
const realFrames = () => page.evaluate(() => new Promise((r) => window.__realRAF(() => window.__realRAF(r))));
const capture = async () =>
  (await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 95, fromSurface: true, captureBeyondViewport: false })).data;
// Only accept a frame once two consecutive captures match, so tiles that are
// still rasterizing (which show up black) never make it into the video.
let retries = 0;
async function shot(path) {
  let prev = await capture();
  for (let k = 0; k < 12; k++) {
    await realFrames();
    const next = await capture();
    if (next === prev) break;
    retries++;
    prev = next;
  }
  fs.writeFileSync(path, Buffer.from(prev, "base64"));
}
const started = Date.now();
for (let f = 0; f <= last; f++) {
  const t = f / FPS;
  await page.evaluate((s) => window.__bragSeek(s), t);
  await page.clock.runFor(1000 / FPS);
  if (mode === "full" || wantFrames.has(f)) {
    const name = mode === "stills" ? `t-${t.toFixed(2)}.jpg` : `${String(f).padStart(5, "0")}.jpg`;
    await realFrames();
    await shot(`${outDir}/${name}`);
  }
  if (f % 60 === 0) console.log(`frame ${f}/${last} ${((Date.now() - started) / 1000).toFixed(0)}s retries ${retries}`);
}
await browser.close();
