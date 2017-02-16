/*
 *  Copyright (c) 2017 Dialogic Inc. All Rights Reserved.
 *
/* global TimelineDataSeries, TimelineGraphView */

'use strict';
//########### Selector section code  ###########
window.audioInputSelect = document.querySelector('select#audioSource');
window.audioOutputSelect = document.querySelector('select#audioOutput');
window.videoSelect = document.querySelector('select#videoSource');
window.selectors = [audioInputSelect, audioOutputSelect, videoSelect];
window.devicesButton = document.getElementById("devicesButton");
devicesButton.onclick = toggleDeviceSelection;
devicesButton.disabled = true;
window.deviceSelector = document.getElementById('deviceSelector');


//Call the function to start the population
navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);


function toggleDeviceSelection(){
    if(deviceSelector.style.display === 'none'){
        navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
        deviceSelector.style.display = 'block';
    } else {
        deviceSelector.style.display = 'none';
    }
    
}

function gotDevices(deviceInfos) {
    trace("Entering gotDevices")
  // Handles being called several times to update labels. Preserve values.
  var values = selectors.map(function(select) {
    return select.value;
  });
  selectors.forEach(function(select) {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (var i = 0; i !== deviceInfos.length; ++i) {
    var deviceInfo = deviceInfos[i];
    var option = document.createElement('option');
      //enable this print if you want to show the full device list
      //trace(option);
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'audioinput') {
      option.text = deviceInfo.label ||
          'microphone ' + (audioInputSelect.length + 1);
      audioInputSelect.appendChild(option);
        
    } else if (deviceInfo.kind === 'audiooutput') {
      option.text = deviceInfo.label || 'speaker ' +
          (audioOutputSelect.length + 1);
      audioOutputSelect.appendChild(option);
    } else if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
      videoSelect.appendChild(option);
    } else {
      trace('Some other kind of source/device: ', deviceInfo);
    }
  }
  selectors.forEach(function(select, selectorIndex) {
    if (Array.prototype.slice.call(select.childNodes).some(function(n) {
      return n.value === values[selectorIndex];
    })) {
      select.value = values[selectorIndex];
    }
  });
    //Once populated letting the button be pushed.
    devicesButton.disabled = false;
}

// Attach audio output device to video element using device/sink ID.
function attachSinkId(element, sinkId) {
    trace("attachSinkID"+element+sinkId)
  if (typeof element.sinkId !== 'undefined') {
    element.setSinkId(sinkId)
    .then(function() {
      trace('Success, audio output device attached: ' + sinkId);
    })
    .catch(function(error) {
      var errorMessage = error;
      if (error.name === 'SecurityError') {
        errorMessage = 'You need to use HTTPS for selecting audio output ' +
            'device: ' + error;
      }
      console.error(errorMessage);
      // Jump back to first output device in the list as it's the default.
      audioOutputSelect.selectedIndex = 0;
    });
  } else {
    console.warn('Browser does not support output device selection.');
  }
}
//TODO: This needs to be updated with the eventual window that will show the stream
window.AudioOutElement = null;
function changeAudioDestination() {
  trace("changeAudioDestination to "+audioOutputSelect.value);
  var audioDestination = audioOutputSelect.value;
  attachSinkId(AudioOutElement, audioDestination);
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}


audioInputSelect.onchange = changeInputSource;
videoSelect.onchange = changeInputSource;
audioOutputSelect.onchange = changeAudioDestination;


function changeInputSource() {
      onConstraintChange();
//      UpdateUserMedia();
}


//########### Constrains code  ###########
window.constraintsButton = document.getElementById("constraintsButton");
constraintsButton.onclick = toggleConstraintSelection;
window.constrainSelector = document.getElementById('ConstraintsSelector');
window.videoSizeSelect = document.querySelector('select#videoSize');
videoSizeSelect.onchange=onConstraintChange;

window.sendVideo = document.getElementById("sendVideo");
sendVideo.onclick = onConstraintChange;
window.sendAudio = document.getElementById("sendAudio");
sendAudio.onclick = onConstraintChange;

function toggleConstraintSelection(){
    trace("ToggleConstraintSelection");
    if(constrainSelector.style.display === 'none'){
        constrainSelector.style.display = 'block';
    } else {
        constrainSelector.style.display = 'none';
    }
    
}
populateVideoSizeSelector();
function populateVideoSizeSelector(){
    trace("Populateing Video Size Selector");
    
    var HD = document.createElement('option');
    HD.text = 'HD 1280x720 (16:9)';
    videoSizeSelect.appendChild(HD);
    var VGA = document.createElement('option');
    VGA.text = 'VGA 640x480 (4:3)';
    videoSizeSelect.appendChild(VGA);
    var QVGA = document.createElement('option');
    QVGA.text = 'QVGA 320x240 (4:3)';
    videoSizeSelect.appendChild(QVGA);
    var CIF = document.createElement('option');
    CIF.text = 'CIF 352x288 (4:3)';
    videoSizeSelect.appendChild(CIF);
    var QCIF = document.createElement('option');
    QCIF.text = 'QCIF 176x144 (4:3)';
    videoSizeSelect.appendChild(QCIF);
}
window.videoWidth = "1280";
window.videoHeight = "720";

