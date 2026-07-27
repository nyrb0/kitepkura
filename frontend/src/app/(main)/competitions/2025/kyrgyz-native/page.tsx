import CompetitionPage from "@/components/CompetitionPage";

export const metadata = {
  title: "Конкурс 2025 — Кыргыз тили (эне тил катары)",
};

export default function Page() {
  return (
    <CompetitionPage
      title="Кыргыз тили (эне тил катары)"
      subtitle="Жыйынтык 2025 — авторлордун тизмеси"
      description={[
        "Жалпы 24 арыз кабыл алынып, калыстар тобунун чечими менен 5 автор тандалып алынды.",
        "Всего принято 24 заявки, по решению жюри отобраны 5 авторов.",
      ]}
      sections={[
        {
          title: "Эне тил",
          items: [
            "Ибраимова Рахат Уметбековна",
            "Бекбоева Айдай Абылбековна",
            "Иманкулова Гүлшан Тыныбековна",
          ],
        },
        {
          title: "Экинчи тил",
          items: [
            "Сайпидинова Миргүл Камалдиновна",
            "Ормукова Айгүл Иниятовна",
          ],
        },
      ]}
      pdfUrl="/pdf/2025-kyrgyz-native.pdf"
      pdfFileName="2025-kyrgyz-native.pdf"
    />
  );
}
