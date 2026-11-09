# Builds the soundtrack for a cut: voices at their cue times + a ducked ambient pad.
import json, subprocess, sys
out = sys.argv[1]
d = json.load(open(f"{out}/audio.json"))
total = d["total"]
args = ["ffmpeg", "-loglevel", "error", "-y"]
filters = []
labels = []
for i, a in enumerate(d["audio"]):
    args += ["-i", a["file"]]
    chain = f"[{i}]aresample=48000,aformat=channel_layouts=stereo"
    if a.get("len"):
        L = a["len"]
        chain += f",atrim=0:{L},afade=t=out:st={L-0.5:.2f}:d=0.5"
    ms = int(a["at"] * 1000)
    chain += f",adelay={ms}|{ms},volume={a.get('gain',1.0)}[v{i}]"
    filters.append(chain); labels.append(f"[v{i}]")
n = len(labels)
filters.append(f"{''.join(labels)}amix=inputs={n}:normalize=0,apad=whole_dur={total:.2f}[voice]")
# Ambient pad: soft A-major chord, slow tremolo, low-passed. Ducks under the voice.
pad = (f"sine=f=110:d={total:.2f},volume=0.5[p1];sine=f=164.81:d={total:.2f},volume=0.35[p2];"
       f"sine=f=277.18:d={total:.2f},volume=0.22[p3];sine=f=329.63:d={total:.2f},volume=0.15[p4];"
       f"[p1][p2][p3][p4]amix=inputs=4:normalize=0,tremolo=f=0.15:d=0.35,lowpass=f=900,"
       f"aformat=channel_layouts=stereo,volume=0.10,afade=t=in:d=2.5,afade=t=out:st={total-3:.2f}:d=3[pad]")
filters.append(pad)
filters.append("[voice]asplit[vmain][vkey]")
filters.append("[pad][vkey]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=400[duck]")
filters.append(f"[vmain][duck]amix=inputs=2:normalize=0,atrim=0:{total:.2f},loudnorm=I=-16:TP=-1.5:LRA=11[mix]")
args += ["-filter_complex", ";".join(filters), "-map", "[mix]", "-ar", "48000", f"{out}/mix.wav"]
subprocess.run(args, check=True)
print("mixed", out, round(total, 2))
