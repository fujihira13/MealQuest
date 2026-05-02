import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence, Audio, staticFile } from 'remotion';
import React from 'react';

const COLORS = {
  bg1: '#0d1117',
  bg2: '#161b22',
  keyword: '#c084fc',
  string: '#4ade80',
  comment: '#6b7280',
  accent: '#3b82f6',
  red: '#ef4444',
  green: '#10b981',
  yellow: '#f59e0b',
};

const PAD = 60;
const W = 1080;
const CODE_W = W - PAD * 2;

/* ── SRTベースのシーン切り替えフレーム ──
 * narration_A.srt タイムスタンプ:
 * 0:00-4.96  → 再宣言について（イントロ）
 * 4.96-10.20 → varは同じ名前で何度も宣言できてしまう
 * 10.20-15.80 → constなら再宣言するとエラー
 * 15.80-20.12 → 次にスコープ
 * 20.12-24.44 → constならブロックスコープ
 * 24.44-29.12 → 結論 基本はconst
 * 29.12-32.60 → varは使わないで
 *
 * シーン構成:
 * Title: 0-150 (0-5s)
 * Scene1 再宣言: 150-476 (5s-15.8s) → SRT 4.96s-15.80s
 * Scene2 スコープ: 476-733 (15.8s-24.44s)
 * Scene3 まとめ: 733-922 (24.44s-end)
 */

const TypewriterLine: React.FC<{ parts: { text: string; color: string }[]; startFrame: number }> = ({ parts, startFrame }) => {
  const frame = useCurrentFrame();
  const full = parts.map(p => p.text).join('');
  const chars = Math.min(full.length, Math.max(0, frame - startFrame));
  let remaining = chars;
  return (
    <>
      {parts.map((p, i) => {
        if (remaining <= 0) return null;
        const show = Math.min(p.text.length, remaining);
        remaining -= show;
        return <span key={i} style={{ color: p.color }}>{p.text.slice(0, show)}</span>;
      })}
    </>
  );
};

const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  const visible = Math.floor(frame / 10) % 2 === 0;
  return <span style={{ color: '#58a6ff', opacity: visible ? 1 : 0, fontWeight: 'bold' }}>▌</span>;
};

const ProgressDots: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div style={{ position: 'absolute', top: 80, left: PAD, display: 'flex', alignItems: 'center', gap: 8 }}>
    {Array.from({ length: total }).map((_, i) => (
      <React.Fragment key={i}>
        <div style={{
          width: 14, height: 14, borderRadius: '50%',
          background: i < current ? COLORS.accent : 'rgba(255,255,255,0.2)',
        }} />
        {i < total - 1 && <div style={{ width: 30, height: 3, background: i < current ? COLORS.accent : 'rgba(255,255,255,0.15)' }} />}
      </React.Fragment>
    ))}
    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 24, marginLeft: 12 }}>{current}/{total}</span>
  </div>
);

const SceneHeading: React.FC<{ icon: string; text: string }> = ({ icon, text }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const s = spring({ frame, fps, config: { damping: 15 } });
  return (
    <div style={{ position: 'absolute', top: 180, left: PAD, opacity: s, transform: `translateY(${(1 - s) * 20}px)` }}>
      <div style={{ fontSize: 48, fontWeight: 700, color: '#fff' }}>{icon} {text}</div>
      <div style={{ width: 120, height: 3, background: COLORS.accent, marginTop: 12 }} />
    </div>
  );
};

