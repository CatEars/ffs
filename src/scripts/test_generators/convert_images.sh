#!/bin/bash

# --- File and directory setup ---
INPUT_FILE="image.png"
OUTPUT_DIR="converted_images"

# Check if the input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file '$INPUT_FILE' not found."
    echo "Please place your image file and name it '$INPUT_FILE' in the same directory as this script."
    exit 1
fi

mkdir -p "$OUTPUT_DIR"
echo "Starting conversion of '$INPUT_FILE' to various formats..."
echo "Output files will be saved in the '$OUTPUT_DIR' directory."

# --- JPEG Conversions ---
# JPEG is a lossy format, so we test different quality levels.
echo "-> Generating JPEG files..."
convert "$INPUT_FILE" -quality 90 "$OUTPUT_DIR/image_quality90.jpg"
convert "$INPUT_FILE" -quality 70 "$OUTPUT_DIR/image_quality70.jpg"
convert "$INPUT_FILE" -quality 30 "$OUTPUT_DIR/image_quality30.jpg"

# --- PNG Conversions ---
# PNG is lossless, so we test different compression levels.
echo "-> Generating PNG files..."
convert "$INPUT_FILE" -quality 0 "$OUTPUT_DIR/image_png_min_compression.png"
convert "$INPUT_FILE" -quality 9 "$OUTPUT_DIR/image_png_max_compression.png"

# --- GIF Conversions ---
# GIF uses a limited color palette. We can test different palette sizes.
echo "-> Generating GIF files..."
convert "$INPUT_FILE" -colors 256 "$OUTPUT_DIR/image_256colors.gif"
convert "$INPUT_FILE" -colors 16 "$OUTPUT_DIR/image_16colors.gif"

# --- WEBP Conversions ---
# WebP is a modern format with both lossy and lossless options.
echo "-> Generating WebP files..."
convert "$INPUT_FILE" -quality 80 "$OUTPUT_DIR/image_webp_lossy.webp"
convert "$INPUT_FILE" -define webp:lossless=true "$OUTPUT_DIR/image_webp_lossless.webp"

# --- AVIF Conversions ---
# AVIF is a next-generation format with superior compression.
echo "-> Generating AVIF files..."
convert "$INPUT_FILE" -quality 50 "$OUTPUT_DIR/image_avif_quality50.avif"

# --- TIFF Conversions ---
# TIFF is a professional format with various compression schemes.
echo "-> Generating TIFF files..."
convert "$INPUT_FILE" -compress LZW "$OUTPUT_DIR/image_lzw.tiff"
convert "$INPUT_FILE" -compress ZIP "$OUTPUT_DIR/image_zip.tiff"
convert "$INPUT_FILE" -compress None "$OUTPUT_DIR/image_uncompressed.tiff"

# --- Other Useful Formats ---
echo "-> Generating other miscellaneous formats..."
# BMP (Bitmap) - simple and uncompressed
convert "$INPUT_FILE" "$OUTPUT_DIR/image.bmp"

# ICO (Icon) - used for favicons
convert "$INPUT_FILE" -define icon:auto-resize=256,128,64,48,32,16 "$OUTPUT_DIR/image.ico"

# PSD (Photoshop) - a good test for applications that handle layers
convert "$INPUT_FILE" "$OUTPUT_DIR/image.psd"

# SVG (Scaled Vector Graphics) - rasterizing to a vector format (note: this will be a bitmap-in-vector)
# This is more for testing how an app renders an image in an SVG container.
convert "$INPUT_FILE" "$OUTPUT_DIR/image.svg"

# PDF (Portable Document Format)
convert "$INPUT_FILE" "$OUTPUT_DIR/image.pdf"

echo "All conversions are complete! Check the '$OUTPUT_DIR' directory."
