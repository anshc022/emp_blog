"""Flag frames with unpainted (pure black) blocks in the paper scenes."""
import subprocess, sys, numpy as np, json
ff = open("ff.env").read().split("=",1)[1].strip()
T = json.load(open("timeline.json"))
W, H = 192, 108
raw = subprocess.run([ff, "-v", "error", "-framerate", "30", "-i", (sys.argv[1] if len(sys.argv) > 1 else "frames") + "/%05d.jpg", "-vf", f"scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W)
bad = []
for i, f in enumerate(frames):
    t = i / 30
    # paper scenes (skip the projector frame, which is legitimately dark)
    if 3.5 <= t <= 27.45 and not (20.9 <= t <= 24.1):
        dark = f < 6
        # longest horizontal run of pure black in any row
        best = 0
        for row in dark:
            run = 0
            for v in row:
                run = run + 1 if v else 0
                best = max(best, run)
        if best >= 20:
            bad.append((i, best))
print(len(frames), "frames; suspicious:", bad[:40], "count", len(bad))