var constraints = {
      audio: true,
        video: {
			width: {
				min: "256",
				max: "1280",
                ideal: "1280"
			},
			height: {
				min: "144",
				max: "720",
                ideal: "720"
			}
		}  };
window.autoUpdateOnChange = true;
function onConstraintChange() {
    trace("Update Constraints");
    var sizeRegex =/(\d*?)x(\d*?) /g;
    var match = sizeRegex.exec(videoSizeSelect.value);
    videoWidth = match[1];
    videoHeight = match[2];
    var audioSource = audioInputSelect.value;
    var videoSource = videoSelect.value;
    
  constraints = {
     audio: sendAudio.checked ? {deviceId: audioSource ? {exact: audioSource} : undefined} : false,
     video: sendVideo.checked ?  {deviceId: videoSource ? {exact: videoSource} : undefined,
            width: {
				min: "256",
				max: "1280",
                ideal: videoWidth
			},
			height: {
				min: "144",
				max: "720",
                ideal: videoHeight
			} 
        }  : false 
  }
    trace("New constraints:");
    trace(constraints);
    if(autoUpdateOnChange){
        UpdateUserMedia();
    }
}


//########### GetUserMedia Code  ###########
window.GUMButton = document.getElementById("GUMButton");
GUMButton.onclick = UpdateUserMedia;
window.userMediaStream = null;
function UpdateUserMedia() {
    trace("UpdateUserMedia")
   
    
  trace("Calleing GetUserMedia w/ constraints=" );
  trace(constraints);
  navigator.mediaDevices.getUserMedia(constraints).
      then(gotUserStream).catch(handleError);
    
}
function gotUserStream(stream){
    trace("Entering gotUserStream " )
    trace( stream);
    
    // first checking if I had a stream before, if so stopping all the tracks
     if (userMediaStream) {
        trace("Stopping all tracks on UserMediaStream");
        userMediaStream.getTracks().forEach(function(track) {
          track.stop();
        });
      } else {
          trace("UserMediaStream is not active");
      }
    
    //Now setting the user media to the new stream
    window.userMediaStream = stream;
    
    //Checking to see if the PeerConnect Input stream has been setup
    // if not seeding the stream with the user media stream
    //  Note, I do not use the userStream directly as the Input stream
    //  to allow in the future to swas the PCInput to an alternate source
    //  while maintaining the streams fetched by the GUM
    if(!PCinputStream){
        trace("Cloning userMedia Stream as seed for PCinput Stream");
        PCinputStream = window.userMediaStream.clone();
    
    } else if (usingUserMedia){
        trace("Remove all current tracks on PCInputStream-");
        PCinputStream.getTracks().forEach(function(track) {
          trace(track);
          PCinputStream.removeTrack(track);
        });
        trace("Addeding new userMediaStreams to PCInputStream-");
        userMediaStream.getTracks().forEach(function(track){
            trace(track);
            PCinputStream.addTrack(track);
        });
      } else {
          trace("UserMediaStream no change needed to PCInputStream");
      }
    UpdateLocalVideo();
    // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices().then(gotDevices);
}


// ################### Local Video and PC Input Stream ########################

window.usingUserMedia = true;
window.localVideo = document.getElementById('localVideo');

window.PCinputStream = new MediaStream();
window.PCinputStream.onaddtrack = onPCinputStreamTrackAdd;
window.PCinputStream.onremovetrack = onPCinputStreamTrackRemove;


window.LocalVideoButton = document.getElementById('LocalVideoButton');
LocalVideoButton.onclick = toggleLocalVideoSelection;
window.LocalVideoContainer = document.getElementById('LocalVideoContainer');

UpdateLocalVideo();

function UpdateLocalVideo(){
    localVideo.srcObject = PCinputStream;
    
}


function onPCinputStreamTrackAdd(event){
    trace("Added "+event.type+" track to PCinputStream");
    trace(event.track);
}
function onPCinputStreamTrackRemove(event){
    trace("Removing "+event.type+" track to PCinputStream");
    trace(event.track);
}

function toggleLocalVideoSelection(){
    trace("ToggleLocalVideoSelection");
    if(LocalVideoContainer.style.display === 'none'){
        LocalVideoContainer.style.display = 'block';
    } else {
        LocalVideoContainer.style.display = 'none';
    }
    
}
























