import React from "react";

interface PdfPageViewerProps {
  pdfUrl: string | null;
  previewMimeType?: string | null;
  loading?: boolean;
  error?: string | null;
}

const PdfPageViewer: React.FC<PdfPageViewerProps> = ({ pdfUrl, previewMimeType = null, loading = false, error = null }) => {
  const isImagePreview = !!previewMimeType && previewMimeType.startsWith("image/");

  return (
    <div className="pdf-viewer-container">
      {loading && <p className="status-text">Loading preview...</p>}
      {error && <p className="error-text">{error}</p>}

      {pdfUrl && (
        <div className="pdf-card">
          {isImagePreview ? (
            <img
              src={pdfUrl}
              alt="Document Preview"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          ) : (
            <iframe
              src={pdfUrl}
              title="PDF Viewer"
              style={{ width: "100%", minHeight: "800px", border: "none", display: "block" }}
            />
          )}
        </div>
      )}

      {!loading && !pdfUrl && !error && (
        <p className="status-text">Select an EPIC No to preview the PDF here.</p>
      )}
    </div>
  );
};

export default PdfPageViewer;