/*****************************************************
 * Project: 8tracks-Player Chrome Extension          *
 * Author: Ian Lozinski    Date: 01/23/14            *
 *                                                   *
 * Description: Lets users listen to 8tracks mixes.  *
 * This project is still very much in beta and isn't *
 * perfrect by means. Hopefully you got that.        *
 *****************************************************/


/*
 * This function runs in a loop whenever the popup is open.
 * It keeps the track info updated.
 */
function init() {
  var bg = chrome.extension.getBackgroundPage()
  if (bg.BG8.current_mix != null) {
    // show mix info
    $('#title').text(bg.BG8.current_mix.set.track.name)    // show song title
    $('#artist').text(bg.BG8.current_mix.set.track.performer)  // show artist name
    $('#playlist').text(bg.BG8.mix_name)   // show mix name
    $('#cover').attr('src', bg.BG8.cover_url) // show mix cover image

    if (bg.BG8.isPlaying()) {
      $('#pause-resume-button').removeClass('fi-play').addClass('fi-pause')
    } else {
      $('#pause-resume-button').removeClass('fi-pause').addClass('fi-play')
    }

  } else {
    $('#title').text(' - ')
    $('#artist').text('No playlist selected')
    $('#playlist').text(' - ')

  }
    $('#current-time').text(bg.BG8.currentTime()) // get current time of track
    $('#duration').text(bg.BG8.getDuration()) // get length of track

  setTimeout(init, 100) // Call init() after 100ms.
}

var mixList = {
  mixes: null,

  mixes_endpoint: 'http://8tracks.com/mix_sets/all.json?api_version=3&include=mixes&api_key=39501dd2e8f36ad35f4738ac3a9e704813e1695d',

  /*
   * Sets up and sends XHR
   */
  getMixes: function() {
    req = new XMLHttpRequest()
    req.open("GET", this.mixes_endpoint, true)
    req.onload = function() {
      mixList.displayMixes(JSON.parse(req.responseText))
    }

    req.send()
  }

}

/*
 * Pause or resume song when pause-resume-button is clicked.
 */
$('#pause-resume-button').click(function() {
  if ($('#pause-resume-button').hasClass('fi-pause')) {
    chrome.extension.getBackgroundPage().BG8.pause()
  }
  else if ($('#pause-resume-button').hasClass('fi-play')) {
    chrome.extension.getBackgroundPage().BG8.resume()
  }
})

/*
 *  Skip song when next-button is clicked.
 */
$('#next-button').click(function() {
  var bg = chrome.extension.getBackgroundPage()
  if (bg.BG8.current_mix.set.skip_allowed) {
    bg.BG8.nextSong()
  } else {
    console.log('skip not allowed')
  }
})


/*
 * Autocomplete bulllllllllllllshit.
 */
$('#search').autocomplete({
  source: function(req, res) {
    $.getJSON("http://8tracks.com/mix_sets/tags:" + req.term + ".json",
      { api_version: 3,
        api_key: '39501dd2e8f36ad35f4738ac3a9e704813e1695d',
        include: 'mixes',
        tags: req.term
      },
      function(data) {
        console.log('got data:', data)
        res($.map(data.mix_set.mixes, function(mix) {
          return {
            label: mix.name,
            mix_id: mix.id,
            cover: mix.cover_urls.sq100
          }
        }))
      }
    )
  },
  minLength: 2,
  // Callback after JSON is returned
  select: function(event, res) {
    var bg = chrome.extension.getBackgroundPage()
    bg.BG8.mix_id = res.item.mix_id
    bg.BG8.mix_name = res.item.label
    if (bg.BG8.play_token == null) {
      bg.BG8.getPlayToken()
    } else {
      bg.BG8.playMix()
    }
    bg.BG8.cover_url = res.item.cover
    console.log('res:', res)
  }
})

// Makes search dropdown look a little nicer.
$('.ui-autocomplete').addClass('f-dropdown');

// When popup loads, run init
onload = setTimeout(init, 0)
