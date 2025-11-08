'use client';

import { useState, useEffect } from 'react';

interface Aircraft {
  id: number;
  icao: string;
  callsign: string | null;
  first_seen: string;
  last_seen: string;
  message_count: number;
}

export default function AircraftTable() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [sortField, setSortField] = useState<keyof Aircraft>('last_seen');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Mock data for now, replace with actual api calls later
  useEffect(() => {
    const mockData: Aircraft[] = [
      {
        id: 1,
        icao: 'ABC123',
        callsign: 'FIN123',
        first_seen: '2025-11-08T10:30:00Z',
        last_seen: '2025-11-08T14:45:00Z',
        message_count: 245
      },
      {
        id: 2,
        icao: 'DEF456',
        callsign: 'SAS789',
        first_seen: '2025-11-08T11:15:00Z',
        last_seen: '2025-11-08T14:42:00Z',
        message_count: 189
      },
      {
        id: 3,
        icao: '4CA123',
        callsign: null,
        first_seen: '2025-11-08T13:20:00Z',
        last_seen: '2025-11-08T14:40:00Z',
        message_count: 67
      },
      {
        id: 4,
        icao: 'A1B2C3',
        callsign: 'BAW456',
        first_seen: '2025-11-08T09:00:00Z',
        last_seen: '2025-11-08T14:38:00Z',
        message_count: 521
      },
      {
        id: 5,
        icao: '123ABC',
        callsign: 'LH789',
        first_seen: '2025-11-08T12:45:00Z',
        last_seen: '2025-11-08T14:35:00Z',
        message_count: 312
      }
    ];

    setTimeout(() => {
      setAircraft(mockData);
      setLoading(false);
    }, 500);
  }, []);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const timeAgo = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };


  const filteredAircraft = aircraft.filter(ac => 
    ac.icao.toLowerCase().includes(filter.toLowerCase()) ||
    (ac.callsign && ac.callsign.toLowerCase().includes(filter.toLowerCase()))
  );


  const sortedAircraft = [...filteredAircraft].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (aVal === null) return 1;
    if (bVal === null) return -1;
    
    if (sortField === 'first_seen' || sortField === 'last_seen') {
      aVal = new Date(aVal as string).getTime();
      bVal = new Date(bVal as string).getTime();
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof Aircraft) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };


  const SortIcon = ({ field }: { field: keyof Aircraft }) => {
    if (sortField !== field) return <span className="text-gray-400">↕</span>;
    return <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ADS-B Aircraft Tracker
          </h1>
          <p className="text-gray-600">
            Real-time aircraft monitoring and database viewer
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Aircraft</div>
            <div className="text-3xl font-bold text-gray-900">
              {aircraft.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Active (1h)</div>
            <div className="text-3xl font-bold text-green-600">
              {aircraft.filter(ac => {
                const diff = new Date().getTime() - new Date(ac.last_seen).getTime();
                return diff < 3600000;
              }).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">With Callsign</div>
            <div className="text-3xl font-bold text-blue-600">
              {aircraft.filter(ac => ac.callsign).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Messages</div>
            <div className="text-3xl font-bold text-purple-600">
              {aircraft.reduce((sum, ac) => sum + ac.message_count, 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <input
            type="text"
            placeholder="Search by ICAO or Callsign..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>


        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading aircraft data...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : sortedAircraft.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">
                {filter ? 'No aircraft found matching your search.' : 'No aircraft data available.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('icao')}
                    >
                      ICAO <SortIcon field="icao" />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('callsign')}
                    >
                      Callsign <SortIcon field="callsign" />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('message_count')}
                    >
                      Messages <SortIcon field="message_count" />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('first_seen')}
                    >
                      First Seen <SortIcon field="first_seen" />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('last_seen')}
                    >
                      Last Seen <SortIcon field="last_seen" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedAircraft.map((ac) => {
                    const isRecent = new Date().getTime() - new Date(ac.last_seen).getTime() < 300000; // 5 minutes
                    
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
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Showing {sortedAircraft.length} of {aircraft.length} aircraft
          {filter && ` (filtered)`}
        </div>
      </div>
    </div>
  );
}