// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="feedback">
// </div>

import {Controller} from "stimulus";

export default class extends Controller {
  connect() {
    this.form = $(this.element);
    this.form.find("#submit").on("click", event => {
      if (this.validate(event, this.form[0]) == false) {
        return false;
      }

      this.submit();
      return false;
    });

    this.form.on("submit", event => {
      if (this.validate(event, this.form[0]) == false) {
        return false;
      }

      this.submit();
      return false;
    });
  }

  validate(event, form) {
    event.preventDefault();
    event.stopPropagation();

    if (!$(form).hasClass("was-validated")) $(form).addClass("was-validated");

    if (form.checkValidity() === false) {
      form.reportValidity();
      return false;
    }

    return true;
  }

  submit() {
    const submitButton = this.form.find("[type='submit']")[0]
    this.element.querySelector('#current-url').value = window.location.href;

    submitButton.innerHTML = '<span class="quran-icon icon-loading"></span>';
    submitButton.disabled = true;

    var headers = { "X-Requested-With": "XMLHttpRequest" };
    var csrfTokenElement = document.querySelector('meta[name="csrf-token"]');
    if (csrfTokenElement) headers["X-CSRF-Token"] = csrfTokenElement.content;

    var requestOptions = {
      headers: headers,
      mode: 'cors',
     // credentials: 'include',
      method: 'POST',
      body: new FormData(this.element)
    };

    fetch(this.element.action, requestOptions)
      .then((response) => response.json())
      .then((json) => {
        submitButton.innerHTML = 'Submit';
        submitButton.disabled = false;

        this.form.find('#notice').html(json.message).removeClass('hidden')
      })
      .catch(err => {
        console.log(err)
      })
  }
}
