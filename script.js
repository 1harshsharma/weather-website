let appId = '';
let units = 'metric'; // other option is imperial
let searchMethod = 'q'; // Set the search method to 'q' for searching by city name

function getSearchMethod(searchTerm) {
    searchMethod = 'q'; // Always set the search method to 'q' for searching by city name
}
function searchWeather(searchTerm) {
    // Fetch current weather data
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchTerm}&APPID=${appId}&units=${units}`)
        .then((result) => {
            return result.json();
        })
        .then((res) => {
            // Call init function to display current weather information
            initCurrentWeather(res);
        });

    // Fetch forecast data
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${searchTerm}&appid=${appId}&units=${units}`)
        .then((result) => {
            return result.json();
        })
        .then((res) => {
            // Call function to process and display forecast data
            processForecast(res);
        });
}


// Existing JavaScript code remains unchanged, only add these lines at the appropriate places

function initCurrentWeather(resultFromServer) {
    // Display current weather information
    let weatherDescriptionHeader = document.getElementById('weatherDescriptionHeader');
    let temperatureElement = document.getElementById('temperature');
    let humidityElement = document.getElementById('humidity');
    let windSpeedElement = document.getElementById('windSpeed');
    let cityHeader = document.getElementById('cityHeader');
    let cloudinessElement = document.getElementById('cloudiness');
    let visibilityElement = document.getElementById('visibility');

    let weatherIcon = document.getElementById('documentIconImg');
    weatherIcon.src = 'http://openweathermap.org/img/w/' + resultFromServer.weather[0].icon + '.png';

    let resultDescription = resultFromServer.weather[0].description;
    weatherDescriptionHeader.innerText = resultDescription.charAt(0).toUpperCase() + resultDescription.slice(1);
    temperatureElement.innerHTML = Math.floor(resultFromServer.main.temp) + '&#176;';
    windSpeedElement.innerHTML = 'Winds at  ' + Math.floor(resultFromServer.wind.speed) + ' m/s';
    cityHeader.innerHTML = `${resultFromServer.name}, ${resultFromServer.sys.country}`; // Concatenate city name and country code
    humidityElement.innerHTML = 'Humidity levels at ' + resultFromServer.main.humidity +  '%';
    cloudinessElement.innerHTML = 'Cloudiness: ' + resultFromServer.clouds.all + '%';
    visibilityElement.innerHTML = 'Visibility: ' + resultFromServer.visibility + ' metres';
}

function processForecast(forecastData) {
    // Process and display forecast data
    let forecastList = forecastData.list;

    // Clear existing forecast data
    document.getElementById('forecastOutlook').innerHTML = '';

    // Split forecast data into clusters of 5 items each
    let clusters = [];
    for (let i = 0; i < forecastList.length; i += 10) {
        clusters.push(forecastList.slice(i, i + 10));
    }

    // Calculate aggregate for each cluster
    clusters.forEach((cluster, index) => {
        // Calculate average temperature for the cluster
        let totalTemperature = cluster.reduce((acc, forecast) => acc + forecast.main.temp, 0);
        let averageTemperature = totalTemperature / cluster.length;

        // Calculate average probability of precipitation for the cluster
        let totalPop = cluster.reduce((acc, forecast) => acc + (forecast.pop * 100), 0);
        let averagePop = totalPop / cluster.length;

        // Calculate most common weather description in the cluster
        let weatherDescriptions = {};
        cluster.forEach((forecast) => {
            let description = forecast.weather[0].description;
            weatherDescriptions[description] = (weatherDescriptions[description] || 0) + 1;
        });
        let mostCommonWeatherDescription = Object.keys(weatherDescriptions).reduce((a, b) => weatherDescriptions[a] > weatherDescriptions[b] ? a : b);

        // Calculate average humidity for the cluster
        let totalHumidity = cluster.reduce((acc, forecast) => acc + forecast.main.humidity, 0);
        let averageHumidity = totalHumidity / cluster.length;

        // Calculate average windspeed for the cluster
        let totalWindSpeed = cluster.reduce((acc, forecast) => acc + forecast.wind.speed, 0);
        let averageWindSpeed = totalWindSpeed / cluster.length;

        // Create a container for the summarized forecast
        let summarizedForecastContainer = document.createElement('div');
        summarizedForecastContainer.classList.add('summarized-forecast');

        // Populate summarized forecast container with information
        summarizedForecastContainer.innerHTML = `
            <div class="forecast-details">
                <h2>${(index+1)*12} Hour Forecast</h2>
                <p>Average Temperature: ${averageTemperature.toFixed(1)} &#176;C</p>
                <p>Average Probability of Precipitation: ${averagePop.toFixed(1)}%</p>
                <p>Weather Description: ${mostCommonWeatherDescription}</p>
                <p>Average Humidity: ${averageHumidity.toFixed(1)}%</p>
                <p>Average Wind Speed: ${averageWindSpeed.toFixed(1)} m/s</p>
            </div>
        `;

        // Append summarized forecast container to the forecast outlook container
        document.getElementById('forecastOutlook').appendChild(summarizedForecastContainer);
    });
}

document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    
    let searchTerm = document.getElementById('searchInput').value;
    if(searchTerm) {
        searchWeather(searchTerm);
        document.getElementById('searchInput').value = ""; // Clear the search box
    }
});