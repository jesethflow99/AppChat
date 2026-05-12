import { Redirect } from 'expo-router'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { useChat } from '@/src/store/chat'

export default function Index() {
  const { token, loading } = useChat()

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return <Redirect href={token ? '/(tabs)' : '/(auth)'} />
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
