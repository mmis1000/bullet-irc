var service = require('./index.js').getNewSession(window);

service.addListener('error', function (err) {
  console.error();
});
service.addListener('registered', function (from, to, message) {
  console.log('connect');
  bullet('connected!');
});
service.addListener('message', function (from, to, message) {
  console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + " " + from + ' => ' + to + ': ' + message);
  bullet(
    colorize(from) + ' => ' + colorize(to) + ': ' + parseLink(parseColor(safe_tags_replace(message))),
    {
      sender : from,
      target : to
    }
  );
});
service.addListener('ctcp', function (from, to, message) {
  if (message.search(/^action/i) === 0) {
    message = message.replace(/^action\s/i, '');
    console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + " " + to + ' * ' + from + ' ' + message);
    bullet(
      colorize(to) + ' * ' + colorize(from) + ' ' + parseColor(safe_tags_replace(message)),
      {
        sender : from,
        target : to
      }
    );
  }
});


storage = service.getStorage('profile')
storage.useQuery = false;

timeRemain = 8000;
space = 80;

var tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};
function replaceTag(tag) {
    return tagsToReplace[tag] || tag;
}
function safe_tags_replace(str) {
    return str.replace(/[&<>]/g, replaceTag);
}
var getColor = function() {
  var cache = {};
  var crypto = require('crypto');
  
  function md5(str) { 
    var md5sum = crypto.createHash('md5'); 
    md5sum.update(str); 
    str = md5sum.digest('hex'); 
    return str; 
  };
  
  function getColor_(str) {
    if (cache[str]) {
      return cache[str];
    }
    
    if (typeof md5 !== "undefined") {
      var frag = parseInt(md5(str.charAt(0)=='?'? str.substr(2):str).substring(0,6), 16);
    } else {
      var frag = Math.floor(Math.random() * 0xffffff);
      console.log('missing md5 support, using random color now!')
    }
    
    var h = Math.floor((frag & 0xff0000 >> 16) / 255 * 360);
    var s = Math.floor((frag & 0xff00 >> 8) / 255 * 20 + 80);
    var l = Math.floor((frag & 0xff) / 255 * 20 + 60);
    
    //convert color with jQuery
    var colorCode = $('<span></span>').css("color", "hsl(" + h + "," + s + "%," + l +"%)").css("color");
    
    cache[str] = colorCode;
    return colorCode;
  }
  return getColor_;
}();
function colorize(nick) {
  return '<span style="color:' + getColor(nick) + '">' + nick + '</span>';
}
var parseColor = function() {

    var colors = [
      "#FFFFFF",
      "#000000",
      "#000080",
      "#008000",
      
      "#ff0000",
      "#800040",
      "#800080",
      "#ff8040",
      
      "#ffff00",
      "#80ff00",
      "#008000",
      "#00ffff",
      
      "#0000ff",
      "#FF55FF",
      "#808080",
      "#C0C0C0"
    ];

    var style = {
      2 : {
        styles : [
          {
            key : "font-weight",
            value : "bold"
          }
        ]
      },
      15: {
        styles : [
          {
            key : "background",
            value : null
          },
          {
            key : "color",
            value : null
          },
          {
            key : "font-style",
            value : null
          },
          {
            key : "text-decoration",
            value : null
          },
          {
            key : "font-weight",
            value : null
          }
        ]
      },
      22: {
        styles:[]
      },
      29: {
        styles : [
          {
            key : "font-style",
            value : "italic"
          }
        ]
      },
      31: {
        styles : [
          {
            key : "text-decoration",
            value : "underline"
          }
        ]
      },
      3 : function(str){
        var temp, color, background,style
        style = [];
        temp = str.substring(1).split(",")
        color = colors[parseInt(temp[0])];
        if (color) {
          style.push({
            key : "color",
            value : color
          })
        }
        if (temp[1]) {
          background = colors[parseInt(temp[1])];
          if (background) {
            style.push({
              key : "background",
              value : background
            })
          }
        }
        
        return {
          styles : style
        };
        
      }
    }

    function copyOver(from, to) {
      for(var i in from) {
        if(from.hasOwnProperty(i)) {
          to[i] = from[i];
        }
      }
    }

    function wrap(text, styles) {
      if (text == null) {
        return "";
      }
      var i
      var text2 = "<span style='"
      for (i in styles) {
        if (styles.hasOwnProperty(i)) {
          text2 += i;
          text2 += ":";
          text2 += styles[i];
          text2 += ";";
        }
      }
      text2 += "'>";
      text2 += text;
      text2 += "</span>";
      return text2;
    }
    
    var parseColor_ = function(html) {
        
        var html, matchrule, matchrule2, allStyle, temp, text, styles, stylefrag, i;
        allStyle = [2, 15, 22, 29, 31, 3];
        matchrule = /((?:\u0003\d\d?,\d\d?|\u0003\d\d?|\u0002|\u001d|\u000f|\u0016|\u001f)+)/g;
        /* use "html" to prevent break links*/
        //html = $(this).html();
        temp = html.split(matchrule);
        if (temp.length === 1) {
          /*no color code, so break it at early at possible*/
          return '<span>' + html + '</span>';
        }
        for (i = 0; i < temp.length; i++) {
          text = temp[i];
          if (allStyle.indexOf(text.charCodeAt(0)) < 0) {
            continue;
          }
          styles = {};
          matchrule2 = /((?:\u0003\d\d?,\d\d?|\u0003\d\d?|\u0002|\u001d|\u000f|\u0016|\u001f))/g;
          fragTemp = matchrule2.exec(text);
          
          if (!fragTemp) {
            continue;
          }
          
          stylefrag = [];
          stylefrag.push(fragTemp[1]);
          while (fragTemp = matchrule2.exec(text)) {
            stylefrag.push(fragTemp[1]);
          }
          
          // extract styles from style frag
          stylefrag.forEach(function(el){
            var temp2, i
            var charCode = el.charCodeAt(0);
            if (style[charCode]) {
              temp2 = style[charCode]
              if (typeof temp2 === "function") {
                temp2 = temp2(el);
              }
              for (i = 0; i< temp2.styles.length; i++) {
                styles[temp2.styles[i].key] = temp2.styles[i].value;
              }
            }
            return true;
          });
          //console.log(JSON.stringify(text));
          //console.log(JSON.stringify(stylefrag));
          //insert styles into list and remove parsed tag
          temp.splice(i, 1, styles);
        }
      
        
        
        var styleTemp = {};
        for (i = 0; i < temp.length; i++) {
          if (typeof temp[i] === "object") {
            copyOver(temp[i], styleTemp);
            copyOver(styleTemp, temp[i]);
          }
        }
      
        for (i = 0; i < temp.length; i++) {
          if (typeof temp[i] === "object") {
            temp.splice(i, 2, wrap(temp[i + 1], temp[i]));
          }
        }
      
        return temp.join('')
    
    };
    
    return parseColor_;
} ();
var parseLink = function(html) {
  //console.log(html);
  var temp = $('<div>' + html + '</div>');
  
  var newContext = $('<div>')
  
  temp.find('*').each(function(){
    var _ = $(this);
    var text = _.text();
    var temp = text.split(/(https?:\/\/[^\.\s\/\<]+(?:\.[^\.\s\/\<]+)+(?:\/[^\s\<]*))/ig);
    var style = _.attr('style');
    
    if (! _.is('span')) {
      newContext.append(this);
      return;
    }
    
    //console.log(temp);
    
    for (var i = 0; i < temp.length; i++) {
      if ( (/https?:\/\/[^\.\s\/\<]+(?:\.[^\.\s\/\<]+)+(?:\/[^\s\<]*)/ig).test(temp[i]) ) {
        newContext.append(
          $('<a>')
          .text(temp[i])
          .attr('style', style)
          .attr('href', temp[i])
          .attr('target', '_blank')
        );
      } else {
        newContext.append(
          $('<span>')
          .text(temp[i])
          .attr('style', style)
        );
      }
    }
  })
  //console.log(newContext);
  return newContext.html();
}


