// 1. API 설정 (여기에 발급받은 API Key를 넣으세요)
const API_KEY = "1255156312d816bf4685c6904592dfe3"; 

// 2. DOM 요소 가져오기
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const tempDisplay = document.getElementById('temp');
const descDisplay = document.getElementById('description');

// 3. 오류 처리 함수
function handleError(error) {
    console.error("에러 발생:", error);
    descDisplay.innerText = "도시를 찾을 수 없습니다.";
    tempDisplay.innerText = "--";
    alert("오류가 발생했습니다. 도시 이름을 확인하거나 API Key를 확인해주세요.");
}

// 4. 날씨 정보 가져오기 (실제 API 적용)
async function getWeather(city) {
    // URL 생성: 섭씨 온도(units=metric), 한국어 설명(lang=kr) 적용
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=kr`;

    try {
        if (!city) {
            alert("도시 이름을 입력해주세요!");
            return;
        }

        // 로딩 표시
        descDisplay.innerText = "날씨 정보를 불러오는 중...";

        // Fetch API 호출
        const response = await fetch(url);

        // 응답 상태 확인 (404: 도시 없음, 401: API Key 오류 등)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // JSON 데이터 파싱
        const data = await response.json();

        // 5. 실제 데이터 화면에 표시 (수정된 부분)
        // data.weather[0].description: 날씨 상태 설명 (예: 맑음, 구름 조금)
        // data.main.temp: 현재 온도
        descDisplay.innerText = data.weather[0].description; 
        tempDisplay.innerText = `${Math.round(data.main.temp)}°C`; // 반올림하여 정수로 표시

        console.log("데이터 수신 성공:", data);

    } catch (error) {
        handleError(error);
    }
}

// 6. 이벤트 리스너
searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    getWeather(city);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather(cityInput.value);
    }
});