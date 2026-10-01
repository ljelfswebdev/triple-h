"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BrandMark from "./BrandMark";

export default function HeaderClient({ copy, items }) {
  const [open, setOpen] = useState(false);
  const [desktopMenu, setDesktopMenu] = useState(null);
  const [mobilePanel, setMobilePanel] = useState(null);
  const desktopCloseTimer = useRef(null);
  const pathname = usePathname();

  const cancelDesktopClose = () => {
    if (!desktopCloseTimer.current) return;
    window.clearTimeout(desktopCloseTimer.current);
    desktopCloseTimer.current = null;
  };

  const openDesktopMenu = (label) => {
    cancelDesktopClose();
    setDesktopMenu(label);
  };

  const scheduleDesktopClose = () => {
    cancelDesktopClose();
    desktopCloseTimer.current = window.setTimeout(() => {
      setDesktopMenu(null);
      desktopCloseTimer.current = null;
    }, 220);
  };

  useEffect(() => {
    setOpen(false);
    setDesktopMenu(null);
    setMobilePanel(null);
  }, [pathname]);

  useEffect(() => () => {
    if (desktopCloseTimer.current) window.clearTimeout(desktopCloseTimer.current);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        if (mobilePanel) setMobilePanel(null);
        else setOpen(false);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobilePanel, open]);

  const closeMenu = () => {
    setOpen(false);
    setDesktopMenu(null);
    setMobilePanel(null);
  };

  return (
    <>
      <a className="skip-link" href="#main-content">{copy.skipLabel}</a>
      <header className={`th-header${open ? " th-header--menu-open" : ""}`}>
        <div className="container th-header__inner">
          <BrandMark priority />
          <button
            aria-controls="primary-navigation"
            aria-expanded={open}
            className="th-header__toggle"
            onClick={() => {
              setOpen((value) => !value);
              setMobilePanel(null);
              setDesktopMenu(null);
            }}
            type="button"
          >
            <span />
            <span />
            <span />
            <span className="visually-hidden">{copy.menuLabel}</span>
          </button>
          <nav aria-label="Primary" className={`th-nav${open ? " th-nav--open" : ""}`} id="primary-navigation">
            <ul className="th-nav__primary">
              {items.map(({ label, href, newTab, children }, index) => (
                <li
                  className={children?.length ? "th-nav__parent" : undefined}
                  key={`${label}-${href}`}
                  onMouseEnter={() => children?.length && openDesktopMenu(label)}
                  onMouseLeave={() => children?.length && scheduleDesktopClose()}
                  style={{ "--nav-index": index }}
                >
                  {children?.length ? (
                    <button
                      aria-expanded={desktopMenu === label || mobilePanel?.label === label}
                      className="th-nav__parent-trigger"
                      onClick={() => {
                        if (window.matchMedia("(max-width: 1080px)").matches) setMobilePanel({ label, items: children });
                        else openDesktopMenu(label);
                      }}
                      onFocus={() => openDesktopMenu(label)}
                      type="button"
                    >
                      <span>{label}</span>
                      <svg aria-hidden="true" className="th-nav__chevron" viewBox="0 0 14 14">
                        <path d="m2.5 5 4.5 4 4.5-4" />
                      </svg>
                    </button>
                  ) : (
                    <Link
                      aria-current={href.startsWith("/") && pathname.startsWith(href) ? "page" : undefined}
                      href={href}
                      onClick={closeMenu}
                      rel={newTab ? "noopener noreferrer" : undefined}
                      target={newTab ? "_blank" : undefined}
                    >
                      {label}
                    </Link>
                  )}
                  {children?.length ? (
                    <div
                      className={`th-nav__mega${desktopMenu === label ? " is-open" : ""}`}
                      onMouseEnter={cancelDesktopClose}
                      onMouseLeave={scheduleDesktopClose}
                    >
                      <div className="container th-nav__mega-inner">
                        <div className="th-nav__mega-intro">
                          <span>{copy.exploreLabel}</span>
                          <strong>{label}</strong>
                          <p>{copy.megaDescription}</p>
                        </div>
                        <div className="th-nav__mega-links">
                          {children.map((child, childIndex) => (
                            <Link href={child.href} key={child.href} onClick={closeMenu}>
                              <span>{String(childIndex + 1).padStart(2, "0")}</span>
                              <strong>{child.label}</strong>
                              <small>{child.description}</small>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
            <div className="th-nav__actions">
              <Link className="btn btn-primary" href={copy.contactLink.url} onClick={closeMenu}>{copy.contactLink.label}</Link>
              <Link className="btn btn-white-outline" href={copy.portalLink.url} onClick={closeMenu}>{copy.portalLink.label}</Link>
            </div>
            <div className={`th-nav__mobile-panel${mobilePanel ? " is-open" : ""}`} aria-hidden={!mobilePanel}>
              {mobilePanel ? (
                <>
                  <button className="th-nav__back" onClick={() => { setMobilePanel(null); setDesktopMenu(null); }} type="button">
                    <span aria-hidden="true">←</span> {copy.backLabel}
                  </button>
                  <p className="eyebrow">{copy.exploreLabel}</p>
                  <h2>{mobilePanel.label}</h2>
                  <ul>
                    {mobilePanel.items.map((child, index) => (
                      <li key={child.href} style={{ "--nav-index": index }}>
                        <Link href={child.href} onClick={closeMenu}>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <strong>{child.label}</strong>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
