import Image from "next/image";

export const brandAssets = {
  full: "/brand/logo-vieira-systems.png",
  icon: "/brand/icon-vieira-systems.png",
} as const;

export function BrandLogo({
  compact = false,
  priority = false,
}: {
  compact?: boolean;
  priority?: boolean;
}) {
  return (
    <span className={`brand-plaque${compact ? " brand-plaque-compact" : ""}`}>
      <Image
        src={brandAssets.full}
        alt="VIEIRA SYSTEMS"
        width={2172}
        height={724}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="brand-logo-image"
        sizes={compact ? "144px" : "204px"}
      />
    </span>
  );
}

export function BrandIcon({
  size = 40,
  className = "",
  decorative = false,
  priority = false,
}: {
  size?: number;
  className?: string;
  decorative?: boolean;
  priority?: boolean;
}) {
  return (
    <Image
      src={brandAssets.icon}
      alt={decorative ? "" : "Símbolo VIEIRA SYSTEMS"}
      width={1254}
      height={1254}
      className={`brand-icon-image ${className}`}
      style={{ width: size, height: size }}
      sizes={`${size}px`}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}

export function BrandLoader({
  label = "Preparando o próximo passo",
}: {
  label?: string;
}) {
  return (
    <div className="brand-loader" role="status" aria-label={label}>
      <span className="loader-ring" />
      <BrandIcon size={54} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`brand-watermark ${className}`} aria-hidden="true">
      <BrandIcon size={200} decorative />
    </span>
  );
}
