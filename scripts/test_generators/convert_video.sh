#!/bin/bash

# --- File and directory setup ---
INPUT_FILE="video.mp4"
OUTPUT_DIR="test_videos"
POSTFIX=""

# Check if the input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file '$INPUT_FILE' not found."
    echo "Please place your video file and name it '$INPUT_FILE' in the same directory as this script."
    exit 1
fi

mkdir -p "$OUTPUT_DIR"
echo "Starting video conversion to all common formats..."
echo "Output files will be saved in the '$OUTPUT_DIR' directory with the '$POSTFIX' postfix."

# --- H.264 Codec Conversions ---
echo "-> Generating H.264 videos..."
# H.264 (libx264) with AAC audio in MP4 container (Standard)
ffmpeg -i "$INPUT_FILE" -c:v libx264 -c:a aac -crf 23 -b:a 128k "$OUTPUT_DIR/h264_aac$POSTFIX.mp4"

# H.264 with AAC in MOV container
ffmpeg -i "$INPUT_FILE" -c:v libx264 -c:a aac -crf 23 -b:a 128k "$OUTPUT_DIR/h264_aac$POSTFIX.mov"

# H.264 with MP3 audio in AVI container
ffmpeg -i "$INPUT_FILE" -c:v libx264 -c:a libmp3lame -q:a 4 "$OUTPUT_DIR/h264_mp3$POSTFIX.avi"

# --- H.265 Codec Conversions ---
echo "-> Generating H.265 videos..."
# H.265 (libx265) with AAC audio in MP4 container (Higher Efficiency)
ffmpeg -i "$INPUT_FILE" -c:v libx265 -c:a aac -crf 28 -b:a 128k "$OUTPUT_DIR/h265_aac$POSTFIX.mp4"

# H.265 with AAC in MOV container
ffmpeg -i "$INPUT_FILE" -c:v libx265 -c:a aac -crf 28 -b:a 128k "$OUTPUT_DIR/h265_aac$POSTFIX.mov"

# --- VP9 Codec Conversions ---
echo "-> Generating VP9 videos..."
# VP9 (libvpx-vp9) with Opus audio in WebM container (Web Standard)
ffmpeg -i "$INPUT_FILE" -c:v libvpx-vp9 -c:a libopus -b:v 1M "$OUTPUT_DIR/vp9_opus$POSTFIX.webm"

# VP9 with AAC audio in an MKV container
ffmpeg -i "$INPUT_FILE" -c:v libvpx-vp9 -c:a aac -f matroska "$OUTPUT_DIR/vp9_aac$POSTFIX.mkv"

# --- AV1 Codec Conversions ---
echo "-> Generating AV1 videos..."
# AV1 (libaom-av1) with Opus audio in WebM container
ffmpeg -i "$INPUT_FILE" -c:v libaom-av1 -c:a libopus -b:v 1M "$OUTPUT_DIR/av1_opus$POSTFIX.webm"

# AV1 with AAC audio in an MP4 container
ffmpeg -i "$INPUT_FILE" -c:v libaom-av1 -c:a aac -f mp4 -b:v 1M "$OUTPUT_DIR/av1_aac$POSTFIX.mp4"

# AV1 with AAC audio in an MKV container
ffmpeg -i "$INPUT_FILE" -c:v libaom-av1 -c:a aac -f matroska -b:v 1M "$OUTPUT_DIR/av1_aac$POSTFIX.mkv"

# --- Other Common Formats ---
echo "-> Generating other miscellaneous formats..."
# MPEG-2 video in a DVD-compatible MPEG-PS container
ffmpeg -i "$INPUT_FILE" -c:v mpeg2video -c:a mp2 -b:v 4M -b:a 192k "$OUTPUT_DIR/mpeg2_mp2$POSTFIX.mpg"

# MPEG-4 Part 2 (DivX/Xvid) video with MP3 audio in an AVI container
ffmpeg -i "$INPUT_FILE" -c:v mpeg4 -c:a libmp3lame -q:v 4 -q:a 4 "$OUTPUT_DIR/mpeg4_mp3$POSTFIX.avi"

echo "All specified video formats have been generated in the '$OUTPUT_DIR' directory."