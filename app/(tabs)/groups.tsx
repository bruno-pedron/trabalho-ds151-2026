import { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { createGroup } from '@/services/groups';
import { useAuth } from '@/hooks/useAuth';

export default function GroupsScreen() {

  const { session } = useAuth();

  const [groupName, setGroupName] = useState('');

  async function handleCreateGroup() {

    if (!session?.user?.id) {
      console.error('No session found');
      return;
    }

    if (!groupName.trim()) {
      console.error('Group name is empty');
      return;
    }

    try {

      console.log('Creating group...');

      const createdGroup = await createGroup(
        groupName.trim(),
        session.user.id
      );

      console.log('GROUP CREATED:');
      console.log(JSON.stringify(createdGroup, null, 2));

      setGroupName('');

    } catch (err) {

      console.error(JSON.stringify(err, null, 2));
    }
  }

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.title}>
        Meus Grupos
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do grupo"
        value={groupName}
        onChangeText={setGroupName}
      />

      <Button
        title="Criar Grupo"
        onPress={handleCreateGroup}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 20,
  },

  title: {
    fontSize: 24,
  },

  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },

});