import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, Sequence, interpolate, Audio, staticFile } from 'remotion';
import React from 'react';

/* ── SRTベースのシーン切り替えフレーム ──
 * narration_B.srt タイムスタンプ:
 * 0:00-5.32  → mapを完全理解しましょう（イントロ）
 * 5.32-7.04  → mapの基本
 * 7.04-20.76 → 各要素に関数を適用...
 * 20.76-22.12 → 実践編
 * 22.12-33.56 → 価格の配列に税率を計算...
 * 33.56-35.88 → 最後にmapの鉄則
 * 35.88-43.68 → 元の配列は変更されません...
 *
 * Title: 0-160 (0-5.32s)
 * Scene1 基本: 160-623 (5.32s-20.76s)
 * Scene2 実践: 623-1007 (20.76s-33.56s)
 * Scene3 鉄則: 1007-1314 (33.56s-end)
 */

const KEYWORD = '#c084fc';
const STRING = '#4ade80';
const NUMBER = '#f59e0b';
const METHOD = '#60a5fa';
const COMMENT = '#6b7280';
const PLAIN = '#e6edf3';
const PUNCT = '#8b949e';

type Token = { text: string; color: string };

function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = line;

  while (i < s.length) {
    if (s.slice(i, i + 2) === '//') {
      tokens.push({ text: s.slice(i), color: COMMENT });
      break;
    }
    if (s[i] === '"' || s[i] === "'" || s[i] === '`') {
      const q = s[i];
      let j = i + 1;
      while (j < s.length && s[j] !== q) j++;
      tokens.push({ text: s.slice(i, j + 1), color: STRING });
      i = j + 1;
      continue;
    }
    if (/[0-9]/.test(s[i]) && (i === 0 || /[\s,\(\[\*+\-\/=:]/.test(s[i - 1]))) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      tokens.push({ text: s.slice(i, j), color: NUMBER });
      i = j;
      continue;
    }
    if (/[a-zA-Z_$]/.test(s[i])) {
      let j = i;
      while (j < s.length && /[a-zA-Z0-9_$]/.test(s[j])) j++;
      const word = s.slice(i, j);
      const keywords = ['const', 'let', 'var', 'return', 'function', 'import', 'from', 'export', 'default', 'new'];
      if (keywords.includes(word)) {
        tokens.push({ text: word, color: KEYWORD });
      } else if (j < s.length && s[j] === '(') {
        tokens.push({ text: word, color: METHOD });
      } else if (i > 0 && s[i - 1] === '.') {
        tokens.push({ text: word, color: METHOD });
      } else {
        tokens.push({ text: word, color: PLAIN });
      }
      i = j;
      continue;
    }
    if (s.slice(i, i + 2) === '=>') {
      tokens.push({ text: '=>', color: KEYWORD });
      i += 2;
      continue;
    }
    tokens.push({ text: s[i], color: PUNCT });
    i++;
  }
  return tokens;
}

