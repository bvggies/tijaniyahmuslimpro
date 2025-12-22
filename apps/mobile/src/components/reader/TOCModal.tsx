import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { BottomSheet } from '../ui/BottomSheet';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { TOCItem } from '../../utils/readerParser';

interface TOCModalProps {
  visible: boolean;
  onClose: () => void;
  toc: TOCItem[];
  onItemPress: (item: TOCItem) => void;
}

export const TOCModal: React.FC<TOCModalProps> = ({
  visible,
  onClose,
  toc,
  onItemPress,
}) => {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Table of Contents">
      <FlatList
        data={toc}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              onItemPress(item);
              onClose();
            }}
            style={styles.item}
          >
            <View style={[styles.indicator, { marginLeft: (item.level - 1) * spacing.lg }]} />
            <Text
              style={[
                styles.itemText,
                item.level === 1 && styles.itemTextLevel1,
                item.level === 2 && styles.itemTextLevel2,
              ]}
            >
              {item.text}
            </Text>
          </Pressable>
        )}
        contentContainerStyle={styles.content}
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.evergreen[500],
    marginRight: spacing.md,
  },
  itemText: {
    ...typography.bodyMd,
    fontSize: 15,
    color: colors.pineBlue[100],
    flex: 1,
  },
  itemTextLevel1: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  itemTextLevel2: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TOCModal;

