import { useEffect } from 'react';
import { AppState, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/app/navigation/AppNavigator';

const ROOT_BG = '#28261F';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    GoogleSansFlex_400Regular: require('./node_modules/@expo-google-fonts/google-sans-flex/400Regular/GoogleSansFlex_400Regular.ttf'),
    GoogleSansFlex_600SemiBold: require('./node_modules/@expo-google-fonts/google-sans-flex/600SemiBold/GoogleSansFlex_600SemiBold.ttf'),
    GoogleSansFlex_700Bold: require('./node_modules/@expo-google-fonts/google-sans-flex/700Bold/GoogleSansFlex_700Bold.ttf'),
    CascadiaMono_400Regular: require('./node_modules/@expo-google-fonts/cascadia-mono/400Regular/CascadiaMono_400Regular.ttf'),
    CascadiaMono_700Bold: require('./node_modules/@expo-google-fonts/cascadia-mono/700Bold/CascadiaMono_700Bold.ttf'),
    RoadRage_400Regular: require('./node_modules/@expo-google-fonts/road-rage/400Regular/RoadRage_400Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const hide = () => NavigationBar.setVisibilityAsync('hidden');
    hide();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') hide();
    });
    return () => sub.remove();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: ROOT_BG }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
