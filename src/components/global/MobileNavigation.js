"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const closeDuration = 620;

function phoneHref(number) {
  const value = number.replace(/[^\d+]/g, "");
  return value ? `tel:${value}` : "";
}

function isCurrentPage(pathname, href) {
  if (!href?.startsWith("/")) return false;
  if (href === "/") return pathname === "/";

  const cleanHref = href.replace(/\/$/, "");
  return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
}

function MobileLink({ children, className = "", item, onClick, ...props }) {
  return (
    <Link
      className={className}
      href={item.href}
      onClick={onClick}
      rel={item.newTab ? "noreferrer" : undefined}
      target={item.newTab ? "_blank" : undefined}
      {...props}
    >
      {children}
    </Link>
  );
}

export default function MobileNavigation({ items, phoneNumber, quoteLink }) {
  const [open, setOpen] = useState(false);
  const [renderMenu, setRenderMenu] = useState(false);
  const [closing, setClosing] = useState(false);
  const pathname = usePathname();
  const closeTimerRef = useRef(null);
  const toggleRef = useRef(null);
  const menuRef = useRef(null);
  const telephone = phoneNumber ? phoneHref(phoneNumber) : "";

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current === null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const closeMenu = useCallback(
    ({ immediate = false, restoreFocus = false } = {}) => {
      clearCloseTimer();
      setClosing(!immediate);
      setOpen(false);

      if (immediate) {
        setRenderMenu(false);
      } else {
        closeTimerRef.current = window.setTimeout(() => {
          setRenderMenu(false);
          setClosing(false);
          closeTimerRef.current = null;
        }, closeDuration);
      }

      if (restoreFocus) {
        window.requestAnimationFrame(() => toggleRef.current?.focus());
      }
    },
    [clearCloseTimer],
  );

  const openMenu = useCallback(() => {
    clearCloseTimer();
    setClosing(false);

    if (renderMenu) {
      setOpen(true);
      return;
    }

    setRenderMenu(true);
    window.requestAnimationFrame(() => setOpen(true));
  }, [clearCloseTimer, renderMenu]);

  useEffect(() => {
    closeMenu({ immediate: true });
  }, [closeMenu, pathname]);

  useEffect(() => {
    return clearCloseTimer;
  }, [clearCloseTimer]);

  useEffect(() => {
    if (!renderMenu) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event) {
      if (event.key !== "Escape") return;
      closeMenu({ restoreFocus: true });
    }

    function closeAtDesktop(event) {
      if (event.matches) closeMenu({ immediate: true });
    }

    const desktopQuery = window.matchMedia("(min-width: 1025px)");
    document.addEventListener("keydown", closeOnEscape);
    desktopQuery.addEventListener("change", closeAtDesktop);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      desktopQuery.removeEventListener("change", closeAtDesktop);
    };
  }, [closeMenu, renderMenu]);

  useEffect(() => {
    if (!open) return undefined;

    const focusFrame = window.requestAnimationFrame(() => {
      menuRef.current?.querySelector("a")?.focus();
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [open]);

  return (
    <div className="min-[1025px]:hidden">
      <div className="relative z-[2]">
        <button
          aria-controls="mobile-navigation-menu"
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="mobile-navigation__toggle"
          onClick={() => (open ? closeMenu() : openMenu())}
          ref={toggleRef}
          type="button"
        >
          <span className="relative flex h-4 w-6 items-center justify-center" aria-hidden="true">
            <span
              className={`absolute h-[2px] w-6 rounded-full bg-current transition-[transform,opacity] duration-500 ease-in-out ${open ? "translate-y-0 rotate-45" : "-translate-y-[7px]"}`}
            />
            <span
              className={`absolute h-[2px] w-6 rounded-full bg-current transition-[transform,opacity] duration-500 ease-in-out ${open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"}`}
            />
            <span
              className={`absolute h-[2px] w-6 rounded-full bg-current transition-[transform,opacity] duration-500 ease-in-out ${open ? "translate-y-0 -rotate-45" : "translate-y-[7px]"}`}
            />
          </span>
        </button>
      </div>

      {renderMenu ? (
        <>
          <button
            aria-label="Close navigation"
            className={`fixed inset-0 top-[80px] bg-black/55 transition-opacity duration-[560ms] ease-in-out ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
            onClick={() => closeMenu()}
            tabIndex={-1}
            type="button"
          />

          <div
            aria-hidden={!open}
            className={`fixed inset-x-0 top-[80px] max-h-[calc(100dvh-80px)] overflow-y-auto border-t border-white/10 bg-[var(--color-black)] shadow-[0_24px_50px_#0008] transition-[transform,opacity] duration-[600ms] ease-in-out ${open ? "translate-y-0 opacity-100" : closing ? "pointer-events-none translate-y-0 opacity-0" : "pointer-events-none -translate-y-3 opacity-0"}`}
            id="mobile-navigation-menu"
            ref={menuRef}
          >
            <div className="container">
              <nav aria-label="Mobile navigation" className="py-6">
              <ul className="m-0 list-none p-0">
                {items.map((item, index) => (
                  <li
                    className={`border-b border-white/10 transition-[transform,opacity] duration-[440ms] ease-in-out ${open ? "translate-y-0 opacity-100" : closing ? "translate-y-0 opacity-0" : "-translate-y-2 opacity-0"}`}
                    key={item.id}
                    style={{
                      transitionDelay: open
                        ? `${90 + index * 55}ms`
                        : "0ms",
                    }}
                  >
                    <MobileLink
                      aria-current={
                        isCurrentPage(pathname, item.href) ? "page" : undefined
                      }
                      className="mobile-navigation__link body-large flex items-center justify-between py-5 no-underline transition-colors"
                      item={item}
                      onClick={() => closeMenu()}
                      tabIndex={open ? undefined : -1}
                    >
                      <span>{item.label}</span>
                      <span aria-hidden="true">→</span>
                    </MobileLink>
                  </li>
                ))}
              </ul>

              <div
                className={`mt-7 grid gap-3 transition-[transform,opacity] duration-[440ms] ease-in-out ${open ? "translate-y-0 opacity-100" : closing ? "translate-y-0 opacity-0" : "-translate-y-2 opacity-0"}`}
                style={{
                  transitionDelay: open
                    ? `${140 + items.length * 55}ms`
                    : "0ms",
                }}
              >
                {telephone ? (
                  <a
                className="btn btn-primary-outline btn-on-dark"
                    href={telephone}
                    onClick={() => closeMenu()}
                    tabIndex={open ? undefined : -1}
                  >
                    {phoneNumber}
                  </a>
                ) : null}

                <MobileLink
              className="btn btn-white"
                  item={quoteLink}
                  onClick={() => closeMenu()}
                  tabIndex={open ? undefined : -1}
                >
                  {quoteLink.label}
                </MobileLink>
              </div>
              </nav>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
