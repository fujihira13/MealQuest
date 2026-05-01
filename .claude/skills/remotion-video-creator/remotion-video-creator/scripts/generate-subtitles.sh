#!/bin/bash
# Whisperで字幕を生成するスクリプト
#
# 使用方法:
#   ./generate-subtitles.sh <input.wav> [output_dir]
#
# 例:
#   ./generate-subtitles.sh out/narration.wav out/
#   ./generate-subtitles.sh audio.wav

set -e

INPUT_FILE="${1:-out/narration.wav}"
OUTPUT_DIR="${2:-.}"
LANGUAGE="${3:-ja}"
MODEL="${4:-small}"

echo "🎤 Whisper 字幕生成"
echo "----------------------------"
echo "入力: ${INPUT_FILE}"
echo "出力先: ${OUTPUT_DIR}"
echo "言語: ${LANGUAGE}"
echo "モデル: ${MODEL}"
echo "----------------------------"

# 入力ファイル確認
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ ファイルが見つかりません: ${INPUT_FILE}"
    exit 1
fi

# Whisper実行
echo "🔄 字幕生成中..."
whisper "$INPUT_FILE" \
    --model "$MODEL" \
    --language "$LANGUAGE" \
    --output_format srt \
    --output_dir "$OUTPUT_DIR"

# 結果表示
BASENAME=$(basename "$INPUT_FILE" .wav)
SRT_FILE="${OUTPUT_DIR}/${BASENAME}.srt"

if [ -f "$SRT_FILE" ]; then
    echo "----------------------------"
    echo "✅ 字幕生成完了: ${SRT_FILE}"
    echo ""
    echo "📝 生成された字幕（最初の5件）:"
    head -20 "$SRT_FILE"
else
    echo "❌ 字幕ファイルが生成されませんでした"
    exit 1
fi
