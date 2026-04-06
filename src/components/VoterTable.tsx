import React from "react";

export interface VoterRecord {
  sNo: number;
  epicNumber: string;
  name: string;
  age: number;
  relativeName: string;
  state: string;
  district: string;
  assemblyConstituency: string;
  part: string;
  pollingStation: string;
  partSerialNumber: number;
}

interface VoterTableProps {
  data: VoterRecord[];
}

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px",
};

const cellStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "8px",
  verticalAlign: "top",
};

const headerStyle: React.CSSProperties = {
  ...cellStyle,
  backgroundColor: "#f5f5f5",
  fontWeight: 600,
};

export default function VoterTable({ data }: VoterTableProps) {
  return (
    <div style={{ padding: 20 }}>
      <h2>Voter Details</h2>

      <div className="table-wrapper">
        <table style={tableStyle}>
          <thead>
          <tr>
            <th style={headerStyle}>S. NO.</th>
            <th style={headerStyle}>Epic Number</th>
            <th style={headerStyle}>Name</th>
            <th style={headerStyle}>Age</th>
            <th style={headerStyle}>Relative Name</th>
            <th style={headerStyle}>State</th>
            <th style={headerStyle}>District</th>
            <th style={headerStyle}>Assembly Constituency</th>
            <th style={headerStyle}>Part</th>
            <th style={headerStyle}>Polling Station</th>
            <th style={headerStyle}>Part Serial Number</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.sNo}>
              <td style={cellStyle}>{row.sNo}</td>
              <td style={cellStyle}>{row.epicNumber}</td>
              <td style={cellStyle}>{row.name}</td>
              <td style={cellStyle}>{row.age}</td>
              <td style={cellStyle}>{row.relativeName}</td>
              <td style={cellStyle}>{row.state}</td>
              <td style={cellStyle}>{row.district}</td>
              <td style={cellStyle}>{row.assemblyConstituency}</td>
              <td style={cellStyle}>{row.part}</td>
              <td style={cellStyle}>{row.pollingStation}</td>
              <td style={cellStyle}>{row.partSerialNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
