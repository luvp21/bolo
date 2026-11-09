#!/usr/bin/env bash
# Encodes rendered frames + mix into an X/YouTube-ready MP4 (H.264 high, yuv420p, AAC, faststart).
set -euo pipefail
out=$1; name=$2
ffmpeg -loglevel error -y -framerate 30 -i "$out/frames/%05d.jpg" -i "$out/mix.wav" \
  -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -r 30 -g 60 \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest "$out/$name"
ffprobe -v error -show_entries format=duration,size -of csv=p=0 "$out/$name"
