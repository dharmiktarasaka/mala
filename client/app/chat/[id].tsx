import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Header } from '../../src/components/Header';
import { apiClient, getSocket } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';

export default function ChatRoomScreen() {
  const { id: conversationId, username, displayName } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { mode } = useThemeStore();
  const theme = Colors[mode];

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchMessages();

    // Setup real-time WebSocket connection
    const socket = getSocket();
    socket.emit('join:conversation', { conversationId });

    socket.on('new:message', (msg: any) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    });

    socket.on('devotee:typing', (data: any) => {
      if (data.conversationId === conversationId && data.userId !== user?.id) {
        setIsOtherTyping(data.isTyping);
      }
    });

    return () => {
      socket.emit('leave:conversation', { conversationId });
      socket.off('new:message');
      socket.off('devotee:typing');
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const res: any = await apiClient.get(`/chat/conversations/${conversationId}/messages`);
      if (res.data) {
        setMessages(res.data);
        scrollToBottom();
      }
    } catch {}
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      const res: any = await apiClient.post('/chat/messages', {
        recipientIdentifier: String(username),
        content: textToSend,
      });

      if (res.data) {
        setMessages((prev) => [...prev, res.data]);
        scrollToBottom();
      }
    } catch {
      // optimistic update
      setMessages((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          senderId: user?.id,
          content: textToSend,
          createdAt: new Date().toISOString(),
        },
      ]);
      scrollToBottom();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title={String(displayName || username || 'Satsang Chat')} showBack />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={scrollToBottom}
      >
        {messages.map((msg) => {
          const isMine = msg.senderId === user?.id;
          return (
            <View
              key={msg.id}
              style={[
                styles.messageBubbleWrapper,
                isMine ? styles.myBubbleWrapper : styles.theirBubbleWrapper,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  isMine
                    ? { backgroundColor: Colors.primary }
                    : { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: isMine ? '#FFFFFF' : theme.textPrimary },
                  ]}
                >
                  {msg.content}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    { color: isMine ? '#FFE0B2' : theme.textSecondary },
                  ]}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          );
        })}

        {isOtherTyping && (
          <View style={styles.typingIndicator}>
            <Text style={[styles.typingText, { color: theme.textSecondary }]}>
              {displayName} is typing sacred message...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Message Input Bar */}
      <View style={[styles.inputBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TextInput
          style={[
            styles.textInput,
            { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border },
          ]}
          placeholder="Type a spiritual message..."
          placeholderTextColor={theme.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!inputText.trim()}
          style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]}
        >
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubbleWrapper: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  myBubbleWrapper: {
    alignSelf: 'flex-end',
  },
  theirBubbleWrapper: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingIndicator: {
    paddingVertical: 6,
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          outline: 'none',
          boxShadow: 'none',
        } as any)
      : {}),
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

