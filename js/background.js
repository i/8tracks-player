var bg8 = {
  mix_id: null,
  mix_name: null,
  current_mix: null,
  cover_url: null,
  play_token: null,
  song_reported: false,

  // TODO DON'T FORGET: Reporting the song

  /*
   * Plays a new song in background.html's audio player from url
   */
  play: function(url) {
    var player = document.getElementById('player')
    player.src = url
    player.play()
  },

  /* Pauses playback on the audio player */
  pause: function() {
    document.getElementById('player').pause()
  },

  /*
   * Resumes song on audio player
   * Should only be called if paused
   */
  resume: function() {
    document.getElementById('player').play()
  },

  isPlaying: function() {
    return !document.getElementById('player').paused
  },

  /*
   * Return current time of track in a readable format.
   * MM:SS
   */
  currentTime: function() {
    var seconds = document.getElementById('player').currentTime
    return parseInt(seconds / 60) + ":" + ( parseInt(seconds % 60) < 10 ? "0" + parseInt(seconds % 60) : parseInt(seconds % 60) )
  },

  /*
   * Return duration of track in a readable format.
   * MM:SS
   */
  getDuration: function() {
    var seconds = document.getElementById('player').duration
    return parseInt(seconds / 60) + ":" + ( parseInt(seconds % 60) < 10 ? "0" + parseInt(seconds % 60) : parseInt(seconds % 60) )
  },


  /*
   * Gets play token which is needed to get info to play songs from a mix
   */
  getPlayToken: function() {
    req = new XMLHttpRequest()
    req.open("GET", 'http://8tracks.com/sets/new.json?api_key=39501dd2e8f36ad35f4738ac3a9e704813e1695d&api_version=3', true)
    req.onload = function(err) {
      console.log(req.responseText)
      bg8.play_token = JSON.parse(req.responseText)["play_token"]
      bg8.playMix()
    }
    req.send()
  },

  playMix: function() {
    bg8.song_reported = false
    var url = 'http://8tracks.com/sets/' + bg8.play_token + '/play.json?api_key=39501dd2e8f36ad35f4738ac3a9e704813e1695d&api_version=3&mix_id=' + bg8.mix_id
    req = new XMLHttpRequest()
    req.open("GET", url, true)
    req.onload = function(err) {
      if (err) { console.log(req.responseText) }
      bg8.current_mix = JSON.parse(req.responseText)
      bg8.play(bg8.current_mix.set.track.track_file_stream_url)
    }
    req.send()
  },

  nextSong: function() {
    bg8.song_reported = false
    var url = 'http://8tracks.com/sets/' + bg8.play_token + '/next.json?api_key=39501dd2e8f36ad35f4738ac3a9e704813e1695d&api_version=3&mix_id=' + bg.mix_id
    req = new XMLHttpRequest()
    req.open("GET", url, true)
    req.onload = function(err) {
      console.log(req.responseText)
      bg8.current_mix = JSON.parse(req.responseText)
      bg8.play(bg8.current_mix.set.track.track_file_stream_url)
    }
    req.send()
  }

}

/*
 * Cron job to make sure songs get reported at thirty seconds
 * and lets the next song of the mix play
 */
setInterval(function() {
  var player = document.getElementById('player')
  if (!bg8.song_reported && bg8.isPlaying() && player.currentTime >= 30) {
    var url = 'http://8tracks.com/sets/111696185/report.json?track_id=' +
               bg8.current_mix.set.track.id + '&mix_id=' + bg8.mix_id
    req = new XMLHttpRequest()
    req.open("GET", url, true)
    req.onload = function(err) {
      if (!err) {
        bg8.song_reported = true
        console.log('reported song successfully')
      }
    }
  }
  if (player.currentTime == player.duration && currentTime > 0) {
    bg8.nextSong()
  }
}, 500)
