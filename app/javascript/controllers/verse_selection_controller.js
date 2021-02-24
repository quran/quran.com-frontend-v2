import {Controller} from "stimulus";

const startCircleClass = 'start-circle';
const endCircleClass = 'end-circle';
let ayahClass = '.arabic';
let wordClass = '.w';

export default class extends Controller {
  connect() {
    setTimeout(() => {
      const reader = document.getElementById('reader').reader;
      if (!reader.isInfoMode()) {
        this.bindSelection()
      }
    }, 300)
  }

  bindSelection() {
    const el = $(this.element);
    this.selectedAyah = null;
    this.isSelecting = false;
    this.startWord = null;
    this.startPosition = null;
    this.selectableWords = [];
    this.selections = [];

    this.startCircle = $('<div>').addClass(startCircleClass).css({position: 'absolute'});
    this.endCircle = $('<div>').addClass(endCircleClass).css({position: 'absolute'});
    this.closeSelection = $('<span>').addClass("icon-times-circle close-selection text--green").css({position: 'absolute'});

    // modern Chrome requires { passive: false } when adding event
    var supportsPassive = false;
    try {
      window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
        get: function () {
          supportsPassive = true;
        }
      }));
    } catch (e) {
    }

    this.wheelOpt = supportsPassive ? {passive: false} : false;
    this.wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

    el.on('mousedown touchstart', (e) => {
      let el = $(e.target);
      if (!el.is(wordClass) && !el.is(`.${startCircleClass}`) && !el.is(`.${endCircleClass}`) && (!el.is('.el-selection-dropdown') && el.parents('.el-selection-dropdown').length == 0)) {
        // this.deselect();
      }
    });

    el.on('mousedown touchstart', `.${startCircleClass}`, (e) => this.update(e));
    el.on('mousedown touchstart', `.${endCircleClass}`, (e) => this.update(e));
    el.on('mousedown touchstart', wordClass, (e) => this.start(e))
    el.on('mousemove touchmove', (e) => this.mouseMoved(e))
    el.on('mouseup touchend', (e) => this.mouseUp(e))
    el.on('click', '.close-selection', (e) => this.deselect(e))

    $(window).on('resize', function () {
      if (!this.selectableWords) return;

      this.selectableWords = this.selectableWords.map((item) => {
        item.rect = item.el.get(0).getBoundingClientRect();
        return item;
      });

      positionCircles();
      setSelection();
      updateDropdownPositions(this.selectableWords.filter(i => i.selected));
    });
  }

  update(e) {
    preventDefault(e);
    this.disableScroll();

    this.selectedAyah = $(e.target).parents(ayahClass);
    this.isSelecting = true;
    this.selectedItems = this.selectedItems.filter(item => item.selected);

    const last = this.selectedItems.last;

    if (last) {
      this.startPosition = {
        x: last.rect.x,
        y: last.rect.y
      }
      this.startWord = last.el;
    }
  }

  start(e) {
    preventDefault(e);
    this.deselect();
    this.startWord = $(e.currentTarget);
    this.selectedAyah = this.startWord.closest(".arabic")
    this.selectedAyah.css({position: 'relative'});

    this.selectedAyah.append(this.closeSelection);
    this.selectedAyah.append(this.startCircle);
    this.selectedAyah.append(this.endCircle);

    this.isSelecting = true;
    this.disableScroll();

    this.startPosition = {
      x: e.clientX,
      y: e.clientY
    }

    if (e.type == 'touchstart') {
      this.startPosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      }
    }

    this.buildItemsArray();
    this.mouseMoved(e);
  }

  filterSelected() {
    this.selectedItems = this.selectableWords.filter(item => item.selected);
  }

  // call this to Disable
  disableScroll() {
    window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
    window.addEventListener(this.wheelEvent, preventDefault, this.wheelOpt); // modern desktop
    window.addEventListener('touchmove', preventDefault, this.wheelOpt); // mobile
    window.addEventListener('keydown', preventDefaultForScrollKeys, false);
  }

  // call this to Enable
  enableScroll() {
    window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.removeEventListener(this.wheelEvent, preventDefault, this.wheelOpt);
    window.removeEventListener('touchmove', preventDefault, this.wheelOpt);
    window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
  }

  buildItemsArray() {
    this.selectableWords = [];

    this.selectedAyah.find(wordClass).each((idx, item) => {
      item = $(item);

      this.selectableWords.push({
        el: item,
        index: item.index(),
        rect: item.get(0).getBoundingClientRect(),
        selected: this.startWord.index() == item.index()
      })
    });
  }

  setSelection() {
    let selectedItems = this.selectableWords.filter(item => item.selected);
    let rows = {};
    let rowsCount = 0;
    let pos = this.selectedAyah.get(0).getBoundingClientRect();

    selectedItems.forEach(item => {
      let top = Math.round(item.rect.y - pos.y);
      let left = Math.round(item.rect.x - pos.x);
      let right = Math.round(item.rect.x - pos.x + item.rect.width);
      let bottom = Math.round(item.rect.y - pos.y + item.rect.height);

      if (rows[top]) {
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

    if (rowsCount > this.selections.length) {
      for (var i = this.selections.length - 1; i < rowsCount; i++) {
        let selection = $('<div>').addClass('selection');
        this.selectedAyah.append(selection);
        this.selections.push(selection);
      }
    } else if (rowsCount < this.selections.length) {
      this.selections.splice(rowsCount).map(item => item.remove());
    }

    Object.values(rows).map((coords, idx) => {
      let selection = this.selections[idx];
      selection.css({
        top: coords.top,
        left: coords.left,
        width: coords.right - coords.left,
        height: coords.bottom - coords.top
      });
    });
  }

  positionCircles() {
    if (!this.selectedAyah)
      return

    let pos = this.selectedAyah.get(0).getBoundingClientRect();

    let selectedItems = this.selectableWords.filter(item => item.selected);
    if (selectedItems.length == 0) return;

    let firstItem = selectedItems[0];
    let lastItem = selectedItems[selectedItems.length - 1];

    const leftCircleX = firstItem.rect.x - pos.x + firstItem.rect.width;
    const rightCircleX = lastItem.rect.x - pos.x;

    this.startCircle.css({
      top: firstItem.rect.y - pos.y,
      left: leftCircleX,
      height: firstItem.rect.height
    });

    this.endCircle.css({
      top: lastItem.rect.y - pos.y,
      left: rightCircleX,
      height: lastItem.rect.height
    });

    this.closeSelection.css({
      top: firstItem.rect.y - pos.y - 30,
      left: (leftCircleX + rightCircleX) / 2 - 20,
      fontSize: '20px'
    })
  }

  updateDropdownPositions() {
    const corners = {
      left: 99999,
      bottom: 0,
      right: 0
    }

    this.selectedItems.forEach((item) => {
      corners.left = Math.min(corners.left, item.rect.x);
      corners.bottom = Math.max(corners.bottom, item.rect.y + item.rect.height);
      corners.right = Math.max(corners.right, item.rect.x + item.rect.width);
    });

    const scrollPos = $(window).scrollTop();
    const root = document.documentElement;

    root.style.setProperty('--el-selection-y', corners.bottom + scrollPos + "px");
    root.style.setProperty('--el-selection-x', ((corners.left + corners.right) / 2) + "px");
  }

  deselect(e) {
    if (e) {
      e.preventDefault()
      e.stopImmediatePropagation();
    }

    this.selectableWords.forEach((item) => {
      item.selected = false;
      item.el.removeClass('selected');
    });

    this.selectableWords = [];
    this.selectedAyah = null;
    this.startWord = null;
    this.startPosition = null;
    this.startCircle.remove();
    this.endCircle.remove();
    this.closeSelection.remove();

    this.selections.splice(0).map(item => item.remove());
    $(document).trigger('segment:removed');
  }

  mouseUp(e) {
    if (this.isSelecting) {
      this.isSelecting = false;

      this.filterSelected();
      this.updateDropdownPositions();
      this.positionCircles();

      $(document).trigger('segment:selected', [this.selectedItems.map(i => i.el)]);

      this.enableScroll();
    }
  }

  mouseMoved(e) {
    if (this.isSelecting) {

      let mousePos = {
        x: e.clientX,
        y: e.clientY
      };

      if (e.type == 'touchmove') {
        mousePos = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }

      this.selectableWords.forEach((item) => {
        // ARABIC
        let rightSelect = (item.el.index() <= this.startWord.index()) && ((item.rect.x < mousePos.x && item.rect.y + item.rect.height > mousePos.y) || (item.rect.y > mousePos.y));
        let leftSelect = (item.el.index() >= this.startWord.index()) && ((item.rect.x + item.rect.width > mousePos.x && item.rect.y < mousePos.y) || (item.rect.y + item.rect.height < mousePos.y));

        item.selected = leftSelect || rightSelect;
        if (item.selected)
          item.el.addClass('selected');
        else
          item.el.removeClass('selected');
      });

      this.positionCircles();
      this.setSelection();
    }
  }
}

function preventDefault(e) {
  e.preventDefault();
}

// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32,
// pageup: 33,
// pagedown: 34,
// end: 35,
// home: 36
const KEYS = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefaultForScrollKeys(e) {
  if (KEYS[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}
