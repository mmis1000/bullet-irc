(function(){
  var irc = require('irc');

  var server = 'chat.freenode.net';
  var botName= 'bullet_bot';
  var client = new irc.Client(server, botName, {
    channels: ['#sitcon', '#ysitd']
  });

  module.exports.client = client;
  
  var listeners = []
  
  module.exports.on = module.exports.addListener = function on(ev, listener) {
    listeners.push([ev, listener]);
    client.on(ev, listener);
  }
  
  module.exports.resetListeners = function resetListeners() {
    listeners.forEach( function(item) {
      client.removeListener(item[0], item[1]);
    });
    listeners = [];
  }

}());