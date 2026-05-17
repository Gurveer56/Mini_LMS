import { useIsFocused } from "@react-navigation/native";
import { useVideoPlayer, VideoView } from "expo-video";
import React from "react";
import { StyleSheet, View } from "react-native";

const WELCOME_VIDEO = require("../../../../assets/videos/welcome.mp4");

function WelcomeVideoPlayer() {
  const player = useVideoPlayer(WELCOME_VIDEO, (instance) => {
    instance.loop = true;
    instance.muted = true;
    instance.play();
  });

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

export const WelcomeVideoLayer = () => {
  const isFocused = useIsFocused();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {isFocused ? <WelcomeVideoPlayer /> : null}
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(9, 9, 11, 0.75)",
  },
});
