// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="feedback">
// </div>

import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
    this.submitButton = document.getElementById('submit-feedback-btn');
    this.submitButton.addEventListener("click", _ => this.submitForm());
  }

  submitForm(){
    this.element.querySelector('#current-url').value = window.location.href;
    this.submitButton.innerHTML = '<span class="quran-icon icon-loading"></span>';
    this.submitButton.disabled = true;
    fetch(this.element.action, {
      method: 'post',
      body: (new FormData(this.element))
    })
      .then(_ => {
        this.submitButton.innerHTML = 'Saved';
        this.submitButton.disabled = false;
        setInterval(() => {
          this.submitButton.innerHTML = 'Submit';
        }, 5000)
      })
      .catch(err => {
        console.log(err)
      })
  }
}