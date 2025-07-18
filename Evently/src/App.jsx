import { useState, useEffect } from 'react';
import './App.css';

const API_KEY = import.meta.env.VITE_TM_API_KEY;
console.log('Hello3')
console.log("API KEY:", import.meta.env.VITE_TM_API_KEY);

function App() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Add keyword param only if search is not empty
        const url = `https://app.ticketmaster.com/discovery/v2/events?apikey=AuaHQbsGIC865tGo7vWnqPrAKncY6TPr&size=50${
          search ? `&keyword=${encodeURIComponent(search)}` : ''
        }`;

        const res = await fetch(url);
        const data = await res.json();
        if (data._embedded?.events) {
          setEvents(data._embedded.events);
        } else {
          setEvents([]); // Clear events if none found
          console.warn('No events found');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [search]);

  const filteredEvents = events.filter((event) => {
    const name = event.name.toLowerCase();
    const keywordMatch = name.includes(search.toLowerCase());
    const typeMatch = typeFilter === 'all' || event.classifications?.[0]?.segment?.name.toLowerCase() === typeFilter.toLowerCase();
    return keywordMatch && typeMatch;
  });

  const totalEvents = events.length;
  const mostCommonType = (() => {
    const typeCount = {};
    events.forEach((e) => {
      const type = e.classifications?.[0]?.segment?.name || 'Other';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    const sorted = Object.entries(typeCount).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? 'N/A';
  })();

  const nextEvent = events.reduce((soonest, current) => {
    const soonestDate = new Date(soonest.dates?.start?.dateTime);
    const currentDate = new Date(current.dates?.start?.dateTime);
    return currentDate < soonestDate ? current : soonest;
  }, events[0] || {});

  return (
    <div className="app">
      <header>
        <h1>🎫 Evently</h1>
        <div className="filters">
          <input
            type="text"
            placeholder="Search event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="music">Music</option>
            <option value="sports">Sports</option>
            <option value="arts & theatre">Arts & Theatre</option>
          </select>
        </div>
      </header>

      <section className="stats">
        <div className="card">Total Events: {totalEvents}</div>
        <div className="card">Most Common Type: {mostCommonType}</div>
        <div className="card">Next Event: {nextEvent?.name?.slice(0, 30) ?? 'N/A'}</div>
      </section>

      <main>
        {filteredEvents.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id}>
                  <td>{event.name}</td>
                  <td>{new Date(event.dates.start.dateTime).toLocaleString()}</td>
                  <td>{event._embedded?.venues?.[0]?.name}</td>
                  <td>{event.classifications?.[0]?.segment?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-results">No events match your search or filter.</p>
        )}
      </main>
    </div>
  );
}

export default App;