function TypewriterCode({ lines, charCount, fontSize = 28 }: { lines: string[]; charCount: number; fontSize?: number }) {
  let remaining = charCount;
  return (
    <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize, lineHeight: 1.6 }}>
      {lines.map((line, li) => {
        if (remaining <= 0) return null;
        const lineWithNl = line + '\n';
        const visibleLen = Math.min(remaining, lineWithNl.length);
        remaining -= lineWithNl.length;
        const visibleText = lineWithNl.slice(0, visibleLen);
        const tokens = tokenize(visibleText.replace(/\n$/, ''));
        const showCursor = visibleLen <= lineWithNl.length && remaining <= 0;
        return (
          <div key={li} style={{ display: 'flex', minHeight: fontSize * 1.6 }}>
            <span style={{ color: '#484f58', width: 40, textAlign: 'right', marginRight: 16, userSelect: 'none', flexShrink: 0 }}>
              {li + 1}
            </span>
            <span>
              {tokens.map((t, ti) => (
                <span key={ti} style={{ color: t.color }}>{t.text}</span>
              ))}
              {showCursor && <BlinkingCursor />}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function BlinkingCursor() {
  const frame = useCurrentFrame();
  const visible = Math.floor(frame / 10) % 2 === 0;
  return <span style={{ color: '#58a6ff', opacity: visible ? 1 : 0, fontWeight: 'bold' }}>▌</span>;
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {Array.from({ length: total }, (_, i) => (
        <React.Fragment key={i}>
          <div style={{
            width: 14, height: 14, borderRadius: '50%',
            background: i <= current ? '#58a6ff' : '#30363d',
            opacity: i <= current ? 1 : 0.5,
          }} />
          {i < total - 1 && <div style={{ width: 30, height: 3, background: i < current ? '#58a6ff' : '#30363d' }} />}
        </React.Fragment>
      ))}
      <span style={{ color: '#8b949e', fontSize: 24, marginLeft: 12 }}>{current + 1}/{total}</span>
    </div>
  );
}

function CodeWindow({ title, lines, charCount, fontSize = 28 }: { title: string; lines: string[]; charCount: number; fontSize?: number }) {
  return (
    <div style={{
      width: 960, background: '#0d1117', borderRadius: 16, border: '1px solid #30363d',
      overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', background: '#161b22', borderBottom: '1px solid #30363d' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f85149' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f0b72f' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3fb950' }} />
        </div>
        <span style={{ color: '#8b949e', fontSize: 18, marginLeft: 16 }}>📌 {title}</span>
      </div>
      <div style={{ padding: '20px 24px' }}>
        <TypewriterCode lines={lines} charCount={charCount} fontSize={fontSize} />
      </div>
    </div>
  );
}

function ExplainCard({ text, opacity }: { text: string; opacity: number }) {
  return (
    <div style={{
      opacity, background: 'linear-gradient(135deg, rgba(88,166,255,0.1), rgba(192,132,252,0.1))',
      border: '1px solid rgba(88,166,255,0.3)', borderRadius: 12, padding: '24px 32px',
      width: 960, marginTop: 50,
    }}>
      <span style={{ fontSize: 42, color: '#e6edf3', lineHeight: 1.5, fontWeight: 600 }}>💡 {text}</span>
    </div>
  );
}

function CodeScene({ sceneFrame, title, emoji, lines, fileName, explanation, sceneDuration, sceneIndex }: {
  sceneFrame: number; title: string; emoji: string; lines: string[]; fileName: string;
  explanation: string; sceneDuration: number; sceneIndex: number;
}) {
  const { fps } = useVideoConfig();
  const totalChars = lines.join('\n').length + lines.length;
  const typingDuration = sceneDuration * 0.6;
  const charCount = Math.floor(interpolate(sceneFrame, [0, typingDuration], [0, totalChars], { extrapolateRight: 'clamp' }));

  const titleOpacity = interpolate(sceneFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(sceneFrame, [0, 15], [20, 0], { extrapolateRight: 'clamp' });
  const codeOpacity = interpolate(sceneFrame, [10, 25], [0, 1], { extrapolateRight: 'clamp' });
  const explainOpacity = interpolate(sceneFrame, [typingDuration, typingDuration + 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ padding: '0 60px' }}>
      <div style={{ position: 'absolute', top: 80, left: 60 }}>
        <ProgressDots current={sceneIndex} total={3} />
      </div>
      <div style={{ position: 'absolute', top: 160, left: 60, opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
        <div style={{ fontSize: 48, fontWeight: 'bold', color: '#e6edf3' }}>
          {emoji} {title}
        </div>
        <div style={{ width: 120, height: 4, background: 'linear-gradient(90deg, #58a6ff, #c084fc)', borderRadius: 2, marginTop: 12 }} />
      </div>
      <div style={{ position: 'absolute', top: '30%', left: 60, opacity: codeOpacity }}>
        <CodeWindow title={fileName} lines={lines} charCount={charCount} />
        <ExplainCard text={explanation} opacity={explainOpacity} />
      </div>
    </AbsoluteFill>
  );
}

function TitleScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const subtitleOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ transform: `scale(${scale})`, textAlign: 'center' }}>
        <div style={{ fontSize: 36, color: '#58a6ff', marginBottom: 16, letterSpacing: 4 }}>JAVASCRIPT</div>
        <div style={{ fontSize: 72, fontWeight: 'bold', color: '#e6edf3', lineHeight: 1.2 }}>
          .map() を完全理解
        </div>
        <div style={{
          width: 200, height: 4, margin: '24px auto',
          background: 'linear-gradient(90deg, #58a6ff, #c084fc, #f59e0b)', borderRadius: 2,
        }} />
      </div>
      <div style={{ position: 'absolute', bottom: 300, opacity: subtitleOpacity }}>
        <span style={{ fontSize: 30, color: '#8b949e' }}>配列操作の基本メソッドをマスター</span>
      </div>
    </AbsoluteFill>
  );
}

function GridBg() {
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(135deg, #0d1117, #161b22)' }}>
      <svg width="100%" height="100%" style={{ opacity: 0.06 }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#58a6ff" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </AbsoluteFill>
  );
}

export const FusionBV3: React.FC = () => {
  const scene1Lines = [
    'const numbers = [1, 2, 3, 4, 5];',
    '',
    'const doubled = numbers.map(n => n * 2);',
    '',
    '// [2, 4, 6, 8, 10]',
  ];

  const scene2Lines = [
    'const prices = [100, 250, 500];',
    '',
    'const withTax = prices.map(p => ({',
    '  price: p,',
    '  tax: Math.floor(p * 0.1),',
    '  total: Math.floor(p * 1.1)',
    '}));',
  ];

  const scene3Lines = [
    '// ✅ 元の配列は変更されない',
    '// ✅ 必ず新しい配列を返す',
    '// ✅ returnを忘れずに！',
  ];

  return (
    <AbsoluteFill style={{ fontFamily: "'Inter', 'Noto Sans JP', sans-serif" }}>
      <GridBg />
      <Audio src={staticFile('audio_mixed_B.mp3')} />

      {/* Title: 0-160 (0-5.32s) */}
      <Sequence from={0} durationInFrames={160}>
        <TitleScene />
      </Sequence>

      {/* Scene 1: 160-623 (5.32s-20.76s) */}
      <Sequence from={160} durationInFrames={463}>
        <SceneWrapper sceneIndex={0} title="基本の使い方" emoji="📖" lines={scene1Lines}
          fileName="array-map.js" explanation="各要素に関数を適用して新しい配列を返す" sceneDuration={463} />
      </Sequence>

      {/* Scene 2: 623-1007 (20.76s-33.56s) */}
      <Sequence from={623} durationInFrames={384}>
        <SceneWrapper sceneIndex={1} title="実践: 税率計算" emoji="🧮" lines={scene2Lines}
          fileName="tax-calc.js" explanation="オブジェクトを返せば構造化データも作れる" sceneDuration={384} />
      </Sequence>

      {/* Scene 3: 1007-1314 (33.56s-end) */}
      <Sequence from={1007} durationInFrames={307}>
        <SceneWrapper sceneIndex={2} title="mapの鉄則" emoji="📜" lines={scene3Lines}
          fileName="map-rules.js" explanation="mapは非破壊。元データを安全に保つ" sceneDuration={307} />
      </Sequence>
    </AbsoluteFill>
  );
};

function SceneWrapper(props: {
  sceneIndex: number; title: string; emoji: string; lines: string[];
  fileName: string; explanation: string; sceneDuration: number;
}) {
  const frame = useCurrentFrame();
  return (
    <CodeScene sceneFrame={frame} sceneIndex={props.sceneIndex} title={props.title} emoji={props.emoji}
      lines={props.lines} fileName={props.fileName} explanation={props.explanation} sceneDuration={props.sceneDuration} />
  );
}
