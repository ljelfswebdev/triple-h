"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFoundActions({ copy }) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <div className="not-found-page__actions">
      <button
        className="btn btn-white-outline"
        onClick={goBack}
        type="button"
      >
        <span aria-hidden="true">←</span>
        {copy.backLabel}
      </button>
      <Link className="btn btn-primary" href="/">
        {copy.homeLabel}
      </Link>
    </div>
  );
}
