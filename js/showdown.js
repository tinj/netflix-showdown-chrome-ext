// Netflix Showdown is based off of the netflix-rate chrome extension

// s (NEW!)  string (optional)   title of a movie to search for
// i     string (optional)   a valid IMDb movie id
// t     string (optional)   title of a movie to return
// y     year (optional)     year of the movie
// r     JSON, XML   response data type (JSON default)
// plot  short, full     short or extended plot (short default)
// callback  name (optional)     JSONP callback name
// tomatoes  true (optional)     adds rotten tomatoes data

console.log('loading showdown.js');

var IMDB_API =  "http://www.omdbapi.com/?tomatoes=true";
var TOMATO_LINK = "http://www.rottentomatoes.com/search/?sitesearch=rt&search=";
var IMDB_LINK = "http://www.imdb.com/title/";

//popup movie selectors
var HOVER_SEL = {
  '.bobbable .popLink' : getWIMainTitle, //wi main display movies
  '.mdpLink' : getSideOrDVDTitle,
};

var CACHE = localStorage;
var CACHE_LIFE = 1210000000; //two weeks in milliseconds


/////////// HELPERS /////////////
/*
    Builds a select object where the selector is used to insert the ratings via the given insertFunc. Interval specifies the interval necessary for the popupDelay. imdb and rt classes are extra classes that can be added to a rating.
*/
function selectObj(selector, insertFunc, interval, imdbClass, rtClass){
  imdbClass = imdbClass || '';
  rtClass = rtClass || '';
  return {
    'selector' : selector,
    'insertFunc' : insertFunc,
    'interval' : interval,
    'imdbClass' : imdbClass,
    'rtClass' : rtClass,
  };
}

/*
    Add the style sheet to the main netflix page.
*/
function addStyle() {
  if (!$('#rating-overlay').length){
    var url = chrome.extension.getURL('../css/showdown.css');
    $("head").append("<link id='rating-overlay' href='" + url + "' type='text/css' rel='stylesheet' />");
  }
}


/*
    Get the arguments for showRating based on which popup is being overridden
*/
function getArgs() {
  var url = document.location.href;
  var key = 'dvd.netflix.com';
  var args;
  if (url.indexOf(key) != -1) { // we are in dvds
    args = POPUP_INS_SEL[key];
    args.key = key;
    return args;
  }

  key = 'movies.netflix.com';
  var dict = POPUP_INS_SEL[key];
  if (url.indexOf('Queue') != -1) {
    args = dict.Queue;
    args.key = 'Queue';
  } else {
    args = dict.Wi;
    args.key = 'Wi';
  }

  return args;
}

/*
    Add item to the cache
*/
function addCache(title, imdb, tomato, imdbID, year) {
  year = year || null;
  imdb = imdb || null;
  tomato = tomato || null;
  imdbID = imdbID || null;

  var date = new Date().getTime();
  var rating = {
    'title' : title,
    'imdb' : imdb,
    'tomato' : tomato,
    'imdbID' : imdbID,
    'year' : year,
    'date' : date,
  };

  CACHE[title] = JSON.stringify(rating);
  return rating;
}

function checkCache(title) {
  if(!(title in CACHE)) {
    return {
      'inCache' : false,
      'cachedVal' : null
    };
  }

  var cachedVal = JSON.parse(CACHE[title]);
  var inCache = false;
  if (cachedVal !== undefined && cachedVal.year !== null){
    var now = new Date().getTime();
    var lifetime = now - cachedVal.date;
    if(lifetime <= CACHE_LIFE) {
      inCache = true;
    }
  }
  return {
    'inCache' : inCache,
    'cachedVal' : cachedVal
  };
}

/*
    Helper to generalize the parser for side titles and DVD titles
*/
function getWrappedTitle(e, key, regex) {
  var title = $(e.target).attr('alt');
  if (title === undefined) {
    var url = $(e.target).context.href;
    if (typeof url === "undefined"){
      return "";
    }
    url = url.split('/');
    var title = url[url.indexOf(key) + 1];
    title = title.replace(regex, ' ');
  }
  return title;
}

