import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * キーボードの表示状態に連動して、その高さ（表示中は `endCoordinates.height`、
 * 非表示時は `0`）を返すフック。
 *
 * エッジツーエッジ表示が標準の Android（Expo SDK 54）では
 * `KeyboardAvoidingView` の `SOFT_INPUT_ADJUST_RESIZE` によるウィンドウ縮小が
 * 効かないため、取得した高さをモーダル側で `paddingBottom` として明示的に
 * 適用することで入力欄の隠れを防ぐ。
 *
 * iOS はアニメーションに追従できる `keyboardWillShow` / `keyboardWillHide` を、
 * Android はそれらのイベントが発火しないため `keyboardDidShow` / `keyboardDidHide`
 * を購読する。
 */
export function useKeyboardHeight(): number {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return keyboardHeight;
}
