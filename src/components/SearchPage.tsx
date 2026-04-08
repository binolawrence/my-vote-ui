import React, { useState } from "react";
import SearchBar from "./SearchBar";
import PdfPageViewer from "./PdfPageViewer";

interface VoterSearchResult {
  epicNo: string | null;
  name: string;
  relativeName: string;
  streetName?: string | null;
  address: string;
  assembly: string | null;
  state: string | null;
  district: string | null;
  age: number;
  wardNo: string | null;
  getPollingStation: string;
  partSerialNo: string | null;
  pageNo: number;
  fileLocation: string;
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

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080").replace(/\/+$/, "");

const SearchPage: React.FC = () => {
  const [results, setResults] = useState<VoterSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const getPdfLink = (voter: VoterSearchResult) => {
    const params = new URLSearchParams();
    params.set("fileName", voter.fileLocation);

    params.set("fileLocation", voter.fileLocation);
    params.set("pageNo", String(voter.pageNo));

    [voter.name, voter.relativeName, voter.streetName ?? ""]
      .map((text) => text.trim())
      .filter((text) => text.length > 0)
      .forEach((text) => params.append("searchText", text));

    return `${API_BASE_URL}/api/pdf/loadPDF?${params.toString()}`;
  };

  const handleSearch = async ({ name, fathername, streetname }: { name: string; fathername: string; streetname: string }) => {
    setPdfUrl(null);
    setHasSearched(false);
    setLoading(true);

    const params = new URLSearchParams();

    params.set("name", name);
    params.set("fathername", fathername);
    if (streetname) params.set("streetname", streetname);

    const queryString = params.toString();

    const data = await fetch(
      `${API_BASE_URL}/api/pdf/search?${queryString}`,
      { method: "GET" }
    ).then((res) => res.json());

    setResults(data);
    setHasSearched(true);
    setLoading(false);
  };

  return (
    <div className="search-page-container">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="header-title"> Search by Name,Relative Name</div>
            <p className="header-subtitle">
              Election search, voter details and PDF preview in one place.
            </p>
          </div>
          <div className="logo-badge">TA</div>
        </div>
      </div>

      <div className="panel-card combined-panel">
        <div className="combined-panel-section">
          <SearchBar onSearch={handleSearch} defaultValues={{ name: "Rajesh", fathername: "Muthukumar" }} />
        </div>

        {loading && <p className="status-text">Searching...</p>}

        {results.length > 0 && (
          <div className="combined-panel-section">
            <h2>Voter Search Results</h2>
            <div className="table-wrapper">
              <table className="results-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>EPIC No</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Relative Name</th>
                    <th style={thStyle}>Age</th>
                    <th style={thStyle}>Address</th>
                    <th style={thStyle}>Ward No</th>
                    <th style={thStyle}>Assembly</th>
                    <th style={thStyle}>District</th>
                    <th style={thStyle}>Polling Station</th>
                    <th style={thStyle}>Part Serial No</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((voter, index) => (
                    <tr key={index}>
                      <td style={tdStyle} data-label="#">{index + 1}</td>
                      <td style={tdStyle} data-label="EPIC No">
                        {voter.epicNo ? (
                          <a
                            href={getPdfLink(voter)}
                            onClick={(e) => {
                              e.preventDefault();
                              setPdfUrl(getPdfLink(voter));
                            }}
                            style={{ color: "#0066cc", textDecoration: "underline" }}
                          >
                            {voter.epicNo}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={tdStyle} data-label="Name">{voter.name}</td>
                      <td style={tdStyle} data-label="Relative Name">{voter.relativeName}</td>
                      <td style={tdStyle} data-label="Age">{voter.age > 0 ? voter.age : "-"}</td>
                      <td style={tdStyle} data-label="Address">{voter.address}</td>
                      <td style={tdStyle} data-label="Ward No">{voter.wardNo ?? "-"}</td>
                      <td style={tdStyle} data-label="Assembly">{voter.assembly ?? "-"}</td>
                      <td style={tdStyle} data-label="District">{voter.district ?? "-"}</td>
                      <td style={tdStyle} data-label="Polling Station">{voter.getPollingStation}</td>
                      <td style={tdStyle} data-label="Part Serial No">{voter.partSerialNo ?? "-"}</td>
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

        {pdfUrl && (
          <div className="combined-panel-section combined-panel-section--pdf">
            <PdfPageViewer pdfUrl={pdfUrl} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;