interface SearchBarProps {
  filter: string;
  onFilterChange: (value: string) => void;
}

export default function SearchBar({ filter, onFilterChange }: SearchBarProps) {
  return (
    <div className="bg-white rounded-lg shadow mb-6 p-4">
      <input
        type="text"
        placeholder="Search by ICAO or Callsign..."
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}