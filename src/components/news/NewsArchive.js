"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CollectionCard from "@/components/sections/triple-h/CollectionCard";
import Select from "@/components/admin/Select";
import PaginationControls, { usePaginatedItems } from "@/components/ui/PaginationControls";
import { filterNewsItems, newsMonthKey, newsMonthLabel } from "@/lib/news-filters";
import { trackEvent } from "@/lib/analytics-events";

export default function NewsArchive({ copy, items }) {
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date-desc");
  const searchChanged = useRef(false);

  const categoryOptions = useMemo(
    () => [...new Set(items.map((item) => item.category).filter(Boolean))]
      .sort((left, right) => left.localeCompare(right))
      .map((value) => ({ label: value, value })),
    [items],
  );
  const dateOptions = useMemo(
    () => [...new Set(items.map(newsMonthKey).filter(Boolean))]
      .sort((left, right) => right.localeCompare(left))
      .map((value) => ({ label: newsMonthLabel(value), value })),
    [items],
  );
  const sortOptions = useMemo(() => [
    { label: copy.sortNewestLabel, value: "date-desc" },
    { label: copy.sortOldestLabel, value: "date-asc" },
    { label: copy.sortAzLabel, value: "title-asc" },
    { label: copy.sortZaLabel, value: "title-desc" },
  ], [copy.sortAzLabel, copy.sortNewestLabel, copy.sortOldestLabel, copy.sortZaLabel]);
  const filteredItems = useMemo(
    () => filterNewsItems(items, { category, date, search, sort }),
    [category, date, items, search, sort],
  );
  const { page, pageItems, setPage, startIndex } = usePaginatedItems(filteredItems);

  useEffect(() => {
    setPage(1);
  }, [category, date, search, setPage, sort]);

  useEffect(() => {
    if (!searchChanged.current) return undefined;
    const timeout = window.setTimeout(() => {
      trackEvent("News Search", {
        termLength: search.trim().length,
        resultCount: filteredItems.length,
        state: search ? "updated" : "cleared",
      });
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [filteredItems.length, search]);

  const activeFilters = Number(Boolean(search)) + Number(Boolean(category)) + Number(Boolean(date));

  function scrollToResults() {
    window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById("news-grid-start")?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  function clearFilters() {
    setSearch("");
    setCategory("");
    setDate("");
    setFiltersOpen(false);
    trackEvent("News Filter", { action: "clear-all", resultCount: items.length });
    scrollToResults();
  }

  function changeSort(option) {
    setSort(option?.value || "date-desc");
    setFiltersOpen(false);
    trackEvent("News Sort", { sort: option?.value || "date-desc", resultCount: filteredItems.length });
    scrollToResults();
  }

  function changeCategory(option) {
    setCategory(option?.value || "");
    setFiltersOpen(false);
    trackEvent("News Filter", { filter: "category", value: option?.value || "all" });
    scrollToResults();
  }

  function changeDate(option) {
    setDate(option?.value || "");
    setFiltersOpen(false);
    trackEvent("News Filter", { filter: "date", value: option?.value || "all" });
    scrollToResults();
  }

  function changeSearch(event) {
    searchChanged.current = true;
    setSearch(event.target.value);
    scrollToResults();
  }

  return (
    <div className="news-archive-layout">
      <button
        aria-controls="news-filter-panel"
        aria-expanded={filtersOpen}
        className="news-filter-toggle"
        onClick={() => setFiltersOpen((current) => !current)}
        type="button"
      >
        <span>{copy.toggleLabel}{activeFilters ? ` (${activeFilters})` : ""}</span>
        <span aria-hidden="true">{filtersOpen ? "×" : "+"}</span>
      </button>

      <aside className={`news-filters${filtersOpen ? " is-open" : ""}`}>
        <div className="news-filters__panel" id="news-filter-panel">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
          <div className="field">
            <label htmlFor="news-search">{copy.searchLabel}</label>
            <input
              id="news-search"
              onChange={changeSearch}
              placeholder={copy.searchPlaceholder}
              type="search"
              value={search}
            />
          </div>
          <div className="field">
            <label htmlFor="news-sort">{copy.sortLabel}</label>
            <Select
              inputId="news-sort"
              isSearchable={false}
              onChange={changeSort}
              options={sortOptions}
              placeholder={copy.sortPlaceholder}
              value={sortOptions.find((option) => option.value === sort)}
            />
          </div>
          <div className="field">
            <label htmlFor="news-category">{copy.categoryLabel}</label>
            <Select
              inputId="news-category"
              isClearable
              isSearchable={false}
              onChange={changeCategory}
              options={categoryOptions}
              placeholder={copy.categoryPlaceholder}
              value={categoryOptions.find((option) => option.value === category) || null}
            />
          </div>
          <div className="field">
            <label htmlFor="news-date-filter">{copy.dateLabel}</label>
            <Select
              inputId="news-date-filter"
              isClearable
              isSearchable={false}
              menuPlacement="top"
              onChange={changeDate}
              options={dateOptions}
              placeholder={copy.datePlaceholder}
              value={dateOptions.find((option) => option.value === date) || null}
            />
          </div>
          {activeFilters ? (
            <button className="news-filters__clear" onClick={clearFilters} type="button">
              {copy.clearAllLabel} <span aria-hidden="true">↗</span>
            </button>
          ) : null}
        </div>
      </aside>

      <div className="news-results">
        <div className="news-results__heading pagination-scroll-target" aria-live="polite" id="news-grid-start">
          <div>
            <p className="eyebrow">{copy.resultsEyebrow}</p>
            <h2>{filteredItems.length === 1 ? `1 ${copy.singularLabel}` : `${filteredItems.length} ${copy.pluralLabel}`}</h2>
          </div>
          {activeFilters ? <span>{activeFilters} {copy.activeLabel} {activeFilters === 1 ? copy.activeSingularLabel : copy.activePluralLabel}</span> : null}
        </div>

        {filteredItems.length ? (
          <>
            <div className="content-grid">
              {pageItems.map((item, index) => (
                <CollectionCard
                  href={`/news/${item.slug}`}
                  index={startIndex + index}
                  item={item}
                  key={item.slug}
                  showDate
                />
              ))}
            </div>
            <PaginationControls
              itemLabel={copy.pluralLabel}
              onChange={setPage}
              page={page}
              scrollTargetId="news-grid-start"
              totalItems={filteredItems.length}
            />
          </>
        ) : (
          <div className="news-results__empty">
            <strong>{copy.emptyTitle}</strong>
            <p>{copy.emptyText}</p>
            <button className="btn btn-black-outline" onClick={clearFilters} type="button">{copy.emptyButtonLabel}</button>
          </div>
        )}
      </div>
    </div>
  );
}
