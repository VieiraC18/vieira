import { BrandLoader } from "@/components/brand/brand";

export default function Loading() {
  return (
    <div className="route-loading">
      <BrandLoader label="Carregando formulário" />
    </div>
  );
}
