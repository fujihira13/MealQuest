#!/usr/bin/env node
/**
 * Gemini TTS 2.5 レスポンスから音声をデコードしてWAVファイルに保存
 * 
 * 使用方法:
 *   node decode-gemini-audio.js <input.json> <output.wav>
 *   node decode-gemini-audio.js /tmp/tts_response.json out/narration.wav
 */

const fs = require('fs');
const path = require('path');

// 引数処理
const args = process.argv.slice(2);
const inputPath = args[0] || '/tmp/gemini_tts_response.json';
const outputPath = args[1] || 'out/narration_gemini.wav';

// メイン処理
function main() {
  console.log('🎵 Gemini TTS Audio Decoder');
  console.log('----------------------------');
  
  // JSONファイル読み込み
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ ファイルが見つかりません: ${inputPath}`);
    process.exit(1);
  }
  
  const response = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  
  // エラーチェック
  if (response.error) {
    console.error(`❌ APIエラー: ${response.error.message}`);
    process.exit(1);
  }
  
  // 音声データ抽出
  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  const mimeType = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType;
  
  if (!audioData) {
    console.error('❌ 音声データが見つかりません');
    console.log('レスポンス:', JSON.stringify(response, null, 2).substring(0, 500));
    process.exit(1);
  }
  
  console.log(`📝 MIME Type: ${mimeType}`);
  
  // Base64デコード
  const rawAudio = Buffer.from(audioData, 'base64');
  console.log(`📦 Raw audio size: ${rawAudio.length.toLocaleString()} bytes`);
  
  // WAVヘッダー作成（PCM L16 24kHz mono）
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = rawAudio.length;
  const fileSize = 36 + dataSize;
  
  const wavHeader = Buffer.alloc(44);
  
  // RIFF header
  wavHeader.write('RIFF', 0);
  wavHeader.writeUInt32LE(fileSize, 4);
  wavHeader.write('WAVE', 8);
  
  // fmt subchunk
  wavHeader.write('fmt ', 12);
  wavHeader.writeUInt32LE(16, 16);      // Subchunk1Size
  wavHeader.writeUInt16LE(1, 20);       // AudioFormat (PCM)
  wavHeader.writeUInt16LE(numChannels, 22);
  wavHeader.writeUInt32LE(sampleRate, 24);
  wavHeader.writeUInt32LE(byteRate, 28);
  wavHeader.writeUInt16LE(blockAlign, 32);
  wavHeader.writeUInt16LE(bitsPerSample, 34);
  
  // data subchunk
  wavHeader.write('data', 36);
  wavHeader.writeUInt32LE(dataSize, 40);
  
  // WAVファイル作成
  const wavFile = Buffer.concat([wavHeader, rawAudio]);
  
  // 出力ディレクトリ作成
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // 保存
  fs.writeFileSync(outputPath, wavFile);
  
  // 結果表示
  const duration = (dataSize / byteRate).toFixed(2);
  console.log('----------------------------');
  console.log(`✅ 保存完了: ${outputPath}`);
  console.log(`📊 WAVファイルサイズ: ${wavFile.length.toLocaleString()} bytes`);
  console.log(`⏱️  長さ: ${duration} 秒`);
}

main();
