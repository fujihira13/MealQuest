#!/bin/bash
# ナレーションとBGMをミックスするスクリプト
#
# 使用方法:
#   ./mix-audio.sh <narration.wav> <bgm.mp3> <output.mp3> [duration] [bgm_volume]
#
# 例:
#   ./mix-audio.sh out/narration.wav out/bgm.mp3 out/audio_mixed.mp3
#   ./mix-audio.sh out/narration.wav out/bgm.mp3 out/audio_mixed.mp3 60 0.15

set -e

NARRATION="${1:-out/narration.wav}"
BGM="${2:-out/bgm.mp3}"
OUTPUT="${3:-out/audio_mixed.mp3}"
DURATION="${4:-60}"
BGM_VOLUME="${5:-0.15}"
NARRATION_VOLUME="${6:-1.2}"
FADE_DURATION="${7:-5}"

echo "🎵 Audio Mixer"
echo "----------------------------"
echo "ナレーション: ${NARRATION}"
echo "BGM: ${BGM}"
echo "出力: ${OUTPUT}"
echo "長さ: ${DURATION}秒"
echo "BGM音量: ${BGM_VOLUME}"
echo "ナレーション音量: ${NARRATION_VOLUME}"
echo "フェードアウト: ${FADE_DURATION}秒"
echo "----------------------------"

# ファイル確認
if [ ! -f "$NARRATION" ]; then
    echo "❌ ナレーションファイルが見つかりません: ${NARRATION}"
    exit 1
fi

if [ ! -f "$BGM" ]; then
    echo "❌ BGMファイルが見つかりません: ${BGM}"
    exit 1
fi

# フェードアウト開始タイミング計算
FADE_START=$((DURATION - FADE_DURATION))

echo "🔄 ミックス中..."

# ffmpegでミックス
ffmpeg -y \
  -i "$NARRATION" \
  -i "$BGM" \
  -filter_complex "
    [0:a]volume=${NARRATION_VOLUME},aresample=44100,apad=whole_dur=${DURATION}[voice];
    [1:a]volume=${BGM_VOLUME},atrim=0:${DURATION},afade=t=out:st=${FADE_START}:d=${FADE_DURATION}[bgm];
    [voice][bgm]amix=inputs=2:duration=first[out]
  " \
  -map "[out]" \
  -ac 2 \
  -ar 44100 \
  -b:a 192k \
  "$OUTPUT"

# 結果表示
if [ -f "$OUTPUT" ]; then
    SIZE=$(ls -lh "$OUTPUT" | awk '{print $5}')
    ACTUAL_DURATION=$(ffprobe -v quiet -print_format json -show_format "$OUTPUT" | grep -o '"duration": "[^"]*"' | head -1 | cut -d'"' -f4)
    
    echo "----------------------------"
    echo "✅ ミックス完了: ${OUTPUT}"
    echo "📊 ファイルサイズ: ${SIZE}"
    echo "⏱️  長さ: ${ACTUAL_DURATION}秒"
else
    echo "❌ ミックスに失敗しました"
    exit 1
fi
