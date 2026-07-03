import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";
import { useContext } from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  // Return nothing to let expo-router handle the routing
  return null;
}
