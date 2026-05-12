import { useEffect } from 'react'
import { View, Text, TouchableOpacity, Alert, StyleSheet, Share } from 'react-native'
import { router } from 'expo-router'
import { useChat } from '@/src/store/chat'

export default function Settings() {
  const { token, logout, isConnected } = useChat()

  useEffect(() => {
    if (!token) router.replace('/(auth)')
  }, [token])

  const handleShareToken = async () => {
    if (!token) return
    await Share.share({
      message: `Mi token de chat: ${token}`,
    })
  }

  const handleCopyToken = () => {
    if (!token) return
    Alert.alert('Token copiado', token)
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Mi Token</Text>
        <Text style={styles.token} selectable>{token}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={handleCopyToken}>
            <Text style={styles.buttonText}>Copiar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleShareToken}>
            <Text style={styles.buttonText}>Compartir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Estado</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, isConnected ? styles.online : styles.offline]} />
          <Text style={styles.statusText}>
            {isConnected ? 'Conectado al servidor' : 'Desconectado'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar sesión / Nuevo token</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 13,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  token: {
    fontSize: 14,
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  online: {
    backgroundColor: '#34C759',
  },
  offline: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    fontSize: 15,
    color: '#333',
  },
  logoutButton: {
    marginTop: 'auto',
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
})
