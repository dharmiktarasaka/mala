import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Post } from '../types';
import { useThemeStore } from '../store/themeStore';

interface PostCardProps {
  post: Post;
  onLikePress: () => void;
  onCommentPress: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLikePress,
  onCommentPress,
}) => {
  const { mode } = useThemeStore();
  const theme = Colors[mode];

  const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    PRACTICE: 'flower-outline',
    QUOTES: 'book-outline',
    MEDITATION: 'partly-sunny-outline',
    BHAKTI: 'heart-outline',
    ACHIEVEMENTS: 'trophy-outline',
    COMMUNITY: 'people-outline',
    GENERAL: 'chatbubble-ellipses-outline',
  };

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      {/* Devotee Header */}
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {post.author?.displayName?.[0]?.toUpperCase() || '🕉️'}
          </Text>
        </View>

        <View style={styles.authorInfo}>
          <Text style={[styles.displayName, { color: theme.textPrimary }]}>
            {post.author?.displayName || 'Devotee'}
          </Text>
          <Text style={[styles.username, { color: theme.textSecondary }]}>
            @{post.author?.username} • {timeAgo(post.createdAt)}
          </Text>
        </View>

        {/* Category Pill */}
        <View style={styles.categoryPill}>
          <Ionicons
            name={categoryIcons[post.category] || 'sparkles-outline'}
            size={12}
            color={Colors.primary}
          />
          <Text style={styles.categoryText}>{post.category}</Text>
        </View>
      </View>

      {/* Post Content */}
      <Text style={[styles.content, { color: theme.textPrimary }]}>{post.content}</Text>

      {/* Social Actions (Like, Comment, Share) */}
      <View style={[styles.actionsRow, { borderTopColor: theme.border }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onLikePress}
          style={styles.actionItem}
        >
          <Ionicons
            name={post.isLikedByMe ? 'heart' : 'heart-outline'}
            size={20}
            color={post.isLikedByMe ? '#E53935' : theme.textSecondary}
          />
          <Text
            style={[
              styles.actionLabel,
              { color: post.isLikedByMe ? '#E53935' : theme.textSecondary },
            ]}
          >
            {post.likesCount} Blessings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onCommentPress}
          style={styles.actionItem}
        >
          <Ionicons
            name="chatbubble-outline"
            size={18}
            color={theme.textSecondary}
          />
          <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>
            {post.commentsCount} Comments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} style={styles.actionItem}>
          <Ionicons
            name="share-social-outline"
            size={18}
            color={theme.textSecondary}
          />
          <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>
            Share
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.accentGold,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  authorInfo: {
    flex: 1,
    marginLeft: 10,
  },
  displayName: {
    fontSize: 14,
    fontWeight: '700',
  },
  username: {
    fontSize: 11,
    marginTop: 2,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  content: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
