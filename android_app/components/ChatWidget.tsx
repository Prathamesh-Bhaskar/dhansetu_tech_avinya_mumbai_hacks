import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import ChatModal from './ChatModal';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ChatModal visible={open} onClose={() => setOpen(false)} />

      <View pointerEvents="box-none" style={styles.container}>
        <TouchableOpacity onPress={() => setOpen(true)} style={styles.button}>
          <Text style={styles.icon}>💬</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 18,
    bottom: 28,
    zIndex: 9999,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  icon: { color: '#fff', fontSize: 22 },
});
