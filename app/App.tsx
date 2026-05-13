import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/app/navigation/AppNavigator';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    GoogleSansFlex_400Regular: require('./node_modules/@expo-google-fonts/google-sans-flex/400Regular/GoogleSansFlex_400Regular.ttf'),
    GoogleSansFlex_600SemiBold: require('./node_modules/@expo-google-fonts/google-sans-flex/600SemiBold/GoogleSansFlex_600SemiBold.ttf'),
    GoogleSansFlex_700Bold: require('./node_modules/@expo-google-fonts/google-sans-flex/700Bold/GoogleSansFlex_700Bold.ttf'),
    RoadRage_400Regular: require('./node_modules/@expo-google-fonts/road-rage/400Regular/RoadRage_400Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
    }
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
