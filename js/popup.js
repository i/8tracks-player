
onload = setTimeout(init, 0)

/*
 * This function runs when popup opens each time.
 */
function init() {
  var bg = chrome.extension.getBackgroundPage()
  if (bg.bg8.current_mix != null) {
    // show mix info
    $('#title').text(bg.bg8.current_mix.set.track.name)    // show song title
    $('#artist').text(bg.bg8.current_mix.set.track.performer)  // show artist name
    $('#playlist').text(bg.bg8.mix_name)   // show mix name
    $('#cover').attr('src', bg.bg8.cover_url) // show mix cover image

    if (bg.bg8.isPlaying()) {
      $('#pause-resume-button').removeClass('fi-play').addClass('fi-pause')
    } else {
      $('#pause-resume-button').removeClass('fi-pause').addClass('fi-play')
    }



  } else {
    $('#title').text(' - ')
    $('#artist').text('No playlist selected')
    $('#playlist').text(' - ')

  }
    $('#current-time').text(bg.bg8.currentTime()) // get current time of track
    $('#duration').text(bg.bg8.getDuration()) // get length of track

  // DEBUG ONLY
  /*
  var play = { "api_version": 3, "errors": null, "notices": "", "set": { "at_beginning": false, "at_end": false, "at_last_track": false, "skip_allowed": false, "track": { "buy_icon": "http://8tracks.com/assets/buy/itunes.png", "buy_link": "http://redirect.viglink.com/?key=f4be5dc2078785c5846df105343edee0&out=https%3A%2F%2Fsearch.itunes.apple.com%2FWebObjects%2FMZSearch.woa%2Fwa%2Fsearch%3Fterm%3DOxia%2520Domino", "buy_text": "iTunes", "faved_by_current_user": false, "full_length": true, "id": 67, "name": "Domino", "performer": "Oxia", "release_name": "Speicher 34", "stream_source": "upload_v3", "track_file_stream_url": "http://cft.8tracks.com/tf/000/000/067/1zSYPd.48k.v3.m4a", "uid": 67, "url": "http://8tracks.com/tracks/67", "user_id": 2, "year": null } }, "status": "200 OK" };
  $('#title').text(play.set.track.name)
  $('#artist').text(play.set.track.performer)
  $('#playlist').text(play.
  */
  setTimeout(init, 40)
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

$('#pause-resume-button').click(function() {
  console.log('clicked ze button')
  var bg = chrome.extension.getBackgroundPage()

  if ($('#pause-resume-button').hasClass('fi-pause')) {
    bg.bg8.pause()
  }
  else if ($('#pause-resume-button').hasClass('fi-play')) {
    bg.bg8.resume()
  }

})

$('#next-button').click(function() {
  var bg = chrome.extension.getBackgroundPage()
  if (bg.bg8.current_mix.set.skip_allowed) {
    bg.bg8.nextSong()
  } else {
    console.log('skip not allowed')
  }
})

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
    bg.bg8.mix_id = res.item.mix_id
    bg.bg8.mix_name = res.item.label
    if (bg.bg8.play_token == null) {
      bg.bg8.getPlayToken()
    } else {
      bg.bg8.playMix()
    }
    bg.bg8.cover_url = res.item.cover
    console.log('res:', res)
  }
})

$('.ui-autocomplete').addClass('f-dropdown');


// chrome.extension.getBackgroundPage().play('https://dtp6gm33au72i.cloudfront.net/tf/000/000/025/YxgALb.48k.v3.m4a')
