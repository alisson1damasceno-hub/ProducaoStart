import type { TomPele, CorRoupa } from "./types";

const CORES_PELE: Record<TomPele, string> = {
  tom1: "#F0C08A",
  tom2: "#C68642",
  tom3: "#8D5524",
  tom4: "#3F2818",
};

const CORES_ROUPA: Record<CorRoupa, string> = {
  azul: "#378ADD",
  rosa: "#D4537E",
  verde: "#639922",
  vermelho: "#E24B4A",
};

type AvatarPreviewProps = {
  pele: TomPele;
  roupa: CorRoupa;
  size?: number;
};

export function AvatarPreview({ pele, roupa, size = 40 }: AvatarPreviewProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ borderRadius: "50%", flexShrink: 0 }}
    >
      <rect width="100" height="100" fill="#e9f3ed" />
      <path d="M10 100 A40 40 0 0 1 90 100 Z" fill={CORES_ROUPA[roupa]} />
      <circle cx="50" cy="42" r="26" fill={CORES_PELE[pele]} />
    </svg>
  );
}
