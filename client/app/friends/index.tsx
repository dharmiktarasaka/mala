import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Header } from '../../src/components/Header';
import { apiClient } from '../../src/api/client';
import { useThemeStore } from '../../src/store/themeStore';

export default function FriendsScreen() {
  const { mode, t } = useThemeStore();
  const theme = Colors[mode];

  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [friends, setFriends] = useState<any[]>([]);
  const [incomingReqs, setIncomingReqs] = useState<any[]>([]);
  const [sentReqs, setSentReqs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFriendsAndRequests = async () => {
    try {
      const [friendsRes, reqRes]: any = await Promise.all([
        apiClient.get('/friends'),
        apiClient.get('/friends/requests'),
      ]);

      if (friendsRes.data) setFriends(friendsRes.data);
      if (reqRes.data) {
        setIncomingReqs(reqRes.data.incoming || []);
        setSentReqs(reqRes.data.sent || []);
      }
    } catch {}
  };

  useEffect(() => {
    fetchFriendsAndRequests();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFriendsAndRequests();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res: any = await apiClient.get(`/users/search?q=${searchQuery.trim()}`);
      if (res.data) setSearchResults(res.data);
    } catch {}
  };

  const handleSendRequest = async (targetUsername: string) => {
    try {
      await apiClient.post(`/friends/request/${targetUsername}`);
      Alert.alert('Request Sent', `Friend request sent to @${targetUsername}`);
      fetchFriendsAndRequests();
    } catch (err: any) {
      Alert.alert('Notice', err.response?.data?.message || 'Unable to send request');
    }
  };

  const handleRespondRequest = async (requestId: string, action: 'ACCEPTED' | 'REJECTED') => {
    try {
      await apiClient.post(`/friends/respond/${requestId}`, { action });
      fetchFriendsAndRequests();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update request');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Devotee Friends" showBack />

      {/* Tabs Bar */}
      <View style={[styles.tabBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('friends')}
          style={[styles.tabBtn, activeTab === 'friends' && styles.activeTabBtn]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'friends' ? Colors.primary : theme.textSecondary }]}>
            My Friends ({friends.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('requests')}
          style={[styles.tabBtn, activeTab === 'requests' && styles.activeTabBtn]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'requests' ? Colors.primary : theme.textSecondary }]}>
            Requests ({incomingReqs.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('search')}
          style={[styles.tabBtn, activeTab === 'search' && styles.activeTabBtn]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'search' ? Colors.primary : theme.textSecondary }]}>
            Find Devotees
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {activeTab === 'friends' && (
          <View style={styles.listSection}>
            {friends.length > 0 ? (
              friends.map((f) => (
                <View
                  key={f.userId}
                  style={[styles.friendCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{f.displayName?.[0]?.toUpperCase() || '🕉️'}</Text>
                  </View>

                  <View style={styles.friendInfo}>
                    <Text style={[styles.friendName, { color: theme.textPrimary }]}>{f.displayName}</Text>
                    <Text style={[styles.friendUsername, { color: Colors.primary }]}>@{f.username}</Text>
                    {f.lifetimeMala !== null && (
                      <Text style={[styles.friendMala, { color: Colors.accentGoldDark }]}>
                        {f.lifetimeMala} Lifetime Mala
                      </Text>
                    )}
                  </View>

                  {/* Actions (Message & Send Mala) */}
                  <View style={styles.friendActions}>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: '/chat/[id]',
                          params: { id: f.userId, username: f.username, displayName: f.displayName },
                        } as any)
                      }
                      style={[styles.iconActionBtn, { backgroundColor: '#EDE7F6' }]}
                    >
                      <Ionicons name="chatbubble" size={16} color="#7E57C2" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => router.push('/transfer/send' as any)}
                      style={[styles.iconActionBtn, { backgroundColor: '#FFF3E0' }]}
                    >
                      <Ionicons name="gift" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Ionicons name="people-outline" size={40} color={theme.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Friends Connected</Text>
                <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                  Search devotees or explore suggestions to build your spiritual circle.
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'requests' && (
          <View style={styles.listSection}>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              INCOMING REQUESTS ({incomingReqs.length})
            </Text>
            {incomingReqs.length > 0 ? (
              incomingReqs.map((req) => (
                <View
                  key={req.requestId}
                  style={[styles.friendCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{req.user?.displayName?.[0]?.toUpperCase() || '🕉️'}</Text>
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={[styles.friendName, { color: theme.textPrimary }]}>{req.user?.displayName}</Text>
                    <Text style={[styles.friendUsername, { color: Colors.primary }]}>@{req.user?.username}</Text>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() => handleRespondRequest(req.requestId, 'ACCEPTED')}
                      style={[styles.smallBtn, { backgroundColor: Colors.success }]}
                    >
                      <Text style={styles.smallBtnText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRespondRequest(req.requestId, 'REJECTED')}
                      style={[styles.smallBtn, { backgroundColor: '#F3F4F6' }]}
                    >
                      <Text style={[styles.smallBtnText, { color: '#6B7280' }]}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={[styles.noReqText, { color: theme.textMuted }]}>No incoming friend requests.</Text>
            )}
          </View>
        )}

        {activeTab === 'search' && (
          <View style={styles.listSection}>
            <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                style={[styles.searchInput, { color: theme.textPrimary }]}
                placeholder={t('searchDevotees')}
                placeholderTextColor={theme.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity onPress={handleSearch} style={styles.searchSubmitBtn}>
                <Text style={styles.searchSubmitText}>Search</Text>
              </TouchableOpacity>
            </View>

            {searchResults.map((devotee) => (
              <View
                key={devotee.id}
                style={[styles.friendCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{devotee.displayName?.[0]?.toUpperCase() || '🕉️'}</Text>
                </View>
                <View style={styles.friendInfo}>
                  <Text style={[styles.friendName, { color: theme.textPrimary }]}>{devotee.displayName}</Text>
                  <Text style={[styles.friendUsername, { color: Colors.primary }]}>@{devotee.username}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleSendRequest(devotee.username)}
                  style={[styles.smallBtn, { backgroundColor: Colors.primary }]}
                >
                  <Text style={styles.smallBtnText}>Connect</Text>
                </TouchableOpacity>
              </View>
            ))}
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabBtn: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  listSection: {
    gap: 8,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.accentGold,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '700',
  },
  friendUsername: {
    fontSize: 12,
    fontWeight: '600',
  },
  friendMala: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  friendActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 30,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginVertical: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  smallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  smallBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  noReqText: {
    fontSize: 13,
    padding: 16,
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
  searchSubmitBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  searchSubmitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

