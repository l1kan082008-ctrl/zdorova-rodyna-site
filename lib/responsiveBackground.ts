import { getImageProps } from "next/image";
import { canOptimizeImage, resolveImageSource } from "./imageSource";

// Reuse Next's responsive image URLs without changing the approved CSS crop.
export function responsiveBackground(src: string, width: number) {
  const { props } = getImageProps({
    src: resolveImageSource(src), unoptimized: !canOptimizeImage(src), alt: "", width, height: Math.round(width / 2), quality: 85,
  });
  if (!props.srcSet) return `url(${JSON.stringify(props.src)})`;
  const sources = props.srcSet.split(", ").map((candidate) => {
    const separator = candidate.lastIndexOf(" ");
    return `url("${candidate.slice(0, separator)}") ${candidate.slice(separator + 1)}`;
  });
  return `image-set(${sources.join(", ")})`;
}
