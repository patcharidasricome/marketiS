"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const LOTTIE_SRC =
  "https://lottie.host/7ab21716-b37b-4210-b4c6-e3652e025058/dqR6gQBgUw.lottie";

interface LottieLoaderProps {
  /** Width/height of the animation in px (default 160) */
  size?: number;
  /** Accessible label shown to screen-readers */
  label?: string;
}

export default function LottieLoader({
  size = 160,
  label = "Loading…",
}: LottieLoaderProps) {
  return (
    <span
      role="status"
      aria-label={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
      }}
    >
      <DotLottieReact src={LOTTIE_SRC} loop autoplay style={{ width: size, height: size }} />
    </span>
  );
}
