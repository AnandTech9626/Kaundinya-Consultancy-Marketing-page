import React, { useEffect, useState } from "react";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";

interface NavChild {
  label: string;
  href: string;
}

interface NavLink {
  label: string;
  href: string;
  children?: NavChild[];
}

interface Props {
  links: NavLink[];
  currentPath: string;
}

export default function MobileNav({ links, currentPath }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    setServicesOpen(false);
  };

  const openModal = () => {
    close();
    window.dispatchEvent(new CustomEvent("open-consultation-modal"));
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="inline-flex items-center justify-center p-2.5 rounded-md text-charcoal hover:text-charcoal-dark hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-gold transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="flex items-center justify-between h-16 px-4 border-b border-border-subtle">
            <img
              src="/images/logo.webp"
              alt="Kaundinya Consultancy"
              className="h-9 w-auto"
              width="36"
              height="36"
            />
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="inline-flex items-center justify-center p-2 rounded-md text-charcoal hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-gold transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="px-4 py-4 space-y-1" aria-label="Mobile Navigation">
            {links.map((link) => {
              const isContact = link.label.toLowerCase() === "contact";
              const isActive = currentPath === link.href;

              if (link.children) {
                return (
                  <div key={link.label} className="border-b border-border-subtle/60">
                    <button
                      type="button"
                      onClick={() => setServicesOpen(!servicesOpen)}
                      className="flex items-center justify-between w-full py-3 text-base font-semibold text-charcoal hover:text-gold transition-colors"
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          servicesOpen ? "rotate-180 text-gold" : "text-muted"
                        }`}
                      />
                    </button>

                    {servicesOpen && (
                      <div className="pb-3 space-y-1">
                        <a
                          href={link.href}
                          onClick={close}
                          className="block py-2 pl-4 text-sm font-medium text-charcoal hover:text-gold transition-colors"
                        >
                          All Services Overview
                        </a>
                        {link.children.map((child) => (
                          <a
                            key={child.href}
                            href={child.href}
                            onClick={close}
                            className={`block py-2 pl-4 text-sm transition-colors ${
                              currentPath === child.href
                                ? "text-gold font-semibold"
                                : "text-muted hover:text-charcoal"
                            }`}
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              if (isContact) {
                return (
                  <button
                    key={link.label}
                    type="button"
                    onClick={openModal}
                    className="block w-full text-left py-3 text-base font-semibold border-b border-border-subtle/60 text-charcoal hover:text-gold transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                );
              }

              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className={`block py-3 text-base font-semibold border-b border-border-subtle/60 transition-colors ${
                    isActive ? "text-gold" : "text-charcoal hover:text-gold"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          <div className="px-4 py-6">
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center justify-center w-full px-5 py-3 text-sm font-semibold text-charcoal bg-gold hover:bg-gold-hover rounded-md shadow-sm transition-colors gap-2 cursor-pointer"
            >
              <span>Request a Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
