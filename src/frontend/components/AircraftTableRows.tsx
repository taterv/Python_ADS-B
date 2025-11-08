interface Aircraft {
  id: number;
  icao: string;
  callsign: string | null;
  first_seen: string;
  last_seen: string;
  message_count: number;
}

interface AircraftTableRowsProps {
  aircraft: Aircraft[];
  formatDateTime: (dateString: string) => string;
  timeAgo: (dateString: string) => string;
}

export default function AircraftTableRows({ 
  aircraft, 
  formatDateTime, 
  timeAgo 
}: AircraftTableRowsProps) {
  return (
    <>
      {aircraft.map((ac) => {
        const isRecent = new Date().getTime() - new Date(ac.last_seen).getTime() < 300000;
        
        return (
          <tr key={ac.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="font-mono font-semibold text-gray-900">
                  {ac.icao}
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">
                {ac.callsign || (
                  <span className="text-gray-400 italic">Unknown</span>
                )}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">
                {ac.message_count.toLocaleString()}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-600">
                {formatDateTime(ac.first_seen)}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-600">
                {formatDateTime(ac.last_seen)}
                <div className="text-xs text-gray-500">
                  {timeAgo(ac.last_seen)}
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {isRecent ? (
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              ) : (
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                  Inactive
                </span>
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
}