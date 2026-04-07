var Clay = require('@rebble/clay');
var clayConfig = require('./config');
var clay = new Clay(clayConfig, null, { autoHandleEvents: false });
clay.registerComponent(require('./clayTextarea'));

Pebble.addEventListener('ready', function() {
    console.log('Watch requested info from Pebble app and  PebbleKit JS is ready!');
    var note;
    var font_size;
    if(localStorage['note_input'] && localStorage['font_size'] ) {
        note = localStorage.getItem('note_input');
        font_size = localStorage.getItem('font_size');
    }
    else {
        note = "Please enter your note in the settings";
        font_size = 24;
    }
    var dict = {};

    var buffer = [];
    var utf8 = unescape(encodeURIComponent(note));
    for (var i = 0; i < utf8.length; i++) {
        buffer.push(utf8.charCodeAt(i));
    }
    buffer.push(0);

    dict['AppKeyNote'] = buffer;
    dict['AppKeyNoteLength'] = buffer.length;
    dict['AppKeyFontSize'] = parseInt(font_size);
    console.log('Sending: ' + JSON.stringify(dict))
    // Send to watchapp
    Pebble.sendAppMessage(dict, function() {
        console.log('Send successful: ' + JSON.stringify(dict));
    }, function() {
        console.log('Send failed!');
    });
});

Pebble.addEventListener('showConfiguration', function() {
    Pebble.openURL(clay.generateUrl()); 
});

Pebble.addEventListener('webviewclosed', function(e) {
    var configData = clay.getSettings(e.response, false);
    console.log('Clay returned: ' + JSON.stringify(configData));

    var note = configData['AppKeyNote']['value']
    localStorage.setItem('note_input', note);
    var font_size = configData['AppKeyFontSize']['value'];
    localStorage.setItem('font_size', font_size);

    var dict = {};

    var buffer = [];
    var utf8 = unescape(encodeURIComponent(note));
    for (var i = 0; i < utf8.length; i++) {
        buffer.push(utf8.charCodeAt(i));
    }
    buffer.push(0);

    dict['AppKeyNote'] = buffer;
    dict['AppKeyNoteLength'] = buffer.length;
    dict['AppKeyFontSize'] = parseInt(font_size);
    console.log('Sending: ' + JSON.stringify(dict))
    // Send to watchapp
    Pebble.sendAppMessage(dict, function() {
        console.log('Send successful: ' + JSON.stringify(dict));
    }, function() {
        console.log('Send failed!');
    });
});
