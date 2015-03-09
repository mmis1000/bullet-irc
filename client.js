var service = require('./index.js');

service.resetListeners();

service.addListener('error', function (err) {
  console.error();
});
service.addListener('registered', function (from, to, message) {
  console.log('connect');
  bullet('connected!');
});
service.addListener('message', function (from, to, message) {
  console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + " " + from + ' => ' + to + ': ' + message);
  bullet(colorize(from) + ' => ' + colorize(to) + ': ' + parseColor(safe_tags_replace(message)));
});



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

setTimeout(function(){
  $("ul.logs li").each(function(){
    var nickField = $(this).children(".nick");
    
    nickField.css("color",getColor(nickField.text()));
  });
  $(".wordwrap").each(function(){
    $(this).html(
      parseColor($(this).html())
    );
  });
} ,100);

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
          return html;
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



var current = -1
var lastTime = Date.now()
var firstRowLast = -1;
function bullet(text) {
  var item = $('<div class="bullet"/>').html(text);
  item.css({
    display: 'block',
    position: 'absolute',
    'font-family': "'Noto Sans', 'Microsoft JhengHei', 'sans-serif', 'serif'"
  })
  $('body').append(item);
  
  var lastRowRemp;
  
  var itemWidth = item.width()
  var itemHeight = item.height()
  
  var height = screen.height;
  var width = screen.width;
  
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
  
  item.css('top', current);
  item.css('left', width);
  
  var newTime = timeRemain / width * (width + itemWidth)
  
  item.animate( {left : -itemWidth} , newTime, 'linear', function(){
    item.remove();
  })
}

$(function() {
  $(".test").draggable();
});