var Clay = require('@rebble/clay');
var clayConfig = require('./config');
var clay = new Clay(clayConfig, null, { autoHandleEvents: false });
clay.registerComponent(require('./clayTextarea'));

Pebble.addEventListener('ready', function() {
    console.log('PebbleKit JS ready!');
    var note;
    var font_size;
    if(localStorage['AppKeyNote'] && localStorage['font_size'] ) {
        note = localStorage.getItem('AppKeyNote');
        font_size = localStorage.getItem('AppKeyFontSize');
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
    localStorage.setItem('AppKeyNote', note);
    var font_size = configData['AppKeyFontSize']['value'];
    localStorage.setItem('AppKeyFontSize', font_size);

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
