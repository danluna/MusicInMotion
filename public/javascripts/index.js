$(document).ready(function() { 


  // initialize client with app credentials
  SC.initialize({
    client_id: '4a4e35aed5c587e1c7296ddbd13e8926',
    // Make sure it matches with the preset uri online.
    redirect_uri: 'http://127.0.0.1:3000/'
  });

  $("#soundPlayer").draggable({revert: "invalid"});

  var genreBoxColor;

  $(".genreBox").on("mouseout", function() {
    $(this).css("background-color", genreBoxColor);
  });
  
  $("#genreBox" + scrollHighlighter).css("color", "red");
  $("#genreBox" + scrollHighlighter).css("border-color", "#F0F0F0");
  
  $("#genreList").css("opacity", "1.0");
  $("#playlistArea").css("opacity", "0.4");
});



// Global Variables for keeping track of the song being played.
var curTracks;  
var curIndex;
var curSound;
var curGenre;
var volume = 50;
var curSet;
var selectionGenre = true;
var genreList = [
	"Ambient", "Classical", "Country", "Dance",
	"Electronic", "Folk", "Hip Hop", "Jazz",
	"Metal", "Pop", "Rap", "Rock", "Techno"
];

var genreTrackMap = createGenreTrackMap();
var playlistMap = createPlaylistMap();
var isPlaylist = false;

function togglePauseTrack() {
  if (curSound != null) {
    curSound.togglePause();
  }
}

function playPrevTrack() {
  if (curIndex <= 0) {
    return;
  }   

  curIndex--;
 
  if (curSound != null) {
    curSound.stop();
  }

  var id = curTracks[curIndex].id;
  var title = curTracks[curIndex].title;
  var imageURL = curTracks[curIndex].artwork_url;
  
  // TODO: Set default image if imageURL is null
  if (imageURL != null) {
    imageURL = imageURL.replace("large", "t300x300");
  }
  $("#soundImage").attr("src", imageURL);


  console.log("ID: ".concat(id, " Title: ", title));
  SC.stream("/tracks/".concat(id), {onfinish: playNextTrack}, function(sound) {
    console.log(sound);
    curSound = sound;
    sound.setVolume(volume);
    sound.play();
  });
}

// Plays stops the current track and plays the next track.
function playNextTrack() {
  if (curIndex == curTracks.length) {
    return;
  }
  curIndex++;
  
  if (curSound != null) {
    curSound.stop();
  }


  console.log(curTracks);
  var id = curTracks[curIndex].id;
  var title = curTracks[curIndex].title;
  var imageURL = curTracks[curIndex].artwork_url;
 
  displayMetadata();
 
  // TODO: Set default image if imageURL is null
  if (imageURL != null) {
    imageURL = imageURL.replace("large", "t300x300");
  }
  $("#soundImage").attr("src", imageURL);


  console.log("ID: ".concat(id, " Title: ", title));
  SC.stream("/tracks/".concat(id), {onfinish: playNextTrack}, function(sound) {
    console.log(sound);
    curSound = sound;
    sound.setVolume(volume);
    sound.play();
  });
}

