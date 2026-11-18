import LojaLayout from "./(loja)/layout";
import NotFoundContent from "@/components/NotFoundContent";

// 404 de URL que não existe: renderiza fora do grupo (loja), então trazemos cabeçalho/rodapé junto.
export default function NotFound() {
  return (
    <LojaLayout>
      <NotFoundContent />
    </LojaLayout>
  );
}
