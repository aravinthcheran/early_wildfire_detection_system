document.addEventListener('DOMContentLoaded', function() {
    // Initialize map
    const map = L.map('map').setView([0, 0], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    let marker = null;
    let refreshInterval = 5; // seconds
    let refreshTimer;
    
    // Function to format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
    }
    
    // Function to calculate fire risk based on sensor data
    function calculateFireRisk(data) {
        // Parse values from data
        const gas = parseFloat(data.field1) || 0;
        const soilMoisture = parseFloat(data.field2) || 0;
        const temperature = parseFloat(data.field3) || 0;
        const humidity = parseFloat(data.field4) || 0;
        const flameDetected = parseInt(data.field6);
        console.log("Flame:", flameDetected);
        
        // If flame is detected, it's high risk
        if (!flameDetected) {
            return {
                level: "high-risk",
                message: "HIGH - Flame Detected"
            };
        }
        
        // Calculate risk score based on environmental factors
        let riskScore = 0;
        
        // Gas level factor (higher gas = higher risk)
        if (gas > 100) riskScore += 3;
        else if (gas > 70) riskScore += 2;
        else if (gas > 50) riskScore += 1;
        
        // Soil moisture factor (lower moisture = higher risk)
        if (soilMoisture < 500) riskScore += 3;
        else if (soilMoisture < 700) riskScore += 2;
        else if (soilMoisture < 900) riskScore += 1;
        
        // Temperature factor (higher temp = higher risk)
        if (temperature > 40) riskScore += 3;
        else if (temperature > 35) riskScore += 2;
        else if (temperature > 30) riskScore += 1;
        
        // Humidity factor (lower humidity = higher risk)
        if (humidity < 20) riskScore += 3;
        else if (humidity < 30) riskScore += 2;
        else if (humidity < 40) riskScore += 1;
        
        // Determine risk level based on score
        if (riskScore >= 8) {
            return {
                level: "high-risk",
                message: "HIGH - Multiple Risk Factors"
            };
        } else if (riskScore >= 5) {
            return {
                level: "moderate-risk",
                message: "MODERATE - Several Risk Factors"
            };
        } else {
            return {
                level: "low-risk",
                message: "LOW - Few Risk Factors"
            };
        }
    }
    
    // Function to update UI with data
    function updateUI(data) {
        try {
            // Update timestamp
            document.getElementById('timestamp').textContent = formatDate(data.created_at);
            
            // Update sensor values
            document.getElementById('gas').textContent = `${parseFloat(data.field1).toFixed(2)} ppm`;
            document.getElementById('soilMoisture').textContent = `${parseFloat(data.field2).toFixed(2)}`;
            document.getElementById('temp').textContent = `${parseFloat(data.field3).toFixed(1)}°C`;
            document.getElementById('humidity').textContent = `${parseFloat(data.field4).toFixed(1)}%`;
            
            // Update flame detection
            // const flameValue = parseInt(data.field6);
            // document.getElementById('flame').textContent = !flameValue === 1 ? 'Detected' : 'Not Detected';
            
            // Calculate fire risk
            const risk = calculateFireRisk(data);
            
            // Update fire risk display
            const fireRiskElement = document.getElementById('fireRisk');
            const riskCard = document.querySelector('.risk-card');
            
            // Remove all existing classes from risk element
            fireRiskElement.classList.remove('low-risk', 'moderate-risk', 'high-risk', 'critical-risk');
            
            // Add appropriate class and set text
            fireRiskElement.classList.add(risk.level);
            fireRiskElement.textContent = risk.message;
            
            // Show fire alert if fire is detected
            const fireAlert = document.getElementById('fireAlert');
            if (risk.level === "high-risk") {
                fireAlert.style.display = 'flex';
            } else {
                fireAlert.style.display = 'none';
            }
            
            // Update coordinates
            const latitude = parseFloat(data.field5);
            const longitude = parseFloat(data.field8);
            document.getElementById('coordinates').textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            
            // Update map
            updateMap(latitude, longitude, risk.level === "high-risk");
            
            console.log("Data updated successfully:", data);
        } catch (error) {
            console.error("Error updating UI:", error, data);
        }
    }
    
    // Function to update map
    function updateMap(lat, lng, isFireDetected) {
        try {
            if (marker) {
                map.removeLayer(marker);
            }
            
            if (!isNaN(lat) && !isNaN(lng)) {
                map.setView([lat, lng], 13);
                marker = L.marker([lat, lng]).addTo(map);
                
                // Create a circle for visual effect if fire is detected
                if (isFireDetected) {
                    L.circle([lat, lng], {
                        color: 'red',
                        fillColor: '#f03',
                        fillOpacity: 0.5,
                        radius: 300
                    }).addTo(map);
                }
            } else {
                console.error("Invalid coordinates:", lat, lng);
            }
        } catch (error) {
            console.error("Error updating map:", error);
        }
    }
    
    // Function to fetch data from API
    async function fetchData() {
        try {
            console.log("Fetching data...");
            
            // Use a cache-busting parameter to avoid cached responses
            const cacheBuster = new Date().getTime();
            const apiUrl = `https://api.thingspeak.com/channels/2863137/feeds/last.json?_=${cacheBuster}`;
            
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`Network error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log("Data received:", data);
            
            if (!data || !data.created_at) {
                throw new Error("Invalid data format received");
            }
            
            updateUI(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            document.getElementById('timestamp').textContent = 'Connection error';
            document.querySelectorAll('.sensor-data p').forEach(el => {
                el.textContent = 'Error loading data';
            });
            
            // Try again after a short delay
            setTimeout(() => {
                console.log("Retrying data fetch...");
                fetchData();
            }, 3000);
        }
    }
    
    // Function to start auto refresh
    function startAutoRefresh() {
        // Clear existing timer
        if (refreshTimer) clearInterval(refreshTimer);
        
        // Set up refresh timer
        refreshTimer = setInterval(fetchData, refreshInterval * 1000);
    }
    
    // Manual refresh button
    document.getElementById('refreshButton').addEventListener('click', () => {
        console.log("Manual refresh triggered");
        fetchData();
    });
    
    // Initial data fetch
    fetchData();
    
    // Start auto refresh
    startAutoRefresh();
    
    // Display debug info
    console.log("Dashboard initialized. Refresh interval:", refreshInterval, "seconds");
});
