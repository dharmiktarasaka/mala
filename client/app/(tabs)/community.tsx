import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Header } from '../../src/components/Header';
import { PostCard } from '../../src/components/PostCard';
import { apiClient } from '../../src/api/client';
import { useThemeStore } from '../../src/store/themeStore';
import { Post } from '../../src/types';

const CATEGORIES = [
  'ALL',
  'PRACTICE',
  'QUOTES',
  'MEDITATION',
  'BHAKTI',
  'ACHIEVEMENTS',
  'COMMUNITY',
];

export default function CommunityFeedScreen() {
  const { mode, t } = useThemeStore();
  const theme = Colors[mode];

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New post state
  const [newContent, setNewContent] = useState('');
  const [postCategory, setPostCategory] = useState('GENERAL');
  const [submitting, setSubmitting] = useState(false);

  const fetchFeed = async () => {
    try {
      const catParam = selectedCategory !== 'ALL' ? `&category=${selectedCategory}` : '';
      const res: any = await apiClient.get(`/feed/posts?filter=home${catParam}&limit=30`);
      if (res.data?.items) {
        setPosts(res.data.items);
      }
    } catch {
      // offline / mock fallback
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeed();
    setRefreshing(false);
  };

  const handleToggleLike = async (postId: string) => {
    try {
      const res: any = await apiClient.post(`/feed/posts/${postId}/like`);
      const { liked, likesCount } = res.data;

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isLikedByMe: liked, likesCount } : p,
        ),
      );
    } catch {
      // optimistic toggle
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLikedByMe: !p.isLikedByMe,
                likesCount: p.isLikedByMe ? p.likesCount - 1 : p.likesCount + 1,
              }
            : p,
        ),
      );
    }
  };

  const handleCreatePost = async () => {
    if (!newContent.trim()) {
      Alert.alert('Empty Post', 'Please write a spiritual thought or sadhana update.');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/feed/posts', {
        content: newContent.trim(),
        category: postCategory,
        visibility: 'PUBLIC',
      });

      setNewContent('');
      setShowCreateModal(false);
      fetchFeed();
      Alert.alert('Blessed!', 'Your experience was shared with the spiritual community.');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Spiritual Community" />

      {/* Categories Horizontal Scroll */}
      <View style={[styles.categoryBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.catPill,
                  isSelected
                    ? { backgroundColor: Colors.primary, borderColor: Colors.primary }
                    : { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                ]}
              >
                <Text
                  style={[
                    styles.catText,
                    { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLikePress={() => handleToggleLike(post.id)}
              onCommentPress={() => Alert.alert('Comments', `View ${post.commentsCount} comments`)}
            />
          ))
        ) : (
          <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="chatbubbles-outline" size={36} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No posts in this category yet. Be the first to share your sadhana!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button (+ Post) */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setShowCreateModal(true)}
        style={styles.fab}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Create Post Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Share with Devotees
              </Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border },
              ]}
              placeholder="Write your spiritual realization, today's mala achievement or sacred quote..."
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={4}
              value={newContent}
              onChangeText={setNewContent}
            />

            {/* Select category */}
            <Text style={[styles.categorySelectLabel, { color: theme.textSecondary }]}>
              Category:
            </Text>
            <View style={styles.catGrid}>
              {['PRACTICE', 'QUOTES', 'MEDITATION', 'BHAKTI', 'GENERAL'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setPostCategory(cat)}
                  style={[
                    styles.smallCatPill,
                    postCategory === cat
                      ? { backgroundColor: Colors.primary }
                      : { backgroundColor: theme.surfaceSubtle, borderWidth: 1, borderColor: theme.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.smallCatText,
                      { color: postCategory === cat ? '#FFFFFF' : theme.textPrimary },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleCreatePost}
              disabled={submitting}
              style={[styles.publishBtn, submitting && { opacity: 0.7 }]}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.publishBtnText}>Publish to Community</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryBar: {
    height: 48,
    borderBottomWidth: 1,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  catText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 20,
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  textArea: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    height: 110,
    textAlignVertical: 'top',
    fontSize: 14,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          outline: 'none',
          boxShadow: 'none',
        } as any)
      : {}),
  },
  categorySelectLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 8,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 20,
  },
  smallCatPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  smallCatText: {
    fontSize: 11,
    fontWeight: '700',
  },
  publishBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

