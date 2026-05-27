import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {createGroup} from '@/services/groups';
import { useAuth } from '@/hooks/useAuth';
export default function GroupsScreen() {

  const { session } = useAuth();

  useEffect(() => {

  async function run() {

    if (!session?.user?.id) {
      console.log('❌ No session found');
      return;
    }

    try {

      console.log('==============================');
      console.log('🚀 STARTING GROUP CRUD TESTS');
      console.log('==============================');

      console.log('👤 USER ID:');
      console.log(session.user.id);

      console.log('🛠 Creating group...');

      const createdGroup = await createGroup(
        'Grupo Teste',
        session.user.id
      );

      console.log('✅ GROUP CREATED:');
      console.log(JSON.stringify(createdGroup, null, 2));

    } catch (err) {

      console.log('==============================');
      console.log('❌ CRUD TEST FAILED');
      console.log('==============================');

      console.error(JSON.stringify(err, null, 2));
    }
  }

  run();

}, []);

  return (
    <SafeAreaView>
      <View>
        <Text>Meus Grupos</Text>
      </View>
    </SafeAreaView>
  )
}