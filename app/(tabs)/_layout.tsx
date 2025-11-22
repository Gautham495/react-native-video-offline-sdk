import React from "react";

import { Platform } from "react-native";

import {
  createNativeBottomTabNavigator,
  NativeBottomTabNavigationEventMap,
  NativeBottomTabNavigationOptions,
} from "@bottom-tabs/react-navigation";

import { ParamListBase, TabNavigationState } from "@react-navigation/native";

import { withLayoutContext } from "expo-router";

const BottomTabNavigator = createNativeBottomTabNavigator().Navigator;

const Tabs = withLayoutContext<
  NativeBottomTabNavigationOptions,
  typeof BottomTabNavigator,
  TabNavigationState<ParamListBase>,
  NativeBottomTabNavigationEventMap
>(BottomTabNavigator);

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Videos",
          tabBarIcon: () =>
            Platform.OS === "ios"
              ? { sfSymbol: "video" }
              : require("../../assets/tabs/video-1.png"),
        }}
      />

      <Tabs.Screen
        name="drm-videos"
        options={{
          tabBarLabel: "DRM Videos",

          tabBarIcon: () =>
            Platform.OS === "ios"
              ? { sfSymbol: "video.and.waveform" }
              : require("../../assets/tabs/video-2.png"),
        }}
      />
    </Tabs>
  );
}