var current = -1
var lastTime = Date.now()
var firstRowLast = -1;
function bullet(html, dataObj) {
  dataObj = dataObj || {};
  var urlMatch = /https?:\/\/[^\.\s\/\<]+(?:\.[^\.\s\/\<]+)+(?:\/[^\s\<]*)\.(?:jpe?g|gif|png)/ig
  
  images = html.match(urlMatch)
  
  var item = $('<div class="bullet hasPointer"/>').html(html);
  
  if (images) {
    item.append('<br>');
    images.forEach(function(src){
      item.append(
        $('<img alt="" title=""/>').attr('src', src).on('error', function(){
          $(this).remove();
        })
      );
    })
  }
  for (var i in dataObj) {
    if (dataObj.hasOwnProperty(i)) {
      item.attr('data-' + i, dataObj[i].toString());
    }
  }
  
  var bulletSpace = $('.bullet-space');
  var boxs = [];
  bulletSpace.find('.bullet').each(function (){
    var _ = $(this);
    var positionBase = bulletSpace.offset();
    var position = _.offset();
    boxs.push(
      AABB(
        position.left - positionBase.left, 
        position.top  - positionBase.top ,
        position.left - positionBase.left + _.width(),
        position.top  - positionBase.top + _.height()
      )
    );
  })
  //console.log(boxs);
  
  bulletSpace.append(item);
  
  
  var lastRowRemp;
  
  var itemWidth = item.width()
  var itemHeight = item.height()
  
  var width = bulletSpace.width();
  var height = bulletSpace.height();
  
  var current = space * Math.random() * 0.5;
  
  while (true) {
    //console.log(AABB( width, current, width + itemWidth, current + itemHeight));
    if ( !AABB( width, current, width + itemWidth, current + itemHeight).overlapWithBoxs(boxs) ) {
      break;
    }
    current += space;
    if ( current > height - itemHeight) {
      current = (height - itemHeight) * Math.random();
      break;
    }
  }
  /*
  lastRowTemp = Date.now() + itemWidth / width * timeRemain;
  
  if (
    (current === -1 || current + space > (height - itemHeight) * 0.8) ||
    (current > (height - itemHeight) * 0.2 + space && Date.now() > firstRowLast )
  ) {
    current = (height - itemHeight) * 0.2 - space * Math.random();
    firstRowLast = lastRowTemp;
  }
  
  
  
  
  current += space * (0.8 + Math.random() * 0.4);
  lastTime = Date.now();
  
  
  //lastRow = Date.now() + itemWidth / width * timeRemain;
  */
  
  item.css('top', current);
  item.css('left', width);
  
  var newTime = timeRemain / width * (width + itemWidth)
  
  item.animate( {left : -itemWidth} , newTime, 'linear', function(){
    item.remove();
  })
}

