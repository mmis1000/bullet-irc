/*http://jsfiddle.net/adamboduch/JLSrR/*/
;(function( $, undefined ) {
    function nooz () {}
    
    // Extends the dialog widget with a new option.
    $.widget( "app.dialog", $.ui.dialog, {
    
        options: {
            iconButtons: []
        },
    
        _create: function() {
    
            // Call the default widget constructor.
            this._super();
            this._addTitleIcons();
    
        },
        
        animate: function(props, transition, duration, align) {
          var parseAlign = function (align) {
            var horizontal;
            var vertical;
            var temp;
            if ( 'object' === typeof align) {
              return align;
            }
            if ( 'string' !== typeof align) {
              align = 'left-top';
            }
            if ( !(/(left|center|right)-(top|middle|bottom)/).test(align) ) {
              align = 'left-top';
            }
            temp = align.split('-');
            return {
              horizontal : temp[0],
              vertical : temp[1]
            };
          }
          
          var parseAsNumber = function (str, parent, prop) {
            var original, autoValue;
            
            if ('number' === typeof str) {
              return str;
            }
            if (null === str) {
              return null;
            }
            str = str.toLowerCase();
            
            var temp = (/(^.*?)([a-z]+)\s*$/i).exec(str);
            var type = temp[2];
            
            if (type === 'px') {
              return parseFloat(temp[1])
            }
            
            if (type === 'em') {
              return parseFloat(temp[1]) * Number(getComputedStyle(parent, "").fontSize.match(/(\d*(\.\d*)?)px/)[1]);
            }
            
            if (type === 'auto') {
              if (prop !== 'width' && prop !== 'height') {
                throw new Error('Convert unknown auto property ' + prop + ' to px.');
              }
              original = parent.css(prop);
              parent.css(prop, 'auto');
              autoValue = parent[prop]();
              parent.css(prop, original);
              return autoValue;
            }
            return null;
          }
          
          align = parseAlign(align);
          console.log(align);
          var currentWidth = this.uiDialog.width();
          var currentHeight = this.uiDialog.height();
          var currentOuterWidth = this.uiDialog.outerWidth();
          var currentOuterHeight = this.uiDialog.outerHeight();
          var currenContentWidth = this.element.width();
          var currenContentHeight = this.element.height();
          
          var currentLeft = parseAsNumber(this.uiDialog.css('left'), this.uiDialog);
          var currentTop = parseAsNumber(this.uiDialog.css('top'), this.uiDialog);
          
          console.log(currentWidth, currentHeight, currenContentWidth, currenContentHeight, currentTop, currentLeft);
          
          var newWidth = parseAsNumber(props.width, this.uiDialog, 'width');
          var newHeight = parseAsNumber(props.height, this.uiDialog, 'height');
          
          var newLeft = parseAsNumber(props.left, this.uiDialog);
          var newTop = parseAsNumber(props.top, this.uiDialog);
          
          if (align.horizontal === 'center') {
            newLeft -= (newWidth + currentOuterWidth - currentWidth) / 2;
          } else if (align.horizontal === 'right') {
            newLeft -= newWidth + currentOuterWidth - currentWidth;
          }
          
          if (align.vertical === 'middle') {
            newTop -= (newHeight + currentOuterWidth - currentWidth) / 2;
          } else if (align.vertical === 'bottom') {
            newTop -= newHeight + currentOuterWidth - currentWidth;
          }
          
          newWidth = newWidth != null ? newWidth : currentWidth;
          newHeight = newHeight != null ? newHeight : currentHeight;
          newLeft = newLeft != null ? newLeft : currentLeft;
          newTop = newTop != null ? newTop : currentTop;
          
          console.log(newWidth, newHeight, newLeft, newTop)
          
          this.element.css('width', 'auto');
          
          this.uiDialog.animate({
            left : newLeft + 'px',
            top : newTop+ 'px',
            height : newHeight + 'px',
            width : newWidth + 'px',
          })
          //console.log(newHeight, this.uiDialog.find('.ui-dialog-titlebar').outerHeight());
          
          //we need to get the correct height in order to animate it
          this.element.animate({
            height : (
              newHeight 
              - this.uiDialog.find('.ui-dialog-titlebar').outerHeight()
              - (this.element.outerHeight(true) - this.element.height())
            ) + 'px',
            //width : currenContentWidth + newWidth - currentWidth + 'px',
          })
        },
        _setOption: function( key, value ) {
          this._super( key, value );
          if (key === 'iconButtons') {
            
            //remove current setted buttons
            var $titlebar = this.uiDialog.find( ".ui-dialog-titlebar" );
            $titlebar.find( '.mmis1000-addition-button' ).remove();
            
            //readd them
            this._addTitleIcons();
          }
        },
        _addTitleIcons: function () {
            // The dialog titlebar is the button container.
            var $titlebar = this.uiDialog.find( ".ui-dialog-titlebar" );
            
            // Make sure the listener has correct 'this'
            var $content = this.uiDialog.find( ".ui-dialog-content" ).get(0);
            //console.log(this, this.uiDialog, $content)
            
            // Iterate over the "iconButtons" array, which defaults to
            // and empty array, in which case, nothing happens.
            $.each( this.options.iconButtons, function( i, v ) {
                this.click = 'function' === typeof this.click ? this.click : nooz;
                // Finds the last button added. This is actually the
                // left-most button.
                var $button = $( "<button/>" ).text( this.text ),
                    right = $titlebar.find( "[role='button']:last" )
                                     .css( "right" );
    
                // Creates the button widget, adding it to the titlebar.
                $button.button( { icons: { primary: this.icon }, text: false } )
                       .addClass( "ui-dialog-titlebar-close" )
                       .addClass( "mmis1000-addition-button" )
                       .css( "right", ( parseInt( right ) + 22) + "px" )
                       .off( 'click' )
                       .click( this.click.bind($content) )
                       .appendTo( $titlebar );
    
            });
        },
        getPositionAndSize: function () {
          var currentWidth = this.uiDialog.width();
          var currentHeight = this.uiDialog.height();
          var currentLeft = this.uiDialog.css( 'left' );
          var currentTop = this.uiDialog.css( 'top' );
          
          return {
            width : currentWidth,
            height : currentHeight,
            left : currentLeft,
            top: currentTop
          }
        }
    });
} (jQuery));