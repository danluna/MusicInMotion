window.onload = function() {
	document.getElementById("test1").innerHTML = "JS loading start";	


	// initialize client with app credentials
	SC.initialize({
		client_id: '4a4e35aed5c587e1c7296ddbd13e8926',
		// Make sure it matches with the preset uri online.
		redirect_uri: 'http://127.0.0.1:3000/'
	});

	playGenre("metal");
}

// Global Variables for keeping track of the song being played.
var currentTracks;	
var currentIndex;
var curSound;


function togglePauseTrack() {
	curSound.togglePause();
}

// Plays stops the current track and plays the next track.
function playNextTrack() {
	if (currentIndex == currentTracks.length) {
		// TODO: change this
		alert("No more songs in current tracks");
	}

	if (curSound != null) {
		curSound.destruct();
	}

	var id = currentTracks[currentIndex].id;
	var title = currentTracks[currentIndex].title;
	currentIndex++;

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
	SC.get('/tracks', { genres: genre, stream: true }, function(tracks) {
		currentTracks = tracks;
		currentIndex = 0;
		console.log(tracks);
		playNextTrack();
	});
}	
	

	/*
	Authentication of user

	document.getElementById("test2").innerHTML = "SC initialized";	
	
	// initiate auth popup
	SC.connect(function() {
		SC.get('/me', function(me) { 
			alert('Hello, ' + me.username); 
			document.getElementById("test3").innerHTML = "Connected to SC";	
		});
	});
	*/
