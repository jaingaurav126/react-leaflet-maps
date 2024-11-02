// src/MapComponent.js
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import './MapComponent.css'; // Import CSS for styling
import loadingSpinner from './loading-spinner.gif'; // Add a loading spinner image

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: require('./marker-icon.png'),
  iconSize: [35, 55],
  iconAnchor: [17, 55],
  popupAnchor: [1, -40],
  shadowUrl: require('./marker-shadow.png'),
  shadowSize: [50, 50],
});

const MapClickHandler = ({ setPosition, fetchWeather }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      fetchWeather(lat, lng);
    },
  });

  return null;
};

const MapComponent = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState('metric');
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState([]);

  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    try {
      const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
      const response = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=no`);
      setWeatherData(response.data);
      setHistory((prevHistory) => [...new Set([...prevHistory, response.data.location.name])]); // Add to history and ensure uniqueness
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) return;
    try {
      const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
      const response = await axios.get(`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${searchTerm}`);
      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setPosition([lat, lon]);
        fetchWeather(lat, lon);
      } else {
        alert('Location not found');
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  const toggleUnit = () => {
    setUnit(prevUnit => (prevUnit === 'metric' ? 'imperial' : 'metric'));
  };

  return (
    <div className="map-container">
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search for a location..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={toggleUnit}>Toggle to {unit === 'metric' ? '°F' : '°C'}</button>
      </div>
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapClickHandler setPosition={setPosition} fetchWeather={fetchWeather} />
        {position && (
          <Marker position={position} icon={customIcon}>
            <Popup className="weather-popup">
              {loading ? (
                <div className="loading-container">
                  <img src={loadingSpinner} alt="Loading..." />
                  <p>Loading weather data...</p>
                </div>
              ) : (
                weatherData ? (
                  <div className="weather-info">
                    <h2>Weather in {weatherData.location.name}</h2>
                    <p><strong>Condition:</strong> {weatherData.current.condition.text}</p>
                    <p><strong>Temperature:</strong> {unit === 'metric' ? `${weatherData.current.temp_c} °C` : `${weatherData.current.temp_f} °F`}</p>
                    <p><strong>Humidity:</strong> {weatherData.current.humidity} %</p>
                    <p><strong>Wind:</strong> {unit === 'metric' ? `${weatherData.current.wind_kph} kph` : `${weatherData.current.wind_mph} mph`}</p>
                  </div>
                ) : (
                  <p>No weather data available.</p>
                )
              )}
            </Popup>
          </Marker>
        )}
      </MapContainer>
      <div className="history-container">
        <h3>Location History</h3>
        <ul>
          {history.map((location, index) => (
            <li key={index}>{location}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MapComponent;
