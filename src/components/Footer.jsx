import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-textSecondary sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
        <p>&copy; {year} GeoFinder</p>
        <Link
          to="/privacy"
          className="inline-flex items-center gap-2 text-textPrimary transition hover:text-accent"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
