import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Lab Inventores 3D", template: "%s | Lab Inventores 3D" },
  description: "Ferramentas grátis para quem está começando a vender impressão 3D: calculadora de preço, vendas, despesas e resultados.",
  robots: { index: false, follow: false },
};

// Restaura o tema escolhido antes de pintar (evita piscar claro→escuro).
const themeScript = `try{var t=localStorage.getItem("lab-theme");if(t)document.documentElement.dataset.labTheme=t}catch(e){}`;

export default function LabLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      {children}
    </>
  );
}