/*
    Clear old ratings and unused content. Differs for different popups
*/
function clearOld(args){
  var $target = $('#BobMovie');
  if (args.key in POPUP_INS_SEL['movies.netflix.com']){
    $target.find('.label').contents().remove();
  }
  // $target.find('.rating-link').remove();
  // $target.find('.ratingPredictor').remove();
  $target.find('.showdown-link').remove();
}


///////////////// URL BUILDERS ////////////////

/*
    Builds and returns the imdbAPI url
*/
function getIMDBAPI(title, year) {
  var url = IMDB_API + '&t=' + title
  if (year !== null) {
      url += '&y=' + year;
  }
  return url;
}

/*
    Build the url for the imdbLink
*/
function getIMDBLink(title) {
  return IMDB_LINK + title;
}

/*
    Build the url for the rtLink
*/
function getTomatoLink(title) {
  return TOMATO_LINK + title;
}


///////////////// TITLE PARSERS ////////////////
/*
    parses form: http://movies.netflix.com/WiPlayer?movieid=70171942&trkid=7103274&t=Archer
*/
function getWIMainTitle(e) {
  return $(e.target).siblings('img').attr('alt');
}

/*
    Cleanup recently watched title
*/
function getRecentTitle(title) {
  var index = title.indexOf('%3A');
  if (index !== -1) {
    title = title.slice(0, index);
  }
  return title;
}

/*
    Instant Queue and dvd popups use the same selector but different parsers
*/
function getSideOrDVDTitle(e) {
  var url = document.location.href;
  if (url.indexOf('Search') != -1) { //no popups on search page.
    return $(e.target).text(); // but still cache the title
  }

  var key = 'dvd.netflix.com';
  if (url.indexOf(key) != -1) { // we are in dvds now
    return getDVDTitle(e);
  }
  return getSideTitle(e);
}

function getSideTitle(e) {
  var key = "WiMovie";
  var regex = /_/g;
  return getWrappedTitle(e, key,regex);
}

function getDVDTitle(e) {
  var key = "Movie";
  var regex = /-/g;
  return getWrappedTitle(e, key,regex);
}

function parseYear($target) {
  var $target = $target || $('.year');
  var year = null;
  if ($target.length) {
    year = $target.text().split('-')[0];
  }
  return year;
}

/*
    Parse the search title for a given search result
*/
function parseSearchTitle($target){
  return $target.find('.title').children().text();
}

/////////// RATING HANDLERS ////////////
function eventHandler(e){
  var title = e.data(e); //title parse funtion
  if ($('.label').contents() != '') { //the popup isn't already up
    getRating(title, null, null, function(rating){ //null year, null addArgs
      showRating(rating, getArgs());
    });
  }
}

/*
    Search for the title, first in the CACHE and then through the API
*/
function getRating(title, year, addArgs, callback) {
  var cached = checkCache(title);
  if (cached.inCache){
    callback(cached.cachedVal, addArgs);
    return;
  }
  $.get(getIMDBAPI(title, year), function(res){
    try {
      res = JSON.parse(res);
    } catch(e){
      res = {'Response' : 'False'};
    }

    if (res.Response === 'False'){
      addCache(title);
      return null;
    }
    var imdbScore = parseFloat(res.imdbRating);
    var tomatoScore = res.tomatoMeter === "N/A" ? null : parseInt(res.tomatoMeter);
    var rating = addCache(title, imdbScore, tomatoScore, res.imdbID, year);
    callback(rating, addArgs);
  });
}

/*
    Given a rating and specific arguments, display to popup or search page
*/
function showRating(rating, args) {
  if (!args.interval) { // unknown popup
    return;
  }
  var checkVisible = setInterval(function(){
    var $target = $(args.selector);
    if($target.length){
      clearInterval(checkVisible);
      updateCache(rating.title); //run the query with the year to update
      clearOld(args);
      displayRating(rating, args);
    }
  }, args.interval);
}

/*
    Call the API with the year and update the rating if neccessary
*/
function updateCache(title) {
  var cachedVal = checkCache(title).cachedVal;
  if (cachedVal.year === null) {
    var year = parseYear();
    getRating(title, year, null, function(rating){
      showRating(rating, getArgs());
    });
  }
}

