import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../../features/game/screens/HomeScreen';
import { GameScreen } from '../../features/game/screens/GameScreen';
import { SummaryScreen } from '../../features/game/screens/SummaryScreen';
import { RootStackParamList } from './types';
import { BACKGROUND, TEXT_PRIMARY } from '../../shared/constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: BACKGROUND },
          headerTintColor: TEXT_PRIMARY,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: BACKGROUND },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{ title: 'Partie en cours', headerBackVisible: false }}
        />
        <Stack.Screen
          name="Summary"
          component={SummaryScreen}
          options={{ title: 'Résumé de partie' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
