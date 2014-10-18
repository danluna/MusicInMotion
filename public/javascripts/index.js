$(document).ready(function() { 

  // initialize client with app credentials
  SC.initialize({
    client_id: '4a4e35aed5c587e1c7296ddbd13e8926',
    // Make sure it matches with the preset uri online.
    redirect_uri: 'http://127.0.0.1:3000/'
  });

  playGenre("Metal");

  $("#soundPlayer").draggable({revert: "invalid"});


var genreBoxColor;
  $(".genreBox").on("mouseover", function() {
    genreBoxColor = $(this).css("background-color");
    $(this).css("background-color", "green");
    $(this).css('cursor', 'pointer');
  });

  $(".genreBox").on("mouseout", function() {
    $(this).css("background-color", genreBoxColor);
  });

  $("#soundPlayer").on("mouseover", function() {
    $(this).css('cursor', 'pointer');
  });

});

// Global Variables for keeping track of the song being played.
var curTracks;  
var curIndex;
var curSound;
var curGenre;
var volume = 50;
var genreList = [
	"Ambient", "Classical", "Country", "Dance",
	"Electronic", "Folk", "Hip Hop", "Jazz",
	"Metal", "Pop", "Rap", "Rock", "Techno"
];

var genreTrackMap = createGenreTrackMap();
var playlistMap = createPlaylistMap();
var isPlaylist = false;

function togglePauseTrack() {
  curSound.togglePause();
}

// Plays stops the current track and plays the next track.
function playNextTrack() {
  if (curIndex == curTracks.length) {
    // TODO: change this
    alert("No more songs in the track queue");
  }

  if (curSound != null) {
    curSound.destruct();
  }

  var id = curTracks[curIndex].id;
  var title = curTracks[curIndex].title;
  var imageURL = curTracks[curIndex].artwork_url;
  
  // TODO: Set default image if imageURL is null
  $("#artImage").attr("src", imageURL);

  curIndex++;

  console.log("ID: ".concat(id, " Title: ", title));
  SC.stream("/tracks/".concat(id), {onfinish: playNextTrack}, function(sound) {
    console.log(sound);
    curSound = sound;
    sound.setVolume(volume);
    sound.play();
  });
}

// Gets a set of tracks from a genre and starts playing them.
// TODO: add a structure keeping track of each genre's list so that they don't
// repeat when we go back to the same genre.
function playGenre(genre) {
  saveCurrentQueue();
  isPlaylist = false;

  curGenre = genre;
  if (genreTrackMap == null || genreTrackMap[genre] == null ||
      genreTrackMap[genre].tracks == null || genreTrackMap[genre].index >= 50) {
    SC.get('/tracks', { genres: genre.toLowerCase(), stream: true }, function(tracks) {
      curTracks = tracks;
      curIndex = 0;
    
      console.log(tracks);
      playNextTrack();
    });
  } else {
    curTracks = genreTrackMap[genre].tracks;
    curIndex = genreTrackMap[genre].index;
    playNextTrack();
  }
}


function playPlaylist(playlistName) {
  if (playlistMap[playlistName] == null) {
    alert("This playlist does not exist!");
  }

  saveCurrentQueue();
  isPlaylist = true;
 
  var plist = playlistMap[playlistName];
  var curTracks = plist.list;
  var curIndex = plist.index;
  
  if (curTracks.length == 0) {
    alert("No tracks in this playlist");
  } else {
    // Make sure the index is in a valid range.
    curIndex = curIndex % curTracks.length;

    playNextTrack();
  }
}

function saveCurrentQueue() {
  if (curTracks != null) {
    if(isPlaylist) {
      playlistMap = {tracks: curTracks, index: (curIndex + 1) % curTracks.length};
    } else {
      genreTrackMap[curGenre] = {tracks: curTracks, index: curIndex + 1}; 
    }
  }
}


function createGenreTrackMap() {
	var map	= {};
	for (var i = 0; i < genreList.length; i++) {
		map[genreList[i]] = {tracks: null, index: -1};
	}
  return map;
}

// Volume stuff.
function raiseVolume() {
  if (volume > 90) {
    volume = 100;
  } else {
    volume += 10;
  }
  curSound.setVolume(volume);
}

function lowerVolume() {
  if (volume < 10) {
    volume = 0;
  } else {
    volume -= 10;
  }
  curSound.setVolume(volume);
}


// Playlist stuff
function createPlaylistMap() {
  var playlists = {};
  playlists["My Playlist"] = {list: [], index: -1};
  playlists["My Mom's Playlist"] = {list: [], index: -1};
  return playlists;
}

function createPlaylist(name) {
  if (playlistMap[name] != null) {
    alert("This playlist already exists!");
  } else {
    playlistMap[name] = {list: [], index: -1};
  }
}

function deletePlaylist(name) {
  delete playlistMap[name];
}

function addToPlaylist(playlist) {
  playlist.push(curTracks[curIndex]);
}

function removeFromPlaylst(playlist) {
  playlist.splice(curIndex, 1);
}

/*
 * Genre calling methods, remove after using indices in html to call.
 */
function playMetal() {
  playGenre("Metal");
}

function playClassical() {
  playGenre("Classical");
}