// Gets a set of tracks from a genre and starts playing them.
function playGenre(genre) {
  if (curSet == genre) {
    return;
  }
  saveCurrentQueue();
  isPlaylist = false;
  curSet = genre;
  
  if (curSound != null) {
    curSound.stop();
  }

  curGenre = genre;
  if (genreTrackMap == null || genreTrackMap[genre] == null ||
      genreTrackMap[genre].tracks == null || genreTrackMap[genre].index >= 50) {
    SC.get('/tracks', { genres: genre.toLowerCase(), stream: true }, function(tracks) {
      curTracks = tracks;
      curIndex = -1;
    
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
  if (curSet == playlistName) {  
    return;
  }
  
  console.log(playlistName);

  if (playlistMap[playlistName] == null) {
    return;
  }

  saveCurrentQueue();
  isPlaylist = true;
  curSet = playlistName; 

  var plist = playlistMap[playlistName];
  console.log(plist);
  curTracks = plist.list;
  curIndex = plist.index;
  
  if (curTracks.length == 0) {
    return;
  } else {
    // Make sure the index is in a valid range.
    curIndex = (curIndex % curTracks.length) - 1;

    playNextTrack();
  }
}

function saveCurrentQueue() {
  if (curTracks != null) {
    if(isPlaylist) {
      playlistMap[curSet] = {tracks: curTracks, index: curIndex % curTracks.length};
    } else {
      genreTrackMap[curGenre] = {tracks: curTracks, index: curIndex}; 
    }
  }
}

function displayMetadata() {
  var user = curTracks[curIndex].user.username;
  var title = curTracks[curIndex].title;
  $("#song_title").html(title);
  $("#user").html(user);
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
  if (curSound == null) {
    return;
  }
  if (volume > 90) {
    volume = 100;
  } else {
    volume += 10;
  }
  curSound.setVolume(volume);
}

function lowerVolume() {
  if (curSound == null) {
    return;
  }
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
  playlistIndices = [];
  playlists["My Playlist"] = {list: [], index: -1};
  playlistIndices[0] = "My Playlist";
  playlists["My Mom's Playlist"] = {list: [], index: -1};
  playlistIndices[1] = "My Mom's Playlist";
  playlists["My Enemy's Playlist"] = {list: [], index: -1};
  playlistIndices[2] = "My Enemy's Playlist";
  playlists["Your Playlist"] = {list: [], index: -1};
  playlistIndices[3] = "Your Playlist";
  
  // Initialize playlist names  
  $("#p1").html(playlistIndices[0]);
  $("#p2").html(playlistIndices[1]);
  $("#p3").html(playlistIndices[2]);
  $("#p4").html(playlistIndices[3]);
  return playlists;
}

function createPlaylist(name) {
  if (playlistMap[name] != null) {
    return;
  } else {
    playlistMap[name] = {list: [], index: -1};
  }
}

function deletePlaylist(name) {
  delete playlistMap[name];
}

function pushPlaylist() {
  if (selectionGenre) {
    return;
  } 
  console.log(playlistMap);
  addToPlaylist(playlistMap[playlistIndices[playlistIndex]].list);
}

function popPlaylist() {
  if (selectionGenre) {
    return;
  }
  removeFromPlaylist(playlistMap[playlistIndices[playlistIndex]].list);
}

function addToPlaylist(playlist) {
  playlist.push(curTracks[curIndex]);
}

function removeFromPlaylist(playlist) {
  playlist.splice(playlist.length - 1, 1);
}


function scrollUp() {
  if (selectionGenre) {
    genreScrollUp();
  } else {
    playlistScrollUp();
  }
}

function scrollDown() {
  if (selectionGenre) {
    genreScrollDown();
  } else {
    playlistScrollDown();
  }
}

// Global variables for keeping track of the genre bar
var genreIndex = 0;
var selectedBox;
var scrollHighlighter = 0;
var playlistIndex = 0;

function playlistScrollUp() {
  // Check if highlighter at end of list
  if(playlistIndex < 3) {
    playlistIndex++;
    nextScrolledPlaylist();
  }
}

function playlistScrollDown() {
  // Check if highlighter at end of list
  if(playlistIndex > 0) {
    playlistIndex--;
    nextScrolledPlaylist();
  }
}

function nextScrolledPlaylist() {
  $("#p" + (playlistIndex + 2)).css("border-color", "#F0F0F0");
  $("#p" + (playlistIndex)).css("border-color", "#F0F0F0");

  $("#p" + (playlistIndex + 1)).css("border-color", "red");
  
  $("#p" + (playlistIndex + 2)).css("color", "#F0F0F0");
  $("#p" + (playlistIndex)).css("color", "#F0F0F0");

  $("#p" + (playlistIndex + 1)).css("color", "red");
}

function genreScrollDown() {

  // Check if highlighter at end of list
  if(scrollHighlighter == 5 && genreIndex == 7) {
    // At very bottom, no need to scroll down
  } else if(scrollHighlighter == 5) {
    genreIndex++;
    $("#genreBox0").html(genreList[genreIndex]);
    $("#genreBox1").html(genreList[genreIndex + 1]);
    $("#genreBox2").html(genreList[genreIndex + 2]);
    $("#genreBox3").html(genreList[genreIndex + 3]);
    $("#genreBox4").html(genreList[genreIndex + 4]);
    $("#genreBox5").html(genreList[genreIndex + 5]);
  } else { // Scroll was not at last index
    scrollHighlighter++;
    //genreIndex++;
    nextScrolledBar();
  }
}

function genreScrollUp() {
  if(genreIndex == 0 && scrollHighlighter == 0) {
    // No need to do anything
  } else if (scrollHighlighter == 0) {
    genreIndex--;
    $("#genreBox0").html(genreList[genreIndex]);
    $("#genreBox1").html(genreList[genreIndex + 1]);
    $("#genreBox2").html(genreList[genreIndex + 2]);
    $("#genreBox3").html(genreList[genreIndex + 3]);
    $("#genreBox4").html(genreList[genreIndex + 4]);
    $("#genreBox5").html(genreList[genreIndex + 5]);
  } else {
    scrollHighlighter--;
    nextScrolledBar();
  }
}

// Highlight the correct genreBox
function nextScrolledBar() {
  //$("#genreBox" + scrollHighlighter).css("background-color", "green");
  $("#genreBox" + (scrollHighlighter + 1)).css("border-color", "#F0F0F0");
  $("#genreBox" + (scrollHighlighter - 1)).css("border-color", "#F0F0F0");

  $("#genreBox" + scrollHighlighter).css("color", "red");
  $("#genreBox" + scrollHighlighter).css("border-color", "#F0F0F0");
  $("#genreBox" + (scrollHighlighter + 1)).css("color", "#F0F0F0");
  $("#genreBox" + (scrollHighlighter - 1)).css("color", "#F0F0F0");
}

function selectGroup() {
  if (selectionGenre) {
    selectGenre();
  } else {
    selectPlaylist();
  }
}

// Call to start playing a specific genre.
// The correct genre identified by the genreIndex.
function selectGenre() {
  console.log("Select new genre ".concat(genreList[genreIndex + scrollHighlighter]));
  playGenre(genreList[genreIndex + scrollHighlighter]);
}

function selectPlaylist() {
  console.log("Select playlist ".concat(playlistIndex));
  playPlaylist(playlistIndices[playlistIndex]);  
}

function toggleSelection() {
  selectionGenre = !selectionGenre;
  if (selectionGenre) {
    $("#genreList").css("opacity", "1.0");
    $("#playlistArea").css("opacity", "0.4");
    
    $("#p".concat((playlistIndex + 1))).css("border-color", "#F0F0F0");
    $("#p".concat((playlistIndex + 1))).css("color", "#F0F0F0");
    
    $("#genreBox" + scrollHighlighter).css("color", "red");
    $("#genreBox" + scrollHighlighter).css("border-color", "#F0F0F0");
  } else {
    $("#genreList").css("opacity", "0.4");
    $("#playlistArea").css("opacity", "1.0");
    console.log(playlistIndex); 
    $("#p".concat(playlistIndex + 1)).css("border-color", "red");
    $("#p".concat(playlistIndex + 1)).css("color", "red");
    
    $("#genreBox" + scrollHighlighter).css("color", "#F0F0F0");
  } 
}
