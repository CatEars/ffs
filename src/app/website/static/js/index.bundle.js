(() => {
  // vendor/htm.mjs
  var n = function(t2, s, r, e) {
    var u;
    s[0] = 0;
    for (var h2 = 1; h2 < s.length; h2++) {
      var p = s[h2++], a = s[h2] ? (s[0] |= p ? 1 : 2, r[s[h2++]]) : s[++h2];
      3 === p ? e[0] = a : 4 === p ? e[1] = Object.assign(e[1] || {}, a) : 5 === p ? (e[1] = e[1] || {})[s[++h2]] = a : 6 === p ? e[1][s[++h2]] += a + "" : p ? (u = t2.apply(a, n(t2, a, r, ["", null])), e.push(u), a[0] ? s[0] |= 2 : (s[h2 - 2] = 0, s[h2] = u)) : e.push(a);
    }
    return e;
  };
  var t = /* @__PURE__ */ new Map();
  function htm_default(s) {
    var r = t.get(this);
    return r || (r = /* @__PURE__ */ new Map(), t.set(this, r)), (r = n(this, r.get(s) || (r.set(s, r = (function(n2) {
      for (var t2, s2, r2 = 1, e = "", u = "", h2 = [0], p = function(n3) {
        1 === r2 && (n3 || (e = e.replace(/^\s*\n\s*|\s*\n\s*$/g, ""))) ? h2.push(0, n3, e) : 3 === r2 && (n3 || e) ? (h2.push(3, n3, e), r2 = 2) : 2 === r2 && "..." === e && n3 ? h2.push(4, n3, 0) : 2 === r2 && e && !n3 ? h2.push(5, 0, true, e) : r2 >= 5 && ((e || !n3 && 5 === r2) && (h2.push(r2, 0, e, s2), r2 = 6), n3 && (h2.push(r2, n3, 0, s2), r2 = 6)), e = "";
      }, a = 0; a < n2.length; a++) {
        a && (1 === r2 && p(), p(a));
        for (var l = 0; l < n2[a].length; l++) t2 = n2[a][l], 1 === r2 ? "<" === t2 ? (p(), h2 = [h2], r2 = 3) : e += t2 : 4 === r2 ? "--" === e && ">" === t2 ? (r2 = 1, e = "") : e = t2 + e[0] : u ? t2 === u ? u = "" : e += t2 : '"' === t2 || "'" === t2 ? u = t2 : ">" === t2 ? (p(), r2 = 1) : r2 && ("=" === t2 ? (r2 = 5, s2 = e, e = "") : "/" === t2 && (r2 < 5 || ">" === n2[a][l + 1]) ? (p(), 3 === r2 && (h2 = h2[0]), r2 = h2, (h2 = h2[0]).push(2, 0, r2), r2 = 0) : " " === t2 || "	" === t2 || "\n" === t2 || "\r" === t2 ? (p(), r2 = 2) : e += t2), 3 === r2 && "!--" === e && (r2 = 4, h2 = h2[0]);
      }
      return p(), h2;
    })(s)), r), arguments, [])).length > 1 ? r : r[0];
  }

  // base.js
  var html = htm_default.bind(void 0);
  async function loadSharedStylesheets() {
    const sharedStylesheet = new CSSStyleSheet();
    try {
      const response = await fetch("/static/css/index.bundle.css");
      if (!response.ok) {
        throw new Error(
          `Failed to load stylesheet: ${response.statusText} / ${response2.statusText}`
        );
      }
      const cssText = await response.text();
      await sharedStylesheet.replace(cssText);
      console.log("Shared stylesheet loaded and parsed.");
    } catch (error) {
      console.error("Error loading shared stylesheet:", error);
    }
    return [sharedStylesheet];
  }
  var BaseWebComponent = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.adoptedStyleSheets = [...document.adoptedStyleSheets];
    }
    connectedCallback() {
      this._renderComponent();
    }
    render(_html) {
      throw new Error("Sub-components must implement the render(...) method.");
    }
    postRender(_html) {
    }
    _renderComponent() {
      const content = this.render(html);
      (void 0)(content, this.shadowRoot);
      this.postRender(html);
    }
    attributeChangedCallback(_name, _oldValue, _newValue) {
      this._renderComponent();
    }
  };

  // text/app-header.js
  var AppHeader = class extends BaseWebComponent {
    render(html2) {
      return html2`
            <style>
                header {
                    display: flex;
                    flex-direction: row;
                    gap: 1rem;
                    align-items: center;
                }
            </style>
            <header>
                <slot name="starter"></slot>
                <h1><slot></slot></h1>
                <slot name="ender"></slot>
            </header>
        `;
    }
  };
  var app_header_default = AppHeader;

  // layout/app-main.js
  var AppMain = class extends BaseWebComponent {
    render(html2) {
      return html2`
            <style>
                main {
                    display: flex;
                    flex-direction: column;
                    margin-left: 1rem;
                    margin-right: 1rem;
                }
            </style>
            <main>
                <slot></slot>
            </main>
        `;
    }
  };
  var app_main_default = AppMain;

  // text/app-subheader.js
  var AppSubheader = class extends BaseWebComponent {
    render(html2) {
      return html2`
            <div class="row">
                <h2><slot></slot></h2>
            </div>
        `;
    }
  };
  var app_subheader_default = AppSubheader;

  // navigation/breadcrumb-nav.js
  var BreadcrumbNav = class extends BaseWebComponent {
    static observedAttributes = ["trail", "hide-last-slash"];
    render(html2) {
      const trail = this.getAttribute("trail") || "";
      const crumbs = trail.split("/");
      const preCrumbs = crumbs.slice(0, crumbs.length - 1);
      const lastCrumb = crumbs[crumbs.length - 1];
      const onIndexClick = (idx) => {
        this.dispatchEvent(
          new CustomEvent("crumb-click", {
            bubbles: true,
            composed: true,
            detail: {
              trail,
              index: idx
            }
          })
        );
      };
      return html2`
            <style>
                :host {
                    display: block;
                    width: 100%;
                    margin: 1rem 0;
                }
                nav {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                    width: 100%;
                }
                nav::-webkit-scrollbar {
                    display: none;
                }
                ol {
                    display: inline-flex;
                    flex-direction: row;
                    align-content: center;
                    list-style-type: none;
                    gap: 1rem;
                    margin: 0;
                    padding: 0 0.5rem;
                }
                li {
                    flex-shrink: 0;
                    white-space: nowrap;
                }
                a {
                    color: var(--font-color);
                    text-decoration: underline;
                }
                li::after {
                    content: '/';
                    margin-left: 1rem;
                }
                :host([hide-last-slash]) li:last-child::after {
                    content: none;
                }
                li.breadcrumb-item > span {
                    cursor: default;
                }
            </style>
            <nav>
                <ol class="breadcrumb">
                    ${preCrumbs.map(
        (crumb, idx) => html2`
                                <li class="breadcrumb-item">
                                    <a href="#" onclick="${() => onIndexClick(idx)}">${crumb}</a>
                                </li>
                            `
      )}
                    <li class="breadcrumb-item">
                        <span>${lastCrumb}</span>
                    </li>
                </ol>
            </nav>
        `;
    }
  };
  var breadcrumb_nav_default = BreadcrumbNav;

  // base-form.js
  var BaseFormComponent = class extends BaseWebComponent {
    constructor() {
      super();
    }
    connectedCallback() {
      super.connectedCallback();
      this.setupCsrf();
    }
    async setupCsrf() {
      const forms = this.shadowRoot.querySelectorAll("form");
      const token = await getCookie("FFS-Csrf-Protection");
      for (const shadowForm of forms) {
        shadowForm.addEventListener("submit", (_event) => {
          if (token) {
            let input = shadowForm.querySelector('input[name="ffs_csrf_protection"]');
            if (!input) {
              input = document.createElement("input");
              input.type = "hidden";
              input.name = "ffs_csrf_protection";
              shadowForm.appendChild(input);
            }
            input.value = token.value;
          }
        });
      }
    }
  };

  // display/cli-command.js
  function formatCommand(cmd) {
    return `${cmd["program"]} ${cmd.args.join(" ")}`;
  }
  var CliCommand = class extends BaseFormComponent {
    static observedAttributes = ["command"];
    render(html2) {
      const command = JSON.parse(this.getAttribute("command") || "{}");
      const formattedCommand = formatCommand(command);
      const method = this.getAttribute("method");
      const action = this.getAttribute("action");
      const onInputChange = () => {
        const commandDisplay = this.shadowRoot.querySelector("#command-display");
        const inputs = this.shadowRoot.querySelectorAll('input[type="text"]');
        let updatedCommand = formattedCommand;
        for (const inputIdx of range(inputs.length)) {
          const input = inputs[inputIdx];
          const typedValue = input.value;
          if (typedValue) {
            updatedCommand = updatedCommand.replaceAll(`$${inputIdx + 1}`, typedValue);
          }
        }
        commandDisplay.textContent = updatedCommand;
      };
      return html2`
            <style>
                ol {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                ol > label > span {
                    margin-right: 0.5rem;
                }
                form {
                    padding: 1rem;
                    margin-bottom: 1rem;
                    border: 1px solid black;
                    border-radius: 3px;
                }
                button {
                    max-width: 8rem;
                }
            </style>
            <form action="${action}" method="${method}">
                <input type="hidden" name="index" value="${command.index}" />
                <fieldset>
                    <legend>
                        Example: <span id="command-display">${formatCommand(command)}</span>
                    </legend>
                </fieldset>
                ${range(command.nargs).map(
        (x) => html2`<fieldset>
                            <legend>$${x + 1}</legend>
                            <input onchange="${onInputChange}" name="arg" type="text" />
                        </fieldset>`
      )}
                <fieldset>
                    <button type="submit">Run</button>
                </fieldset>
            </form>
        `;
    }
  };
  var cli_command_default = CliCommand;

  // layout/column-layout.js
  var ColumnLayout = class extends BaseWebComponent {
    render(html2) {
      return html2`
            <style>
                div {
                    display: flex;
                    flex-direction: column;
                }
            </style>
            <div>
                <slot></slot>
            </div>
        `;
    }
  };
  var column_layout_default = ColumnLayout;

  // display/drop-down.js
  var DropDown = class extends BaseWebComponent {
    render(html2) {
      return html2`<style>
                .dropdown-toggle {
                    display: none;
                }
                .dropdown-toggle:not(:checked) + label > .icon-expanded {
                    display: none;
                }
                .dropdown-toggle:checked + label > .icon-collapsed {
                    display: none;
                }
                .dropdown-content {
                    display: none;
                }
                .dropdown-toggle:checked + label + .dropdown-content {
                    display: block;
                }
                .outer {
                    width: 100%;
                    border: 1px solid gray;
                    display: flex;
                    flex-direction: column;
                }
                .dropdown-label {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    margin-left: 0.25rem;
                    gap: 1rem;
                    cursor: pointer;
                }
                .dropdown-content {
                    margin-left: 1rem;
                    margin-right: 1rem;
                    margin-bottom: 1rem;
                }
            </style>
            <div class="outer">
                <input
                    class="dropdown-toggle"
                    type="checkbox"
                    id="dropdown-toggle"
                    name="dropdown-toggle"
                />
                <label class="dropdown-label" for="dropdown-toggle">
                    <svg class="icon icon-collapsed">
                        <use href="/static/svg/sprite_sheet.svg#expand_content"></use>
                    </svg>
                    <svg class="icon icon-expanded">
                        <use href="/static/svg/sprite_sheet.svg#collapse_content"></use>
                    </svg>
                    <slot name="header"></slot>
                </label>

                <div class="dropdown-content">
                    <slot></slot>
                </div>
            </div>`;
    }
  };
  var drop_down_default = DropDown;

  // display/file/linking.js
  function getBaseLinkTo(root, fileName) {
    if (fileName === "..") {
      const lastIndex = root.lastIndexOf("/");
      if (lastIndex === -1) {
        return root;
      }
      return root.substring(0, lastIndex);
    } else {
      return encodeURIComponent(`${root}/${fileName}`);
    }
  }
  function getMediaLinkTo(root, filename) {
    return `/home/media/view?path=${getBaseLinkTo(root, filename)}`;
  }
  function getHomeLinkTo(root, filename) {
    return `/home/?path=${getBaseLinkTo(root, filename)}`;
  }
  function getApiDownloadLinkTo(root, filename) {
    return `/api/file?path=${getBaseLinkTo(root, filename)}`;
  }
  function isDirectory(fileType) {
    return fileType === "directory";
  }
  function isMediaFile(fileType) {
    return fileType === "video" || fileType === "sound" || fileType === "image";
  }
  function getNavigationLink(root, filename, fileType) {
    if (isDirectory(fileType)) {
      return getHomeLinkTo(root, filename);
    } else if (isMediaFile(fileType)) {
      return getMediaLinkTo(root, filename);
    } else {
      return getApiDownloadLinkTo(root, filename);
    }
  }
  function resolveEmojiForMediaFile(fileType) {
    if (fileType === "sound") {
      return "\u{1F3B5}";
    } else if (fileType === "image") {
      return "\u{1F4F7}";
    } else if (fileType === "video") {
      return "\u{1F4FD}\uFE0F";
    } else {
      return "";
    }
  }
  function embellishFilename(filename, fileType) {
    if (isDirectory(fileType)) {
      return `${filename}/`;
    } else if (isMediaFile(fileType)) {
      const emoji = resolveEmojiForMediaFile(fileType);
      return `${emoji} ${filename}`;
    } else {
      return filename;
    }
  }

  // display/file/file-card.js
  var FileCard = class extends BaseWebComponent {
    static observedAttributes = ["filename", "root", "image-src", "file-type", "svg-icon-name"];
    constructor() {
      super();
      this.imageRenderingStarted = false;
    }
    render(html2) {
      const filename = this.getAttribute("filename") || "";
      const root = this.getAttribute("root") || "";
      const fileType = this.getAttribute("file-type") || "";
      const iconName = this.getAttribute("svg-icon-name") || "";
      const image = html2`<svg class="large-icon">
            <use href="/static/svg/sprite_sheet.svg#${iconName}"></use>
        </svg>`;
      const href = getNavigationLink(root, filename, fileType);
      const displayText = embellishFilename(filename, fileType);
      return html2`
            <style>
                a {
                    display: flex;
                    flex-grow: 1;
                    flex-direction: column;
                    text-decoration: none;
                    color: var(--font-color);
                    height: var(--file-card-max-height);
                    max-height: var(--file-card-max-height);
                }
                a > div {
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                    align-items: center;
                    justify-content: center;
                    min-height: 0;
                    overflow: hidden;
                    margin-bottom: 0rem;
                    padding-bottom: 0rem;
                    border: 1px solid grey;
                    border-top-left-radius: 5px;
                    border-top-right-radius: 5px;
                }
                img {
                    object-fit: cover;
                    width: 100%;
                    min-height: 0;
                }
                a > span {
                    border: 1px solid grey;
                    border-top: none;
                    border-bottom-left-radius: 5px;
                    border-bottom-right-radius: 5px;
                    overflow: hidden;
                    white-space: nowrap;
                    word-break: break-all;
                    text-overflow: ellipsis;
                    min-height: 1.5rem;
                    padding-left: 0.2rem;
                    padding-right: 0.2rem;
                    flex-grow: 0;
                }
                div.loaded > svg {
                    display: none;
                }
            </style>
            <a href="${href}">
                <div class="image-container">${image}</div>
                <span>${displayText}</span>
            </a>
        `;
    }
    postRender(_html) {
      const imageSrc = this.getAttribute("image-src") || "";
      const container = this.shadowRoot.querySelector(".image-container");
      const hasImage = this.imageRenderingStarted;
      if (imageSrc && !hasImage) {
        this.imageRenderingStarted = true;
        const img = new Image();
        img.src = imageSrc;
        img.fetchPriority = "low";
        img.onload = () => {
          container.appendChild(img);
          container.classList.add("loaded");
        };
      }
    }
  };
  var file_card_default = FileCard;

  // layout/gapped-row.js
  var GappedRow = class extends BaseWebComponent {
    render(html2) {
      return html2`
            <style>
                div {
                    display: flex;
                    flex-direction: row;
                    gap: 1rem;
                    align-items: center;
                    flex-wrap: wrap;
                }
            </style>
            <div>
                <slot></slot>
            </div>
        `;
    }
  };
  var gapped_row_default = GappedRow;

  // navigation/header-nav-select.js
  var HeaderNavSelect = class extends HTMLElement {
    connectedCallback() {
      const shadow = this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = `
            slot { display: none; }
            select {
                font-size: 16px;
                padding: 0.5rem;
                border-radius: 5px;
                background-color: gray;
                color: var(--font-color);
                border: 1px solid black;
                cursor: pointer;
                width: 100%;
            }
        `;
      const select = document.createElement("select");
      select.addEventListener("change", (e) => {
        window.location.href = e.target.value;
      });
      const slot = document.createElement("slot");
      slot.addEventListener("slotchange", () => this._buildOptions(select));
      shadow.appendChild(style);
      shadow.appendChild(select);
      shadow.appendChild(slot);
      this._buildOptions(select);
    }
    _buildOptions(select) {
      let currentLocation = document.location.pathname;
      if (!currentLocation.endsWith("/")) {
        currentLocation += "/";
      }
      select.replaceChildren();
      for (const child of this.children) {
        if (child instanceof HTMLOptionElement) {
          const opt = child.cloneNode(true);
          opt.selected = currentLocation.startsWith(child.value);
          select.appendChild(opt);
        }
      }
    }
  };
  var header_nav_select_default = HeaderNavSelect;

  // navigation/header-tab.js
  var HeaderTab = class extends BaseWebComponent {
    static observedAttributes = ["href"];
    render(html2) {
      const href = this.getAttribute("href") || "";
      let currentLocation = document.location.pathname;
      if (!currentLocation.endsWith("/")) {
        currentLocation += "/";
      }
      const selected = currentLocation.startsWith(href);
      return html2` <style>
                a {
                    color: var(--font-color);
                    font-size: 16px;
                    text-decoration: none;
                    line-height: 16px;
                    padding-left: 1rem;
                    padding-right: 1rem;
                    padding-bottom: 0.5rem;
                }
                div {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: end;
                    align-items: center;
                }
                div.selected {
                    background-color: gray;
                    border-left: 1px solid black;
                    border-bottom: 1px solid black;
                    border-right: 1px solid black;
                    border-bottom-left-radius: 5px;
                    border-bottom-right-radius: 5px;
                }
            </style>
            <div class="${selected ? "selected" : ""}">
                <a href="${href}"><slot></slot></a>
            </div>`;
    }
  };
  var header_tab_default = HeaderTab;

  // layout/horizontal-ruler.js
  var HorizontalRuler = class extends BaseWebComponent {
    render(html2) {
      return html2`
            <style>
                hr {
                    width: 100%;
                }
            </style>
            <hr />
        `;
    }
  };
  var horizontal_ruler_default = HorizontalRuler;

  // util.js
  function isAttributeTrue(value) {
    return value !== "false" && value !== "0" && value !== "" && value !== void 0 && value !== null;
  }

  // display/icon-hover.js
  var IconHover = class extends BaseWebComponent {
    static observedAttributes = ["url", "disabled"];
    render(html2) {
      const url = this.getAttribute("url") || (isAttributeTrue(this.getAttribute("disabled")) ? "" : "/static/svg/image.svg");
      const styles = html2`<style>
            .outer {
                position: relative;
                height: 100%;
            }
            label {
                position: absolute;
                visibility: hidden;
                display: flex;
                flex-direction: row;
                align-items: center;
                left: 2rem;
                top: -30px;
                padding-top: 1rem;
                padding-bottom: 1rem;
                padding-left: 1rem;
                padding-right: 1rem;
                border: 1px solid grey;
                background-color: var(--background-color);
            }
            .icon-holder {
                background-image: url('${url}');
                background-size: cover;
                background-repeat: no-repeat;
                width: var(--thumbnail-hover-max-width);
                height: var(--thumbnail-hover-max-width);
            }
            .outer:hover > label {
                visibility: visible;
            }
            .inner {
                height: 100%;
                display: flex;
                flex-direction: row;
                align-items: center;
            }
        </style>`;
      if (!url) {
        return html2`${styles}
                <div class="outer">
                    <div class="inner">
                        <slot></slot>
                    </div>
                </div>`;
      }
      return html2`
            ${styles}
            <div class="outer">
                <label>
                    <span class="icon-holder"></span>
                </label>
                <div class="inner">
                    <slot></slot>
                </div>
            </div>
        `;
    }
  };
  var icon_hover_default = IconHover;

  // display/log-drop-down.js
  var LogDropDown = class extends BaseWebComponent {
    static observedAttributes = ["header", "text"];
    render(html2) {
      const header = this.getAttribute("header");
      const text = this.getAttribute("text");
      return html2`<drop-down>
            <style>
                pre {
                    display: flex;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }
            </style>
            <h2 slot="header">${header}</h2>
            <pre>${text}</pre>
        </drop-down>`;
    }
  };
  var log_drop_down_default = LogDropDown;

  // display/media-viewer.js
  var MediaViewer = class extends BaseWebComponent {
    static get observedAttributes() {
      return ["src"];
    }
    render(html2) {
      const src = this.getAttribute("src");
      if (!src) {
        return;
      }
      const mimeType = src.endsWith("mp4") ? "video/mp4" : src.endsWith("m4v") ? "video/mp4" : src.endsWith("png") ? "image/png" : src.endsWith("jpg") || src.endsWith("jpeg") ? "image/jpg" : src.endsWith("gif") ? "image/gif" : "";
      const srcPath = `/api/file?path=${encodeURIComponent(src)}`;
      return html2`
            <style>
                .media-holder {
                    max-height: 90vh;
                    max-width: 90vw;
                }
                div {
                    margin-top: 2rem;
                    margin-bottom: 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
            </style>
            <div>
                ${mimeType.startsWith("image") ? html2`<img class="media-holder" src=${srcPath} />` : html2`<video controls class="col-12 media-holder">
                          <source src="${srcPath}" type="${mimeType}" />
                      </video>`}
            </div>
        `;
    }
  };
  var media_viewer_default = MediaViewer;

  // control/paginate-control.js
  var PaginateControl = class extends BaseWebComponent {
    static observedAttributes = ["page", "max-pages"];
    render(html2) {
      const currentPage = Number.parseInt(this.getAttribute("page")) || 1;
      const maxPages = Number.parseInt(this.getAttribute("max-pages")) || 1;
      const to = (page) => {
        if (page < 1 || page > maxPages || page === currentPage) {
          return;
        }
        this.dispatchEvent(
          new CustomEvent("page-shift", {
            bubbles: true,
            composed: true,
            detail: {
              page
            }
          })
        );
      };
      const pre = () => {
        to(currentPage - 1);
      };
      const post = () => {
        to(currentPage + 1);
      };
      const getPageNumbers = () => {
        const pages = [];
        const delta = 2;
        const ELLIPSIS_THRESHOLD = delta * 2 + 1 + 2;
        const needsEllipses = maxPages > ELLIPSIS_THRESHOLD;
        if (!needsEllipses) {
          for (let i = 1; i <= maxPages; i++) {
            pages.push(i);
          }
          return pages;
        }
        for (let i = 1; i <= maxPages; i++) {
          if (i === 1 || i === maxPages || i >= currentPage - delta && i <= currentPage + delta) {
            pages.push(i);
          }
        }
        return pages;
      };
      const pageNumbers = getPageNumbers();
      return html2`
            <style>
                li {
                    list-style-type: none;
                }

                nav {
                    border: 1px white;
                    border-radius: 3px;
                }
                ul {
                    display: flex;
                    flex-direction: row;
                    gap: 1rem;
                    padding-left: 0;
                }
                a {
                    text-decoration: underline;
                    color: var(--font-color);
                }
                a.disabled {
                    opacity: var(--disabled-opacity);
                    pointer-events: none;
                }
                .ellipsis {
                    color: var(--font-color);
                    opacity: var(--disabled-opacity);
                }
            </style>
            <nav>
                <ul>
                    <li>
                        <a
                            href="#"
                            class="${currentPage === 1 ? "disabled" : ""}"
                            onclick="${() => pre()}"
                            >${"<"}</a
                        >
                    </li>
                    ${pageNumbers.map((pageNum, idx) => {
        const prevPageNum = idx > 0 ? pageNumbers[idx - 1] : 0;
        const showEllipsis = pageNum - prevPageNum > 1;
        return html2`
                            ${showEllipsis ? html2`<li class="ellipsis">...</li>` : ""}
                            <li>
                                <a
                                    href="#"
                                    class="${currentPage === pageNum ? "disabled" : ""}"
                                    onclick="${() => to(pageNum)}"
                                    >${pageNum}</a
                                >
                            </li>
                        `;
      })}
                    <li>
                        <a
                            href="#"
                            class="${currentPage === maxPages ? "disabled" : ""}"
                            onclick="${() => post()}"
                            >${">"}</a
                        >
                    </li>
                </ul>
            </nav>
        `;
    }
  };
  var paginate_control_default = PaginateControl;

  // control/radio-control.js
  var RadioControl = class extends BaseWebComponent {
    static get observedAttributes() {
      return ["imgsrc", "checked", "text"];
    }
    render(html2) {
      const imgSrc = this.getAttribute("imgsrc") || "";
      const checked = isAttributeTrue(this.getAttribute("checked") || "");
      const text = this.getAttribute("text") || "";
      const styles = html2` <style>
            svg {
                color: gray;
                display: block;
            }
            .checked > svg {
                color: rgb(100, 150, 255);
            }
            label {
                user-select: none;
                color: gray;
                cursor: pointer;
            }
            label.checked {
                color: rgb(100, 150, 255);
            }
        </style>`;
      const child = imgSrc ? html2`<svg class="icon">
                  <use href="/static/svg/sprite_sheet.svg#${imgSrc}"></use>
              </svg>` : html2`${text}`;
      return html2`${styles} <label class="${checked ? "checked" : ""}"> ${child} </label>`;
    }
  };
  var radio_control_default = RadioControl;

  // layout/row-layout.js
  var RowLayout = class extends BaseWebComponent {
    render(html2) {
      return html2`
            <style>
                div {
                    display: flex;
                    flex-direction: row;
                }
            </style>
            <div>
                <slot></slot>
            </div>
        `;
    }
  };
  var row_layout_default = RowLayout;

  // control/switch-control.js
  var SwitchControl = class extends BaseWebComponent {
    static observedAttributes = ["checked"];
    render(html2) {
      const checked = isAttributeTrue(this.getAttribute("checked"));
      const onChange = () => {
        this.dispatchEvent(
          new CustomEvent("change", {
            bubbles: true,
            composed: true,
            detail: {
              checked: !checked
            }
          })
        );
      };
      return html2`
            <style>
                label {
                    display: flex;
                    flex-direction: row;
                    gap: 1.5rem;
                }
            </style>
            <label>
                <input
                    type="checkbox"
                    role="switch"
                    id="switchCheckChecked"
                    checked="${checked}"
                    onchange="${() => onChange()}"
                />
                <slot></slot>
            </label>
        `;
    }
  };
  var switch_control_default = SwitchControl;

  // display/file/file-link.js
  var FileLink = class extends BaseWebComponent {
    static observedAttributes = ["filename", "root", "file-type"];
    render(html2) {
      const filename = this.getAttribute("filename") || "";
      const fileType = this.getAttribute("file-type") || "";
      const root = this.getAttribute("root") || "";
      return html2`
            <a href=${getNavigationLink(root, filename, fileType)}>
                <span>${filename}</span>
            </a>
        `;
    }
  };
  var file_link_default = FileLink;

  // index.js
  var components = [
    ["app-header", app_header_default],
    ["app-main", app_main_default],
    ["app-subheader", app_subheader_default],
    ["breadcrumb-nav", breadcrumb_nav_default],
    ["cli-command", cli_command_default],
    ["column-layout", column_layout_default],
    ["drop-down", drop_down_default],
    ["file-card", file_card_default],
    ["file-link", file_link_default],
    ["gapped-row", gapped_row_default],
    ["header-nav-select", header_nav_select_default],
    ["header-tab", header_tab_default],
    ["horizontal-ruler", horizontal_ruler_default],
    ["icon-hover", icon_hover_default],
    ["log-drop-down", log_drop_down_default],
    ["media-viewer", media_viewer_default],
    ["paginate-control", paginate_control_default],
    ["radio-control", radio_control_default],
    ["row-layout", row_layout_default],
    ["switch-control", switch_control_default]
  ];
  function register(name, Component) {
    console.log("Registering WebComponent", name);
    customElements.define(name, Component);
  }
  loadSharedStylesheets().then((sharedStylesheets) => {
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, ...sharedStylesheets];
    for (const [name, Component] of components) {
      register(name, Component);
    }
  });
})();
