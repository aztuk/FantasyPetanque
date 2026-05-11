import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/app/navigation/AppNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}
