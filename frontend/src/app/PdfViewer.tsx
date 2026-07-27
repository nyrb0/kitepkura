'use client';

import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { FiDownload, FiChevronLeft, FiChevronRight, FiMinus, FiPlus } from 'react-icons/fi';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

interface PdfViewerProps {
    fileUrl: string;
    fileName?: string;
}

export function PdfViewer({ fileUrl, fileName = 'document.pdf' }: PdfViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [zoomAdjust, setZoomAdjust] = useState(-0.6);
    const [pageInput, setPageInput] = useState('1');

    // Размеры контейнера
    const [containerWidth, setContainerWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef<number | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
                setContainerHeight(entry.contentRect.height);
            }
        });

        resizeObserver.observe(el);
        setContainerWidth(el.clientWidth);
        setContainerHeight(el.clientHeight);
        return () => resizeObserver.disconnect();
    }, []);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPageNumber(1);
        setPageInput('1');
    }

    function goToPage(n: number) {
        const target = Math.min(Math.max(1, n), numPages || 1);
        setPageNumber(target);
        setPageInput(String(target));
    }

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'ArrowRight') goToPage(pageNumber + 1);
            if (e.key === 'ArrowLeft') goToPage(pageNumber - 1);
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pageNumber, numPages]);

    function handleTouchStart(e: React.TouchEvent) {
        touchStartX.current = e.touches[0].clientX;
    }
    function handleTouchEnd(e: React.TouchEvent) {
        if (touchStartX.current === null) return;
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(diff) > 50) {
            if (diff < 0) goToPage(pageNumber + 1);
            else goToPage(pageNumber - 1);
        }
        touchStartX.current = null;
    }

    function handlePageInputSubmit(e: React.FormEvent) {
        e.preventDefault();
        const n = parseInt(pageInput, 10);
        if (!Number.isNaN(n)) goToPage(n);
    }

    // Базовый размер страницы на десктопе, от которого мы отталкиваемся
    const baseWidth = 600;
    const zoomFactor = 1 + zoomAdjust * 0.1;
    const targetWidth = baseWidth * zoomFactor;

    // Рассчитываем коэффициент масштабирования (scale) для мобилок
    // Если ширина контейнера меньше, чем целевая ширина PDF, сжимаем его CSS-трансформацией
    const padding = 16; // Отступы внутри контейнера
    const availableWidth = containerWidth > padding ? containerWidth - padding : 300;

    const scale = availableWidth < targetWidth ? availableWidth / targetWidth : 1;

    return (
        <div className='flex h-[calc(100vh-2rem)] w-full flex-col gap-2 select-none'>
            {/* Панель управления */}
            <div className='flex w-full flex-shrink-0 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2'>
                <form onSubmit={handlePageInputSubmit} className='flex items-center gap-1.5 text-sm font-medium text-slate-600'>
                    <input
                        type='text'
                        inputMode='numeric'
                        value={pageInput}
                        onChange={e => setPageInput(e.target.value)}
                        onBlur={handlePageInputSubmit}
                        className='w-10 rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-center text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
                    />
                    <span className='text-xs sm:text-sm'>/ {numPages || '-'}</span>
                </form>

                <div className='flex items-center gap-2'>
                    <div className='flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5'>
                        <button
                            onClick={() => setZoomAdjust(s => Math.max(-5, s - 1))}
                            aria-label='Кичирейтүү'
                            className='flex h-7 w-7 items-center justify-center rounded text-slate-600 transition hover:bg-slate-100'
                        >
                            <FiMinus size={14} />
                        </button>
                        <span className='w-9 text-center text-xs font-medium text-slate-500'>{Math.round((100 + zoomAdjust * 10) * scale)}%</span>
                        <button
                            onClick={() => setZoomAdjust(s => Math.min(10, s + 1))}
                            aria-label='Чоңойтуу'
                            className='flex h-7 w-7 items-center justify-center rounded text-slate-600 transition hover:bg-slate-100'
                        >
                            <FiPlus size={14} />
                        </button>
                    </div>

                    <a
                        href={fileUrl}
                        download={fileName}
                        aria-label='Жүктөп алуу'
                        className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white transition hover:bg-primary-700 sm:h-9 sm:w-auto sm:gap-2 sm:px-4'
                    >
                        <FiDownload size={16} />
                        <span className='hidden text-sm font-semibold sm:inline'>Жүктөп алуу</span>
                    </a>
                </div>
            </div>

            {/* Основной контейнер */}
            <div className='relative min-h-0 w-full flex-1'>
                {/* Кнопка "Назад" */}
                <button
                    onClick={() => goToPage(pageNumber - 1)}
                    disabled={pageNumber <= 1}
                    className='absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 shadow-lg backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-0 sm:left-3 sm:h-12 sm:w-12'
                    aria-label='Мурунку барак'
                >
                    <FiChevronLeft size={22} />
                </button>

                {/* Кнопка "Вперед" */}
                <button
                    onClick={() => goToPage(pageNumber + 1)}
                    disabled={pageNumber >= numPages}
                    className='absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 shadow-lg backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-0 sm:right-3 sm:h-12 sm:w-12'
                    aria-label='Кийинки барак'
                >
                    <FiChevronRight size={22} />
                </button>

                {/* Скролл-контейнер */}
                <div
                    ref={containerRef}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className='flex h-full w-full items-center justify-center overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-2'
                >
                    {containerWidth > 0 && (
                        <div
                            className='flex items-center justify-center transition-transform duration-150 ease-out'
                            style={{
                                // Масштабируем всю обертку документа через CSS transform
                                transform: `scale(${scale})`,
                                transformOrigin: 'center center',
                                // Компенсируем уменьшение размеров контейнера, чтобы не было лишних пустых отступов вокруг сжатого PDF
                                width: `${targetWidth}px`,
                                minWidth: `${targetWidth}px`,
                            }}
                        >
                            <Document
                                file={fileUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={<p className='py-10 text-center text-slate-500'>Жүктөлүүдө...</p>}
                                error={<p className='py-10 text-center text-red-500'>PDF ачылбай жатат</p>}
                                className='flex items-center justify-center'
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    width={targetWidth}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                    className='bg-white shadow-md'
                                />
                            </Document>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
