import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaBarsStaggered, FaXmark } from "react-icons/fa6";

const links = [
  { to: "/", label: "Overview" },
  { to: "/play", label: "Play the Web Demo" },
];

function Navbar() {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/70 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <Link
          to="/"
          onClick={close}
          className="text-lg font-semibold tracking-tight text-white transition hover:text-accent"
        >
          GeoFinder
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={close}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive
                    ? "text-accent"
                    : "text-textSecondary hover:text-accent"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        <button
          type="button"
          onClick={toggle}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-surface/80 text-textSecondary transition hover:border-accent/60 hover:text-accent md:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <FaXmark /> : <FaBarsStaggered />}
        </button>
      </nav>
      {open && (
        <div className="border-t border-white/10 bg-background/95 px-6 pb-6 pt-4 shadow-xl sm:px-10 lg:px-16 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={close}
                className={({ isActive }) =>
                  `rounded-2xl border border-white/5 px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-accent/20 text-accent"
                      : "text-textSecondary hover:border-accent/40 hover:text-accent"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
