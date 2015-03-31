(function(){
  require('coffee-script/register')
  
  
  var irc = require('irc');
  var Gaze = require('gaze').Gaze;
  var Storage = require('./node_lib/storage');
  var gaze;
  var mainWindow;
  
  
  
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
  
  module.exports.getNewSession = function (window) {
    mainWindow = window;
    this.resetListeners();
    if (!gaze) {
      gaze = new Gaze(['lib/**/*', 'index.html']);

      gaze.on('all', function(event, filepath) {
        if (mainWindow && mainWindow.location) {
          mainWindow.location.reload();
        }
      });
    }
    
    return this;
  }
  
  module.exports.on = module.exports.addListener = function on(ev, listener) {
    listeners.push([ev, listener]);
    client.on(ev, listener);
  }
  
  module.exports.resetListeners = function resetListeners() {
    //console.log(listeners)
    listeners.forEach( function(item) {
      client.removeListener(item[0], item[1])
      return true;
    });
    listeners = [];
  }
  
  module.exports.getSelfName = function resetListeners() {
    return botName;
  }
  
  function safeToString(x) {
    switch (typeof x) {
      case 'object':
        return 'object';
      case 'function':
        return 'function';
      default:
        return x + '';
    }
  }
  
  var storages = {};
  
  module.exports.getStorage = function getStorage(name) {
    name = safeToString(name);
    name = new Buffer(name).toString('base64').replace('/', '-');
    if (storages[name] === undefined) {
      storages[name] = new Storage('./save/' + name + '.json')
    }
    return storages[name];
  }

}());