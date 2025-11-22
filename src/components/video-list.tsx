import {
  getAvailableTracks,
  type DownloadOptions,
} from "@TheWidlarzGroup/react-native-video-stream-downloader";

import { StatusBar } from "expo-status-bar";

import React, { useCallback } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import RadialGradient from "react-native-radial-gradient";

import { useStreamDownloader } from "@/hooks/use-stream-downloader";
import { boldFont, mediumFont, normalFont } from "@/themes/fonts";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const API_KEY = "673bd80f-93f5-404d-926f-02c93638bfe5"; // Replace with your actual API key, which you can obtain at https://sdk.thewidlarzgroup.com/

type VideoItemType = {
  id: string;
  title: string;
  url: string;
  duration: string;
  thumbnail: string;
  description: string;
  licenseServer?: string;
  certificateUrl?: string;
};

const HeaderSection = () => {
  return (
    <View style={{ paddingTop: 20, gap: 20, paddingHorizontal: 10 }}>
      <View>
        <Text style={styles.headerTitle}>Offline SDK Playlist</Text>
        <View
          style={{
            flexDirection: "row",
            gap: 5,
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Text style={styles.headerDesc}>4 normal videos and 1 DRM video</Text>
        </View>
      </View>
    </View>
  );
};

type DownloadControlsProps = {
  status: any;
  loading: boolean;
  resumeDownload: (url: string) => void;
  deleteAsset: (id: string) => void;
  start: (
    url: string,
    options: DownloadOptions,
    isDrm: boolean,
    licenseServer?: string,
    certificateUrl?: string
  ) => void;
  item: VideoItemType;
  isDrm: boolean;
};

const DownloadControls = ({
  status,
  loading,
  resumeDownload,
  deleteAsset,
  start,
  item,
  isDrm,
}: DownloadControlsProps) => {
  const downloadStatus = status?.status ?? "default";
  const progress = ((status?.progress ?? 0) * 100).toFixed(2);
  const isProgressStatus = ["downloading", "paused", "pending"].includes(
    downloadStatus
  );
  const isCompletedStatus = ["completed"].includes(downloadStatus);
  const isFailedStatus = ["failed"].includes(downloadStatus);
  const toDownload =
    downloadStatus === "default" ||
    (!isCompletedStatus && !isProgressStatus && !isFailedStatus);

  const handleDownload = async () => {
    /** Get available tracks for the video */
    const tracks = await getAvailableTracks(item.url);

    // Video Tracks, Audio Tracks, Text (Subtitle) - Stranger Things 5 - English, Polish, French

    const selectedVideo = tracks.video?.[Math.floor(tracks.video.length / 2)];

    /** Start the download with selected video and all available text and audio tracks */
    start(
      item.url,
      {
        tracks: {
          video: selectedVideo ? [selectedVideo.id] : [],
          text: tracks.text?.map((t) => t.id) || [],
          audio: tracks.audio?.map((a) => a.id) || [],
        },
      },
      isDrm,
      item.licenseServer,
      item.certificateUrl
    );
  };

  if (loading) return null;

  return (
    <>
      {isProgressStatus && (
        <>
          <AnimatedCircularProgress
            style={{
              marginRight: 5,
            }}
            size={40}
            width={10}
            padding={12}
            backgroundWidth={17}
            fill={parseFloat(progress)}
            tintColor="#fff"
            duration={500}
            backgroundColor="#444"
          />
          {downloadStatus == "paused" && (
            <TouchableOpacity onPress={() => resumeDownload(item.url)}>
              <Image
                source={require("@/icons/play-video.png")}
                style={{ width: 30, height: 30 }}
              />
            </TouchableOpacity>
          )}
        </>
      )}

      {isCompletedStatus && (
        <TouchableOpacity
          onPress={() => status?.id && deleteAsset(status.id)}
          style={{
            marginRight: 20,
          }}
        >
          <Image
            source={require("@/icons/delete.png")}
            style={{ width: 25, height: 25 }}
          />
        </TouchableOpacity>
      )}

      {isFailedStatus && <Text>Failed</Text>}

      {toDownload && (
        <TouchableOpacity
          onPress={() => handleDownload()}
          hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
          style={{
            marginRight: 20,
          }}
        >
          <Image
            source={require("@/icons/download.png")}
            style={{ width: 25, height: 25 }}
          />
        </TouchableOpacity>
      )}
    </>
  );
};

type VideoItemProps = {
  item: VideoItemType;
  index: number;
  openVideo: (video: VideoItemType) => void;
  getStatus: (url: string) => any;
  loading: boolean;
  resumeDownload: (url: string) => void;
  deleteAsset: (id: string) => void;
  start: (url: string, options: DownloadOptions) => void;
  isDrm: boolean;
};

const VideoItem = ({
  item,
  index,
  openVideo,
  getStatus,
  loading,
  resumeDownload,
  deleteAsset,
  start,
  isDrm,
}: VideoItemProps) => {
  const status = getStatus(item.url);
  return (
    <Pressable onPress={() => openVideo(item)}>
      <View style={{ marginBottom: 10, padding: 10 }}>
        <View style={styles.videoItem}>
          <Image
            source={{ uri: item.thumbnail }}
            resizeMode="cover"
            style={styles.thumbnail}
          />
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text style={styles.videoTitle}>{`${index + 1}. ${
                item.title
              }`}</Text>
              <Text style={styles.videoDuration}>{item.duration}</Text>
            </View>
            <View style={styles.controls}>
              <DownloadControls
                status={status}
                loading={loading}
                resumeDownload={resumeDownload}
                deleteAsset={deleteAsset}
                start={start}
                item={item}
                isDrm={isDrm}
              />
            </View>
          </View>
        </View>
        <Text style={styles.videoDuration}>{item.description}</Text>
      </View>
    </Pressable>
  );
};

const VideoList = ({ isDrm = false }) => {
  const { downloads, assets, start, resumeDownload, deleteAsset, loading } =
    useStreamDownloader(API_KEY);

  const getStatus = (url: string) => downloads.find((d) => d.url === url);

  const router = useRouter();

  const openVideo = useCallback(
    (video: VideoItemType) => {
      const asset = assets.find((a) => a.url === video.url);
      const localPath = asset?.pathToFile || null;

      router.push({
        pathname: "/video-player",
        params: {
          uri: localPath || video.url,
        },
      });
    },
    [router, assets]
  );

  const insets = useSafeAreaInsets();

  const videos: VideoItemType[] = isDrm
    ? [
        {
          id: "1",
          title: "DRM",
          url:
            Platform.OS === "ios"
              ? "https://d2e67eijd6imrw.cloudfront.net/559c7a7e-960d-4cd8-9dba-bc4e59890177/assets/47cfca69-91b5-4311-bf6c-b9b1f297ed9b/videokit-720p-dash-hls-drm/hls/index.m3u8"
              : "https://d2e67eijd6imrw.cloudfront.net/559c7a7e-960d-4cd8-9dba-bc4e59890177/assets/47cfca69-91b5-4311-bf6c-b9b1f297ed9b/videokit-720p-dash-hls-drm/dash/index.mpd",
          licenseServer:
            Platform.OS === "ios"
              ? "https://thewidlarzgroup.la.drm.cloud/acquire-license/fairplay?brandGuid=559c7a7e-960d-4cd8-9dba-bc4e59890177"
              : "https://thewidlarzgroup.la.drm.cloud/acquire-license/widevine?brandGuid=559c7a7e-960d-4cd8-9dba-bc4e59890177",
          certificateUrl:
            "https://thewidlarzgroup.la.drm.cloud/certificate/fairplay?brandGuid=559c7a7e-960d-4cd8-9dba-bc4e59890177",
          duration: "12m",
          thumbnail:
            "https://images.pexels.com/photos/2317685/pexels-photo-2317685.jpeg",
          description:
            "TWG DRM Protected Stream uses HLS for iOS & DASH for Android",
        },
      ]
    : [
        {
          id: "1",
          title: "Sintel",
          url: "https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
          duration: "12m",
          thumbnail:
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg",
          description:
            "Sintel is an independently produced short film, initiated by the Blender Foundation...",
        },
        {
          id: "2",
          title: "Buck Bunny",
          url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          duration: "13m",
          thumbnail:
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
          description:
            "Big Buck Bunny is a short computer-animated comedy film, featuring animals of the forest...",
        },
        {
          id: "3",
          title: "Blazes",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          duration: "2m",
          thumbnail:
            "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
          description:
            "For Bigger Blazes is a short film that shows off the capabilities of the Google Cloud Platform.",
        },
        {
          id: "4",
          title: "Escape",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
          duration: "1m",
          thumbnail:
            "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg",
          description:
            "For Bigger Escape is a short film that shows off the capabilities of the Google Cloud Platform.",
        },
      ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <RadialGradient
        colors={["#423D3F", "#382E37", "#252025"]}
        stops={[0, 0.4, 1]}
        center={[
          Dimensions.get("window").width / 3,
          Dimensions.get("window").height / 1.5,
        ]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
        }}
      >
        <ScrollView style={{ flex: 1, paddingTop: insets.top / 1.5 }}>
          <HeaderSection />
          <View
            style={{
              paddingHorizontal: 10,
            }}
          >
            {videos.map((item, index) => (
              <VideoItem
                key={item.id}
                item={item}
                index={index}
                openVideo={openVideo}
                getStatus={getStatus}
                loading={loading}
                resumeDownload={resumeDownload}
                deleteAsset={deleteAsset}
                start={start}
                isDrm={isDrm}
              />
            ))}
          </View>
        </ScrollView>
      </RadialGradient>
    </View>
  );
};

export default VideoList;

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: { fontSize: 24, color: "#fff", fontFamily: boldFont },
  headerDesc: { fontSize: 14, color: "#c1c1c1", fontFamily: mediumFont },
  playButton: {
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    flex: 1,
    borderRadius: 5,
  },
  playText: { color: "black", fontFamily: boldFont },
  downloadButton: {
    flex: 1,
    gap: 5,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: { color: "white", marginLeft: 5, fontFamily: boldFont },
  videoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    gap: 10,
  },
  thumbnail: { width: 140, height: 80, borderRadius: 10 },
  videoTitle: { color: "#fff", fontSize: 16, fontFamily: boldFont },
  videoDuration: {
    color: "#c1c1c1",
    fontSize: 14,
    fontFamily: normalFont,
    lineHeight: 26,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
  },
});
