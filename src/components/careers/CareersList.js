"use client";

import Link from "next/link";
import PaginationControls, { usePaginatedItems } from "@/components/ui/PaginationControls";
import { useSiteCopy } from "@/components/global/SiteCopyProvider";

export default function CareersList({ vacancies }) {
  const { cards } = useSiteCopy();
  const pagination = usePaginatedItems(vacancies);

  return (
    <>
      <div className="jobs-list pagination-scroll-target" id="careers-grid-start">
        {pagination.pageItems.map((job) => (
          <Link href={`/careers/${job.slug}`} key={job.slug}>
            <div>{job.category ? <span>{job.category}</span> : null}<h3>{job.title}</h3>{job.location || job.hours ? <p>{[job.location, job.hours].filter(Boolean).join(" · ")}</p> : null}</div>
            <strong>{cards.viewRoleLabel} ↗</strong>
          </Link>
        ))}
      </div>
      <PaginationControls itemLabel={cards.rolesPaginationLabel} onChange={pagination.setPage} page={pagination.page} scrollTargetId="careers-grid-start" totalItems={vacancies.length} />
    </>
  );
}
