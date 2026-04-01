(() => {
  // vendor/preact.mjs
  var D;
  var d;
  var Y;
  var ce;
  var x;
  var K;
  var Z;
  var ee;
  var _e;
  var V;
  var $;
  var j;
  var te;
  var M = {};
  var ne = [];
  var pe = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
  var L = Array.isArray;
  function k(_, e) {
    for (var t in e) _[t] = e[t];
    return _;
  }
  function z(_) {
    _ && _.parentNode && _.parentNode.removeChild(_);
  }
  function fe(_, e, t) {
    var o, l, r, i = {};
    for (r in e) r == "key" ? o = e[r] : r == "ref" ? l = e[r] : i[r] = e[r];
    if (arguments.length > 2 && (i.children = arguments.length > 3 ? D.call(arguments, 2) : t), typeof _ == "function" && _.defaultProps != null) for (r in _.defaultProps) i[r] === void 0 && (i[r] = _.defaultProps[r]);
    return E(_, i, o, l, null);
  }
  function E(_, e, t, o, l) {
    var r = { type: _, props: e, key: t, ref: o, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: l ?? ++Y, __i: -1, __u: 0 };
    return l == null && d.vnode != null && d.vnode(r), r;
  }
  function I(_) {
    return _.children;
  }
  function N(_, e) {
    this.props = _, this.context = e;
  }
  function P(_, e) {
    if (e == null) return _.__ ? P(_.__, _.__i + 1) : null;
    for (var t; e < _.__k.length; e++) if ((t = _.__k[e]) != null && t.__e != null) return t.__e;
    return typeof _.type == "function" ? P(_) : null;
  }
  function re(_) {
    var e, t;
    if ((_ = _.__) != null && _.__c != null) {
      for (_.__e = _.__c.base = null, e = 0; e < _.__k.length; e++) if ((t = _.__k[e]) != null && t.__e != null) {
        _.__e = _.__c.base = t.__e;
        break;
      }
      return re(_);
    }
  }
  function B(_) {
    (!_.__d && (_.__d = true) && x.push(_) && !H.__r++ || K != d.debounceRendering) && ((K = d.debounceRendering) || Z)(H);
  }
  function H() {
    for (var _, e, t, o, l, r, i, u = 1; x.length; ) x.length > u && x.sort(ee), _ = x.shift(), u = x.length, _.__d && (t = void 0, l = (o = (e = _).__v).__e, r = [], i = [], e.__P && ((t = k({}, o)).__v = o.__v + 1, d.vnode && d.vnode(t), q(e.__P, t, o, e.__n, e.__P.namespaceURI, 32 & o.__u ? [l] : null, r, l ?? P(o), !!(32 & o.__u), i), t.__v = o.__v, t.__.__k[t.__i] = t, ie(r, t, i), t.__e != l && re(t)));
    H.__r = 0;
  }
  function oe(_, e, t, o, l, r, i, u, f, s, p) {
    var n, v, c, m, g, y, a2 = o && o.__k || ne, h = e.length;
    for (f = ae(t, e, a2, f, h), n = 0; n < h; n++) (c = t.__k[n]) != null && (v = c.__i == -1 ? M : a2[c.__i] || M, c.__i = n, y = q(_, c, v, l, r, i, u, f, s, p), m = c.__e, c.ref && v.ref != c.ref && (v.ref && G(v.ref, null, c), p.push(c.ref, c.__c || m, c)), g == null && m != null && (g = m), 4 & c.__u || v.__k === c.__k ? f = le(c, f, _) : typeof c.type == "function" && y !== void 0 ? f = y : m && (f = m.nextSibling), c.__u &= -7);
    return t.__e = g, f;
  }
  function ae(_, e, t, o, l) {
    var r, i, u, f, s, p = t.length, n = p, v = 0;
    for (_.__k = new Array(l), r = 0; r < l; r++) (i = e[r]) != null && typeof i != "boolean" && typeof i != "function" ? (f = r + v, (i = _.__k[r] = typeof i == "string" || typeof i == "number" || typeof i == "bigint" || i.constructor == String ? E(null, i, null, null, null) : L(i) ? E(I, { children: i }, null, null, null) : i.constructor == null && i.__b > 0 ? E(i.type, i.props, i.key, i.ref ? i.ref : null, i.__v) : i).__ = _, i.__b = _.__b + 1, u = null, (s = i.__i = de(i, t, f, n)) != -1 && (n--, (u = t[s]) && (u.__u |= 2)), u == null || u.__v == null ? (s == -1 && (l > p ? v-- : l < p && v++), typeof i.type != "function" && (i.__u |= 4)) : s != f && (s == f - 1 ? v-- : s == f + 1 ? v++ : (s > f ? v-- : v++, i.__u |= 4))) : _.__k[r] = null;
    if (n) for (r = 0; r < p; r++) (u = t[r]) != null && (2 & u.__u) == 0 && (u.__e == o && (o = P(u)), ue(u, u));
    return o;
  }
  function le(_, e, t) {
    var o, l;
    if (typeof _.type == "function") {
      for (o = _.__k, l = 0; o && l < o.length; l++) o[l] && (o[l].__ = _, e = le(o[l], e, t));
      return e;
    }
    _.__e != e && (e && _.type && !t.contains(e) && (e = P(_)), t.insertBefore(_.__e, e || null), e = _.__e);
    do
      e = e && e.nextSibling;
    while (e != null && e.nodeType == 8);
    return e;
  }
  function de(_, e, t, o) {
    var l, r, i, u = _.key, f = _.type, s = e[t], p = s != null && (2 & s.__u) == 0;
    if (s === null && _.key == null || p && u == s.key && f == s.type) return t;
    if (o > (p ? 1 : 0)) {
      for (l = t - 1, r = t + 1; l >= 0 || r < e.length; ) if ((s = e[i = l >= 0 ? l-- : r++]) != null && (2 & s.__u) == 0 && u == s.key && f == s.type) return i;
    }
    return -1;
  }
  function Q(_, e, t) {
    e[0] == "-" ? _.setProperty(e, t ?? "") : _[e] = t == null ? "" : typeof t != "number" || pe.test(e) ? t : t + "px";
  }
  function F(_, e, t, o, l) {
    var r, i;
    e: if (e == "style") if (typeof t == "string") _.style.cssText = t;
    else {
      if (typeof o == "string" && (_.style.cssText = o = ""), o) for (e in o) t && e in t || Q(_.style, e, "");
      if (t) for (e in t) o && t[e] == o[e] || Q(_.style, e, t[e]);
    }
    else if (e[0] == "o" && e[1] == "n") r = e != (e = e.replace(_e, "$1")), i = e.toLowerCase(), e = i in _ || e == "onFocusOut" || e == "onFocusIn" ? i.slice(2) : e.slice(2), _.l || (_.l = {}), _.l[e + r] = t, t ? o ? t.u = o.u : (t.u = V, _.addEventListener(e, r ? j : $, r)) : _.removeEventListener(e, r ? j : $, r);
    else {
      if (l == "http://www.w3.org/2000/svg") e = e.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if (e != "width" && e != "height" && e != "href" && e != "list" && e != "form" && e != "tabIndex" && e != "download" && e != "rowSpan" && e != "colSpan" && e != "role" && e != "popover" && e in _) try {
        _[e] = t ?? "";
        break e;
      } catch {
      }
      typeof t == "function" || (t == null || t === false && e[4] != "-" ? _.removeAttribute(e) : _.setAttribute(e, e == "popover" && t == 1 ? "" : t));
    }
  }
  function X(_) {
    return function(e) {
      if (this.l) {
        var t = this.l[e.type + _];
        if (e.t == null) e.t = V++;
        else if (e.t < t.u) return;
        return t(d.event ? d.event(e) : e);
      }
    };
  }
  function q(_, e, t, o, l, r, i, u, f, s) {
    var p, n, v, c, m, g, y, a2, h, S, w, W, U, J, A, T, R, b2 = e.type;
    if (e.constructor != null) return null;
    128 & t.__u && (f = !!(32 & t.__u), r = [u = e.__e = t.__e]), (p = d.__b) && p(e);
    e: if (typeof b2 == "function") try {
      if (a2 = e.props, h = "prototype" in b2 && b2.prototype.render, S = (p = b2.contextType) && o[p.__c], w = p ? S ? S.props.value : p.__ : o, t.__c ? y = (n = e.__c = t.__c).__ = n.__E : (h ? e.__c = n = new b2(a2, w) : (e.__c = n = new N(a2, w), n.constructor = b2, n.render = me), S && S.sub(n), n.props = a2, n.state || (n.state = {}), n.context = w, n.__n = o, v = n.__d = true, n.__h = [], n._sb = []), h && n.__s == null && (n.__s = n.state), h && b2.getDerivedStateFromProps != null && (n.__s == n.state && (n.__s = k({}, n.__s)), k(n.__s, b2.getDerivedStateFromProps(a2, n.__s))), c = n.props, m = n.state, n.__v = e, v) h && b2.getDerivedStateFromProps == null && n.componentWillMount != null && n.componentWillMount(), h && n.componentDidMount != null && n.__h.push(n.componentDidMount);
      else {
        if (h && b2.getDerivedStateFromProps == null && a2 !== c && n.componentWillReceiveProps != null && n.componentWillReceiveProps(a2, w), !n.__e && n.shouldComponentUpdate != null && n.shouldComponentUpdate(a2, n.__s, w) === false || e.__v == t.__v) {
          for (e.__v != t.__v && (n.props = a2, n.state = n.__s, n.__d = false), e.__e = t.__e, e.__k = t.__k, e.__k.some(function(C) {
            C && (C.__ = e);
          }), W = 0; W < n._sb.length; W++) n.__h.push(n._sb[W]);
          n._sb = [], n.__h.length && i.push(n);
          break e;
        }
        n.componentWillUpdate != null && n.componentWillUpdate(a2, n.__s, w), h && n.componentDidUpdate != null && n.__h.push(function() {
          n.componentDidUpdate(c, m, g);
        });
      }
      if (n.context = w, n.props = a2, n.__P = _, n.__e = false, U = d.__r, J = 0, h) {
        for (n.state = n.__s, n.__d = false, U && U(e), p = n.render(n.props, n.state, n.context), A = 0; A < n._sb.length; A++) n.__h.push(n._sb[A]);
        n._sb = [];
      } else do
        n.__d = false, U && U(e), p = n.render(n.props, n.state, n.context), n.state = n.__s;
      while (n.__d && ++J < 25);
      n.state = n.__s, n.getChildContext != null && (o = k(k({}, o), n.getChildContext())), h && !v && n.getSnapshotBeforeUpdate != null && (g = n.getSnapshotBeforeUpdate(c, m)), T = p, p != null && p.type === I && p.key == null && (T = se(p.props.children)), u = oe(_, L(T) ? T : [T], e, t, o, l, r, i, u, f, s), n.base = e.__e, e.__u &= -161, n.__h.length && i.push(n), y && (n.__E = n.__ = null);
    } catch (C) {
      if (e.__v = null, f || r != null) if (C.then) {
        for (e.__u |= f ? 160 : 128; u && u.nodeType == 8 && u.nextSibling; ) u = u.nextSibling;
        r[r.indexOf(u)] = null, e.__e = u;
      } else {
        for (R = r.length; R--; ) z(r[R]);
        O(e);
      }
      else e.__e = t.__e, e.__k = t.__k, C.then || O(e);
      d.__e(C, e, t);
    }
    else r == null && e.__v == t.__v ? (e.__k = t.__k, e.__e = t.__e) : u = e.__e = ve(t.__e, e, t, o, l, r, i, f, s);
    return (p = d.diffed) && p(e), 128 & e.__u ? void 0 : u;
  }
  function O(_) {
    _ && _.__c && (_.__c.__e = true), _ && _.__k && _.__k.forEach(O);
  }
  function ie(_, e, t) {
    for (var o = 0; o < t.length; o++) G(t[o], t[++o], t[++o]);
    d.__c && d.__c(e, _), _.some(function(l) {
      try {
        _ = l.__h, l.__h = [], _.some(function(r) {
          r.call(l);
        });
      } catch (r) {
        d.__e(r, l.__v);
      }
    });
  }
  function se(_) {
    return typeof _ != "object" || _ == null || _.__b && _.__b > 0 ? _ : L(_) ? _.map(se) : k({}, _);
  }
  function ve(_, e, t, o, l, r, i, u, f) {
    var s, p, n, v, c, m, g, y = t.props, a2 = e.props, h = e.type;
    if (h == "svg" ? l = "http://www.w3.org/2000/svg" : h == "math" ? l = "http://www.w3.org/1998/Math/MathML" : l || (l = "http://www.w3.org/1999/xhtml"), r != null) {
      for (s = 0; s < r.length; s++) if ((c = r[s]) && "setAttribute" in c == !!h && (h ? c.localName == h : c.nodeType == 3)) {
        _ = c, r[s] = null;
        break;
      }
    }
    if (_ == null) {
      if (h == null) return document.createTextNode(a2);
      _ = document.createElementNS(l, h, a2.is && a2), u && (d.__m && d.__m(e, r), u = false), r = null;
    }
    if (h == null) y === a2 || u && _.data == a2 || (_.data = a2);
    else {
      if (r = r && D.call(_.childNodes), y = t.props || M, !u && r != null) for (y = {}, s = 0; s < _.attributes.length; s++) y[(c = _.attributes[s]).name] = c.value;
      for (s in y) if (c = y[s], s != "children") {
        if (s == "dangerouslySetInnerHTML") n = c;
        else if (!(s in a2)) {
          if (s == "value" && "defaultValue" in a2 || s == "checked" && "defaultChecked" in a2) continue;
          F(_, s, null, c, l);
        }
      }
      for (s in a2) c = a2[s], s == "children" ? v = c : s == "dangerouslySetInnerHTML" ? p = c : s == "value" ? m = c : s == "checked" ? g = c : u && typeof c != "function" || y[s] === c || F(_, s, c, y[s], l);
      if (p) u || n && (p.__html == n.__html || p.__html == _.innerHTML) || (_.innerHTML = p.__html), e.__k = [];
      else if (n && (_.innerHTML = ""), oe(e.type == "template" ? _.content : _, L(v) ? v : [v], e, t, o, h == "foreignObject" ? "http://www.w3.org/1999/xhtml" : l, r, i, r ? r[0] : t.__k && P(t, 0), u, f), r != null) for (s = r.length; s--; ) z(r[s]);
      u || (s = "value", h == "progress" && m == null ? _.removeAttribute("value") : m != null && (m !== _[s] || h == "progress" && !m || h == "option" && m != y[s]) && F(_, s, m, y[s], l), s = "checked", g != null && g != _[s] && F(_, s, g, y[s], l));
    }
    return _;
  }
  function G(_, e, t) {
    try {
      if (typeof _ == "function") {
        var o = typeof _.__u == "function";
        o && _.__u(), o && e == null || (_.__u = _(e));
      } else _.current = e;
    } catch (l) {
      d.__e(l, t);
    }
  }
  function ue(_, e, t) {
    var o, l;
    if (d.unmount && d.unmount(_), (o = _.ref) && (o.current && o.current != _.__e || G(o, null, e)), (o = _.__c) != null) {
      if (o.componentWillUnmount) try {
        o.componentWillUnmount();
      } catch (r) {
        d.__e(r, e);
      }
      o.base = o.__P = null;
    }
    if (o = _.__k) for (l = 0; l < o.length; l++) o[l] && ue(o[l], e, t || typeof _.type != "function");
    t || z(_.__e), _.__c = _.__ = _.__e = void 0;
  }
  function me(_, e, t) {
    return this.constructor(_, t);
  }
  function ye(_, e, t) {
    var o, l, r, i;
    e == document && (e = document.documentElement), d.__ && d.__(_, e), l = (o = typeof t == "function") ? null : t && t.__k || e.__k, r = [], i = [], q(e, _ = (!o && t || e).__k = fe(I, null, [_]), l || M, M, e.namespaceURI, !o && t ? [t] : l ? null : e.firstChild ? D.call(e.childNodes) : null, r, !o && t ? t : l ? l.__e : e.firstChild, o, i), ie(r, _, i);
  }
  D = ne.slice, d = { __e: function(_, e, t, o) {
    for (var l, r, i; e = e.__; ) if ((l = e.__c) && !l.__) try {
      if ((r = l.constructor) && r.getDerivedStateFromError != null && (l.setState(r.getDerivedStateFromError(_)), i = l.__d), l.componentDidCatch != null && (l.componentDidCatch(_, o || {}), i = l.__d), i) return l.__E = l;
    } catch (u) {
      _ = u;
    }
    throw _;
  } }, Y = 0, ce = function(_) {
    return _ != null && _.constructor == null;
  }, N.prototype.setState = function(_, e) {
    var t;
    t = this.__s != null && this.__s != this.state ? this.__s : this.__s = k({}, this.state), typeof _ == "function" && (_ = _(k({}, t), this.props)), _ && k(t, _), _ != null && this.__v && (e && this._sb.push(e), B(this));
  }, N.prototype.forceUpdate = function(_) {
    this.__v && (this.__e = true, _ && this.__h.push(_), B(this));
  }, N.prototype.render = I, x = [], Z = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, ee = function(_, e) {
    return _.__v.__b - e.__v.__b;
  }, H.__r = 0, _e = /(PointerCapture)$|Capture$/i, V = 0, $ = X(false), j = X(true), te = 0;

  // vendor/htm.mjs
  var a = function(p, f, c, n) {
    var l;
    f[0] = 0;
    for (var u = 1; u < f.length; u++) {
      var g = f[u++], o = f[u] ? (f[0] |= g ? 1 : 2, c[f[u++]]) : f[++u];
      g === 3 ? n[0] = o : g === 4 ? n[1] = Object.assign(n[1] || {}, o) : g === 5 ? (n[1] = n[1] || {})[f[++u]] = o : g === 6 ? n[1][f[++u]] += o + "" : g ? (l = p.apply(o, a(p, o, c, ["", null])), n.push(l), o[0] ? f[0] |= 2 : (f[u - 2] = 0, f[u] = l)) : n.push(o);
    }
    return n;
  };
  var M2 = /* @__PURE__ */ new Map();
  function b(p) {
    var f = M2.get(this);
    return f || (f = /* @__PURE__ */ new Map(), M2.set(this, f)), (f = a(this, f.get(p) || (f.set(p, f = (function(c) {
      for (var n, l, u = 1, g = "", o = "", i = [0], s = function(v) {
        u === 1 && (v || (g = g.replace(/^\s*\n\s*|\s*\n\s*$/g, ""))) ? i.push(0, v, g) : u === 3 && (v || g) ? (i.push(3, v, g), u = 2) : u === 2 && g === "..." && v ? i.push(4, v, 0) : u === 2 && g && !v ? i.push(5, 0, true, g) : u >= 5 && ((g || !v && u === 5) && (i.push(u, 0, g, l), u = 6), v && (i.push(u, v, 0, l), u = 6)), g = "";
      }, t = 0; t < c.length; t++) {
        t && (u === 1 && s(), s(t));
        for (var w = 0; w < c[t].length; w++) n = c[t][w], u === 1 ? n === "<" ? (s(), i = [i], u = 3) : g += n : u === 4 ? g === "--" && n === ">" ? (u = 1, g = "") : g = n + g[0] : o ? n === o ? o = "" : g += n : n === '"' || n === "'" ? o = n : n === ">" ? (s(), u = 1) : u && (n === "=" ? (u = 5, l = g, g = "") : n === "/" && (u < 5 || c[t][w + 1] === ">") ? (s(), u === 3 && (i = i[0]), u = i, (i = i[0]).push(2, 0, u), u = 0) : n === " " || n === "	" || n === `
` || n === "\r" ? (s(), u = 2) : g += n), u === 3 && g === "!--" && (u = 4, i = i[0]);
      }
      return s(), i;
    })(p)), f), arguments, [])).length > 1 ? f : f[0];
  }

  // base.js
  var html = b.bind(fe);
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
    _renderComponent() {
      const content = this.render(html);
      ye(content, this.shadowRoot);
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
        (x2) => html2`<fieldset>
                            <legend>$${x2 + 1}</legend>
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
  function urlEncodeThumbnailComponent(url) {
    const x2 = url.split("path=")[1];
    return `/api/thumbnail?path=${encodeURIComponent(x2)}`;
  }
  var FileCard = class extends BaseWebComponent {
    static observedAttributes = ["filename", "root", "image-src", "file-type"];
    render(html2) {
      const filename = this.getAttribute("filename") || "";
      const root = this.getAttribute("root") || "";
      const imageSrc = this.getAttribute("image-src") || "";
      const fileType = this.getAttribute("file-type") || "";
      const image = imageSrc.includes("/thumbnail") ? html2`<img src="${urlEncodeThumbnailComponent(imageSrc)}" />` : html2`<svg class="large-icon">
                  <use href="/static/svg/sprite_sheet.svg#${imageSrc}"></use>
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
            </style>
            <a href="${href}">
                <div>${image}</div>
                <span>${displayText}</span>
            </a>
        `;
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