function setTarget (target) {
  $(".send .target").val(target)
}

function handleKeyup (e) {
  var text, target;
  var code = e.keyCode
  if (code == 13) {
    //$('.send').fadeOut();
    text = $('.send .input').val();
    $('.send .input').val('');
    
    if (text === '') {
      $('.main-wrap').fadeOut();
      return;
    }
    
    target = $(".send .target").val();
    
    service.client.say(target, text);
    
    bullet(
      colorize(service.getSelfName()) + ' => ' + colorize(target) + ': ' + parseColor(safe_tags_replace(text)),
      {
        target : target
      }
    );
    
    return;
  }  
  if (code == 27) {
    $('.main-wrap').fadeOut();
    $('.send .input').text('');
    return;
  }  
}

function handleKeydown (e) {
  if (e.keyCode === 13 || e.keyCode === 27) {
    return;
  }
    
  var target = $('.send .target');
  var input = $('.send .input');
  if ($(this).is('.input')) {
    if ($(this).caret() === 0 && e.keyCode == 37) {
      target.focus()
      target.caret(target.val().length)
      e.preventDefault();
    }
  }
  if ($(this).is('.target')) {
    if ($(this).caret() === target.val().length && e.keyCode == 39) {
      input.focus()
      input.caret(0)
      e.preventDefault();
    }
  }
}

