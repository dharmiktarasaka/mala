import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Header } from '../../src/components/Header';
import { apiClient } from '../../src/api/client';
import { useThemeStore } from '../../src/store/themeStore';

export default function ChatListScreen() {
  const { mode } = useThemeStore();
  const theme = Colors[mode];

  const [conversations, setConversations] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    try {
      const res: any = await apiClient.get('/chat/conversations');
      if (res.data) {
        setConversations(res.data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Satsang Chat" showBack />

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
        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <TouchableOpacity
              key={conv.id}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/chat/[id]',
                  params: {
                    id: conv.id,
                    username: conv.otherUser?.username,
                    displayName: conv.otherUser?.displayName,
                  },
                } as any)
              }
              style={[
                styles.convCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {conv.otherUser?.displayName?.[0]?.toUpperCase() || '🕉️'}
                </Text>
              </View>

              <View style={styles.convInfo}>
                <View style={styles.convTopRow}>
                  <Text style={[styles.convName, { color: theme.textPrimary }]}>
                    {conv.otherUser?.displayName || conv.otherUser?.username}
                  </Text>
                  <Text style={[styles.convTime, { color: theme.textSecondary }]}>
                    {conv.lastMessage
                      ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </Text>
                </View>

                <View style={styles.convBottomRow}>
                  <Text
                    style={[styles.lastMsg, { color: theme.textSecondary }]}
                    numberOfLines={1}
                  >
                    {conv.lastMessage?.content || 'Sacred conversation started'}
                  </Text>
                  {conv.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadCount}>{conv.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="chatbubbles-outline" size={40} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No Conversations Yet
            </Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Connect with fellow devotees in the Friends section to start satsang messages.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/friends/index' as any)}
              style={styles.findDevoteesBtn}
            >
              <Text style={styles.findDevoteesText}>Find Devotees</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.accentGold,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  convInfo: {
    flex: 1,
  },
  convTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convName: {
    fontSize: 15,
    fontWeight: '700',
  },
  convTime: {
    fontSize: 11,
  },
  convBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  lastMsg: {
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 4,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  findDevoteesBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  findDevoteesText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});

