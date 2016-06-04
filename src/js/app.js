Pebble.addEventListener('ready', function() {
  console.log('PebbleKit JS ready!');
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

  var dict = {};

  var buffer = [];
  var utf8 = unescape(encodeURIComponent(note));
  for (var i = 0; i < utf8.length; i++) {
      buffer.push(utf8.charCodeAt(i));
  }
  buffer.push(0);

  dict['AppKeyNote'] = note;
  dict['AppKeyNoteLength'] = note.length;
  console.log('Sending: ' + JSON.stringify(dict))
  // Send to watchapp
  Pebble.sendAppMessage(dict, function() {
    console.log('Send successful: ' + JSON.stringify(dict));
  }, function() {
    console.log('Send failed!');
  });
});
