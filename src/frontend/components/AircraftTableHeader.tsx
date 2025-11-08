interface Aircraft {
  id: number;
  icao: string;
  callsign: string | null;
  first_seen: string;
  last_seen: string;
  message_count: number;
}

interface AircraftTableHeaderProps {
  sortField: keyof Aircraft;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof Aircraft) => void;
}

export default function AircraftTableHeader({ 
  sortField, 
  sortDirection, 
  onSort 
}: AircraftTableHeaderProps) {
  
  const SortIcon = ({ field }: { field: keyof Aircraft }) => {
    if (sortField !== field) return <span className="text-gray-400">↕</span>;
    return <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
          onClick={() => onSort('icao')}
        >
          ICAO <SortIcon field="icao" />
        </th>
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
          onClick={() => onSort('callsign')}
        >
          Callsign <SortIcon field="callsign" />
        </th>
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
          onClick={() => onSort('message_count')}
        >
          Messages <SortIcon field="message_count" />
        </th>
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
          onClick={() => onSort('first_seen')}
        >
          First Seen <SortIcon field="first_seen" />
        </th>
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
          onClick={() => onSort('last_seen')}
        >
          Last Seen <SortIcon field="last_seen" />
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Status
        </th>
      </tr>
    </thead>
  );
}