/*
    Build and display the ratings
*/
function displayRating(rating, args) {
  // var imdb = getIMDBHtml(rating.imdb, rating.imdbID, rating.title, args.imdbClass);
  // var tomato = getTomatoHtml(rating.tomato, rating.title, args.rtClass);
  var showdown = getShowdownHtml();
  var $target = $(args.selector);
  // $target[args.insertFunc](imdb);
  // $target[args.insertFunc](tomato);
  // $target[args.insertFunc](showdown);
  // $('.showdown-link').on('click', addMovieClick);
}

function addMovieClick (evt) {
  evt.preventDefault();
  console.log(evt);
  var $popover = $('#BobMovie');
  var id = $popover.find('.agMovie .bobMovieContent a').prop('id');
  $popover.hide();
  console.log(id);
  movieSelected($('#'+id).parent().parent(), id);
}

////////SEARCH AND INDIVIDUAL PAGE HANDLERS //////////
/*
    Determine which search, dvd or watch instantly and display the correct ratings
*/
function searchSetup() {
  var url = document.location.href;
  var args;
  if (url.indexOf("WiSearch") !== -1) {
    args = SEARCH_SEL.WiSearch;
    args.selectorClass = ".media";
  } else if (url.indexOf("Search") !== -1) {
    args = SEARCH_SEL.Search;
    args.selectorClass = ".agMovie";
  }
  if (args === undefined) {
    return;
  }
  return displaySearch(args);
}

/*
    Find ratings for all of the movies found by the search and display them
*/
function displaySearch(args){
  var selector = args.selector;
  $.each($(args.selectorClass), function(index, target){ // iterate over movies found
    var $target = $(target);
    var year = parseYear($target.find('.year'));
    var title = parseSearchTitle($target);
    var addArgs = {
      'target' : $target,
      'selector' : selector
    }; // add the current target so the rating matches the movie found
    getRating(title, year, addArgs, function(rating, addArgs){
      args.selector = addArgs.target.find(addArgs.selector); // store selector to show rating on.

      displayRating(rating, args);
    });
  });
}


/////////// HTML BUILDERS ////////////
function getIMDBHtml(score, imdbID, title, klass) {
  var html = $('<a class="rating-link" target="_blank" href="' + getIMDBLink(imdbID) + '"><div class="imdb imdb-icon star-box-giga-star" title="IMDB Rating"></div></a>');
  if (score === null) {
    html.css('visibility', 'hidden');
  } else {
    html.find('.imdb').addClass(klass).append(score.toFixed(1));
  }
  return html;
}

function getTomatoHtml(score, title, klass) {
  var html = $('<a class="rating-link" target="_blank" href="' + getTomatoLink(title) + '"><span class="tomato tomato-wrapper" title="Rotten Tomato Rating"><span class="tomato-icon med"></span><span class="tomato-score"></span></span></a>');
  if (score === null) {
    html.css('visibility', 'hidden');
    return html;
  }
  var klass;
  if (score < 59) {
    klass = 'rotten';
  } else {
    klass = 'fresh';
  }
  html.find('.tomato-icon').addClass(klass);
  html.find('.tomato-score').append(score + '%');
  html.addClass(klass); //add custom class
  return html;
}

function getShowdownHtml(title, klass) {
  var html = $('<a class="showdown-link" href="#">Add to Showdown</a>');
  // html.find('.imdb').addClass(klass);
  return html;
}


// showdown timer
// var timeRemaining = 60;
var timers = [];
var currTimer = 0;

