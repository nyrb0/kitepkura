import DockNav from '@/widgets/DockNav';

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            {children}
            <DockNav />
        </div>
    );
}
