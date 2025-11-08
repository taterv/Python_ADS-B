'use client';

import { useState, useEffect } from 'react';
import StatsCards from './StatsCards';
import SearchBar from './SearchBar';
import AircraftTableHeader from './AircraftTableHeader';
import AircraftTableRows from './AircraftTableRows';

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
      second: '2-digit',
      hour12: false
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

  // Handle sort
  const handleSort = (field: keyof Aircraft) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ADS-B Aircraft Tracker
          </h1>
          <p className="text-gray-600">
            Seen ADS-B aircraft 
          </p>
        </div>
        <StatsCards aircraft={aircraft} />
        <SearchBar filter={filter} onFilterChange={setFilter} />
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
                <AircraftTableHeader 
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <tbody className="bg-white divide-y divide-gray-200">
                  <AircraftTableRows 
                    aircraft={sortedAircraft}
                    formatDateTime={formatDateTime}
                    timeAgo={timeAgo}
                  />
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