const CodeWindow: React.FC<{
  badLabel: string; badLines: { parts: { text: string; color: string }[] }[];
  goodLabel: string; goodLines: { parts: { text: string; color: string }[] }[];
  startFrame: number;
}> = ({ badLabel, badLines, goodLabel, goodLines, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const lineH = 48;
  const headerH = 48;
  const sectionPad = 16;

  let charOffset = 0;
  const renderLines = (lines: { parts: { text: string; color: string }[] }[], bg: string, label: string, hdrColor: string) => {
    const section = lines.map((line, li) => {
      const lineLen = line.parts.map(p => p.text).join('').length;
      const sf = startFrame + charOffset;
      charOffset += lineLen;
      return (
        <div key={li} style={{ fontSize: 30, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", lineHeight: 1.6 }}>
          <TypewriterLine parts={line.parts} startFrame={sf} />
          {li === lines.length - 1 && <Cursor />}
        </div>
      );
    });
    return (
      <div style={{ background: bg, padding: `${sectionPad}px 20px` }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: hdrColor, marginBottom: 8 }}>{label}</div>
        {section}
      </div>
    );
  };

  const badContent = (() => {
    charOffset = 0;
    return renderLines(badLines, 'rgba(239,68,68,0.06)', badLabel, COLORS.red);
  })();
  const goodContent = (() => {
    charOffset = badLines.reduce((a, l) => a + l.parts.map(p => p.text).join('').length, 0);
    return renderLines(goodLines, 'rgba(16,185,129,0.06)', goodLabel, COLORS.green);
  })();

  return (
    <div style={{
      width: CODE_W,
      borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)',
      opacity: s, transform: `scale(${0.95 + s * 0.05})`,
    }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 22 }}>📌 compare.js</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: 14, height: 14, borderRadius: '50%', background: c }} />)}
        </div>
      </div>
      {badContent}
      <div style={{ height: 2, background: 'rgba(255,255,255,0.1)' }} />
      {goodContent}
    </div>
  );
};

const ExplanationCard: React.FC<{ text: string; delayFrames?: number }> = ({ text, delayFrames = 60 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: Math.max(0, frame - delayFrames), fps, config: { damping: 12, stiffness: 80 } });
  return (
    <div style={{
      marginTop: 50, width: CODE_W,
      background: 'rgba(59,130,246,0.12)', borderRadius: 16, padding: '28px 36px',
      border: '1px solid rgba(59,130,246,0.2)',
      opacity: s, transform: `translateY(${(1 - s) * 30}px)`,
    }}>
      <div style={{ fontSize: 42, color: '#fff', lineHeight: 1.5, fontWeight: 600 }}>💡 {text}</div>
    </div>
  );
};

