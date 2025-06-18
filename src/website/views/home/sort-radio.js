class SortRadio extends HTMLElement {
    static get observedAttributes() {
        return ['imgSrc', 'checked', 'name', 'text'];
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const imgSrc = this.getAttribute('imgSrc') || '';
        const checked = this.getAttribute('checked') || '';
        const name = this.getAttribute('name') || '';
        const text = this.getAttribute('text') || '';
        let labelHtml = '';
        if (imgSrc) {
            labelHtml = `<img width="26" src="${imgSrc}" />`;
        } else if (text) {
            labelHtml = text;
        }
        const checkedHtml = checked ? 'checked="1"' : '';
        this.innerHTML = `<div class="form-check form-check-inline">
  <input
    class="form-check-input"
    type="radio"
    name="${name}"
    id="${name}"
    ${checkedHtml}
  />
  <label class="form-check-label" for="${name}">
    ${labelHtml}
  </label>
</div>`;
    }

    attributeChangedCallback() {
        this.render();
    }
}

customElements.define('sort-radio', SortRadio);
