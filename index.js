'use strict'

// create global var for map to use for the several different functions it will be needed for.
var map;
// creates an array to hold each disaster for later selection from the user.
const dataArray = [];

//Calls the reliefWeb API to gather our disaster data.
function callUrl() {
  fetch('https://api.reliefweb.int/v1/disasters?profile=full')
  .then(response => response.json())
    .then(responseJson =>
      disasterData(responseJson))
    .catch(error => alert('Something went wrong. Try again later.'));
}

// takes the JSON data from our reliefWeb API and turns it into lat, longitude, disaster description, and url's for the user to follow to the reliefWeb site.
function disasterData(responseJson) {
  for (let i=0; i<responseJson.data.length; i++) {
    const newsUrl=responseJson.data[i].fields.url
    const lat=responseJson.data[i].fields.country[0].location.lat;
    const long=responseJson.data[i].fields.country[0].location.lon;
    const location=responseJson.data[i].fields.name;
    const description=responseJson.data[i].fields.description;
    const dataObject= {
      newsUrl: newsUrl,
      description: description,
      location: location,
    };
    dataArray.push(dataObject);
    drawMarkers(long,lat,location, i);
  }
}


// throws promise to check if there are any errors when loading the webgl map, along with displaying the WebGL map in the DOM.
function displayResults() {
  mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zaHVhYmxvdW50MiIsImEiOiJjanB4N3hoZzYwMzBxNDhwcGV1OXNqbXhoIn0.r-dvdiKjDsHHPmL-RFn9ww';
   newMap(mapboxgl)
  .then(() => {
    console.log('map loaded')
    callUrl();
  })
  .catch(err => {
    console.log(`map failed to load ${err}`)
  });
}

// Generates the stylistic choices of the WebGL map we create and resolves the promises made in the previous function(displayResults).
function newMap(mapboxgl) {
  map=new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/satellite-v9'
  });
  return Promise.resolve();
}

// Creates markers for the map based off the reliefWeb API's latitude and longitude data, also adds popup functionality to the markers allowing us to create popups with buttons for the user to click to receive the disaster text
function drawMarkers(long,lat,location, i) {
  var link=`<button onclick="returnNews('${i}')" class="listener">${location}</button>`
  var marker = new mapboxgl.Marker()
    .setLngLat([long, lat])
    .addTo(map)
    .setPopup(new mapboxgl.Popup().setLngLat([long, lat]).setHTML(link))
}

// Takes the JSON data that came in as markdown text into proper links with the help of regular expression and replaces it with proper clickable links for the user to use.
function replaceText(link) {
  var result = link.replace(/\[(.+?)\]\((https?:\/\/.+?)\)/g, '<a href="$2">$1</a>');
  return result.replace(/(?: |^)(https?\:\/\/[a-zA-Z0-9/.(]+)/g, ' <a href="$1">$1</a>');
}

// Seperates the text at each link making the text more readable, also fixes the replaced text from the previous function(replaceText) as the regular expression only returns a link and not the full text.
function seperateParagraphs(description) {
  // splits text at the end of each appropiate link
  const splitText=description.split('))');
  splitText.forEach((string,index,array) => {
    const startIndex = string.indexOf('([');
    const copy = string.substring(0,startIndex);
    let link = string.substring(startIndex);
    if (link.charAt(0) === '(') {
      link += '))'
    }
    const regex = replaceText(link);
    array[index] = copy + regex;
  })
  const joinText = splitText.join('</p><p>');
  return joinText;
}

// Takes the data from our disasterData function and has it come back in our DOM in the form of a text description of the selected disaster, url's given by the reliefWeb website for their website description along with citations, along with the proper description for each disaster.
function returnNews(i) {
  const location= dataArray[i].location;
  const newsUrl= dataArray[i].newsUrl;
  const description= dataArray[i].description;
  console.log(dataArray);
  const newDescription=seperateParagraphs(description);
  $('#results-list').empty();
  $('#results-list').append(`
  <li><h2>${location}</h2><p>${newDescription}</p><a href='${newsUrl}'>${location}</a></li>
  `)
  $('#results').removeClass('hidden')
}

// watches form to ensure default HTML protocols do not occur
function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
  })
}

// calls on displayResults with JQuery to put all our functions into action
$(displayResults);
