import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import PdfPageViewer from "./PdfPageViewer";

interface SearchResult {
  fileName: string;
  pageNo: number;
  fileLocation: string;
  pollingStation: string;
  streetName: string;
  name: string;
  relativeName: string;
}

const thStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "8px",
  verticalAlign: "top",
  backgroundColor: "#f5f5f5",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "8px",
  verticalAlign: "top",
};

// Use the configured environment base URL when present, otherwise use the current origin.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "";

const normalizeFileParam = (value: string) => value.trim().replace(/\\+/g, "/");

const SearchPage: React.FC = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [previewMimeType, setPreviewMimeType] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [lastSearch, setLastSearch] = useState<{ name: string; relativeName: string; streetName: string } | null>(null);

  const getPdfLink = (result: SearchResult) => {
    const queryParts: string[] = [
      `fileName=${encodeURIComponent(normalizeFileParam(result.fileName))}`,
      `fileLocation=${encodeURIComponent(normalizeFileParam(result.fileLocation))}`,
      `pageNo=${encodeURIComponent(String(result.pageNo))}`,
    ];

    if (lastSearch) {
      [lastSearch.name, lastSearch.relativeName, lastSearch.streetName]
        .map((text) => text.trim())
        .filter((text) => text.length > 0)
        .forEach((text) => queryParts.push(`searchText=${encodeURIComponent(text)}`));
    }

    return `${API_BASE_URL}/pdf/loadPDF?${queryParts.join("&")}`;
  };

  useEffect(() => {
    return () => {
      if (pdfUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const loadPdfPreview = async (result: SearchResult) => {
    setPdfLoading(true);
    setPdfError(null);

    try {
      const response = await fetch(getPdfLink(result), { method: "GET" });
      const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

      if (!response.ok) {
        throw new Error(`PDF API failed with status ${response.status}`);
      }

      // For ByteArrayResource responses, the backend may return application/pdf
      // or application/octet-stream. Reject only obvious non-binary error payloads.
      if (contentType.includes("text/html") || contentType.includes("application/json") || contentType.includes("text/plain")) {
        throw new Error("Non-binary response returned");
      }

      const buffer = await response.arrayBuffer();
      if (buffer.byteLength === 0) {
        throw new Error("Empty PDF response");
      }

      const headerBytes = new Uint8Array(buffer.slice(0, 8));
      const headerText = String.fromCharCode(...headerBytes.slice(0, 5));
      const looksLikePdf = headerText === "%PDF-";
      const looksLikePng =
        headerBytes[0] === 0x89 &&
        headerBytes[1] === 0x50 &&
        headerBytes[2] === 0x4e &&
        headerBytes[3] === 0x47 &&
        headerBytes[4] === 0x0d &&
        headerBytes[5] === 0x0a &&
        headerBytes[6] === 0x1a &&
        headerBytes[7] === 0x0a;

      const isPdfContentType = contentType.includes("pdf") || contentType.includes("octet-stream") || contentType.length === 0;
      const isImageContentType = contentType.includes("image/");

      if (!isImageContentType && !looksLikePng && !isPdfContentType && !looksLikePdf) {
        throw new Error("Unsupported preview response returned");
      }

      const nextMimeType = isImageContentType || looksLikePng ? "image/png" : "application/pdf";
      const blob = new Blob([buffer], { type: nextMimeType });
      const nextPdfUrl = URL.createObjectURL(blob);

      setPdfUrl((prevUrl) => {
        if (prevUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(prevUrl);
        }
        return nextPdfUrl;
      });
      setPreviewMimeType(nextMimeType);
    } catch {
      setPdfUrl(null);
      setPreviewMimeType(null);
      setPdfError("Unable to load document preview. The server returned an invalid response.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleClear = () => {
    setResults([]);
    setPdfUrl(null);
    setPreviewMimeType(null);
    setPdfError(null);
    setSearchError(null);
    setHasSearched(false);
    setLastSearch(null);
  };

  const handleSearch = async ({ name, relativeName, streetName }: { name: string; relativeName: string; streetName: string }) => {
    setResults([]);
    setPdfUrl(null);
    setPreviewMimeType(null);
    setPdfError(null);
    setSearchError(null);
    setHasSearched(false);
    setLoading(true);
    setLastSearch({ name, relativeName, streetName });

    const params = new URLSearchParams();

    params.set("name", name);
    if (relativeName) params.set("relativeName", relativeName);
    if (streetName) params.set("streetName", streetName);

    const queryString = params.toString();

    try {
      const response = await fetch(`${API_BASE_URL}/pdf/search?${queryString}`, {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Search API failed with status ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch {
      setResults([]);
      setSearchError("Search failed. Please try again or check server logs.");
    } finally {
      setHasSearched(true);
      setLoading(false);
    }
  };

  return (
    <div className="search-page-container">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="header-title">உங்கள் வாக்கு உங்கள் குரல்…</div>
            <div className="header-context">தாம்பரம் சட்டமன்றத் தொகுதி | Tambaram Assembly</div>
            <p className="header-subtitle">
              Know your polling booth, part number, and location.
            </p>
          </div>
          <img src="/tambaram-logo.svg" alt="Tambaram Logo" className="logo-badge" />
        </div>
      </div>

      <div className="panel-card combined-panel">
        <div className="combined-panel-section">
          <SearchBar onSearch={handleSearch} onClear={handleClear} />
        </div>

        {loading && <p className="status-text">Searching...</p>}
        {searchError && <p className="error-text">{searchError}</p>}

        {results.length > 0 && (
          <div className="combined-panel-section">
            <h2>Search Results</h2>
            <div className="table-wrapper">
              <table className="results-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Relative Name</th>
                    <th style={thStyle}>Polling Station</th>
                    <th style={thStyle}>Street Name</th>
                    <th style={thStyle}>Page No</th>
                    <th style={thStyle}>PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index}>
                      <td style={tdStyle} data-label="#">{index + 1}</td>
                      <td style={tdStyle} data-label="Name">{result.name || "-"}</td>
                      <td style={tdStyle} data-label="Relative Name">{result.relativeName || "-"}</td>
                      <td style={tdStyle} data-label="Polling Station">{result.pollingStation || "-"}</td>
                      <td style={tdStyle} data-label="Street Name">{result.streetName || "-"}</td>
                      <td style={tdStyle} data-label="Page No">{result.pageNo}</td>
                      <td style={tdStyle} data-label="PDF">
                        <a
                          href={getPdfLink(result)}
                          onClick={(e) => {
                            e.preventDefault();
                            void loadPdfPreview(result);
                          }}
                          style={{ color: "#0066cc", textDecoration: "underline" }}
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {hasSearched && !loading && results.length === 0 && (
          <p className="status-text">No voter matches with the input.</p>
        )}

        {(pdfUrl || pdfLoading || pdfError) && (
          <div className="combined-panel-section combined-panel-section--pdf">
            <PdfPageViewer pdfUrl={pdfUrl} previewMimeType={previewMimeType} loading={pdfLoading} error={pdfError} />
          </div>
        )}

        <div className="powered-by-caption">
          Powered by NTK Tambaram
        </div>
      </div>
    </div>
  );
};

export default SearchPage;