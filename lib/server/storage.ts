import { randomUUID } from "node:crypto";
import { ApiError } from "@/lib/security/http";

/** Uploads stay in object storage; the database stores URLs and metadata only. */
export interface StoredAsset {
  key: string;
  url: string;
  contentType: string;
  size: number;
}
export interface ObjectStorage {
  put(input: {
    key: string;
    contentType: string;
    body: Uint8Array;
  }): Promise<StoredAsset>;
  remove(key: string): Promise<void>;
}
export const assetTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;
export function assetKey(contentType: string, size: number): string {
  if (!(contentType in assetTypes))
    throw new ApiError(415, "Use uma imagem JPEG, PNG, WebP ou AVIF.");
  if (!Number.isSafeInteger(size) || size <= 0 || size > 8 * 1024 * 1024)
    throw new ApiError(413, "A imagem deve ter até 8 MB.");
  return `projects/${randomUUID()}.${assetTypes[contentType as keyof typeof assetTypes]}`;
}
/** Inject a provider adapter after its credentials are provisioned. No public upload route is enabled by default. */
export function requireObjectStorage(adapter?: ObjectStorage): ObjectStorage {
  if (!adapter)
    throw new ApiError(
      503,
      "O armazenamento de arquivos ainda não está configurado.",
    );
  return adapter;
}
