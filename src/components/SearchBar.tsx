import React, { useState } from "react";

interface SearchPayload {
  name: string;
  relativeName: string;
  streetName: string;
}

interface Props {
  onSearch: (payload: SearchPayload) => void;
  onClear: () => void;
}

const SearchBar: React.FC<Props> = ({ onSearch, onClear }) => {
  const [name, setName] = useState("");
  const [relativeName, setRelativeName] = useState("");
  const [streetName, setStreetName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedRelativeName = relativeName.trim();
    const trimmedStreetName = streetName.trim();

    if (!trimmedName && !trimmedRelativeName && !trimmedStreetName) {
      setError("At least one parameter is required.");
      return;
    }

    setError(null);
    onSearch({
      name: trimmedName,
      relativeName: trimmedRelativeName,
      streetName: trimmedStreetName,
    });
  };

  const handleClear = () => {
    setName("");
    setRelativeName("");
    setStreetName("");
    setError(null);
    onClear();
  };

  return (
    <div className={`search-bar-container${error ? " has-error" : ""}`}>
      {error && <p className="error-text search-bar-error">{error}</p>}
      <input
        className="search-input"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      <input
        className="search-input"
        placeholder="Relative Name"
        value={relativeName}
        onChange={(e) => setRelativeName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      <input
        className="search-input"
        placeholder="Street Name"
        value={streetName}
        onChange={(e) => setStreetName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />

      <button onClick={handleSubmit} className="search-button">
        Search
      </button>
      <button onClick={handleClear} className="clear-button">
        Clear
      </button>
    </div>
  );
};

export default SearchBar;