$(function() {
  $(".moveable").draggable({ containment: "html", scroll: false });
  $(".float-icon").click(function(){
    if (!$('.main-wrap').is(":visible")) {
      $('.main-wrap').fadeToggle();
      $('.send .input').focus();
    } else {
      $('.main-wrap').fadeToggle();
    }
    
  })
  $("body").on('click', '.bullet', function(){
    console.log('click');
    var sender = $(this).attr('data-sender');
    var target = $(this).attr('data-target');
    
    if (!target) {
      return;
    }
    if (target.search('#') === 0) {
      setTarget(target);
    } else {
      if (sender) {
        setTarget(sender);
      } else {
        setTarget(target);
      }
    }
    if (!$('.main-wrap').is(":visible")) {
      $('.main-wrap').fadeToggle();
    }
    $('.send .input').focus()
  });
  $('.send').keyup(handleKeyup);
  $('.send .input').keydown(handleKeydown);
  $('.send .target').keydown(handleKeydown);
  
  
  var positions = storage.get('positions', {});
  var position;javascript:void(0);
  
  for (var i in positions) {
    if (positions.hasOwnProperty(i)) {
      position = positions[i];
      $(i).css({
        top : position.top,
        left : position.left,
        width : position.width,
        height : position.height,
        position : position.position
      })
    }
  }
  
  $('.memoryable').on('resize drag stop', function () {
    //console.log('position update');
    var element = $(this);
    var id = element.attr('id');
    positions['#' + id] = {
      top : element.css('top'),
      left : element.css('left'),
      width : element.width(),
      height : element.height(),
      position : element.css('position'),
    }
    storage.set('positions', positions);
  })
  createFloatWindow('http://google.com/');
});

function createFloatWindow(url) {
  var currentPositionAndSize;
  var minHeight;
  var handles = {
    max : [
      {
        text: "min",
        icon: "ui-icon-minusthick",
        click: function( e ) {
          currentPositionAndSize = $(this).dialog('getPositionAndSize');
          
          $(this).dialog('animate', {
            'width' : "200px",
            'height' : minHeight,
            left : screen.width,
            top : 0
          }, null, null,'right-top');
          $(this).dialog('option', 'iconButtons', handles.min);
          $(this).dialog('option', 'resizable', false);
          $(this).dialog('option', 'draggable', false);
          
        }
      }
    ],
    min : [
      {
        text: "max",
        icon: "ui-icon-plusthick",
        click: function( e ) {
          $(this).dialog('animate', currentPositionAndSize);
          $(this).dialog('option', 'iconButtons', handles.max);
          $(this).dialog('option', 'resizable', true);
          $(this).dialog('option', 'draggable', true);
        }
      }
    ]
  }
  
  var floatWindow = $(
    '<div class="window" title="URL">' +
    '<div class="outer">' +
    '<input type="text" readonly class="innerURL"></input>' +
    '<div class="innerFrame">'+
    '<iframe nwdisable nwfaketop src="about:blank" class="inner"></iframe>'+
    '</div></div></div>'
  )
  floatWindow.appendTo('body');
  floatWindow.find('iframe').attr('src', url);
  floatWindow.dialog({
    width: 400,
    height: 600,
    open : function() {
      
    },
    close : function () {
      $(this).dialog('destroy').remove();
    },
    iconButtons : handles.max,
    minHeight : '0px'
  });
  


  var iframe = $(floatWindow).find('iframe').get(0);
  var self = floatWindow;
  iframe.addEventListener('load', function () {
    var title = iframe.contentWindow.document.title;
    $(self).find('.innerURL').val(iframe.contentWindow.location.href)
    
    console.log(title);
    $(self).dialog('option', 'title', title);
    
  });
  minHeight = $(self).parent('.ui-dialog').find('.ui-dialog-titlebar').outerHeight();
  console.log($(self).parent('.ui-dialog').find('.ui-dialog-titlebar').outerHeight());
  
  var dialog = floatWindow.parent('.ui-dialog');
  
  require('nw.gui').Window.get().on('blur', function() {
    dialog.fadeOut();
  });
  require('nw.gui').Window.get().on('focus', function() {
    dialog.fadeIn();
  });
}

require('nw.gui').Window.get().on('blur', function() {
  $('.main-wrap').fadeOut();
});

require('nw.gui').Window.get().on('new-win-policy', function(frame, url, policy) {
  console.log(arguments);
  if (!frame === null) {
    return;
  }
  policy.ignore();
  createFloatWindow(url);
});