import { BaseWebComponent } from '../base.js';

/**
 * <div class="d-flex" style="height: 100%">
                <div class="align-self-end">
                    <!-- include ./breadcrumbs.partial.html -->
                </div>
            </div>
 <nav>
  <script>
    function isLastBreadcrumb(root, index) {
      return index === root.split("/").length - 1;
    }

    function computeBreadcrumbClass(root, index) {
      return (
        "breadcrumb-item" +
        (index === root.split("/").length - 1 ? " active" : "")
      );
    }

    function gotoFolder(root, index) {
      const elements = root.split("/");
      const include = [];
      for (let idx = 0; idx <= index; ++idx) {
        include.push(elements[idx]);
      }
      return include.join("/");
    }
  </script>
  <ol class="breadcrumb">
    <template x-for="(dir, index) in root.split('/')">
      <li x-bind:class="computeBreadcrumbClass(root, index)">
        <template x-if="isLastBreadcrumb(root, index)">
          <span
            style="padding-left: 0.5em; padding-right: 0.5em"
            x-text="dir"
          ></span>
        </template>
        <template x-if="!isLastBreadcrumb(root, index)">
          <a
            href=""
            style="padding-left: 0.5em; padding-right: 0.5em"
            x-bind:href="`/home/?path=${gotoFolder(root, index)}`"
            x-text="dir"
          ></a>
        </template>
      </li>
    </template>
  </ol>
</nav>

 */

class BreadcrumbNav extends BaseWebComponent {
    static observedAttributes = ['trail'];

    render(html) {
        const trail = this.getAttribute('trail') || '';
        const crumbs = trail.split('/');

        const preCrumbs = crumbs.slice(0, crumbs.length - 1);
        const lastCrumb = crumbs[crumbs.length - 1];

        const onIndexClick = (idx) => {
            this.dispatchEvent(
                new CustomEvent('crumb-click', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        trail,
                        index: idx,
                    },
                })
            );
        };

        return html`
            <style>
                .breadcrumb-item > * {
                    padding-left: 0.5em;
                    padding-right: 0.5em;
                }
            </style>
            <div class="d-flex" style="height: 100%;">
                <div class="align-self-end">
                    <nav>
                        <ol class="breadcrumb">
                            ${preCrumbs.map(
                                (crumb, idx) => html`<li class="breadcrumb-item">
                                    <a href="#" onclick=${() => onIndexClick(idx)}>${crumb}</a>
                                </li>`
                            )}
                            <li class="breadcrumb-item active">
                                <span>${lastCrumb}</span>
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>
        `;
    }
}

export default BreadcrumbNav;
