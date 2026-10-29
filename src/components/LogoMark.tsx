import Svg, { Circle, Path } from 'react-native-svg';
import { C } from '../theme';

export function LogoMark() {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28">
      <Circle cx={14} cy={14} r={14} fill={C.teal} />
      <Path
        d="M7.5 18.5c2.2-5.6 3.6-5.4 5.4-1.4 1.5 3.3 2.8 3.2 6.2-5.4"
        stroke="#fff"
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
      />
      <Circle cx={7.6} cy={18.4} r={1.8} fill="#fff" />
      <Circle cx={19.2} cy={11.6} r={1.8} fill="#fff" />
    </Svg>
  );
}
