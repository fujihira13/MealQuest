import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Audio, staticFile } from 'remotion';
import React from 'react';

/* ── SRTベースのシーン切り替えフレーム ──
 * narration_C.srt タイムスタンプ:
 * 0:00-2.58  → Docker環境構築やってみましょう（イントロ）
 * 2.58-12.02 → Dockerfileを作成... copyとrunでセットアップ
 * 12.02-19.16 → 次にイメージをビルド...イメージが作られます
 * 19.16-25.20 → そしてコンテナを起動...サーバーが立ち上がりました
 * 25.20-30.20 → 最後にcurlで動作確認...完璧です
 *
 * Title: 0-78 (0-2.58s)
 * Scene1 Dockerfile: 78-361 (2.58s-12.02s)
 * Scene2 Build: 361-575 (12.02s-19.16s)
 * Scene3 Run: 575-756 (19.16s-25.20s)
 * Scene4 確認: 756-885 (25.20s-end)
 */

const FONT = 'SF Mono, Menlo, monospace';
const BG1 = '#0d1117';
const BG2 = '#161b22';
const TERM_BG = '#0d1117';
const GREEN = '#10b981';
const BLUE = '#3b82f6';
const SLATE = '#94a3b8';
const YELLOW = '#f59e0b';
const WHITE = '#ffffff';
const PAD = 60;
const TERM_W = 960;

const scenes = [
  {
    title: '📦 Dockerfile作成',
    lines: [
      { type: 'cmd', text: 'touch Dockerfile' },
      { type: 'cmd', text: 'cat Dockerfile' },
      { type: 'out', text: 'FROM node:22-alpine' },
      { type: 'out', text: 'WORKDIR /app' },
      { type: 'out', text: 'COPY . .' },
      { type: 'out', text: 'RUN npm install' },
    ],
    hint: '💡 Dockerfileでコンテナの設計図を書く',
    from: 78, dur: 283,
  },
  {
    title: '🔨 イメージをビルド',
    lines: [
      { type: 'cmd', text: 'docker build -t my-app .' },
      { type: 'step', text: '=> [1/4] FROM node:22-alpine' },
      { type: 'step', text: '=> [2/4] WORKDIR /app' },
      { type: 'step', text: '=> [3/4] COPY . .' },
      { type: 'step', text: '=> [4/4] RUN npm install' },
      { type: 'ok', text: '✅ Successfully built!' },
    ],
    hint: '💡 buildコマンドでイメージを作成',
    from: 361, dur: 214,
  },
  {
    title: '🚀 コンテナ起動',
    lines: [
      { type: 'cmd', text: 'docker run -p 3000:3000 my-app' },
      { type: 'out', text: '> my-app start' },
      { type: 'out', text: '> node server.js' },
      { type: 'ok', text: '✅ Server running on port 3000' },
    ],
    hint: '💡 runで起動、-pでポートマッピング',
    from: 575, dur: 181,
  },
  {
    title: '✅ 動作確認',
    lines: [
      { type: 'cmd', text: 'curl localhost:3000' },
      { type: 'out', text: '{"status":"ok","message":"Hello Docker!"}' },
      { type: 'ok', text: '✅ 完璧に動作！' },
    ],
    hint: '💡 ローカルでAPIが動いている！',
    from: 756, dur: 129,
  },
];

const Prompt: React.FC = () => (
  <span>
    <span style={{ color: GREEN }}>akira@mac</span>
    <span style={{ color: WHITE }}> </span>
    <span style={{ color: BLUE }}>~</span>
    <span style={{ color: WHITE }}> % </span>
  </span>
);

const TermLine: React.FC<{ line: { type: string; text: string }; progress: number }> = ({ line, progress }) => {
  const frame = useCurrentFrame();
  if (line.type === 'cmd') {
    const chars = Math.floor(progress * line.text.length);
    const showCursor = progress < 1;
    const cursorVisible = Math.floor(frame / 10) % 2 === 0;
    return (
      <div style={{ lineHeight: 1.5 }}>
        <Prompt />
        <span style={{ color: WHITE }}>{line.text.slice(0, chars)}</span>
        {showCursor && <span style={{ color: '#58a6ff', opacity: cursorVisible ? 1 : 0, fontWeight: 'bold' }}>▌</span>}
      </div>
    );
  }
  const opacity = Math.min(1, progress * 3);
  let color = SLATE;
  if (line.type === 'ok') color = GREEN;
  if (line.type === 'step') color = YELLOW;
  return (
    <div style={{ lineHeight: 1.5, opacity, color }}>{line.text}</div>
  );
};

