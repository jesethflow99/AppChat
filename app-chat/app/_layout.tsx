import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ChatProvider } from '@/src/store/chat'

export default function RootLayout() {
  return (
    <ChatProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" options={{ headerShown: true, title: 'Chat' }} />
      </Stack>
      <StatusBar style="auto" />
    </ChatProvider>
  )
}
