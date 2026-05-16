import { useIsFocused } from "@react-navigation/native";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";

const WELCOME_VIDEO = require("../../../../assets/videos/welcome.mp4");

function WelcomeVideoPlayer() {
  const isFocused = useIsFocused();
  const player = useVideoPlayer(WELCOME_VIDEO, (instance) => {
    instance.loop = true;
    instance.muted = true;
    instance.play();
  });

  useEffect(() => {
    if (isFocused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isFocused, player]);

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
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <WelcomeVideoPlayer />
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(9, 9, 11, 0.75)",
  },
});
