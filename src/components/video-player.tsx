import { type RouteProp, useRoute } from "@react-navigation/native";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Video from "react-native-video";

const VideoPlayer = () => {
  const route = useRoute<RouteProp<{ params: { uri: string } }, "params">>();
  const { uri } = route.params;

  const goBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={goBack}
        style={{
          position: "absolute",
          top: 60,
          left: 20,
          zIndex: 100,
        }}
      >
        <Text style={{ color: "white" }}>Back</Text>
      </TouchableOpacity>
      <Video
        source={{ uri: uri }}
        controls
        resizeMode="contain"
        style={styles.video}
        playInBackground
        enterPictureInPictureOnLeave

        
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#252025",
    justifyContent: "center",
    position: "relative",
  },
  video: {
    width: Dimensions.get("window").width,
    height: (Dimensions.get("window").width * 9) / 16,
  },
});

export default VideoPlayer;
