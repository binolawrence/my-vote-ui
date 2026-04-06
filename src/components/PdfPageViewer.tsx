import React from "react";

interface PdfPageViewerProps {
  pdfUrl: string | null;
  loading?: boolean;
  error?: string | null;
}

const PdfPageViewer: React.FC<PdfPageViewerProps> = ({ pdfUrl, loading = false, error = null }) => {
  return (
    <div className="pdf-viewer-container">
      {loading && <p className="status-text">Loading PDF...</p>}
      {error && <p className="error-text">{error}</p>}

      {pdfUrl && (
        <div className="pdf-card">
          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            style={{ width: "100%", minHeight: "800px", border: "none", display: "block" }}
          />
        </div>
      )}

      {!loading && !pdfUrl && !error && (
        <p className="status-text">Select an EPIC No to preview the PDF here.</p>
      )}
    </div>
  );
};

export default PdfPageViewer;