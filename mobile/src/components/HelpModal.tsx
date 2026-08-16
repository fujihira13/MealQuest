import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface HelpItem {
  number: string;
  title: string;
  description: string;
}

const RECORD_ITEMS: HelpItem[] = [
  {
    number: '1',
    title: '買ったもの',
    description: '食べ物・飲み物を買ったら、カテゴリと金額を記録します。',
  },
  {
    number: '2',
    title: '自炊',
    description: '朝・昼・夜、それぞれ自炊したかを記録します。',
  },
  {
    number: '3',
    title: '買うのをやめたとき',
    description: 'コンビニに寄りたかったけど我慢した、というときにその金額を記録できます。',
  },
];

export function HelpModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>ヘルプ</Text>

          <TouchableOpacity
            style={styles.closeIconBtn}
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.closeIconText}>✕</Text>
          </TouchableOpacity>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.introText}>
              MealQuest は毎日の食費を記録して、使いすぎを防ぐためのアプリです。{'\n'}
              家賃や光熱費など、食費以外の支出は扱いません。
            </Text>

            <Text style={styles.sectionHeading}>記録する3つのこと</Text>
            {RECORD_ITEMS.map((item) => (
              <View key={item.number} style={styles.itemBlock}>
                <Text style={styles.itemTitle}>
                  {item.number}. {item.title}
                </Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
            ))}

            <Text style={styles.sectionHeading}>2つの予算</Text>
            <Text style={styles.bodyText}>
              食費を「スーパー」と「それ以外」に分けて管理します。
            </Text>
            <View style={styles.itemBlock}>
              <Text style={styles.itemTitle}>・スーパー</Text>
              <Text style={styles.itemDescription}>自炊のための食材費です。</Text>
            </View>
            <View style={styles.itemBlock}>
              <Text style={styles.itemTitle}>・それ以外</Text>
              <Text style={styles.itemDescription}>
                コンビニ・自販機・外食・飲み会・デート・その他。お小遣いから引かれます。
              </Text>
            </View>
            <Text style={styles.bodyText}>
              自炊のための買い物は無理に減らす必要がないため、スーパーだけ別の予算にしています。どちらの金額も設定画面で変更できます。
            </Text>

            <Text style={styles.sectionHeading}>ポイントとレベル</Text>
            <Text style={styles.bodyText}>
              記録するとポイントが貯まり、レベルが上がります。{'\n'}
              100ポイントでガチャを1回引けます。{'\n'}
              ミッションは毎日・毎週入れ替わります。達成すると20〜120ポイントもらえます。
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 8,
  },
  closeIconBtn: {
    position: 'absolute',
    top: 10,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '700',
  },
  scrollArea: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
  },
  introText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#424242',
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#E8F5E9',
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#424242',
    marginBottom: 10,
  },
  itemBlock: {
    marginBottom: 12,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#E8F5E9',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 3,
  },
  itemDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#757575',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  closeBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
