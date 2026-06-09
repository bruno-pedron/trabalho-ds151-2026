import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { getGroupMembers, removeFromGroup } from '@/services/groups';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';

export default function GroupMembersScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const { session } = useAuth();

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, [groupId]);

  async function loadMembers() {
    try {
      setLoading(true);
      if (!groupId) return;
      const data = await getGroupMembers(groupId);
      setMembers(data || []);
    } catch (error) {
      console.error("Erro ao buscar membros:", error);
    } finally {
      setLoading(false);
    }
  }

  function isUserAdmin() {
    const userId = session?.user.id
    if (!userId) return false;
    const currentUserMember = members.find(m => m.users?.id === userId);
    return currentUserMember?.role === 'owner';
  }

  async function removeUser(userId: string) {
    Alert.alert(
      'Remover Usuário?',
      'Você tem certeza que quer remover esse usuário?',
      [
        {
          text: 'Cancelar',
          style: "cancel"
        },
        {
          text: "Remover",
          onPress: async () => {
            try { await removeFromGroup(groupId, userId) }
            catch (err) { console.log("erro ao remover do grupo", err) }
            if (userId === session?.user.id) { router.replace("/(tabs)/groups") }
            await loadMembers()
          },
          style: "destructive"
        }
      ]
    )
  }


  const renderMemberItem = ({ item }: { item: any }) => {
    // Ajustar baseado no schema exato do usuário retornado
    const userName = item.users?.name || 'Usuário Desconhecido';

    return (
      <View style={styles.memberItem}>
        <View>
          <Text style={styles.memberName}>{userName}</Text>
          <Text style={styles.memberRole}>{item.role === 'owner' ? '👑 Administrador' : '👤 Membro'}</Text>
        </View>

        {(isUserAdmin() || session?.user.id == item.users?.id) ? (
          <TouchableOpacity onPress={async () => await removeUser(item.users?.id)}>
            <Text style={styles.removeAction}>Remover</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Membros do Grupo',
          headerBackTitle: 'Voltar',
          // Placeholder para ação futura de adicionar membro no cabeçalho
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push(`/groups/${groupId}/invite`)}>
              <Text style={styles.headerAction}>+ Add</Text>
            </TouchableOpacity>
          )
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.users?.id}
          onRefresh={loadMembers}
          refreshing={loading}
          renderItem={renderMemberItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum membro encontrado neste grupo.</Text>
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
  },
  removeAction: {
    color: 'red',
    fontSize: 14,
  },
  headerAction: {
    color: '#007AFF',
    fontSize: 16,
    marginRight: 16,
  }
});
