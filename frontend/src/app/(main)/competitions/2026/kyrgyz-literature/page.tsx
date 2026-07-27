import CompetitionPage from "@/components/CompetitionPage";

export const metadata = {
  title: "Конкурс 2026 — Кыргыз адабияты жана Кыргыз жана дүйнө адабияты",
};

export default function Page() {
  return (
    <CompetitionPage
      title="Кыргыз адабияты жана Кыргыз жана дүйнө адабияты — конкурс жабылды"
      subtitle="5-12-класстар"
      description={[
        "“Кыргыз адабияты” жана “Кыргыз жана дүйнө адабияты” окуу-методикалык комплекстердин авторлорун (түзүүчүлөрүн) тандоо боюнча сынак.",
        "Бул конкурс жабылгандыгын маалымдайбыз.",
      ]}
      sections={[]}
      pdfUrl="/pdf/2026-kyrgyz-literature-closed.pdf"
      pdfFileName="2026-kyrgyz-literature-closed.pdf"
    />
  );
}
