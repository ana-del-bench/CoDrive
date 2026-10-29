import { View } from 'react-native';
import { C } from '../theme';

export function QrMark() {
  const count = 21;
  const cell = 7;
  const finder = (row: number, col: number, r0: number, c0: number) => {
    if (row < r0 || col < c0 || row >= r0 + 7 || col >= c0 + 7) return false;
    const lr = row - r0;
    const lc = col - c0;
    if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
    return lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
  };
  const on = (row: number, col: number) => {
    if (finder(row, col, 0, 0) || finder(row, col, 0, 14) || finder(row, col, 14, 0)) return true;
    if (row === 6 && col > 7 && col < 14) return col % 2 === 0;
    if (col === 6 && row > 7 && row < 14) return row % 2 === 0;
    if (row > 8 && col > 8) return (row * 3 + col * 5) % 4 !== 0;
    if (row > 8 && col < 6) return (row + col) % 3 === 0;
    if (col > 8 && row < 6) return (row * 2 + col) % 3 === 0;
    return false;
  };

  return (
    <View style={{ width: count * cell, height: count * cell, backgroundColor: C.white }}>
      {Array.from({ length: count }, (_, row) => (
        <View key={row} style={{ flexDirection: 'row' }}>
          {Array.from({ length: count }, (_, col) => (
            <View
              key={col}
              style={{ width: cell, height: cell, backgroundColor: on(row, col) ? C.ink : C.white }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
