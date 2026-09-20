"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import PaginationControls from "@/components/ui/PaginationControls";
import { mediaUploadError, readMediaUploadResponse } from "@/lib/media-upload";

function mediaLabel(media) {
  return media.alt || media.caption || media.publicId || "Uploaded media";
}

function mediaSource(media) {
  return media?.secureUrl || media?.url || "";
}

function MediaThumbnail({ media }) {
  const source = mediaSource(media);

  if (media.resourceType === "video") {
    return <video muted playsInline preload="metadata" src={source} />;
  }

  return <img alt="" loading="lazy" src={source} />;
}

export default function MediaField({ accept = "image", label, onChange, value }) {
  const [error, setError] = useState("");
  const [library, setLibrary] = useState([]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryPage, setLibraryPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!libraryOpen) return undefined;
    let active = true;
    setLoadingLibrary(true);

    fetch(`/api/media?type=${encodeURIComponent(accept)}&page=${libraryPage}&limit=10`)
      .then((response) => (response.ok ? response.json() : []))
      .then((result) => {
        if (active) {
          setLibrary(result.items || []);
          setPagination(result.pagination || null);
        }
      })
      .catch(() => {
        if (active) setLibrary([]);
      })
      .finally(() => {
        if (active) setLoadingLibrary(false);
      });

    return () => {
      active = false;
    };
  }, [accept, libraryOpen, libraryPage]);

  useEffect(() => {
    setLibraryPage(1);
  }, [accept]);

  async function upload(event) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    setError("");
    const validationError = mediaUploadError(file);
    if (validationError) {
      setError(validationError);
      input.value = "";
      return;
    }
    setUploading(true);

    try {
      const signatureResponse = await fetch("/api/media/sign", {
        method: "POST",
      });
      const signature = await signatureResponse.json().catch(() => null);
      if (!signatureResponse.ok) {
        throw new Error(
          signature?.error ||
            (signatureResponse.status === 401
              ? "Your session has expired. Please sign in and try again."
              : "The secure upload could not be started. Please try again."),
        );
      }

      const cloudinaryData = new FormData();
      cloudinaryData.set("file", file);
      cloudinaryData.set("api_key", signature.apiKey);
      cloudinaryData.set("timestamp", String(signature.timestamp));
      cloudinaryData.set("public_id", signature.publicId);
      cloudinaryData.set("signature", signature.signature);

      const cloudinaryResponse = await fetch(signature.uploadUrl, {
        method: "POST",
        body: cloudinaryData,
      });
      const cloudinaryResult = await cloudinaryResponse.json().catch(() => null);
      if (!cloudinaryResponse.ok || !cloudinaryResult?.public_id) {
        throw new Error(
          cloudinaryResult?.error?.message || "Cloudinary could not upload this file.",
        );
      }

      const completionBody = JSON.stringify({
        publicId: cloudinaryResult.public_id,
        resourceType: cloudinaryResult.resource_type,
        alt: value?.alt || "",
      });
      let response;
      let completionError;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          response = await fetch("/api/media/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: completionBody,
          });
          if (response.ok || response.status < 500) break;
        } catch (requestError) {
          completionError = requestError;
        }
      }
      if (!response) {
        throw completionError || new Error("The uploaded file could not be saved.");
      }
      const result = await readMediaUploadResponse(response);

      setLibrary((current) => [result, ...current]);
      onChange(result);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      input.value = "";
      setUploading(false);
    }
  }

  const source = mediaSource(value);
  const selectedId = value?._id || value?.publicId;
  const isVideo = value?.resourceType === "video" || accept === "video";

  return (
    <div className="field admin-field admin-media-field">
      <label>{label}</label>
      <div className="admin-media-field__actions">
        <button
          className="btn btn-primary-outline btn-small"
          disabled={uploading}
          onClick={() => setLibraryOpen(true)}
          type="button"
        >
          {value ? "Change from media library" : "Choose from media library"}
        </button>
        {value ? <span className="admin-media-field__selection">{mediaLabel(value)}</span> : null}
      </div>

      <Modal
        className="admin-media-library-modal"
        onClose={() => setLibraryOpen(false)}
        open={libraryOpen}
        title={`Choose existing ${accept}`}
      >
        {loadingLibrary ? <p role="status">Loading media…</p> : null}
        {!loadingLibrary && library.length === 0 ? (
          <p className="admin-empty-value">No {accept}s uploaded yet.</p>
        ) : null}
        {!loadingLibrary && library.length ? (
          <>
            <div className="admin-media-library__grid">
              {library.map((media) => {
                const mediaId = media._id || media.publicId;
                const selected = String(mediaId) === String(selectedId);

                return (
                  <button
                    aria-label={`Choose ${mediaLabel(media)}`}
                    aria-pressed={selected}
                    className="admin-media-library__item"
                    key={mediaId}
                    onClick={() => {
                      onChange(media);
                      setLibraryOpen(false);
                    }}
                    type="button"
                  >
                    <span className="admin-media-library__thumbnail">
                      <MediaThumbnail media={media} />
                    </span>
                    <strong>{mediaLabel(media)}</strong>
                    {media.width && media.height ? (
                      <small>
                        {media.width} × {media.height}
                      </small>
                    ) : null}
                    {selected ? (
                      <span className="admin-media-library__selected">Selected</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {pagination ? <PaginationControls itemLabel="media files" onChange={setLibraryPage} page={pagination.page} pageSize={10} totalItems={pagination.total} /> : null}
          </>
        ) : null}
      </Modal>

      <div className="admin-media-field__upload">
        <input
          accept={accept === "video" ? "video/*" : "image/*"}
          aria-label={`Upload ${label}`}
          disabled={uploading}
          onChange={upload}
          type="file"
        />
        {uploading && <span role="status">Uploading…</span>}
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {source && (
        <div className="admin-media-field__preview">
          {isVideo ? (
            <video controls preload="metadata" src={source} />
          ) : (
            <img alt={value.alt || "Selected media preview"} src={source} />
          )}
          {!isVideo && (
            <div className="field">
              <label>Alternative text</label>
              <input
                onChange={(event) => onChange({ ...value, alt: event.target.value })}
                placeholder="Describe the image for screen readers"
                type="text"
                value={value.alt || ""}
              />
            </div>
          )}
          <button
            className="btn btn-black-outline btn-small"
            onClick={() => onChange(null)}
            type="button"
          >
            Remove selection
          </button>
        </div>
      )}
    </div>
  );
}
