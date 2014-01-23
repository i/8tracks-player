var BG8 = {
  mix_id: null,
  mix_name: null,
  current_mix: null,
  cover_url: null,
  play_token: null,
  song_reported: false,

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
   */
  resume: function() {
    document.getElementById('player').play()
  },

  /*
   * Returns true if a song is playing, false otherwise.
   */
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
    if (isNaN(seconds)) return "0:00"
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
      BG8.play_token = JSON.parse(req.responseText)["play_token"]
      BG8.playMix()
    }
    req.send()
  },

  /*
   * Starts playing BG8.mix_id through the player.
   * This shouldn't be called if there is no play_token.
   */
  playMix: function() {
    BG8.song_reported = false
    var url = 'http://8tracks.com/sets/' + BG8.play_token + '/play.json?api_key=39501dd2e8f36ad35f4738ac3a9e704813e1695d&api_version=3&mix_id=' + BG8.mix_id
    req = new XMLHttpRequest()
    req.open("GET", url, true)
    req.onload = function(err) {
      if (err) {
        console.log(req.responseText)
      }
      BG8.current_mix = JSON.parse(req.responseText)
      BG8.play(BG8.current_mix.set.track.track_file_stream_url)
    }
    req.send()
  },

  /*
   * Pretty self explanatory. plays the next song.
   */
  nextSong: function() {
    BG8.song_reported = false
    var url = 'http://8tracks.com/sets/' + BG8.play_token + '/next.json?api_key=39501dd2e8f36ad35f4738ac3a9e704813e1695d&api_version=3&mix_id=' + BG8.mix_id
    req = new XMLHttpRequest()
    req.open("GET", url, true)
    req.onload = function(err) {
      if (req.status == 403) {
        BG8.playMix()
        console.log('starting mix over')
      } else {
        console.log(err)
      }
      console.log(req.responseText)
      BG8.current_mix = JSON.parse(req.responseText)
      BG8.play(BG8.current_mix.set.track.track_file_stream_url)
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
  if (!BG8.song_reported && BG8.isPlaying() && player.currentTime >= 30) {
    var url = 'http://8tracks.com/sets/111696185/report.json?track_id=' +
               BG8.current_mix.set.track.id + '&mix_id=' + BG8.mix_id +
              '&api_key=39501dd2e8f36ad35f4738ac3a9e704813e1695d' +
              '&api_version=3'
    req = new XMLHttpRequest()
    req.open("GET", url, true)
    req.onload = function(err) {
        console.log('reported song successfully')
        BG8.song_reported = true
    }
    req.send()
  }
  // Play the next track when song finishes
  if (player.currentTime == player.duration) {
    BG8.nextSong()
  }
}, 500)
