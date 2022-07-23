var direction,
    metric = false,
    trailName;

export function start(initTrailName, initDirection) {
    init(initTrailName, initDirection);

    makeForecastTable();
}

function init(initTrailName, initDirection) {
    trailName = initTrailName;
    direction = initDirection;

    // TODO: does unitsChange() need to be wrapped in anon func?
    document.getElementById("imperial").addEventListener("click", function () {
        unitsChange();
    }, false);

    document.getElementById("metric").addEventListener("click", function () {
        unitsChange();
    }, false);
}

function unitsChange() {
    metric = !metric;

    let tableLen = tbl.rows.length

    for(let n = 0; n < tableLen; n++) {
        tbl.deleteRow(-1);
    }

    makeForecastTable();
}

function makeForecastTable() {
    const tableWidth = 11;
    
    let url = "https://s3.amazonaws.com/www.longtrailsweather.net/forecasts/processed/" + trailName + ".json";
    let response = {};

    fetch(url, {cache: "no-store"})
        .then(function(response) {
            return response.json();
        }
    )
        .then(function(forecastJson) {
            makeHeaderRow(forecastJson['forecasts'][0], forecastJson['last_modified'], tableWidth);
            
            for (let i in forecastJson.forecasts) {
                let pointNumber = forecastJson.forecasts[i].location_index;
                let week = [];
                
                // make sure the table has enough rows to add the current row.
                while(tbl.rows.length < pointNumber + 1) {
                    let newRow = tbl.insertRow(-1);
                    for(let j = 0; j < tableWidth; j++) {
                        newRow.insertCell(-1);
                    }
                }

                // TODO: refactor this w/ filter/map/reduce. https://developers.google.com/web/fundamentals/primers/promises
                for (let day = 0; day < 8; day++) {
                    let dayDetail = {},
                        distance = '',
                        locationDetailLink,
                        linkText = '',
                        linkUrlSuffix = '',
                        precipProbability = '',
                        precipType = '';

                    if(metric) {
                        distance = round(imperialToMetric("milesToKilometers", forecastJson.forecasts[i].distance)(), 1);
                        linkUrlSuffix = "/ca12/en";

                        dayDetail.temperatureHigh = function () { return round(imperialToMetric("fahrenheitToCelsius", forecastJson.forecasts[i].days[day].temperatureHigh)(), 2); }
                        dayDetail.temperatureLow = function () { return round(imperialToMetric("fahrenheitToCelsius", forecastJson.forecasts[i].days[day].temperatureLow)(), 2); }
                        dayDetail.precipIntensity = function () { return round(imperialToMetric("inchesToCentimeters", forecastJson.forecasts[i].days[day].precipIntensity * 24)(), 2); }
                    } else {
                        distance = forecastJson.forecasts[i].distance;
                        linkUrlSuffix = "/us12/en";

                        dayDetail.temperatureHigh = function() { return round(forecastJson.forecasts[i].days[day].temperatureHigh, 2); }
                        dayDetail.temperatureLow = function() { return round(forecastJson.forecasts[i].days[day].temperatureLow, 2); }
                        dayDetail.precipIntensity = function() { return round(forecastJson.forecasts[i].days[day].precipIntensity * 24, 2); }
                    }

                    // TODO: don't need an href for every day, just one per location.
                    // create hyperlink for 'distance' column cell. https://stackoverflow.com/a/816506
                    linkText = document.createTextNode(distance);
                    locationDetailLink = document.createElement("a");
                    locationDetailLink.setAttribute("target", "_blank");
                    locationDetailLink.setAttribute("rel", "noopener noreferrer");
                    locationDetailLink.setAttribute("href", "https://darksky.net/forecast/" + forecastJson.forecasts[i].lat + "," + forecastJson.forecasts[i].lon + linkUrlSuffix);
                    locationDetailLink.appendChild(linkText);
                    dayDetail.distance = locationDetailLink;

                    // TODO: change this to if there's any reasonable amt of precip, ie .precipIntensity*24>.05.
                    // if there's any amount of precip in the forecast...
                    if (dayDetail.precipIntensity() > 0) {
                        if (forecastJson.forecasts[i].days[day].precipProbability != '#NA') {
                            precipProbability = round((forecastJson.forecasts[i].days[day].precipProbability * 100), 1) + '% ';
                        }
                        
                        if (forecastJson.forecasts[i].days[day].precipType != '#NA') {
                            precipType = forecastJson.forecasts[i].days[day].precipType + ' ';
                        }                            
                    }
                    dayDetail.precipText = precipType + precipProbability + dayDetail.precipIntensity();                  
                    dayDetail.summary = forecastJson.forecasts[i].days[day].summary;

                    week.push(dayDetail);
                }

                let newTextCol00 = document.createTextNode(forecastJson.forecasts[i].location_index);                   // point
                let newTextCol01 = document.createTextNode(forecastJson.forecasts[i].location_name);                    // location
                //let newTextCol02 = document.createTextNode(cells[0].distance);                                          // nobo mile/km
                let newTextCol03 = document.createTextNode(week[0].temperatureHigh() + " / " + week[0].temperatureLow() + " / " + week[0].precipText + (metric ? " cm. / " : " in. / ") + week[0].summary);
                let newTextCol04 = document.createTextNode(week[1].temperatureHigh() + " / " + week[1].temperatureLow() + " / " + week[1].precipText + (metric ? " cm. / " : " in. / ") + week[1].summary);
                let newTextCol05 = document.createTextNode(week[2].temperatureHigh() + " / " + week[2].temperatureLow() + " / " + week[2].precipText + (metric ? " cm. / " : " in. / ") + week[2].summary);
                let newTextCol06 = document.createTextNode(week[3].temperatureHigh() + " / " + week[3].temperatureLow() + " / " + week[3].precipText + (metric ? " cm. / " : " in. / ") + week[3].summary);
                let newTextCol07 = document.createTextNode(week[4].temperatureHigh() + " / " + week[4].temperatureLow() + " / " + week[4].precipText + (metric ? " cm. / " : " in. / ") + week[4].summary);
                let newTextCol08 = document.createTextNode(week[5].temperatureHigh() + " / " + week[5].temperatureLow() + " / " + week[5].precipText + (metric ? " cm. / " : " in. / ") + week[5].summary);
                let newTextCol09 = document.createTextNode(week[6].temperatureHigh() + " / " + week[6].temperatureLow() + " / " + week[6].precipText + (metric ? " cm. / " : " in. / ") + week[6].summary);
                let newTextCol10 = document.createTextNode(week[7].temperatureHigh() + " / " + week[7].temperatureLow() + " / " + week[7].precipText + (metric ? " cm. / " : " in. / ") + week[7].summary);

                tbl.rows[pointNumber].cells[0].appendChild(newTextCol00);
                tbl.rows[pointNumber].cells[1].appendChild(newTextCol01);
                tbl.rows[pointNumber].cells[2].appendChild(week[0].distance);
                tbl.rows[pointNumber].cells[3].appendChild(newTextCol03);
                tbl.rows[pointNumber].cells[4].appendChild(newTextCol04);
                tbl.rows[pointNumber].cells[5].appendChild(newTextCol05);
                tbl.rows[pointNumber].cells[6].appendChild(newTextCol06);
                tbl.rows[pointNumber].cells[7].appendChild(newTextCol07);
                tbl.rows[pointNumber].cells[8].appendChild(newTextCol08);
                tbl.rows[pointNumber].cells[9].appendChild(newTextCol09);
                tbl.rows[pointNumber].cells[10].appendChild(newTextCol10);
            }
        }
    );
}

