const API_KEY = "여기에_발급받은_API_KEY_를_넣으세요"; 

// DOM 요소
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const tempDisplay = document.getElementById('temp');
const descDisplay = document.getElementById('description');
const cityNameDisplay = document.getElementById('cityName'); // HTML에 id="cityName" 확인 필요
const forecastContainer = document.getElementById('forecastContainer');
const unitToggleBtn = document.getElementById('unitToggleBtn');

// 상태 변수
let isCelsius = true; // true면 섭씨, false면 화씨
let currentCity = "Seoul"; // 현재 보고 있는 도시 (기본값)

// 1. 초기화: 페이지 로드 시 위치 감지 시도
window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherByLocation(lat, lon);
            },
            (error) => {
                console.log("위치 권한 거부됨, 기본 도시(Seoul) 로드");
                getWeather(currentCity);
            }
        );
    } else {
        getWeather(currentCity);
    }
};

// 2. 메인 날씨 함수 (도시 이름으로 검색)
async function getWeather(city) {
    currentCity = city; // 도시 기억
    const units = isCelsius ? 'metric' : 'imperial';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${units}&lang=kr`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${units}&lang=kr`;

    await fetchData(url, forecastUrl);
}

// 3. 위치 기반 날씨 함수 (좌표로 검색)
async function getWeatherByLocation(lat, lon) {
    const units = isCelsius ? 'metric' : 'imperial';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}&lang=kr`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}&lang=kr`;

    await fetchData(url, forecastUrl);
}

// 4. 공통 데이터 처리 로직
async function fetchData(currentUrl, forecastUrl) {
    try {
        // 현재 날씨 요청
        const res = await fetch(currentUrl);
        if (!res.ok) throw new Error("날씨 정보를 가져올 수 없습니다.");
        const data = await res.json();
        
        // UI 업데이트 (현재 날씨)
        // 위치 검색 시 도시 이름이 정확하지 않을 수 있으므로 API가 준 이름을 사용
        currentCity = data.name; 
        if(cityNameDisplay) cityNameDisplay.innerText = data.name;
        
        const unitSymbol = isCelsius ? "°C" : "°F";
        tempDisplay.innerText = `${Math.round(data.main.temp)}${unitSymbol}`;
        descDisplay.innerText = data.weather[0].description;

        // 3일 예보 요청 및 처리
        const forecastRes = await fetch(forecastUrl);
        const forecastData = await forecastRes.json();
        displayForecast(forecastData.list);

    } catch (error) {
        console.error(error);
        alert("오류가 발생했습니다. 도시 이름을 확인하세요.");
    }
}

// 5. 3일 예보 카드 생성 (반복문 활용)
function displayForecast(list) {
    forecastContainer.innerHTML = ""; // 기존 내용 비우기
    const unitSymbol = isCelsius ? "°C" : "°F";

    // API는 3시간 간격 데이터를 줍니다 (하루 8개). 
    // 간단하게 매일 12:00시 데이터만 골라냅니다 (혹은 8번째 데이터씩 건너뛰기).
    // "12:00:00" 문자열이 포함된 데이터만 필터링
    const dailyData = list.filter(item => item.dt_txt.includes("12:00:00"));

    // 최대 3일치만 표시
    for (let i = 0; i < 3; i++) {
        if (!dailyData[i]) break; // 데이터가 부족하면 중단

        const item = dailyData[i];
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString("ko-KR", { weekday: 'short' }); // 월, 화, 수...
        
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-date">${dayName}</div>
            <div class="forecast-icon">
                <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="icon">
            </div>
            <div class="forecast-temp">${Math.round(item.main.temp)}${unitSymbol}</div>
        `;
        forecastContainer.appendChild(card);
    }
}

// 6. 단위 변환 토글 버튼
unitToggleBtn.addEventListener('click', () => {
    isCelsius = !isCelsius; // 상태 반전 (true <-> false)
    getWeather(currentCity); // 현재 기억된 도시로 다시 요청
});

// 검색 버튼 이벤트
searchBtn.addEventListener('click', () => {
    getWeather(cityInput.value);
});

// 엔터키 이벤트
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getWeather(cityInput.value);
});