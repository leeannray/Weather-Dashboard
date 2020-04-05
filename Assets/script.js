// apiKey = 'b4288b0e73b538d11bef86c00186a711';
let apiKey = 'b4288b0e73b538d11bef86c00186a711';

//when page loads add click event for search button
$(document).ready(function () {

  $("#searchBtn").on("click", function() {
    var searchValue = $("#searchCity").val();

    // clear search input box
    $("#searchCity").val("");

    searchWeather(searchValue);
  });
// user able to view other city data from previous searches
  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });

  function makeRow(text) {
    var li = $("<li>")
      .addClass("list-group-item list-group-item-action")
      .text(text);
    $(".history").append(li);
  }

  function searchWeather(searchValue) {
    $.ajax({
      type: "GET",
      url: `https://api.openweathermap.org/data/2.5/weather?q=${searchValue}&appid=${apiKey}&units=imperial`,
      dataType: "json",
      success: function(data) {
        // creates history link for this search
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          localStorage.setItem("history", JSON.stringify(history));

          makeRow(searchValue);
        }

        // clear previous input so user can search again
        $("#currentForecast").empty();

        // create html for current weather/forecast. also add date. Use array to target data retrieved from api
        var title = $("<h3>")
          .addClass("card-title")
          .text(data.name + " (" + new Date().toLocaleDateString() + ")");
        var card = $("<div>").addClass("card");
        var wind = $("<p>")
          .addClass("card-text")
          .text("Wind Speed: " + data.wind.speed + " MPH");
        var humid = $("<p>")
          .addClass("card-text")
          .text("Humidity: " + data.main.humidity + "%");
        var temp = $("<p>")
          .addClass("card-text")
          .text("Temperature: " + data.main.temp + " °F");
        var cardBody = $("<div>").addClass("card-body");
        var img = $("<img>").attr(
          "src",
          "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png"
        );

        // merge and add to page
        title.append(img);
        cardBody.append(title, temp, humid, wind);
        card.append(cardBody);
        $("#currentForecast").append(card);

        // call functions for api endpoints; need latitude and longitude coordinates (UV index)
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }

  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: `https://api.openweathermap.org/data/2.5/forecast?q=${searchValue}&appid=${apiKey}&units=imperial`,
      dataType: "json",
      success: function(data) {
        // overwrite any existing content with title and empty row to append to page
        $("#forecast")
          .html('<h4 class="mt-3">5-DAY FORECAST</h4>')
          .append('<div class="row">');

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            var col = $("<div>").addClass("col-md-2");
            var card = $("<div>").addClass("card bg-secondary text-white");
            var body = $("<div>").addClass("card-body p-2");

            var title = $("<h5>")
              .addClass("card-title")
              .text(new Date(data.list[i].dt_txt).toLocaleDateString());

            var img = $("<img>").attr(
              "src",
              "https://openweathermap.org/img/w/" +
                data.list[i].weather[0].icon +
                ".png"
            );
// add p class for temp and humiditing to be displayed for current forecast in Farenheit and % humidity
            var p1 = $("<p>")
              .addClass("card-text")
              .text("Temp: " + data.list[i].main.temp_max + " °F");
            var p2 = $("<p>")
              .addClass("card-text")
              .text("Humidity: " + data.list[i].main.humidity + "%");

            // merge together and put on page
            col.append(card.append(body.append(title, img, p1, p2)));
            $("#forecast .row").append(col);
          }
        }
      }
    });
  }
// get uv index for each city and add class for button with associated color depending on value
  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`,
      dataType: "json",
      success: function(data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>")
          .addClass("btn btn-sm")
          .text(data.value);

        // change color depending on uv value (<3 green and <7 "warning" and >7 red)
        if (data.value < 3) {
          btn.addClass("btn-success");
        } else if (data.value < 7) {
          btn.addClass("btn-warning");
        } else {
          btn.addClass("btn-danger");
        }

        $("#currentForecast .card-body").append(uv.append(btn));
      }
    });
  }

  // retrieve current history, if data in local storage. create row for each previous search history. If nothing in local storage, create empty array. History.length - 1 will retrieve most recent search from local storage.
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length - 1]);
  }
// for each additional new search add additional row to "history" section that remains static on page when page refreshed
  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
