
$(function(){
    let selectingOn = null;
    let isSelecting = false;
    let startItem = null;
    let startPosition = null;
    let items = null;
    let ayahClass = '.arabic';
    let wordClass = '[data-audio]';
    let startCircleClass = 'start-circle';
    let endCircleClass = 'end-circle';
    let startCircle = $('<div>').addClass(startCircleClass).css({position: 'absolute'});
    let endCircle = $('<div>').addClass(endCircleClass).css({position: 'absolute'});
    let selections = [];
  
      function setSelection() {
        let selectedItems = items.filter(item => item.selected);
      let rows = {};
      let rowsCount = 0;
      let pos = selectingOn.get(0).getBoundingClientRect();
      
      selectedItems.map(item => {
          let top = Math.round(item.rect.y - pos.y);
        let left = Math.round(item.rect.x - pos.x);
        let right = Math.round(item.rect.x - pos.x + item.rect.width);
        let bottom = Math.round(item.rect.y - pos.y + item.rect.height);
        if( rows[top] ) {
            rows[top] = {
              top, 
            left: Math.min(rows[top].left, left),
            right: Math.max(rows[top].right, right),
            bottom: Math.max(rows[top].bottom, bottom),
           }
        } else {
            rowsCount++;
             rows[top] = {top, left, right, bottom}
        }
      });
      
      if( rowsCount > selections.length ) {
          for(var i=selections.length-1; i<rowsCount ;i++) {
            let selection = $('<div>').addClass('selection');
          selectingOn.append( selection );
            selections.push( selection );
        }
      } else if( rowsCount < selections.length ) {
          selections.splice(rowsCount).map(item => item.remove());
      }
      
      Object.values(rows).map((coords, idx) => {
          let selection = selections[idx];
        selection.css({
            top: coords.top,
          left: coords.left,
          width: coords.right - coords.left,
          height: coords.bottom - coords.top
        });
      });
    }
    
    function positionCircles(selectedItems) {
      
     let pos = selectingOn.get(0).getBoundingClientRect();

      selectedItems = selectedItems || items.filter(item => item.selected);
          if( selectedItems.length == 0 ) return;
      
      let firstItem = selectedItems[0];
      let lastItem = selectedItems[selectedItems.length-1];
      startCircle.css({top: firstItem.rect.y - pos.y, left: firstItem.rect.x - pos.x +firstItem.rect.width, height: firstItem.rect.height });
      endCircle.css({top: lastItem.rect.y - pos.y, left: lastItem.rect.x - pos.x, height: lastItem.rect.height });
    }

    function updateDropdownPositions(selectedItems) {
        let corners = {left: 99999, bottom: 0, right: 0};
    selectedItems.map(function(item) {
        corners.left = Math.min(corners.left, item.rect.x);
        corners.bottom = Math.max(corners.bottom, item.rect.y+item.rect.height);
        corners.right = Math.max(corners.right, item.rect.x+item.rect.width);
        return item;
      });
      let scrollPos = $(window).scrollTop();
      
      let root = document.documentElement;
      root.style.setProperty('--el-selection-y', corners.bottom+scrollPos + "px");
      root.style.setProperty('--el-selection-x', ((corners.left+corners.right)/2) + "px");
    }
    
    function deselect() {
        if( !items ) return;
      items = items.map(function(item) {
        item.selected = false;
        item.el.removeClass('selected');
        return item;
      });
      items = null;
      selectingOn = null;	
      startItem = null;
      startPosition = null;
      startCircle.remove();
      endCircle.remove();
      selections.splice(0).map(item => item.remove());
      $(document).trigger('el:deselected');
    }
    
    function mouseMoved(e) {
      if(isSelecting) {
          let mousePos = {x: e.clientX, y: e.clientY };
              if( e.type == 'touchmove' ) {
            mousePos = {x: e.touches[0].clientX, y: e.touches[0].clientY };
          }
          
          items = items.map(function(item) {
            /* let rightSelect = (item.el.index() >= startItem.index()) && ((item.rect.x < mousePos.x && item.rect.y < mousePos.y) || (item.rect.y+item.rect.height < mousePos.y));
            
            let leftSelect = (item.el.index() <= startItem.index()) && ((item.rect.x+item.rect.width > mousePos.x && item.rect.y+item.rect.height > mousePos.y) || (item.rect.y > mousePos.y)); */
            /* let rightSelect = (item.el.index() <= startItem.index()) && ((item.rect.x < mousePos.x && item.rect.y < mousePos.y) || (item.rect.y+item.rect.height < mousePos.y)); */
            
            // ARABIC
            let rightSelect = (item.el.index() <= startItem.index()) && ((item.rect.x < mousePos.x && item.rect.y+item.rect.height > mousePos.y) || (item.rect.y > mousePos.y));
           let leftSelect = (item.el.index() >= startItem.index()) && ((item.rect.x+item.rect.width > mousePos.x && item.rect.y < mousePos.y) || (item.rect.y+item.rect.height < mousePos.y)); 
  
            item.selected = leftSelect || rightSelect;
            item.el[item.selected ? 'addClass' : 'removeClass']('selected');
            return item;
          });
          
          positionCircles();
          setSelection();
        }
    }

    // left: 37, up: 38, right: 39, down: 40,
    // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
    var keys = {37: 1, 38: 1, 39: 1, 40: 1};

    function preventDefault(e) {
      e.preventDefault();
    }

    function preventDefaultForScrollKeys(e) {
      if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
      }
    }

    // modern Chrome requires { passive: false } when adding event
    var supportsPassive = false;
    try {
      window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
        get: function () { supportsPassive = true; } 
      }));
    } catch(e) {}

    var wheelOpt = supportsPassive ? { passive: false } : false;
    var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

    // call this to Disable
    function disableScroll() {
      window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
      window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
      window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
      window.addEventListener('keydown', preventDefaultForScrollKeys, false);
    }

    // call this to Enable
    function enableScroll() {
      window.removeEventListener('DOMMouseScroll', preventDefault, false);
      window.removeEventListener(wheelEvent, preventDefault, wheelOpt); 
      window.removeEventListener('touchmove', preventDefault, wheelOpt);
      window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
    }
    
    $(document).on('mousedown touchstart', function(e) {
        let el = $(e.target);
      if( !el.is(wordClass) && !el.is(`.${startCircleClass}`) && !el.is(`.${endCircleClass}`) && (!el.is('.el-selection-dropdown') && el.parents('.el-selection-dropdown').length == 0) ) {
          deselect();
      }
    });
    $(document).on('mousedown touchstart', `.${startCircleClass}`, function(e) {
        e.preventDefault();
      selectingOn = $(e.target).parents(ayahClass);
      isSelecting = true;
      disableScroll();
      let selectedItems = items.filter(item => item.selected);
      startItem = selectedItems[selectedItems.length-1];
      startPosition = {x: startItem.rect.x, y: startItem.rect.y };
      startItem = startItem.el;
      $(document).trigger('el:selecting');
    });
    $(document).on('mousedown touchstart', `.${endCircleClass}`, function(e) {
        e.preventDefault();
      selectingOn = $(e.target).parents(ayahClass);
      isSelecting = true;
      disableScroll();
      let selectedItems = items.filter(item => item.selected);
      startItem = selectedItems[0];
      startPosition = {x: startItem.rect.x, y: startItem.rect.y };
      startItem = startItem.el;
      $(document).trigger('el:selecting');
    });
    
    $(document).on('mousedown touchstart', wordClass, function(e) {
      e.preventDefault();
      deselect();
      startItem = $(e.target);
      selectingOn = startItem.parents(ayahClass);
      selectingOn.css({position: 'relative'});
      isSelecting = true;
      disableScroll();
      startPosition = {x: e.clientX, y: e.clientY };
      if( e.type == 'touchstart' ) {
        startPosition = {x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      buildItemsArray();
      mouseMoved(e);
      $(document).trigger('el:selecting');
    });
    
    $(document).on('mousemove touchmove', function(e) {
      mouseMoved(e);
    });
    
    $(document).on('mouseup touchend', function(e) {
        if( !isSelecting ) return;
      
      let selectedItems = items.filter(item => item.selected);
      
      updateDropdownPositions(selectedItems);
      positionCircles(selectedItems);
      
      selectingOn.append(startCircle);
      selectingOn.append(endCircle);
      
      $(document).trigger('el:selected', [selectedItems.map(i => i.el)]);	
      
      isSelecting = false;
      enableScroll();
    });
    
    $(window).on('resize', function() {
      if( !items ) return;
      items = items.map((item) => {
        item.rect = item.el.get(0).getBoundingClientRect();
        return item;
      });
      positionCircles();
      setSelection();
      updateDropdownPositions(items.filter(i => i.selected));
    });
    
    function buildItemsArray() {
        items = [];
      selectingOn.find(wordClass).each(function(idx,item){
          item = $(item);
          items.push({
            el: item,
          index: item.index(),
          rect: item.get(0).getBoundingClientRect(),
          selected: false
        })
      });
    }
  });