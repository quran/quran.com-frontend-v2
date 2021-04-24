import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
   this.el = $(this.element)

    this.el.find('.view-more').on('click', (e) => this.showAllResults(e))
  }

  showAllResults(e){
    e.preventDefault()

    this.el.find('.more-items').addClass('hidden');
    this.el.find('.search-item--translation').removeClass('hidden')
  }
}