var Timer = function (id, duration, color) {
  this.init = function (id, duration, color) {
    this.id = id;
    this.color = color || 'white';
    this.movie = '';
    this.url = '';
    this.duration = duration;
    this.durationMS = duration * 1000;
    // this.timeRemaining = timeRemaining || 30;
    // this.timeStart = timeRemaining || 30;
    this.$el = $('#timer-'+id);

    this.chart = getChart(this.$el, id, this.formatTime());
  };

  this.start = function (callback) {
    var that = this;
    that.moment = moment();
    if (callback) {
      that.$el.one('click', function (evt) {
        evt.preventDefault();
        that.stop();
        callback();
      });
    }
    that.interval = setInterval(function () {
      that.updateChart();

      if (0 >= that.timeRemaining()) {
        that.stop();
        if (callback) callback();
      }
    }, 20);
  };

  this.stop = function () {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
      this.updateChart();
    }
  };

  this.updateChart = function () {
    this.chart.update(this.formatTime());
  };

  this.timeRemaining = function () {
    if (this.moment) {
      return this.durationMS + this.moment.diff();
    } else {
      return this.durationMS;
    }
  };

  this.formatTime = function () {
    return [
      {
        value : this.timeRemaining(),
        color : this.color || 'white'
      },
      {
        value: this.durationMS - this.timeRemaining(),
        color : 'none'
      }
    ];
  };

  // this.removeChart = function () {
  //   this.$el.remove();
  // };

  this.init(id, duration, color);
};


function getChart ($el, id, data) {
  var ctx = $el[0].getContext('2d');
  return new Chart(ctx).Doughnut(data, {
    animation: true,
    percentageInnerCutout: 80,
    count: true,
    countColor: 0,
    countModifier: 1000, // milliseconds
    placeNumber: ['1st','2nd','3rd'][id],
    segmentShowStroke: false,
    // segmentStrokeWidth: 1,
    // segmentStrokeColor: "#000",
    onAnimationComplete: function () {
      this.animation = false;
    }
  });
}

var allMovies = [];//['dbs70143836_0','dbs70230088_0','dbs70242311_0'];

function getAllIds () {
  var list = $('.boxShot');
  allMovies = _.map(list, function (el) {
    return el.id;
  });
  console.log(allMovies);
}

function addTimers () {
  $('#bd').prepend([
    '<div class="showdown">',
      '<ul class="timers">',
        '<li>',
          '<canvas id="timer-0" width="50" height="68"></canvas>',
        '</li>',
        '<li>',
          '<canvas id="timer-1" width="50" height="68"></canvas>',
        '</li>',
        '<li>',
          '<canvas id="timer-2" width="50" height="68"></canvas>',
        '</li>',
      '<ul>',
    '</div>'
  ].join(''));
  for (var i=0; i<3; i++) {
    timers.push(new Timer(i, 15));
  }
}

function showTimers () {
  $(".showdown").show();
}

function posterClick (evt) {
  evt.preventDefault();
  evt.stopPropagation();
  // console.log('posterClick');
  var $target = $(evt.currentTarget);
  var id = evt.currentTarget.parentNode.id;
  movieSelected($target.parent().parent(), id);
}

function pickMovie () {
  console.log('pick random');
  // return allMovies.pop();
  return allMovies.splice(Math.floor(allMovies.length * Math.random()), 1); // allMovies.length
}

function getRandom () {
  var id = pickMovie();
  var selected = $('#'+id).parent();
  movieSelected(selected, id);
}

function movieSelected ($el, id) {
  var timer = timers[currTimer];
  var $img = $el.find('img');
  var hsrc = $img.attr('hsrc');
  if (hsrc) {
    $img.attr('src', hsrc);
  }
  $el.addClass('selected');
  timer.$target = $el;
  timer.$el.after(timer.$target);
  timer.$el.hide();
  timer.targetId = id;
  startNextTimer();
}

function startNextTimer () {
  timers[currTimer].stop();
  currTimer++;
  if (currTimer<timers.length) {
    timers[currTimer].start(getRandom);
  } else {
    launchModal();
  }
}

function launchModal () {
  var modalHTML = [
    '<div class="modal-timer">',
      '<p>',
        'Final Showdown ...',
      '</p>',
      '<div>',
        '<canvas id="timer-3" width="60" height="60"></canvas>',
        '<canvas id="timer-4" width="60" height="60" class="timer-hidden"></canvas>',
      '</div>',
    '</div>',
  ].join('');
  $('.showdown').prepend($(modalHTML));
  $('<div class="modal-backdrop" />').appendTo(document.body);
  $('#BobMovie').hide(); // hide popover
  convertToModal();
  timers.push(new Timer(3, 15));

  // timers[3].getChart();
  timers[3].start(pickWinner);
  console.log(timers[3]);
}

