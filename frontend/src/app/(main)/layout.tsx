import SiteVisitTracker from '@/components/SiteVisitTracker';
import Footer from '@/widgets/Footer';
import Header from '@/widgets/Header';

export default function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <Header />
            <SiteVisitTracker />
            <main>{children}</main>
            <Footer />
        </div>
    );
}
