import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Header } from '../../src/components/Header';
import { apiClient } from '../../src/api/client';
import { useThemeStore } from '../../src/store/themeStore';
import { NotificationItem } from '../../src/types';

export default function NotificationsScreen() {
  const { mode } = useThemeStore();
  const theme = Colors[mode];

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res: any = await apiClient.get('/notifications');
      if (res.data) setNotifications(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'MALA_RECEIVED':
        return { name: 'arrow-down-circle', color: Colors.success };
      case 'MALA_SENT':
        return { name: 'arrow-up-circle', color: Colors.primary };
      case 'FRIEND_REQUEST':
      case 'FRIEND_ACCEPTED':
        return { name: 'people', color: '#7E57C2' };
      case 'ACHIEVEMENT_UNLOCKED':
        return { name: 'trophy', color: Colors.accentGoldDark };
      default:
        return { name: 'notifications', color: Colors.primary };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title="Notification Center"
        showBack
        rightAction={
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markReadBtn}>
            <Text style={styles.markReadText}>Mark all read</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {notifications.length > 0 ? (
          notifications.map((item) => {
            const icon = getNotifIcon(item.type);
            return (
              <View
                key={item.id}
                style={[
                  styles.notifCard,
                  {
                    backgroundColor: item.isRead ? theme.surface : theme.surfaceSubtle,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={[styles.iconCircle, { backgroundColor: `${icon.color}15` }]}>
                  <Ionicons name={icon.name as any} size={22} color={icon.color} />
                </View>

                <View style={styles.notifContent}>
                  <Text style={[styles.notifTitle, { color: theme.textPrimary }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.notifBody, { color: theme.textSecondary }]}>
                    {item.body}
                  </Text>
                  <Text style={[styles.notifTime, { color: theme.textMuted }]}>
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                {!item.isRead && <View style={styles.unreadDot} />}
              </View>
            );
          })
        ) : (
          <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="notifications-off-outline" size={40} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No notifications yet. You are completely up to date.
            </Text>
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
    gap: 8,
  },
  markReadBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  notifBody: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
});

