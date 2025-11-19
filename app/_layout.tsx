import * as SplashScreen from "expo-splash-screen";

import { setConfig } from "@TheWidlarzGroup/react-native-video-stream-downloader";

import { Stack } from "expo-router";

import { useFonts } from "expo-font";

import { useEffect } from "react";

import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    "ElmsSans-Regular": require("../assets/fonts/ElmsSans-Regular.ttf"),
    "ElmsSans-Medium": require("../assets/fonts/ElmsSans-Medium.ttf"),
    "ElmsSans-SemiBold": require("../assets/fonts/ElmsSans-SemiBold.ttf"),
  });

  if (!loaded) {
    return null;
  }

  setConfig({
    maxParallelDownloads: 4,
    updateFrequencyMS: 1000,
  });

  const headerProps = {
    headerShown: false,
  };

  async function onReady() {
    SplashScreen.hide();
  }

  useEffect(() => {
    onReady();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={headerProps} />

        <Stack.Screen name="video-player" options={headerProps} />

        <Stack.Screen name="drm-video-player" options={headerProps} />

        <Stack.Screen name="+not-found" options={headerProps} />
      </Stack>
    </SafeAreaProvider>
  );
}
