let GIS = false;
const dayjs = require('dayjs');

let swiper = new Swiper(".mySwiper", {
    slidesPerView: 4,
    spaceBetween: 30,
});
  

function RenderData(data){
    console.log(data)
    let WeatherOfTenDays = data.forecast.forecastday;

    $('#location')[0].textContent = data.location.name;
    $('#currentDate')[0].textContent = dayjs(new Date(data.current.last_updated)).format('dddd, D MMM');

    $('#currentImage')[0].setAttribute('src', data.current.condition.icon);
    $('#currentTemp')[0].textContent = data.current.temp_c;
    $('#currentDescriptionWeather')[0].textContent = data.current.condition.text;

    $('#currendWindSpeed')[0].textContent = data.current.wind_kph;
    $('#currentHumidity')[0].textContent = data.current.humidity;

    let morningDay = data.current.is_day;
    DarkLightMode(morningDay);

    const viewWeatherDetails = (e, Weather) => {
        $('#WeatherInHour').html('');
        $('#WeatherInTenDays').find('.active')[0].classList.remove('active');
        e.currentTarget.classList.add('active');

        if (dayjs(new Date(data.current.last_updated)).format('dddd, D MMM') === dayjs(new Date(Weather.date)).format('dddd, D MMM')) {
            RenderData(data);
        } else {
            $('#currentDate')[0].textContent = dayjs(new Date(Weather.date)).format('dddd, D MMM');

            $('#currentImage')[0].setAttribute('src', Weather.day.condition.icon);
            $('#currentTemp')[0].textContent = Weather.day.maxtemp_c;
            $('#currentDescriptionWeather')[0].textContent = Weather.day.condition.text;

            $('#currendWindSpeed')[0].textContent = Weather.day.maxwind_kph;
            $('#currentHumidity')[0].textContent = Weather.day.avghumidity;

            Weather.hour.forEach(hour => {
                AddHoursWeather(hour);
            });
        }
    };

    WeatherOfTenDays.forEach(dayWeather => {
        let cardHTML = `<div class="card shadow swiper-slide d-flex flex-column justify-content-center align-items-center ${dayjs(dayWeather.date).format('D MMM') === dayjs().format('D MMM') ? 'current active' : ''}">
                    <p class="m-0">${dayjs(dayWeather.date).format('D MMM')}</p>
                    <img src=${dayWeather.day.condition.icon} alt="weather_img" />
                    <div class='d-flex'>
                        <p class="fw-bolder m-0">${dayWeather.day.maxtemp_c} </p><span class='ms-1 me-1'>/</span><p class="fw-bolder m-0"> ${dayWeather.day.mintemp_c}</p>
                    </div>
                </div>`;

        let $card = $(cardHTML);

        $card.on('click', (e) => viewWeatherDetails(e, dayWeather));

        $('#WeatherInTenDays').append($card);
    });

    let AddHoursWeather = (hour) => {
        if ($('#WeatherInHour')[0].children.length < 25) {
            if ((+dayjs(new Date(hour.time)).format('H') >= dayjs(new Date()).format('H')) && (dayjs(new Date(hour.time)).format('YYYY-MM-DD') == dayjs(new Date()).format('YYYY-MM-DD'))) {
                if ((+dayjs(new Date(hour.time)).format('H') == dayjs(new Date()).format('H'))) {
                    let cardHTML = `<div class='card shadow swiper-slide d-flex flex-column justify-content-center align-items-center'>
                                        <p>Now</p>
                                        <img src=${hour.condition.icon} alt='Weather_img' />
                                        <p>${hour.temp_c}<span class='fs-1'> ْ </span>C</p>
                                    </div>`;
                    let $card = $(cardHTML);
                    $('#WeatherInHour').append($card);

                } else if ((+dayjs(new Date(hour.time)).format('H') > dayjs(new Date()).format('H'))) {
                    const time1 = new Date(hour.time);

                    let cardHTML = `<div class='card shadow swiper-slide d-flex flex-column justify-content-center align-items-center'>
                                        <p>${dayjs(time1).format('h A')}</p>
                                        <img src=${hour.condition.icon} alt='Weather_img' />
                                        <p>${hour.temp_c}<span class='fs-1'> ْ </span>C</p>
                                    </div>`;
                    let $card = $(cardHTML);
                    $('#WeatherInHour').append($card);
                }
            } else if (dayjs(new Date(hour.time)).format('YYYY-MM-DD') > dayjs(new Date()).format('YYYY-MM-DD')) {
                const time1 = new Date(hour.time);

                let cardHTML = `<div class='card shadow swiper-slide d-flex flex-column justify-content-center align-items-center'>
                                    <p>${dayjs(time1).format('h A')}</p>
                                    <img src=${hour.condition.icon} alt='Weather_img' />
                                    <p>${hour.temp_c}<span class='fs-1'> ْ </span>C</p>
                                </div>`;
                let $card = $(cardHTML);
                $('#WeatherInHour').append($card);
            }
        }
    };

    WeatherOfTenDays.forEach(dayWeather => {
        dayWeather.hour.forEach(hour => {
            AddHoursWeather(hour);
        });
    });
}


$($('form')[0]).on('submit', (event) => {
    event.preventDefault();
    let location = $("input[type='text']")[0].value;

    fetch(`https://api.weatherapi.com/v1/forecast.json?key=a04071e0c56c41748a6172511251302&q=${location}&days=10&aqi=yes`)
        .then(Response => Response.json())
        .then(data => {
            $('#WeatherInTenDays').html('');
            $('#WeatherInHour').html('');
            RenderData(data)
        })
        .then(() => {
            $($('#Weather_Details')[0]).css('display', 'block');
            if (!GIS) {
                DarkLightMode();
                GISFalse();
            }
            $($('#Message')[0]).css('display', 'none');
        })
        .catch(error => {
            DarkLightMode();
            LocationFalse();
        });
});

window.onload = () => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            GIS = true;

        fetch(`https://api.weatherapi.com/v1/forecast.json?key=a04071e0c56c41748a6172511251302&q=${latitude},${longitude}&days=10&aqi=yes`)
                .then(Response => Response.json())
                .then(data => RenderData(data))
                .catch(error => console.log(error));
        }, function (error) {
            GIS = false;
            $($('#Weather_Details')[0]).css('display', 'none');
            GISFalse();
            DarkLightMode()
        });
    } else {
        $($('#Weather_Details')[0]).css('display', 'none');
        DarkLightMode()
    }
};

function GISFalse() {
    $($('#Message span')[0]).text('Sorry, the GPS system is disabled. Please enable it so we can display the weather for your location.');
    $($('#Message')[0]).css('display', 'block');
}

function LocationFalse() {
    $($('#Message span')[0]).text('Sorry, please select a valid country location.');
    $($('#Message')[0]).css('display', 'block');
}

const DarkLightMode = (morningDay = dayjs(new Date()).format('A') == 'AM' ? true : false)=>{
    if (morningDay) {
        $('#background_body').css({
            "filter": "brightness(50%) contrast(70%) saturate(50%)",
            "background-color": "rgba(0, 0, 0, 0.5)"
        });

        $($('.weatherBlock .container')[0]).css('--color','#17415a')

    } else {
        $('#background_body').css({
            "filter": "brightness(12%) contrast(77%) saturate(23%)",
            "background-color": "rgba(0, 0, 0, 0.79)"
        });

        $($('.weatherBlock .container')[0]).css('--color','#17415a1c')

    }
}