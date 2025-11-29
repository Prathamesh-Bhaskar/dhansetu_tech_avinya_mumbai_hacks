import React, { useState, useRef } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { sendMessageToAi } from '../services/chatService';

type Message = { id: string; role: 'user' | 'assistant' | 'system'; content: string };

export default function ChatModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const inputRef = useRef<any>(null);

  const send = async () => {
    if (!text.trim()) return;
    const userMsg: Message = { id: String(Date.now()), role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setText('');

    try {
      const reply = await sendMessageToAi(userMsg.content);
      const assistantContent = (reply && (reply.content || reply.message || reply)) as string;
      const assistantMsg: Message = { id: String(Date.now() + 1), role: 'assistant', content: assistantContent };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg: Message = { id: String(Date.now() + 2), role: 'assistant', content: `Error: ${err.message}` };
      setMessages(prev => [...prev, errMsg]);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Assistant</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={messages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                <Text style={styles.bubbleText}>{item.content}</Text>
              </View>
            )}
            contentContainerStyle={styles.messages}
          />

          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Type a message"
              onSubmitEditing={send}
              returnKeyType="send"
            />
            <TouchableOpacity onPress={send} style={styles.sendBtn}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, justifyContent: 'flex-end' },
  container: { height: '70%', backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 12, elevation: 6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '600' },
  closeBtn: { padding: 6 },
  closeText: { color: '#007aff' },
  messages: { paddingVertical: 8 },
  bubble: { marginVertical: 6, padding: 10, borderRadius: 8, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#DCF8C6' },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#f1f0f0' },
  bubbleText: { fontSize: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  input: { flex: 1, borderColor: '#ddd', borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, height: 40, backgroundColor: '#fff' },
  sendBtn: { marginLeft: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#6200ee', borderRadius: 20 },
  sendText: { color: '#fff', fontWeight: '600' },
});
