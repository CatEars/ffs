import { BaseWebComponent } from './base.js';

/**
 <nav>
    <ul class="pagination">
        <li class="page-item">
            <a
                href="#"
                @click="currentPage = lowerPageNumberByOne(currentPage)"
                x-bind:class="currentPage === 1 ? 'page-link disabled' : 'page-link'"
                >&lt;</a
            >
        </li>
        <template x-for="(idx) in Array.from({ length: getNumPages(files) }, (_, i) => i + 1)">
            <li class="page-item">
                <a
                    href="#"
                    x-text="idx"
                    @click="setCurrentPage(idx); currentPage = idx"
                    x-bind:class="currentPage === idx ? 'page-link disabled' : 'page-link'"
                ></a>
            </li>
        </template>
        <li class="page-item">
            <a
                href="#"
                @click="currentPage = increasePageNumberByOne(files, currentPage)"
                x-bind:class="currentPage === getNumPages(files) ? 'page-link disabled' : 'page-link'"
                >&gt;</a
            >
        </li>
    </ul>
</nav>

 */

class PaginateControl extends BaseWebComponent {
    static get observedAtttributes() {
        return ['page', 'maxPages'];
    }

    render(html) {
        const currentPage = Number.parseInt(this.getAttribute('page')) || 1;
        const maxPages = Number.parseInt(this.getAttribute('maxPages')) || 1;
        function pre() {
            console.log('back');
        }
        function to(num) {
            console.log('goto');
        }
        function post() {
            console.log('forward');
        }

        return html`<div class="row">
            <nav>
                <ul class="pagination">
                    <li class="page-item">
                        <a
                            href="#"
                            class="page-link ${currentPage === 1 ? 'disabled' : ''}"
                            onclick=${() => pre()}
                            >${'<'}</a
                        >
                    </li>
                    <li>
                        <a
                            href="#"
                            class="page-link ${currentPage === maxPages ? 'disabled' : ''}"
                            onclick=${() => post()}
                            >${'>'}</a
                        >
                    </li>
                </ul>
            </nav>
        </div>`;
    }
}

export default PaginateControl;
