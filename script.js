document.addEventListener('DOMContentLoaded', function (){
  
  let cityName = document.querySelector('.city');
  let time = document.querySelector('.time');
  let degrees = document.querySelector('.degrees');
  let windSpeed = document.querySelector('.wind-speed');
  let windDirection = document.querySelector('.wind-direction');
  let humidity = document.querySelector('.humidity');
  let pressure = document.querySelector('.pressure');
  let skyCondition = document.querySelector('.sky-condition');
  let nextDays = document.querySelector('.next-days');
  const APIKEY = '3a0e5f58eb8563909093e0a89de8e6d3';
  let lon;
  let lat; 

  let promise = new Promise(function(resolve, reject) {
    navigator.geolocation.getCurrentPosition(function (position) {
      resolve(position);
    }, function() {
      reject(alert('No, just not on my shift'));
    })
  });

  promise.then(position => {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
     return fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKEY}`) 
     
    .then(response => {
        return response.json();
    })
  },
  error => {
    console.log('error');
  }) 
  .then(result => {
    return new Promise(function(resolve, reject) {
      console.log(result);
      cityName.textContent = `${result.name}, ${result.sys.country}`;
      getDateTime();
      setInterval(getDateTime,2000);
      degrees.textContent = `${(result.main.temp - 273.15)} ℃`;
      skyCondition.textContent = result.weather[0].main;
      windSpeed.textContent = `Wind speed: ${result.wind.speed} k/h`;
      windDirection.textContent =  `Wind direction: ${identifyWindDirection(result)}`;
      humidity.textContent = `Humidity: ${result.main.humidity} %`;
      pressure.textContent = `Pressure: ${result.main.pressure} kPa`;
      setBackgroundImage();  
    })   
   });  

  promise.then(position => {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
     return fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKEY}`) 
    
    .then(response => {
        return response.json();
    })  
  },
  error => {
    console.log('error')
  })
  .then(result => {
    return new Promise(function(resolve, reject) {
      ymaps.ready(init);

      function init(){
        let myMap = new ymaps.Map("map", {
        center: [lat, lon],
        controls: ['routeButtonControl','zoomControl'],
        zoom: 13
        })
        let myGeoObject = new ymaps.GeoObject({
          geometry: {
            type: "Circle", 
            coordinates: [lat, lon],
            radius: 40 
          }
        });      
        myMap.geoObjects.add(myGeoObject); 
      }
    })
  })

  promise.then(position => {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    return fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKEY}`)  
    .then(response => {
      return response.json();
    })  
  },
  error => {
    console.log('error')
  })

  .then(result => {
    return new Promise(function(resolve, reject) {        
      let date1;
      let date2;
      let counterIterations;
      for( let i = 0; i < result.list.length; i++) {
        date1 = result.list[i].dt_txt;
        date2 = result.list[i+1].dt_txt;                      
        if(date1.slice(0, 10) != date2.slice(0, 10)) {
          counterIterations = i;
          break;
        }
      }
      let daysCounter = 1;
      for( let j = counterIterations + 5; j < result.list.length; j+=8) {
    
        let dayWrap = document.createElement('div');
        dayWrap.classList.add('day-wrap');
        let nextDay = document.createElement('div');
        nextDay.classList.add('next-day');
        let tempDay = new Date();
        let nextTempDay = new Date(`${tempDay.getFullYear()}`, `${tempDay.getMonth()}`, `${tempDay.getDate() + daysCounter}`);
        let nameOfDays = ['Sun', 'Mon', 'Tue', 'WeD', 'Thu', 'Fri', 'Sat'];
        nextTempDay.getDay();
        nextDay.textContent = nameOfDays[nextTempDay.getDay()];
        let nextDegree = document.createElement('div');
        nextDegree.classList.add('next-degree');
        nextDegree.textContent = `${Math.round(result.list[j].main.temp - 273.15)}°`;
        let icon = document.createElement('img');
        let iconValue = result.list[j].weather[0].icon;
        icon.setAttribute('src', `http://openweathermap.org/img/wn/${iconValue}@2x.png`);
        icon.style.width = '50px';
        icon.style.height = '50px';
        nextDays.append(dayWrap);
        dayWrap.append(nextDay,nextDegree, icon);
        daysCounter++;
      }    
    })
  });
 
 

  function setBackgroundImage() {
    if (skyCondition.textContent == 'Clouds') {
      document.body.style.backgroundImage = 'url' + '(./img/oblachno.jpg)';
      document.body.style.backgroundSize = 'cover';
    }

    if (skyCondition.textContent == 'Snow') {
      document.body.style.backgroundImage = 'url' + '(./img/snow.jpg)';
      document.body.style.backgroundSize = 'cover';
    }

    if (skyCondition.textContent == 'Mist' || skyCondition.textContent == 'Fog') {
      document.body.style.backgroundImage = 'url' + '(./img/mistnigth.jpg)';
      document.body.style.backgroundSize = 'cover';          
    }

    if (skyCondition.textContent == 'Clear') {
      document.body.style.backgroundImage = 'url' + '(./img/clearhight.jpeg)';
      document.body.style.backgroundSize = 'cover';          
    }

    if (skyCondition.textContent == 'Rain') {
      document.body.style.backgroundImage = 'url' + '(./img/nightRain.jpg)';
      document.body.style.backgroundSize = 'cover';          
    }
  }

  function identifyWindDirection(obj) {
    if (obj.wind.deg >=0 && obj.wind.deg < 22 || obj.wind.deg >=337 && obj.wind.deg <= 360) {
      return 'North';
    }

    if (obj.wind.deg >=22 && obj.wind.deg < 67) {
      return 'North-East';
    }

    if (obj.wind.deg >=67 && obj.wind.deg < 112) {
      return 'East';
    }

    if (obj.wind.deg >=112 && obj.wind.deg < 157) {
      return 'South-East';
    }

    if (obj.wind.deg >=157 && obj.wind.deg < 202) {
      return 'South';
    }

    if (obj.wind.deg >=202 && obj.wind.deg < 247) {
      return 'South-West';
    }

    if (obj.wind.deg >=247 && obj.wind.deg < 292) {
      return 'West';
    }

    if (obj.wind.deg >=292 && obj.wind.deg < 337) {
      return 'North-West';
    }
  }

  function getDateTime() {
    let date = new Date();
    let todayDate = date.getDate();
    let day = date.getDay();
    let month = date.getMonth();
    let hours = date.getHours();
    let nameOfMonth = ['Jun', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let nameOfDay = ['Sun', 'Mon', 'Tue', 'WeD', 'Thu', 'Fri', 'Sat'];
    if (hours < 10) {hours = `0${hours}`}
    let minutes = date.getMinutes();
    if (minutes < 10) {minutes = `0${minutes}`}
    time.textContent = `${todayDate} ${nameOfMonth[month]} ${nameOfDay[day]} ${hours}:${minutes}`;    
  }
})