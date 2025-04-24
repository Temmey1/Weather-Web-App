import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';


function App() {
  const [data, setData] = useState({});
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);

  const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;
  console.log("API Key:", process.env.REACT_APP_OPENWEATHER_API_KEY);

  const fetchWeatherByCity = useCallback((city) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
    axios.get(url).then((response) => {
      setData(response.data);
      setLoading(false);
    }).catch((err) => {
      console.error('Error fetching weather by city:', err);
    });
  }, [apiKey]); // Memoize the function to prevent unnecessary re-creations

  const fetchWeatherByCoords = useCallback((lat, lon) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
    axios.get(url).then((response) => {
      setData(response.data);
      setLoading(false);
    }).catch((err) => {
      console.error('Error fetching weather by coordinates:', err);
    });
  }, [apiKey]); // Memoize the function

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
      }, (err) => {
        console.warn('Location access denied, loading default city.');
        fetchWeatherByCity('New York'); // fallback default
      });
    } else {
      fetchWeatherByCity('New York'); // fallback default
    }
  }, [fetchWeatherByCity, fetchWeatherByCoords]); // Add memoized functions to dependencies

  // Search when pressing Enter
  const searchLocation = (event) => {
    if (event.key === 'Enter') {
      fetchWeatherByCity(location);
      setLocation('');
    }
  };

  return (
    <div className="app">
      <div className="search">
        <input
          value={location}
          onChange={event => setLocation(event.target.value)}
          onKeyPress={searchLocation}
          placeholder='Enter Location'
          type="text"
        />
      </div>

      <div className="container">
        {loading ? (
          <p>Loading weather based on your location...</p>
        ) : (
          <>
            <div className="top">
              <div className="location">
                <p>{data.name}</p>
              </div>
              <div className="temp">
                {data.main ? <h1>{data.main.temp.toFixed()}°F</h1> : null}
              </div>
              <div className="description">
                {data.weather ? (
                  <>
                    <img
                      src={`http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
                      alt={data.weather[0].main}
                      style={{ width: '6rem', height: '6rem' }}
                    />
                    <p>{data.weather[0].main}</p>
                  </>
                ) : null}
              </div>
            </div>

            {data.name &&
              <div className="bottom">
                <div className="feels">
                  {data.main ? <p className='bold'>{data.main.feels_like.toFixed()}°F</p> : null}
                  <p>Feels Like</p>
                </div>
                <div className="humidity">
                  {data.main ? <p className='bold'>{data.main.humidity}%</p> : null}
                  <p>Humidity</p>
                </div>
                <div className="wind">
                  {data.wind ? <p className='bold'>{data.wind.speed.toFixed()} MPH</p> : null}
                  <p>Wind Speed</p>
                </div>
              </div>
            }
          </>
        )}
      </div>
    </div>
  );
}

export default App;
