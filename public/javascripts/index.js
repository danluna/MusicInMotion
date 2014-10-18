$(document).ready(function() { 

  // initialize client with app credentials
  SC.initialize({
    client_id: '4a4e35aed5c587e1c7296ddbd13e8926',
    // Make sure it matches with the preset uri online.
    redirect_uri: 'http://127.0.0.1:3000/'
  });

  playGenre("metal");

  $("#genreList div:nth-child(2)")

});

// Global Variables for keeping track of the song being played.
var curTracks;  
var curIndex;
var curSound;
var curGenre;
var genreList = [
	"Ambient", "Classical", "Country", "Dance",
	"Electronic", "Folk", "Hip Hop", "Jazz",
	"Metal", "Pop", "Rap", "Rock", "Techno"
];

var map = createTrackMap();

function togglePauseTrack() {
  curSound.togglePause();
}

// Plays stops the current track and plays the next track.
function playNextTrack() {
  if (curIndex == curTracks.length) {
    // TODO: change this
    alert("No more songs in current tracks");
  }

  if (curSound != null) {
    curSound.destruct();
  }

  var id = curTracks[curIndex].id;
  var title = curTracks[curIndex].title;
  curIndex++;

  console.log("ID: ".concat(id, " Title: ", title));
  SC.stream("/tracks/".concat(id), {onfinish: playNextTrack}, function(sound) {
    console.log(sound);
    curSound = sound;
    sound.play();
  });
}

// Gets a set of tracks from a genre and starts playing them.
// TODO: add a structure keeping track of each genre's list so that they don't
// repeat when we go back to the same genre.
function playGenre(genre) {
  if (curTracks != null) {
    
  }

  SC.get('/tracks', { genres: genre.toLowerCase(), stream: true }, function(tracks) {
    curTracks = tracks;
    curIndex = 0;
    console.log(tracks);
    playNextTrack();
  });
}

function createTrackMap() {
	var map	= {};
	for (var i = 0; i < genreList.length; i++) {
		map[genreList[i]] = {tracks: null, index: -1};
	}
}
