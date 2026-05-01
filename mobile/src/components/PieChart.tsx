import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

interface Slice {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: Slice[];
  size?: number;
  centerLabel?: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

export function PieChart({ data, size = 120, centerLabel }: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  if (total === 0) {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={styles.empty}>データなし</Text>
      </View>
    );
  }

  let currentAngle = 0;
  const slices = data.map((slice) => {
    const angle = (slice.value / total) * 360;
    const path = slicePath(cx, cy, r, currentAngle, currentAngle + angle);
    currentAngle += angle;
    return { ...slice, path };
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <G>
          {slices.map((slice, i) => (
            <Path key={i} d={slice.path} fill={slice.color} />
          ))}
        </G>
      </Svg>
      {centerLabel ? <Text style={styles.centerLabel}>{centerLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  centerLabel: {
    fontSize: 12,
    color: '#424242',
    marginTop: 4,
    fontWeight: '600',
  },
});
