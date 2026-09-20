"use client";

import CollectionCard from "./CollectionCard";
import PaginationControls, { usePaginatedItems } from "@/components/ui/PaginationControls";
import { useSiteCopy } from "@/components/global/SiteCopyProvider";

export default function CollectionGrid({ basePath, items }) {
  const { cards } = useSiteCopy();
  const pagination = usePaginatedItems(items);

  return (
    <>
      <div className="content-grid pagination-scroll-target" id="collection-grid-start">
        {pagination.pageItems.map((item, index) => (
          <CollectionCard href={`${basePath}/${item.slug}`} index={pagination.startIndex + index} item={item} key={item.slug} />
        ))}
      </div>
      <PaginationControls itemLabel={cards.entriesPaginationLabel} onChange={pagination.setPage} page={pagination.page} scrollTargetId="collection-grid-start" totalItems={items.length} />
    </>
  );
}
