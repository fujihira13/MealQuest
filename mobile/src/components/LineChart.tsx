import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';

interface DataPoint {
  label: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
}

export function LineChart({ data, width = 160, height = 100, color = '#4CAF50' }: Props) {
  if (data.length === 0) {
    return (
      <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={styles.empty}>データなし</Text>
      </View>
    );
  }

  const paddingLeft = 8;
  const paddingRight = 8;
  const paddingTop = 8;
  const paddingBottom = 20;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 1);
  const minVal = 0;

  const points = data.map((d, i) => ({
    x: paddingLeft + (i / Math.max(data.length - 1, 1)) * chartWidth,
    y: paddingTop + (1 - (d.value - minVal) / (maxVal - minVal)) * chartHeight,
    label: d.label,
    value: d.value,
  }));

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <Svg width={width} height={height}>
      {/* グリッド線 */}
      {[0, 0.5, 1].map((ratio, i) => (
        <Line
          key={i}
          x1={paddingLeft}
          y1={paddingTop + ratio * chartHeight}
          x2={width - paddingRight}
          y2={paddingTop + ratio * chartHeight}
          stroke="#E0E0E0"
          strokeWidth={1}
        />
      ))}
      {/* 折れ線 */}
      <Polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth={2}
      />
      {/* データポイント */}
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}
      {/* X軸ラベル（最初・最後のみ） */}
      {points.length > 0 && (
        <>
          <SvgText
            x={points[0].x}
            y={height - 4}
            fontSize={9}
            fill="#9E9E9E"
            textAnchor="middle"
          >
            {points[0].label}
          </SvgText>
          <SvgText
            x={points[points.length - 1].x}
            y={height - 4}
            fontSize={9}
            fill="#9E9E9E"
            textAnchor="middle"
          >
            {points[points.length - 1].label}
          </SvgText>
        </>
      )}
    </Svg>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 12,
    color: '#9E9E9E',
  },
});
