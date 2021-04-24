import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
    this.element.addEventListener('click', (e) => {
      givingloop('donate', {amount: 50, monthly: true})
    })
  }
}
