import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Share } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { getGroupDetails } from '@/services/groups';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

export default function InviteMembersScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const [inviteCode, setInviteCode] = useState<string>('');
  const [groupName, setGroupName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCode() {
      try {
        setLoading(true);
        if (!groupId) return;
        const data = await getGroupDetails(groupId);
        setInviteCode(data.invite_code || '');
        setGroupName(data.name || '');
      } catch (error) {
        console.error("Erro ao buscar código:", error);
        Alert.alert("Erro", "Não foi possível carregar os detalhes do grupo.");
      } finally {
        setLoading(false);
      }
    }
    
    loadCode();
  }, [groupId]);

  const copyToClipboard = async () => {
    if (!inviteCode) return;
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert('Copiado!', 'Código de convite copiado para a área de transferência.');
  };

  const shareInvite = async () => {
    if (!inviteCode || !groupName) return;
    try {
      const message = `Venha participar do grupo ${groupName}. Use o código: ${inviteCode}`;
      await Share.share({
        message,
      });
    } catch (error: any) {
      Alert.alert('Erro ao compartilhar', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
       <Stack.Screen
          options={{
            title: 'Convite',
            headerBackTitle: 'Voltar',
          }}
       />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.content}>
          <Text style={styles.title}>Convide seus amigos!</Text>
          <Text style={styles.subtitle}>
            Compartilhe o código abaixo para que outras pessoas possam entrar no grupo <Text style={{ fontWeight: 'bold' }}>{groupName}</Text>.
          </Text>
          
          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{inviteCode}</Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button} onPress={copyToClipboard}>
              <Text style={styles.buttonText}>Copiar Código</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.shareButton]} onPress={shareInvite}>
              <Text style={styles.buttonText}>Compartilhar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}      
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  codeContainer: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 250,
    alignItems: 'center',
  },
  codeText: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
    color: '#333',
  },
  buttonsContainer: {
    width: '100%',
    gap: 16, // Use gap for spacing between buttons
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});