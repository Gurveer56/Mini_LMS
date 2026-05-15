import { Shimmer } from "@shared/components/Shimmer";
import React, { memo } from "react";
import { View } from "react-native";

const SHIMMER_COUNT = 6;
const THUMB_SIZE = 112;

const ShimmerRow = memo(function ShimmerRow() {
  return (
    <View
      className="flex-row bg-card border border-border rounded-xl overflow-hidden mb-3"
      style={{ minHeight: THUMB_SIZE }}
    >
      <Shimmer width={THUMB_SIZE} height={THUMB_SIZE} borderRadius={0} />
      <View className="flex-1 p-3 gap-2 justify-center">
        <Shimmer width="85%" height={16} />
        <Shimmer width="55%" height={12} />
        <Shimmer width="100%" height={12} />
        <Shimmer width="70%" height={12} />
      </View>
    </View>
  );
});

export const CourseListShimmer = memo(function CourseListShimmer() {
  return (
    <View className="px-6 pt-2">
      <Shimmer width="45%" height={28} style={{ marginBottom: 12 }} />
      <Shimmer width="100%" height={48} style={{ marginBottom: 16 }} />
      {Array.from({ length: SHIMMER_COUNT }).map((_, index) => (
        <ShimmerRow key={`course-shimmer-${index}`} />
      ))}
    </View>
  );
});
