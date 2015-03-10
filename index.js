(function(){
  var irc = require('irc');

  var server = 'chat.freenode.net';
  var botName= 'mmis1000_bullet';
  var client = new irc.Client(server, botName, {
    channels: ['#sitcon', '#ysitd']
  });
  
  client.on("raw", function(e){
    if (e.command === "rpl_welcome") {
      botName = e.args[0];
    }
  });
  
  module.exports.client = client;
  
  var listeners = []
  
  module.exports.on = module.exports.addListener = function on(ev, listener) {
    listeners.push([ev, listener]);
    client.on(ev, listener);
  }
  
  module.exports.resetListeners = function resetListeners() {
    console.log(listeners)
    listeners.forEach( function(item) {
      client.removeListener(item[0], item[1])
      return true;
    });
    listeners = [];
  }
  
  module.exports.getSelfName = function resetListeners() {
    return botName;
  }
  
  
  
}());