function convertToModal () {
  $('.showdown').addClass('showdown-modal sd');
  $('.mrows a').off();

  _.each(timers, function (timer) {
    timer.$target.toggleClass('selected finalist');
    timer.$target.find('a').off();
    // console.log(timer.$target);
    // console.log(timer.targetId);
    // modal.append(timer.$target);
    timer.$target.one('click', function (evt) {
      evt.preventDefault();
      evt.stopPropagation();
      console.log(evt);
      timers[3].stop();
      _.each(timers, function (timer) {
        timer.$target.off();
      });
      showWinner($(evt.currentTarget));
    });
  });
}

function pickWinner () {
  showWinner(timers[Math.floor(Math.random()*3)].$target);
}

function showWinner (winner) {
  winner.addClass('showdown-winner');
  for (var i=0; i<3; i++) {
    timers[i].$target.addClass('winner-chosen');
  }
  finalCountdown(winner);
}

function getWinnerUrl (winner) {
  return winner.find('a').attr('href');
}

function finalCountdown (winner) {
  $('.modal-timer p').text("It's Showtime!");
  timers[3].$el.hide();
  var finalTimer = new Timer(4, 5);
  timers.push(finalTimer);
  finalTimer.$el.removeClass('timer-hidden');
  // finalTimer.getChart();
  finalTimer.start(function () {
    startPlaying(getWinnerUrl(winner));
  });
}

function startPlaying (url) {
  // window.open(url, '_parent');
}



// function ()

///////// INIT /////////////
$(document).ready(function() {
  //common select objects
  console.log('document ready');

  chrome.runtime.sendMessage({method: "getLocalStorage", key: "total_time"}, function (response) {
    console.log(response.data);
  });


  var dvdSelObj = selectObj('.bobMovieRatings', 'append', 800, 'dvd-popup');
  var WiObj = selectObj('.midBob', 'append', 700);

  //poup select types
  POPUP_INS_SEL = {
    'movies.netflix.com' : {
      'Wi': WiObj, // main page selector
      'Queue' : selectObj('.info', 'before', 800), // queue page selector
    },
    'dvd.netflix.com' : dvdSelObj, // dvdqueue page selector
  };

  //search select types
  SEARCH_SEL = {
    //search page selectors
    'Search' : selectObj('.bluray', 'append', -1, 'dvd-search-page'),
    'WiSearch' : selectObj('.actions', 'append', -1, 'wi-search-page'),
  };

  addStyle(); //add ratings.css to the page
  searchSetup(); // check if this is a search page

  $.each(HOVER_SEL, function (selector, parser){ //add listeners for each hover selector
    $(document).on('mouseenter', selector, parser, eventHandler);
  });

  var timersHTML = [
    '<li id="nav-timers" class="nav-timers nav-item dropdown-trigger">',
      '<span class="i-b content">',
        '<a href="#" id="nav-showdown-link">Showdown</a>',
        // '<span class="right-arrow"></span>',
        // '<canvas id="timer-0" width="50" height="68" class="timer-hidden"></canvas>',
        // '<canvas id="timer-1" width="50" height="68" class="timer-hidden"></canvas>',
        // '<canvas id="timer-2" width="50" height="68" class="timer-hidden"></canvas>',
      '</span>',
      '<span class="i-b shim"></span>',
      '<span class="down-arrow"></span>',
      '<span class="down-arrow-shadow"></span>',
    '</li>',
  ].join('');

  var $navbar = $('#global-header');
  // console.log($navbar);
  $navbar.append(timersHTML);


  addTimers();

  var $showdown = $('#nav-showdown-link');
  $showdown.one('click', function (evt) {
    $showdown.hide();
    $('.mrows').addClass('sd');
    var $popover = $('#BobMovie');
    $popover.append('<span class="popover-add"><a href="#">+</a></span>');
    $popover.find('.popover-add').on('click', addMovieClick);
    showTimers();
    timers[0].start(getRandom);

    $('.mrows a').one('click', posterClick);
  });

  getAllIds();
});

/*
popover
rated
  class = ".stbrMaskFg .sbmfrt .sbmf-50"
  sbmf-50 = rated 5 stars

unrated
  stbrMaskFg sbmfpr sbmf-34
  best guess = 3.4 stars
*/