const GridBg: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(135deg, ${COLORS.bg1}, ${COLORS.bg2})` }}>
    <div style={{
      position: 'absolute', inset: 0, opacity: 0.04,
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
      backgroundSize: '60px 60px',
    }} />
  </AbsoluteFill>
);

export const FusionAV3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ fontFamily: "'Inter','Noto Sans JP',sans-serif" }}>
      <GridBg />
      <Audio src={staticFile('audio_mixed_A.mp3')} />

      {/* Title Scene 0-150 (0-5s) */}
      <Sequence from={0} durationInFrames={150}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          {(() => {
            const s = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
            return (
              <div style={{ textAlign: 'center', transform: `scale(${s})` }}>
                <div style={{ fontSize: 80, fontWeight: 800, color: '#fff', letterSpacing: -2 }}>
                  <span style={{ color: COLORS.red }}>var</span> vs <span style={{ color: COLORS.green }}>const</span>
                </div>
                <div style={{ fontSize: 36, color: 'rgba(255,255,255,0.6)', marginTop: 24 }}>安全なコードの書き方</div>
              </div>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* Scene 1: 150-476 (5s-15.8s) 再宣言の危険 */}
      <Sequence from={150} durationInFrames={326}>
        <AbsoluteFill>
          <ProgressDots current={1} total={3} />
          <SceneHeading icon="🔥" text="再宣言の危険" />
          <div style={{ position: 'absolute', top: '30%', left: PAD }}>
            <CodeWindow
              startFrame={30}
              badLabel="// ❌ 悪い例"
              badLines={[
                { parts: [{ text: 'var', color: COLORS.keyword }, { text: ' name = ', color: '#fff' }, { text: '"太郎"', color: COLORS.string }, { text: ';', color: '#fff' }] },
                { parts: [{ text: 'var', color: COLORS.keyword }, { text: ' name = ', color: '#fff' }, { text: '"花子"', color: COLORS.string }, { text: ';', color: '#fff' }, { text: ' // 上書きされる！', color: COLORS.comment }] },
              ]}
              goodLabel="// ✅ 良い例"
              goodLines={[
                { parts: [{ text: 'const', color: COLORS.keyword }, { text: ' name = ', color: '#fff' }, { text: '"太郎"', color: COLORS.string }, { text: ';', color: '#fff' }] },
                { parts: [{ text: 'const', color: COLORS.keyword }, { text: ' name = ', color: '#fff' }, { text: '"花子"', color: COLORS.string }, { text: ';', color: '#fff' }, { text: ' // ❌ エラー！', color: COLORS.red }] },
              ]}
            />
            <ExplanationCard text="constは再宣言を防いでバグを未然に防止" delayFrames={150} />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: 476-733 (15.8s-24.44s) スコープの違い */}
      <Sequence from={476} durationInFrames={257}>
        <AbsoluteFill>
          <ProgressDots current={2} total={3} />
          <SceneHeading icon="📦" text="スコープの違い" />
          <div style={{ position: 'absolute', top: '30%', left: PAD }}>
            <CodeWindow
              startFrame={30}
              badLabel="// ❌ 悪い例"
              badLines={[
                { parts: [{ text: 'if', color: COLORS.keyword }, { text: ' (', color: '#fff' }, { text: 'true', color: COLORS.keyword }, { text: ') { ', color: '#fff' }, { text: 'var', color: COLORS.keyword }, { text: ' x = ', color: '#fff' }, { text: '1', color: COLORS.string }, { text: '; }', color: '#fff' }] },
                { parts: [{ text: 'console', color: '#fff' }, { text: '.log', color: COLORS.keyword }, { text: '(x);', color: '#fff' }, { text: ' // 1 漏れる', color: COLORS.comment }] },
              ]}
              goodLabel="// ✅ 良い例"
              goodLines={[
                { parts: [{ text: 'if', color: COLORS.keyword }, { text: ' (', color: '#fff' }, { text: 'true', color: COLORS.keyword }, { text: ') { ', color: '#fff' }, { text: 'const', color: COLORS.keyword }, { text: ' x = ', color: '#fff' }, { text: '1', color: COLORS.string }, { text: '; }', color: '#fff' }] },
                { parts: [{ text: 'console', color: '#fff' }, { text: '.log', color: COLORS.keyword }, { text: '(x);', color: '#fff' }, { text: ' // ❌ Error', color: COLORS.red }] },
              ]}
            />
            <ExplanationCard text="constはブロックスコープで変数の漏れを防ぐ" delayFrames={120} />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: 733-922 (24.44s-end) まとめ */}
      <Sequence from={733} durationInFrames={189}>
        <AbsoluteFill>
          <ProgressDots current={3} total={3} />
          <SceneHeading icon="📝" text="まとめ" />
          {[
            { icon: '✅', text: 'const → 基本はこれ！', color: COLORS.green, delay: 30 },
            { icon: '⚡', text: 'let → 再代入が必要な時だけ', color: COLORS.yellow, delay: 60 },
            { icon: '❌', text: 'var → 使わない', color: COLORS.red, delay: 90, strike: true },
          ].map((item, i) => {
            const f = useCurrentFrame();
            const s = spring({ frame: Math.max(0, f - item.delay), fps, config: { damping: 12 } });
            return (
              <div key={i} style={{
                position: 'absolute', top: 400 + i * 120, left: PAD, right: PAD,
                opacity: s, transform: `translateX(${(1 - s) * 40}px)`,
              }}>
                <span style={{ fontSize: 48, color: item.color, fontWeight: 700, textDecoration: item.strike ? 'line-through' : 'none' }}>
                  {item.icon} {item.text}
                </span>
              </div>
            );
          })}
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
