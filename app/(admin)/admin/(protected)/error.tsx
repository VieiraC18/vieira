"use client";
import { ErrorState } from "@/components/admin/shared";
export default function Error({ retry }: { retry: () => void }) {
  return (
    <ErrorState
      message="Houve uma falha ao preparar esta tela. Seus dados salvos permanecem disponíveis."
      retry={retry}
    />
  );
}