function makeHeaderRow(forecastFirstRow, lastModified, tableWidth) {
    let distanceUnit,
        headerRow;

    // update the 'forecasts updated as of' span while we're at it...
    document.getElementById("updated").innerHTML = moment.tz(lastModified, "America/New_York").format('ddd MMM. D, YYYY hh:MM A zz');

    headerRow = tbl.insertRow(-1);
    for(let n = 0; n < tableWidth; n++) {
        headerRow.insertCell(-1);
    }    
    
    if(metric) {
        distanceUnit = "kilometer";
        document.getElementById("formatString").innerHTML = "daily high in °C / daily low in °C / precip. type, probability, amount in cm / summary.";
    } else {
        distanceUnit = "mile";
        document.getElementById("formatString").innerHTML = "daily high in °F / daily low in °F / precip. type, probability, amount in inches / summary.";
    }

    // write header row.
    tbl.rows[0].cells[0].appendChild(document.createTextNode("point"));
    tbl.rows[0].cells[1].appendChild(document.createTextNode("location"));
    tbl.rows[0].cells[2].appendChild(document.createTextNode(direction + ' ' + distanceUnit));
    tbl.rows[0].cells[3].appendChild(document.createTextNode(unixToDate(forecastFirstRow.days[0].time, forecastFirstRow.timezone)));
    tbl.rows[0].cells[4].appendChild(document.createTextNode(unixToDate(forecastFirstRow.days[1].time, forecastFirstRow.timezone)));
    tbl.rows[0].cells[5].appendChild(document.createTextNode(unixToDate(forecastFirstRow.days[2].time, forecastFirstRow.timezone)));
    tbl.rows[0].cells[6].appendChild(document.createTextNode(unixToDate(forecastFirstRow.days[3].time, forecastFirstRow.timezone)));
    tbl.rows[0].cells[7].appendChild(document.createTextNode(unixToDate(forecastFirstRow.days[4].time, forecastFirstRow.timezone)));
    tbl.rows[0].cells[8].appendChild(document.createTextNode(unixToDate(forecastFirstRow.days[5].time, forecastFirstRow.timezone)));
    tbl.rows[0].cells[9].appendChild(document.createTextNode(unixToDate(forecastFirstRow.days[6].time, forecastFirstRow.timezone)));
    tbl.rows[0].cells[10].appendChild(document.createTextNode(unixToDate(forecastFirstRow.days[7].time, forecastFirstRow.timezone)));

    tbl.rows[0].style.fontWeight = "bold";
    tbl.rows[0].style.textAlign = "center";
}

function imperialToMetric(conversionType, value) {
    / TODO: poss. to refactor this to return result of an element from an array of functions, where parameter is index into array? 
    return function() {
        let valueInMetric;

        switch(conversionType) {
            case "inchesToCentimeters":
                valueInMetric = value * 2.54;
                break;
            case 'milesToKilometers':
                valueInMetric = value * 1.6093
                break;
            case 'fahrenheitToCelsius':
                valueInMetric = (value - 32) / 1.8;
                break;
        }

        return valueInMetric;
    }
}

function round(value, places) {
    return +(Math.round(value + "e+" + places)  + "e-" + places);
}

function unixToDate(t, tz) {
    // moment.js: https://stackoverflow.com/a/50208295
    // console.log(moment.tz(moment.unix(t), tz).format('ddd MMMM D YYYY HH:mm:ss [GMT]ZZ (zz)'));

    return moment.tz(moment.unix(t), tz).format('ddd MMM D YYYY');
}