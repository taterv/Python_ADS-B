interface Aircraft {
  id: number;
  icao: string;
  callsign: string | null;
  first_seen: string;
  last_seen: string;
  message_count: number;
}

interface StatsCardsProps {
  aircraft: Aircraft[];
}

export default function StatsCards({ aircraft }: StatsCardsProps) {
  const totalAircraft = aircraft.length;
  
  const activeAircraft = aircraft.filter(ac => {
    const diff = new Date().getTime() - new Date(ac.last_seen).getTime();
    return diff < 3600000; // 1 hour in milliseconds
  }).length;
  
  const withCallsign = aircraft.filter(ac => ac.callsign).length;
  
  const totalMessages = aircraft.reduce((sum, ac) => sum + ac.message_count, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 mb-1">Total Aircraft</div>
        <div className="text-3xl font-bold text-gray-900">
          {totalAircraft}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 mb-1">Active (1h)</div>
        <div className="text-3xl font-bold text-green-600">
          {activeAircraft}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 mb-1">With Callsign</div>
        <div className="text-3xl font-bold text-blue-600">
          {withCallsign}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 mb-1">Total Messages</div>
        <div className="text-3xl font-bold text-purple-600">
          {totalMessages.toLocaleString()}
        </div>
      </div>
    </div>
  );
}