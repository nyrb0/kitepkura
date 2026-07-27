"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

interface SubItem {
  title: string;
  href: string;
}

interface MenuItem {
  id: string;
  title: string;
  subItems: SubItem[];
}

const PageCompetiton = () => {
  const pathname = usePathname();
  const currentPath = pathname ?? "/competitions/2025/geography";

  const menuItems: MenuItem[] = [
    {
      id: "2025",
      title: "Жыйынтык 2025",
      subItems: [
        {
          title: "Кыргыз тили (эне тили катары)",
          href: "/competitions/2025/kyrgyz-native",
        },
        {
          title: "Кыргыз тили (экинчи тили катары)",
          href: "/competitions/2025/kyrgyz-second",
        },
        { title: "География", href: "/competitions/2025/geography" },
        { title: "Тарых / История", href: "/competitions/2025/history" },
      ],
    },
    {
      id: "2026",
      title: "Жыйынтык 2026",
      subItems: [
        {
          title: "Кыргыз тили, география — эксперттик жана координаторлор",
          href: "/competitions/2026/kyrgyz-geography-experts",
        },
        {
          title:
            "Кыргыз адабияты жана Кыргыз жана дүйнө адабияты — конкурс жабылды",
          href: "/competitions/2026/kyrgyz-literature",
        },
      ],
    },
  ];

  // Автоматически открываем категорию, внутри которой есть активный роут
  const [expandedYear, setExpandedYear] = useState<string | null>(() => {
    const activeMenu = menuItems.find((item) =>
      item.subItems.some((sub) => sub.href === currentPath),
    );
    return activeMenu ? activeMenu.id : "2026"; // Если совпадений нет, по умолчанию открыт 2026
  });

  const toggleYear = (id: string) => {
    setExpandedYear(expandedYear === id ? null : id);
  };

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      {/* Карточка меню */}
      <nav className="w-full max-w-2xl rounded-3xl border border-border bg-surface p-6 shadow-elevated sm:p-8 lg:p-10">
        <h2 className="mb-6 text-center text-sm font-bold uppercase tracking-[0.3em] text-text-muted sm:text-base">
          Жабык конкурстар
        </h2>

        <div className="flex flex-col gap-4">
          {menuItems.map((item) => {
            const isExpanded = expandedYear === item.id;
            // Проверяем, активен ли какой-то из подразделов внутри этого года
            const hasActiveChild = item.subItems.some(
              (sub) => sub.href === currentPath,
            );

            return (
              <div key={item.id} className="flex flex-col">
                {/* Кнопка года (Триггер аккордеона) */}
                <button
                  onClick={() => toggleYear(item.id)}
                  className={`group flex w-full items-center justify-between rounded-2xl px-5 py-4 text-lg font-semibold transition-all duration-300 ${
                    isExpanded || hasActiveChild
                      ? "bg-primary-50 text-brand shadow-sm"
                      : "bg-neutral-50 text-text hover:bg-neutral-100"
                  }`}
                >
                  <span>{item.title}</span>

                  {/* Иконка шеврона с анимацией поворота */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className={`h-5 w-5 transition-transform duration-300 ${
                      isExpanded
                        ? "rotate-180 text-brand"
                        : "text-text-muted group-hover:text-text"
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>

                {/* Выпадающий список предметов с плавной анимацией высоты */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isExpanded
                      ? "grid-rows-[1fr] opacity-100 my-2"
                      : "grid-rows-[0fr] opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="overflow-hidden">
                    {/* Древовидная линия слева от подразделов */}
                    <div className="ml-6 flex flex-col gap-2 border-l-2 border-neutral-200 pl-4 py-2">
                      {item.subItems.map((sub) => {
                        const isSubActive = currentPath === sub.href;

                        return (
                          <a
                            key={sub.href}
                            href={sub.href}
                            className={`group relative flex items-center rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 ${
                              isSubActive
                                ? "bg-brand text-brand-foreground shadow-sm"
                                : "text-text hover:bg-neutral-50 hover:text-brand"
                            }`}
                          >
                            <span className="truncate">{sub.title}</span>

                            {/* Изящная стрелочка при наведении на неактивный пункт */}
                            {!isSubActive && (
                              <span className="absolute right-3 text-brand opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100">
                                →
                              </span>
                            )}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default PageCompetiton;
