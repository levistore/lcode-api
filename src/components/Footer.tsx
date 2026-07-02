import { Zap, Globe, Send, MessageCircle } from "lucide-react";
import Logo from "@/components/Logo";

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "APIs", href: "#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Documentation", href: "#playground" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API Status", href: "#" },
      { label: "Support", href: "#" },
      { label: "Community", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-primary">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-5">
              <span className="text-lg font-extrabold text-text-primary tracking-tight font-display">
                Lcode <span className="text-accent">API</span>
              </span>
            </a>
            <p className="text-sm text-text-tertiary leading-relaxed mb-6">
              Powerful APIs for modern applications. Built for developers, by developers.
            </p>
            <div className="flex items-center gap-3">
              {[Globe, Send, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-bg-secondary border border-border flex items-center justify-center text-text-tertiary hover:text-text-primary hover:border-accent/40 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-text-primary mb-4">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-text-tertiary hover:text-text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-tertiary">
            &copy; {new Date().getFullYear()} Lcode API. All rights reserved.
          </p>
          <p className="text-xs text-text-tertiary">
            Crafted with precision for developers worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
