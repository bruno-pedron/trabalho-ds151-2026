import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';

export default function InviteMembersScreen() {
    const { groupId } = useLocalSearchParams<{ groupId: string }>();
}