import { useEffect, useState } from 'react';

import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  createGroup,
  getUserGroups
} from '@/services/groups';

import { useAuth } from '@/hooks/useAuth';

import { router } from 'expo-router';

export default function GroupsScreen() {

  const { session } = useAuth();

  const [groupName, setGroupName] = useState('');

  const [groups, setGroups] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [creatingGroup, setCreatingGroup] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  async function loadGroups() {

    if (!session?.user?.id) {
      return;
    }

    try {

      setLoading(true);

      setErrorMessage('');

      const data = await getUserGroups(
        session.user.id
      );

      setGroups(data || []);

    } catch (err) {

      console.error(err);

      setErrorMessage(
        'Não foi possível carregar os grupos. Verifique sua conexão e tente novamente.'
      );

    } finally {

      setLoading(false);
    }
  }

  async function handleCreateGroup() {

    if (!session?.user?.id) {

      setErrorMessage(
        'Usuário não autenticado.'
      );

      return;
    }

    if (!groupName.trim()) {

      setErrorMessage(
        'Digite um nome para o grupo.'
      );

      return;
    }

    try {

      setCreatingGroup(true);

      setErrorMessage('');

      const createdGroup = await createGroup(
        groupName.trim(),
        session.user.id
      );

      console.log(
        'GROUP CREATED:',
        JSON.stringify(createdGroup, null, 2)
      );

      setGroupName('');

      const updatedGroups =
        await getUserGroups(
          session.user.id
        );

      setGroups(updatedGroups || []);

    } catch (err) {

      console.error(
        JSON.stringify(err, null, 2)
      );

      setErrorMessage(
        'Não foi possível criar o grupo. Tente novamente.'
      );

    } finally {

      setCreatingGroup(false);
    }
  }

  function handleOpenGroup(groupId: string) {
    console.log("Adicionar link para a rota do stack do grupo aqui.")
    //router.push(`/groups/${groupId}`);
  }

  function handleEditGroup(groupId: string) {

  router.push({
  pathname: '/groupEdit',
  params: {
    groupId: groupId,
  },
});
}

  useEffect(() => {

    loadGroups();

  }, [session]);

  if (loading && groups.length === 0) {

    return (
      <SafeAreaView style={styles.loadingContainer}>

        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Carregando grupos...
        </Text>

      </SafeAreaView>
    );
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

      {
        creatingGroup
          ? (
            <ActivityIndicator size="small" />
          )
          : (
            <Button
              title="Criar Grupo"
              onPress={handleCreateGroup}
            />
          )
      }

      {
        errorMessage ? (
          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
        ) : null
      }

      <FlatList
        style={styles.list}
        data={groups}
        keyExtractor={(item) => item.groups.id}
        onRefresh={loadGroups}
        refreshing={loading}
        renderItem={({ item }) => (

          <View style={styles.groupCard}>

            <Text style={styles.groupName}>
              {item.groups.name}
            </Text>

            <Text style={styles.groupRole}>
              Cargo: {item.role}
            </Text>

            <View style={styles.groupButtons}>

              <View style={styles.buttonContainer}>
                <Button
                  title="Abrir"
                  onPress={() =>
                    handleOpenGroup(item.groups.id)
                  }
                />
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title="Editar"
                  onPress={() =>
                    handleEditGroup(item.groups.id)
                  }
                />
              </View>

            </View>

          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>
              Você ainda não participa de nenhum grupo.
            </Text>
          ): null
        }
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    alignItems: 'center',
    gap: 20,
    padding: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },

  loadingText: {
    fontSize: 18,
  },

  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#666',
  },

  title: {
    fontSize: 24,
    marginTop: 20,
    marginBottom: 20,
  },

  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
  },

  list: {
    width: '100%',
    marginTop: 20,
  },

  groupCard: {
  width: '100%',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
  backgroundColor: '#fff',
},

  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  groupRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },

  groupButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  buttonContainer: {
    flex: 1,
  },
  

});