import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { useChat } from '@/src/store/chat'

export default function AuthScreen() {
  const { token, setToken } = useChat()
  const [inputToken, setInputToken] = useState('')

  useEffect(() => {
    if (token) router.replace('/(tabs)')
  }, [token])

  const generateNewToken = () => {
    const token = String(Math.floor(1000000000 + Math.random() * 9000000000))
    setToken(token)
  }

  const useExistingToken = () => {
    const cleaned = inputToken.trim()
    if (!/^\d{10}$/.test(cleaned)) {
      Alert.alert('Error', 'El token debe ser un número de 10 dígitos')
      return
    }
    setToken(cleaned)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Chat</Text>
      <Text style={styles.subtitle}>Chat anónimo sin número telefónico</Text>

      <TouchableOpacity style={styles.primaryButton} onPress={generateNewToken}>
        <Text style={styles.primaryButtonText}>Generar nuevo token</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.orText}>o</Text>
        <View style={styles.line} />
      </View>

      <Text style={styles.label}>Ingresa un token existente</Text>
      <TextInput
        style={styles.input}
        value={inputToken}
        onChangeText={setInputToken}
        placeholder="0000000000"
        keyboardType="number-pad"
        maxLength={10}
      />
      <TouchableOpacity style={styles.secondaryButton} onPress={useExistingToken}>
        <Text style={styles.secondaryButtonText}>Usar token</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },
  label: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
})
