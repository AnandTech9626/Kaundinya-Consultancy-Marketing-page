import React, { useState } from "react";
import { Menu, X, Phone, ChevronDown, ArrowRight } from "lucide-react";

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
  contacts: { name: string; phone: string; phoneRaw: string }[];
}

export default function MobileNav({ links, currentPath, contacts }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const toggle = () => setIsOpen((prev) => !prev);
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
        onClick={toggle}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        className="inline-flex items-center justify-center p-2.5 rounded-md text-charcoal hover:text-charcoal-dark hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-gold transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 top-20 z-50 bg-white/95 backdrop-blur-md border-t border-border-subtle flex flex-col justify-between overflow-y-auto p-6 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="space-y-6">
            <nav className="flex flex-col space-y-2" aria-label="Mobile Navigation">
              {links.map((link) => {
                const isContact = link.label.toLowerCase() === "contact";
                const isActive = currentPath === link.href;

                if (link.children) {
                  return (
                    <div key={link.label} className="border-b border-border-subtle/50 pb-2">
                      <button
                        type="button"
                        onClick={() => setServicesOpen(!servicesOpen)}
                        className="flex items-center justify-between w-full py-2.5 text-base font-semibold text-charcoal hover:text-gold transition-colors"
                      >
                        <span>{link.label}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            servicesOpen ? "rotate-180 text-gold" : "text-muted"
                          }`}
                        />
                      </button>

                      {servicesOpen && (
                        <div className="pl-4 py-1 space-y-1 bg-ivory/60 rounded-md my-1">
                          <a
                            href={link.href}
                            onClick={close}
                            className="block py-2 text-sm font-medium text-charcoal hover:text-gold transition-colors"
                          >
                            All Services Overview
                          </a>
                          {link.children.map((child) => (
                            <a
                              key={child.href}
                              href={child.href}
                              onClick={close}
                              className={`block py-1.5 text-sm transition-colors ${
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
                      className="text-left py-2.5 text-base font-semibold border-b border-border-subtle/50 text-charcoal hover:text-gold transition-colors cursor-pointer"
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
                    className={`py-2.5 text-base font-semibold border-b border-border-subtle/50 transition-colors ${
                      isActive ? "text-gold" : "text-charcoal hover:text-gold"
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>

            <div className="pt-2">
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

          <div className="pt-6 border-t border-border-subtle mt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
              Direct Phone Support (Hyderabad)
            </p>
            <div className="space-y-2">
              {contacts.map((contact) => (
                <a
                  key={contact.phoneRaw}
                  href={`tel:${contact.phoneRaw}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-ivory hover:bg-ivory-dark transition-colors text-charcoal"
                >
                  <div>
                    <div className="text-xs text-muted">{contact.name}</div>
                    <div className="text-sm font-bold">{contact.phone}</div>
                  </div>
                  <Phone className="w-4 h-4 text-gold" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
