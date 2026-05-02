/**
 * 縦長動画テンプレート（YouTubeショート対応）
 * 
 * このテンプレートをコピーして使用してください。
 * 解像度: 1080x1920 (9:16)
 * 長さ: 60秒 (1800フレーム @ 30fps)
 */

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  Sequence,
} from 'remotion';

// ==================== 設定 ====================

// カラーパレット（Tech Blue）
const colors = {
  bg: '#0f172a',
  bgGradient: '#1e293b',
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  code: '#1e1e1e',
  codeText: '#22d3ee',
  subtitleBg: 'rgba(0, 0, 0, 0.85)',
};

// 字幕データ（SRTから変換）
const subtitles = [
  { start: 0, end: 5, text: 'タイトルをここに入れる' },
  { start: 5, end: 15, text: 'ステップ1の説明' },
  // 追加...
];

// ==================== 共通コンポーネント ====================

// 背景
const Background: React.FC = () => (
  <>
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bgGradient} 100%)`,
    }} />
    <GridBackground />
  </>
);

// グリッド背景（微かに動く）
const GridBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame % 60, [0, 30, 60], [0.03, 0.06, 0.03]);
  
  return (
    <AbsoluteFill style={{
      backgroundImage: `
        linear-gradient(${colors.primary}22 1px, transparent 1px),
        linear-gradient(90deg, ${colors.primary}22 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
      opacity,
    }} />
  );
};

// 字幕
const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  const currentTime = frame / fps;
  
  const currentSubtitle = subtitles.find(
    sub => currentTime >= sub.start && currentTime < sub.end
  );
  
  if (!currentSubtitle) return null;
  
  const duration = currentSubtitle.end - currentSubtitle.start;
  const progress = (currentTime - currentSubtitle.start) / duration;
  const fadeIn = interpolate(progress, [0, 0.1], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(progress, [0.9, 1], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);
  
  return (
    <div style={{
      position: 'absolute',
      bottom: 280,
      left: 40,
      right: 40,
      display: 'flex',
      justifyContent: 'center',
      opacity,
    }}>
      <div style={{
        background: colors.subtitleBg,
        padding: '16px 28px',
        borderRadius: 12,
        maxWidth: '90%',
      }}>
        <p style={{
          color: colors.text,
          fontSize: 32,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 600,
          textAlign: 'center',
          margin: 0,
          lineHeight: 1.5,
          whiteSpace: 'pre-line',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
        }}>
          {currentSubtitle.text}
        </p>
      </div>
    </div>
  );
};

// ==================== シーンコンポーネント ====================

// タイトルシーン（0-5秒）
const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  
  const titleY = spring({ frame, fps, from: 50, to: 0, durationInFrames: 20 });
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const lineWidth = interpolate(frame, [10, 40], [0, 200], { extrapolateRight: 'clamp' });
  
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 40,
        paddingBottom: 350,
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: 72,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 800,
            color: colors.text,
            margin: 0,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            letterSpacing: '-2px',
            lineHeight: 1.2,
          }}>
            タイトルを<br />
            <span style={{ color: colors.primary }}>ここに</span>入れる
          </h1>
          <div style={{
            width: lineWidth,
            height: 4,
            background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
            margin: '30px auto',
            borderRadius: 2,
          }} />
        </div>
      </AbsoluteFill>
      <Subtitles />
    </AbsoluteFill>
  );
};

// ステップシーン（テンプレート）
const StepScene: React.FC<{
  stepNumber: number;
  title: string;
  color: string;
}> = ({ stepNumber, title, color }) => {
  const frame = useCurrentFrame();
  const fps = 30;
  
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const contentScale = spring({ frame: frame - 30, fps, from: 0, to: 1, durationInFrames: 20 });
  
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ 
        padding: '60px 40px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* タイトル */}
        <div style={{ opacity: titleOpacity, marginBottom: 40, textAlign: 'center' }}>
          <span style={{
            background: color,
            color: colors.bg,
            padding: '10px 24px',
            borderRadius: 8,
            fontSize: 28,
            fontWeight: 700,
            display: 'inline-block',
            marginBottom: 15,
          }}>STEP {stepNumber}</span>
          <h2 style={{
            fontSize: 56,
            fontFamily: 'system-ui',
            fontWeight: 700,
            color: color,
            margin: 0,
          }}>
            {title}
          </h2>
        </div>
        
        {/* コンテンツ */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${Math.max(0, contentScale)})`,
          marginBottom: 350,
        }}>
          {/* ここにコンテンツを追加 */}
          <p style={{ color: colors.text, fontSize: 32 }}>
            コンテンツをここに
          </p>
        </div>
      </AbsoluteFill>
      <Subtitles />
    </AbsoluteFill>
  );
};

// まとめシーン
const SummaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ 
        padding: '80px 40px 380px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <h2 style={{
          fontSize: 44,
          fontFamily: 'system-ui',
          fontWeight: 700,
          color: colors.text,
          margin: 0,
          opacity: titleOpacity,
          marginBottom: 40,
        }}>
          まとめ
        </h2>
        
        {/* まとめの内容 */}
        <p style={{
          fontSize: 32,
          color: colors.accent,
          fontWeight: 700,
          textAlign: 'center',
        }}>
          🎉 完了メッセージ
        </p>
      </AbsoluteFill>
      <Subtitles />
    </AbsoluteFill>
  );
};

// ==================== メインコンポーネント ====================

export const TemplateVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* タイトル: 0-5秒 (0-150フレーム) */}
      <Sequence from={0} durationInFrames={150}>
        <TitleScene />
      </Sequence>
      
      {/* ステップ1: 5-20秒 (150-600フレーム) */}
      <Sequence from={150} durationInFrames={450}>
        <StepScene stepNumber={1} title="ステップ1" color={colors.primary} />
      </Sequence>
      
      {/* ステップ2: 20-35秒 (600-1050フレーム) */}
      <Sequence from={600} durationInFrames={450}>
        <StepScene stepNumber={2} title="ステップ2" color={colors.secondary} />
      </Sequence>
      
      {/* まとめ: 35-60秒 (1050-1800フレーム) */}
      <Sequence from={1050} durationInFrames={750}>
        <SummaryScene />
      </Sequence>
    </AbsoluteFill>
  );
};
