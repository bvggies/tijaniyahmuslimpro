import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Clipboard } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Toast } from '../ui/Toast';
import { bookmarksService } from '../../services/bookmarks';
import { CardColor, ListStyle } from '../../data/tijaniyah/tijaniyaFiqhContent';

interface FiqhCardProps {
  id: string;
  title: string;
  body: string;
  color: CardColor;
  icon: string;
  isCollapsible?: boolean;
  listStyle?: ListStyle;
  listItems?: string[];
}

const getCardColors = (color: CardColor): string[] => {
  switch (color) {
    case 'teal':
      return ['rgba(14, 106, 106, 0.35)', 'rgba(14, 106, 106, 0.25)'];
    case 'green':
      return ['rgba(31, 106, 50, 0.35)', 'rgba(31, 106, 50, 0.25)'];
    case 'amber':
      return ['rgba(182, 122, 18, 0.35)', 'rgba(182, 122, 18, 0.25)'];
    case 'grey':
      return ['rgba(63, 106, 106, 0.3)', 'rgba(63, 106, 106, 0.2)'];
    default:
      return ['rgba(14, 106, 106, 0.35)', 'rgba(14, 106, 106, 0.25)'];
  }
};

// Determine if content is long enough to collapse (roughly 8 lines)
const isLongContent = (text: string): boolean => {
  const charCount = text.length;
  // Rough estimate: ~60-70 chars per line, so 8 lines = ~480-560 chars
  return charCount > 500;
};

const renderListItems = (body: string, listStyle: ListStyle): React.ReactNode => {
  if (listStyle === 'none' || !listStyle) {
    return <Text style={styles.body}>{body}</Text>;
  }

  // Extract list items from body text
  const lines = body.split('\n').filter((line) => line.trim());
  const listItems: string[] = [];
  let regularText: string[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (
      (listStyle === 'numbered' && /^\d+\./.test(trimmed)) ||
      (listStyle === 'lettered' && /^[a-d]\)/.test(trimmed)) ||
      (listStyle === 'bulleted' && /^[•\-\*]/.test(trimmed))
    ) {
      listItems.push(trimmed);
    } else {
      regularText.push(line);
    }
  });

  return (
    <View>
      {regularText.length > 0 && (
        <Text style={styles.body}>{regularText.join('\n')}</Text>
      )}
      {listItems.length > 0 && (
        <View style={styles.listContainer}>
          {listItems.map((item, index) => {
            // Remove the marker and clean the text
            const cleanText = item.replace(/^[•\-\*]\s*/, '').replace(/^\d+\.\s*/, '').replace(/^[a-d]\)\s*/, '');
            return (
              <View key={index} style={styles.listItem}>
                {listStyle === 'bulleted' && (
                  <Text style={styles.bullet}>•</Text>
                )}
                {listStyle === 'numbered' && (
                  <Text style={styles.number}>{index + 1}.</Text>
                )}
                {listStyle === 'lettered' && (
                  <Text style={styles.letter}>{String.fromCharCode(97 + index)}.</Text>
                )}
                <Text style={styles.listItemText}>{cleanText}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export const FiqhCard: React.FC<FiqhCardProps> = ({
  id,
  title,
  body,
  color,
  icon,
  isCollapsible = false,
  listStyle = 'none',
}) => {
  const [isExpanded, setIsExpanded] = useState(!isCollapsible);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const checkBookmark = async () => {
      const bookmarked = await bookmarksService.isBookmarked(id);
      setIsBookmarked(bookmarked);
    };
    void checkBookmark();
  }, [id]);

  const shouldCollapse = isCollapsible && isLongContent(body);
  const displayBody = shouldCollapse && !isExpanded
    ? body.substring(0, 500) + (body.length > 500 ? '...' : '')
    : body;

  const cardColors = getCardColors(color);

  const handleCopy = async () => {
    try {
      await Clipboard.setString(`${title}\n\n${body}`);
      setToastMessage('Copied');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('Error copying text:', error);
    }
  };

  const handleBookmark = async () => {
    const newState = await bookmarksService.toggleBookmark({
      id,
      type: 'card',
      cardId: id,
      title,
      content: body,
    });
    setIsBookmarked(newState);
    setToastMessage(newState ? 'Saved to bookmarks' : 'Removed from bookmarks');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={cardColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.innerBorder} />
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconBadge}>
              <Ionicons name={icon as any} size={18} color={colors.evergreen[500]} />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>

          <View style={styles.bodyContainer}>
            {renderListItems(displayBody, listStyle)}
          </View>

          <View style={styles.actionsRow}>
            {shouldCollapse && (
              <Pressable
                onPress={() => setIsExpanded(!isExpanded)}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>
                  {isExpanded ? 'Show less' : 'Read more'}
                </Text>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.evergreen[500]}
                />
              </Pressable>
            )}
            <View style={styles.actionButtons}>
              <Pressable onPress={handleCopy} style={styles.iconButton}>
                <Ionicons name="copy-outline" size={18} color={colors.pineBlue[300]} />
              </Pressable>
              <Pressable onPress={handleBookmark} style={styles.iconButton}>
                <Ionicons
                  name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={isBookmarked ? colors.evergreen[500] : colors.pineBlue[300]}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </LinearGradient>
      <Toast visible={showToast} message={toastMessage} icon="checkmark-circle" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  gradient: {
    borderRadius: 20,
    position: 'relative',
  },
  innerBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    pointerEvents: 'none',
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginTop: 2,
  },
  title: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    fontWeight: '600',
    flex: 1,
    lineHeight: 24,
  },
  bodyContainer: {
    maxWidth: '93%',
  },
  body: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    lineHeight: 22,
    fontSize: 14,
  },
  listContainer: {
    marginTop: spacing.xs,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  bullet: {
    ...typography.bodyMd,
    color: colors.evergreen[500],
    fontSize: 16,
    marginTop: 2,
  },
  number: {
    ...typography.bodyMd,
    color: colors.evergreen[500],
    fontSize: 14,
    fontWeight: '600',
    minWidth: 24,
  },
  letter: {
    ...typography.bodyMd,
    color: colors.evergreen[500],
    fontSize: 14,
    fontWeight: '600',
    minWidth: 20,
  },
  listItemText: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    lineHeight: 22,
    fontSize: 14,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    ...typography.bodySm,
    fontSize: 13,
    color: colors.evergreen[500],
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconButton: {
    padding: spacing.xs,
  },
});

export default FiqhCard;

