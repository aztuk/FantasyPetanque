import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../../features/game/screens/HomeScreen';
import { SetupScreen } from '../../features/game/screens/SetupScreen';
import { GameScreen } from '../../features/game/screens/GameScreen';
import { DebugRuleSelectScreen } from '../../features/game/screens/DebugRuleSelectScreen';
import { RootStackParamList } from './types';
import { BACKGROUND, TEXT_PRIMARY, typography } from '../../shared/constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: BACKGROUND },
          headerTintColor: TEXT_PRIMARY,
          headerTitleStyle: { fontWeight: typography.weight.bold },
          contentStyle: { backgroundColor: BACKGROUND },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Setup"
          component={SetupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DebugRuleSelect"
          component={DebugRuleSelectScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
