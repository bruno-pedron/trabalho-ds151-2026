import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { getGroupMembers } from '@/services/groups';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GroupMembersScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    loadMembers();
  }, [groupId]);

  const renderMemberItem = ({ item }: { item: any }) => {
    // Ajustar baseado no schema exato do usuário retornado
    const userName = item.users?.name || 'Usuário Desconhecido';
    
    return (
      <View style={styles.memberItem}>
        <View>
          <Text style={styles.memberName}>{userName}</Text>
          <Text style={styles.memberRole}>{item.role === 'owner' ? '👑 Administrador' : '👤 Membro'}</Text>
        </View>
        
        {/* Placeholder para ação futura de remover membro */}
        <TouchableOpacity onPress={() => console.log('Ação de remover no futuro')}>
          <Text style={styles.removeAction}>Remover</Text>
        </TouchableOpacity>
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