import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { Linking } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../ui/GlassCard';

interface HeroStreamCardProps {
  streamUrl: string;
  onError?: () => void;
}

export const HeroStreamCard: React.FC<HeroStreamCardProps> = ({ streamUrl, onError }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
    setLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleOpenYouTube = () => {
    // Convert embed URL to watch URL
    const watchUrl = streamUrl.replace('/embed/', '/watch?v=').split('?')[0];
    Linking.openURL(watchUrl).catch(() => {
      Linking.openURL(streamUrl).catch(console.error);
    });
  };

  // Convert YouTube URL to embed format if needed
  const getEmbedUrl = () => {
    if (!streamUrl) return '';
    
    // If already embed URL, return as is
    if (streamUrl.includes('/embed/')) {
      return `${streamUrl}${streamUrl.includes('?') ? '&' : '?'}playsinline=1&autoplay=1`;
    }
    
    // If watch URL, convert to embed
    const videoIdMatch = streamUrl.match(/[?&]v=([^&]+)/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?playsinline=1&autoplay=1`;
    }
    
    return streamUrl;
  };

  const embedUrl = getEmbedUrl();

  return (
    <GlassCard style={styles.card}>
      <View style={styles.container}>
        {loading && !error && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.evergreen[500]} />
            <Text style={styles.loadingText}>Loading stream...</Text>
          </View>
        )}
        
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="videocam-off" size={48} color={colors.pineBlue[300]} />
            <Text style={styles.errorTitle}>Stream Unavailable</Text>
            <Text style={styles.errorMessage}>
              The live stream is currently unavailable. Please try opening it on YouTube.
            </Text>
            <Pressable onPress={handleOpenYouTube} style={styles.openButton}>
              <Ionicons name="logo-youtube" size={18} color={colors.darkTeal[950]} />
              <Text style={styles.openButtonText}>Open on YouTube</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.webviewContainer}>
            <WebView
              source={{ uri: embedUrl }}
              style={styles.webview}
              onError={handleError}
              onLoad={handleLoad}
              allowsFullscreenVideo
              javaScriptEnabled
              domStorageEnabled
              mediaPlaybackRequiresUserAction={false}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.evergreen[500]} />
                </View>
              )}
            />
          </View>
        )}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.darkTeal[950],
    position: 'relative',
  },
  webviewContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 20,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.darkTeal[950],
  },
  loadingText: {
    ...typography.bodyMd,
    color: colors.pineBlue[300],
    marginTop: spacing.md,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.darkTeal[950],
  },
  errorTitle: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.evergreen[500],
  },
  openButtonText: {
    ...typography.buttonMd,
    color: colors.darkTeal[950],
    fontWeight: '600',
  },
});

export default HeroStreamCard;

