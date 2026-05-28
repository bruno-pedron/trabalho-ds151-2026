import { useEffect, useState } from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { useLocalSearchParams, router } from 'expo-router';

import { updateGroup } from '@/services/groups';

export default function EditGroupScreen() {

  const { groupId } = useLocalSearchParams();
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSave() {

    if (!groupName.trim()) {

      setErrorMessage('Digite um nome válido.');
      return;
    }

    try {

      setLoading(true);
      setErrorMessage('');

      await updateGroup(String(groupId), groupName.trim());

      router.replace('/groups');

    } catch (err) {

      console.error(err);

      setErrorMessage('Não foi possível salvar as alterações.');

    } finally {

      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.title}>
        Editar Grupo
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Novo nome do grupo"
        value={groupName}
        onChangeText={setGroupName}
      />

      {
        errorMessage ? (
          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
        ) : null
      }

      {
        loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <Button
            title="Salvar Alterações"
            onPress={handleSave}
          />
        )
      }

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },

  errorText: {
    color: 'red',
    textAlign: 'center',
  },

});