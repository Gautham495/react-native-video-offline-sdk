import { type RouteProp, useRoute } from "@react-navigation/native";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Video from "react-native-video";

const VideoPlayer = () => {
  const route = useRoute<RouteProp<{ params: { uri: string } }, "params">>();
  const { uri } = route.params;

  return (
    <View style={styles.container}>
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
  },
  video: {
    width: Dimensions.get("window").width,
    height: (Dimensions.get("window").width * 9) / 16,
  },
});

export default VideoPlayer;
