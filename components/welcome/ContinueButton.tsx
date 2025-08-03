import { Button } from "tamagui";
import React from "react";

export const ContinueButton = ({
  onComplete,
  scrollOffset,
}: {
  onComplete: () => void;
  scrollOffset: number;
}) => (
  <Button
    size="$6"
    backgroundColor="rgb(0, 174, 255)"
    color="#fff"
    fontWeight="700"
    fontFamily="$body"
    borderRadius="$8"
    paddingHorizontal="$5"
    paddingVertical="$5"
    width={360}
    pressStyle={{ opacity: 0.85, scale: 0.97 }}
    onPress={onComplete}
    style={{
      cursor: "pointer",
      transform: `scale(${1 + Math.sin(scrollOffset * 0.003) * 0.02})`,
    }}
  >
    Continue
  </Button>
);
