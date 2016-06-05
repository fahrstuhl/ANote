Pebble.addEventListener('ready', function() {
    console.log('PebbleKit JS ready!');
    var note;
    var font_size;
    if(localStorage['note'] && localStorage['font_size'] ) {
        note = localStorage.getItem('note');
        font_size = localStorage.getItem('font_size');
    }
    else {
        note = "Please set your note in the settings";
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
    var url = 'https://what.re/pebble/config/index.html';
    console.log('Showing configuration page: ' + url);

    Pebble.openURL(url);
});

Pebble.addEventListener('webviewclosed', function(e) {
    var configData = JSON.parse(decodeURIComponent(e.response));
    console.log('Configuration page returned: ' + JSON.stringify(configData));

    var note = configData['note_input']
    localStorage.setItem('note', note);
    var font_size = configData['font_size'];
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
