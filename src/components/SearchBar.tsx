import React, { useState } from "react";

interface SearchPayload {
  name: string;
  fathername: string;
  streetname: string;
}

interface Props {
  onSearch: (payload: SearchPayload) => void;
  defaultValues?: Partial<SearchPayload>;
}

const SearchBar: React.FC<Props> = ({ onSearch, defaultValues }) => {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [fathername, setFathername] = useState(defaultValues?.fathername ?? "");
  const [streetname, setStreetname] = useState(defaultValues?.streetname ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!name.trim() || !fathername.trim()) {
      setError("Name and Father Name are required.");
      return;
    }

    setError(null);
    onSearch({
      name: name.trim(),
      fathername: fathername.trim(),
      streetname: streetname.trim(),
    });
  };

  return (
    <div className="search-bar-container">
      {error && <p className="error-text" style={{ marginBottom: 8 }}>{error}</p>}
      <input
        className="search-input"
        placeholder="Name (required)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      <input
        className="search-input"
        placeholder="Father Name (required)"
        value={fathername}
        onChange={(e) => setFathername(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      <input
        className="search-input"
        placeholder="Street Name (optional)"
        value={streetname}
        onChange={(e) => setStreetname(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />

      <button onClick={handleSubmit} className="search-button">
        Search
      </button>
    </div>
  );
};

export default SearchBar;