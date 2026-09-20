"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Select from "@/components/admin/Select";
import { useSiteCopy } from "@/components/global/SiteCopyProvider";
import { trackEvent } from "@/lib/analytics-events";

export const DEFAULT_PAGE_SIZE = 10;

export function usePaginatedItems(items, pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    page: currentPage,
    pageItems: items.slice(startIndex, startIndex + pageSize),
    setPage,
    startIndex,
    totalPages,
  };
}

export default function PaginationControls({ itemLabel = "items", onChange, page, pageSize = DEFAULT_PAGE_SIZE, scrollTargetId, totalItems }) {
  const { pagination: copy } = useSiteCopy();
  const scrollAfterPageChange = useRef(false);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const options = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => ({ label: String(index + 1), value: index + 1 })),
    [totalPages],
  );

  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalItems);

  useEffect(() => {
    if (!scrollAfterPageChange.current || !scrollTargetId) return;
    scrollAfterPageChange.current = false;
    const target = document.getElementById(scrollTargetId);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, [page, scrollTargetId]);

  function changePage(nextPage) {
    scrollAfterPageChange.current = true;
    trackEvent("Pagination", { collection: itemLabel, page: nextPage, totalPages });
    onChange(nextPage);
  }

  if (totalPages <= 1) return null;

  return (
    <nav aria-label={`${itemLabel} pagination`} className="content-pagination">
      <button aria-label={copy.previousLabel} disabled={page === 1} onClick={() => changePage(page - 1)} type="button">
        <span aria-hidden="true">←</span> {copy.previousShortLabel}
      </button>
      <div className="content-pagination__picker">
        <span>{copy.pageLabel}</span>
        <Select
          aria-label={copy.choosePageLabel}
          inputId={`${itemLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-page`}
          isSearchable={false}
          menuPlacement="auto"
          onChange={(option) => changePage(option?.value || 1)}
          options={options}
          placeholder={copy.choosePageLabel}
          value={options.find((option) => option.value === page)}
        />
        <span>{copy.ofLabel} <strong>{totalPages}</strong></span>
      </div>
      <span className="content-pagination__count">{firstItem}–{lastItem} of {totalItems} {itemLabel}</span>
      <button aria-label={copy.nextLabel} disabled={page === totalPages} onClick={() => changePage(page + 1)} type="button">
        {copy.nextShortLabel} <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}