const ProgressDots: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    {Array.from({ length: total }, (_, i) => (
      <React.Fragment key={i}>
        <div style={{
          width: 12, height: 12, borderRadius: '50%',
          background: i <= current ? GREEN : '#30363d',
        }} />
        {i < total - 1 && <div style={{ width: 24, height: 2, background: i < current ? GREEN : '#30363d' }} />}
      </React.Fragment>
    ))}
    <span style={{ color: SLATE, fontSize: 24, marginLeft: 12 }}>{current + 1}/{total}</span>
  </div>
);

const TerminalWindow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    width: TERM_W, background: TERM_BG, borderRadius: 16,
    border: '1px solid #30363d',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  }}>
    <div style={{
      height: 40, background: '#161b22', display: 'flex', alignItems: 'center',
      padding: '0 16px', gap: 8,
    }}>
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
      <span style={{ color: SLATE, fontSize: 14, marginLeft: 12 }}>akira@mac — zsh</span>
    </div>
    <div style={{ padding: '20px 24px', fontSize: 22 }}>
      {children}
    </div>
  </div>
);

const SceneView: React.FC<{ scene: typeof scenes[0]; frame: number; fps: number; sceneIdx: number }> = ({ scene, frame, fps, sceneIdx }) => {
  const local = frame - scene.from;
  const framesPerLine = Math.floor(scene.dur / (scene.lines.length + 1));

  const titleScale = spring({ frame: local, fps, config: { damping: 15 } });
  const hintOpacity = interpolate(local, [scene.dur * 0.6, scene.dur * 0.7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <>
      <div style={{ position: 'absolute', top: 80, left: PAD }}>
        <ProgressDots current={sceneIdx} total={4} />
      </div>

      <div style={{
        position: 'absolute', top: 180, left: PAD,
        fontSize: 48, fontWeight: 'bold', color: WHITE,
        transform: `scale(${titleScale})`, transformOrigin: 'left center',
      }}>
        {scene.title}
        <div style={{ width: 120, height: 4, background: GREEN, marginTop: 12, borderRadius: 2 }} />
      </div>

      <div style={{ position: 'absolute', top: '30%', left: PAD }}>
        <TerminalWindow>
          {scene.lines.map((line, i) => {
            const lineStart = i * framesPerLine;
            const lineProgress = Math.max(0, Math.min(1, (local - lineStart) / framesPerLine));
            return lineProgress > 0 ? <TermLine key={i} line={line} progress={lineProgress} /> : null;
          })}
        </TerminalWindow>

        {/* Hint card - コンテンツの下に margin-top: 50px */}
        <div style={{
          marginTop: 50, width: TERM_W, opacity: hintOpacity,
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 12, padding: '24px 32px', fontSize: 42, fontWeight: 600, lineHeight: 1.5, color: WHITE,
        }}>
          {scene.hint}
        </div>
      </div>
    </>
  );
};

export const FusionCV3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame, fps, config: { damping: 12, mass: 0.8 } });
  const titleOpacity = interpolate(frame, [60, 78], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const gridBg = `repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(48,54,61,0.3) 59px, rgba(48,54,61,0.3) 60px),
    repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(48,54,61,0.3) 59px, rgba(48,54,61,0.3) 60px)`;

  const currentSceneIdx = scenes.findIndex(s => frame >= s.from && frame < s.from + s.dur);
  const currentScene = currentSceneIdx >= 0 ? scenes[currentSceneIdx] : null;

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, ${BG1}, ${BG2})`,
      fontFamily: FONT, color: WHITE,
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: gridBg, opacity: 0.4 }} />
      <Audio src={staticFile('audio_mixed_C.mp3')} />

      {/* Title (0-2.58s) */}
      {frame < 78 && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          opacity: titleOpacity,
        }}>
          <div style={{
            fontSize: 72, fontWeight: 'bold',
            transform: `scale(${titleScale})`,
          }}>
            🐳 Docker環境構築
          </div>
          <div style={{
            fontSize: 28, color: SLATE, marginTop: 20,
            transform: `scale(${titleScale})`,
          }}>
            ターミナルで学ぶコンテナ入門
          </div>
        </div>
      )}

      {currentScene && <SceneView scene={currentScene} frame={frame} fps={fps} sceneIdx={currentSceneIdx} />}
    </AbsoluteFill>
  );
};
