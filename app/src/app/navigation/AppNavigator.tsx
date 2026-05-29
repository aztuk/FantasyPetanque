import React from 'react';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../../features/game/screens/HomeScreen';
import { SetupScreen } from '../../features/game/screens/SetupScreen';
import { GameScreen } from '../../features/game/screens/GameScreen';
import { DebugRuleSelectScreen } from '../../features/game/screens/DebugRuleSelectScreen';
import { RankingScreen } from '../../features/ranking/screens/RankingScreen';
import { AddMatchScreen } from '../../features/ranking/screens/AddMatchScreen';
import { RootStackParamList } from './types';
import { BACKGROUND, TEXT_PRIMARY, colors, figmaTextStyles } from '../../shared/constants';

const NAV_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: BACKGROUND,
    card: BACKGROUND,
    text: TEXT_PRIMARY,
    border: colors.darkSmooth,
  },
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer theme={NAV_THEME}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: BACKGROUND },
          headerTintColor: TEXT_PRIMARY,
          headerTitleStyle: figmaTextStyles.pageTitles,
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
        <Stack.Screen
          name="Ranking"
          component={RankingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddMatch"
          component={AddMatchScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
