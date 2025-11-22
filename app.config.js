const pkg = require("./package.json");

module.exports = (_config) => {
  const VERSION = pkg.version;

  return {
    expo: {
      platforms: ["ios", "android"],
      orientation: "portrait",
      name: "Offline SDK",
      slug: "offline-sdk",
      version: VERSION,
      icon: "./assets/images/icon.png",
      scheme: "reactnativeofflinesdk",
      userInterfaceStyle: "automatic",
      newArchEnabled: true,

      icon: "./assets/logo.png",
      ios: {
        bundleIdentifier: "com.offlinesdk",
        supportsTablet: true,
        deploymentTarget: "18.0",
        infoPlist: {
          ITSAppUsesNonExemptEncryption: false,
        },
        requireFullScreen: true,
      },

      android: {
        package: "com.offlinesdk",
        edgeToEdgeEnabled: true,
        predictiveBackGestureEnabled: false,
        minSdkVersion: 26,
        targetSDKVersion: 36,

        adaptiveIcon: {
          foregroundImage: "./assets/splash-icon.png",
          backgroundColor: "#5316AE",
        },
      },

      plugins: [
        "expo-router",
        [
          "expo-splash-screen",
          {
            image: "./assets/splash-icon.png",
            imageWidth: 250,
            resizeMode: "native",
            backgroundColor: "#5316AE",
          },
        ],

        [
          "expo-build-properties",
          {
            ios: {
              useFrameworks: "static",
            },
          },
        ],

        [
          "react-native-video",
          {
            enableAndroidPictureInPicture: true,
            enableNotificationControls: true,
            enableBackgroundAudio: true,
          },
        ],
        "react-native-bottom-tabs",
        [
          "expo-font",
          {
            fonts: [
              "./assets/fonts/ElmsSans-Regular.ttf",
              "./assets/fonts/ElmsSans-Medium.ttf",
              "./assets/fonts/ElmsSans-SemiBold.ttf",
            ],
          },
        ],
        "./plugins/with-video-stream-downloader",
      ],

      experiments: {
        typedRoutes: true,
        reactCompiler: true,
      },

      extra: {
        eas: {
          projectId: "3534d3f4-e7e4-48f0-935f-5adb7a93262f",
        },
      },
    },
  };
};
