import {Controller} from "stimulus";
import {debounce} from "lodash-es";

const FILTER_DELAY = 150;

export default class extends Controller {
  connect() {
    this.searchBox = $(this.element).find('input[type=search]');

    this.searchBox.change((e) => {
      this.getSuggestions(e.target.value)
    })
      .keyup(
        debounce(function (e) {
          /* fire the above change event after every letter is typed with a delay of 250ms */
          $(this).change();
        }, FILTER_DELAY)
      );
  }

  getSuggestions(text) {
    if (text && text.length > 0) {
      fetch(`/search/suggestion?query=${text}`)
        .then(response => response.text())
        .then(suggestions => {
          $(".suggestions").html(suggestions)
        })
        .catch(error => callback([]));
    } else {
      $(".suggestions").empty()
    }
  }

  handleItemKeyDown(event, item) {
    const items = this.menu.getElementsByTagName('li');

    if (!items.length) {
      return;
    }

    switch (event.keyCode) {
      case 9: // tab
        return;
      case 13: // enter
        this.props.push(item.href); // change url
        break;
      case 27: // escape
        // TODO if open closeMenu()
        break;
      case 38: // up
        if (event.target === items[0]) {
          // we're on the first item, so focus the input
          this.props.input.focus();
        } else {
          event.target.previousSibling.focus();
        }
        break;
      case 40: // down
        if (event.target === items[items.length - 1]) {
          items[0].focus();
        } else {
          event.target.nextSibling.focus();
        }
        break;
      default:
        return;
    }
    event.preventDefault();
  }

}
