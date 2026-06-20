#!/bin/bash
INFILE=$1
END=$2   # optional: stop here (seconds or HH:MM:SS) to trim the end
OUTFILE=${INFILE%.webm}.webp
TRIM=()
[ -n "$END" ] && TRIM=(-to "$END")
ffmpeg -i "$INFILE" "${TRIM[@]}" -filter:v fps=8 -compression_level 4 -quality 40 -loop 0 "$OUTFILE"
