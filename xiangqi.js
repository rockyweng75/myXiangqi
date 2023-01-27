var E = Object.defineProperty;
var F = (a, t, i) => t in a ? E(a, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : a[t] = i;
var o = (a, t, i) => (F(a, typeof t != "symbol" ? t + "" : t, i), i);
(function() {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload"))
    return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]'))
    e(s);
  new MutationObserver((s) => {
    for (const h of s)
      if (h.type === "childList")
        for (const n of h.addedNodes)
          n.tagName === "LINK" && n.rel === "modulepreload" && e(n);
  }).observe(document, { childList: !0, subtree: !0 });
  function i(s) {
    const h = {};
    return s.integrity && (h.integrity = s.integrity), s.referrerpolicy && (h.referrerPolicy = s.referrerpolicy), s.crossorigin === "use-credentials" ? h.credentials = "include" : s.crossorigin === "anonymous" ? h.credentials = "omit" : h.credentials = "same-origin", h;
  }
  function e(s) {
    if (s.ep)
      return;
    s.ep = !0;
    const h = i(s);
    fetch(s.href, h);
  }
})();
class B {
  constructor(t, i, e, s, h, n) {
    o(this, "triangleAngle", 5);
    o(this, "triangleWidth", 0);
    o(this, "ctx");
    o(this, "id");
    o(this, "coordinate");
    o(this, "x");
    o(this, "y");
    o(this, "width");
    o(this, "height");
    o(this, "text", "");
    o(this, "strokeStyle", "#000000");
    o(this, "backgroundColor", "#ffffff");
    o(this, "faction", "black");
    o(this, "isFocus", !1);
    this.ctx = t, this.id = i, this.coordinate = e, this.x = e.x, this.y = e.y, this.width = s, this.height = h;
    let l = this.height / Math.sin(this.triangleAngle);
    this.triangleWidth = l * Math.cos(this.triangleAngle) * -1, this.faction = n;
  }
  isInside(t, i) {
    let e = this.x, s = this.y, h = this.width / 2;
    return Math.pow(t, 2) + Math.pow(i, 2) - 2 * e * t - 2 * s * i + Math.pow(e, 2) + Math.pow(s, 2) - Math.pow(h, 2) <= 0 && Math.pow(-2 * e, 2) + Math.pow(-2 * s, 2) - 4 * (Math.pow(e, 2) + Math.pow(s, 2) - Math.pow(h, 2)) > 0;
  }
  move(t) {
    return new Promise((i) => {
      this.x = t.x, this.y = t.y, this.coordinate = t, i();
    });
  }
  resize(t, i) {
    return new Promise((e) => {
      this.width = t, this.height = i, e();
    });
  }
  print() {
    var t;
    this.ctx.save(), this.ctx.translate(this.x, this.y), this.ctx.beginPath(), this.ctx.arc(0, 0, this.width / 2, 0, 2 * Math.PI), this.ctx.lineWidth = 5, this.isFocus ? this.ctx.strokeStyle = "dodgerblue" : this.ctx.strokeStyle = "black", (t = this.ctx) == null || t.stroke(), this.ctx.fillStyle = this.backgroundColor, this.ctx.fill(), this.text && (this.ctx.font = "normal normal 900 16px sans-serif", this.ctx.textAlign = "center", this.ctx.textBaseline = "middle", this.faction === "black" ? this.ctx.fillStyle = "#000000" : this.ctx.fillStyle = "red", this.ctx.fillText(this.text, 0, 2)), this.ctx.restore();
  }
  isOverlapping(t, i, e, s) {
    return this.x <= t && t <= this.x + this.width && this.y <= i && i <= this.y + this.height && this.x <= t + e && t + e <= this.x + this.width && this.y <= i + s && i + s <= this.y + this.height;
  }
  focus(t) {
    return this.isFocus = t, t ? this.initMovePoint() : [];
  }
  orderCxAsc(t, i) {
    return t.coordinate.cx > i.coordinate.cx ? 1 : t.coordinate.cx < i.coordinate.cx ? -1 : 0;
  }
  orderCxDesc(t, i) {
    return t.coordinate.cx > i.coordinate.cx ? -1 : t.coordinate.cx < i.coordinate.cx ? 1 : 0;
  }
  orderCyAsc(t, i) {
    return t.coordinate.cy > i.coordinate.cy ? 1 : t.coordinate.cy < i.coordinate.cy ? -1 : 0;
  }
  orderCyDesc(t, i) {
    return t.coordinate.cy > i.coordinate.cy ? -1 : t.coordinate.cy < i.coordinate.cy ? 1 : 0;
  }
}
class T extends B {
  decidePoint(t, i) {
    let e, s, h, n, l = i.filter((r) => t.some((c) => c.coordinate.cid === r.coordinate.cid));
    return l.forEach((r) => {
      if (r.coordinate.cy === this.coordinate.cy) {
        let c = l.filter((m) => m.coordinate.cy === this.coordinate.cy);
        r.coordinate.cx > this.coordinate.cx ? s = c.filter((u) => u.coordinate.cx > this.coordinate.cx).sort((u) => u.coordinate.cx).sort(this.orderCxAsc)[0] : e = c.filter((u) => u.coordinate.cx < this.coordinate.cx).sort((u) => u.coordinate.cx * -1).sort(this.orderCxDesc)[0];
      }
      if (r.coordinate.cx === this.coordinate.cx) {
        let c = l.filter((m) => m.coordinate.cx === this.coordinate.cx);
        r.coordinate.cy > this.coordinate.cy ? n = c.filter((u) => u.coordinate.cy > this.coordinate.cy).sort((u) => u.coordinate.cy * -1).sort(this.orderCyAsc)[0] : h = c.filter((u) => u.coordinate.cy < this.coordinate.cy).sort((u) => u.coordinate.cy * -1).sort(this.orderCyDesc)[0];
      }
    }), t.forEach((r) => {
      let c = r.coordinate;
      c.cy === this.coordinate.cy && (c.cx > this.coordinate.cx ? s && (c.cx > s.coordinate.cx ? r.isBlock = !0 : c.cx === s.coordinate.cx ? (this.faction !== s.faction && (r.isTarget = !0), r.isBlock = !0) : r.isBlock = !1) : e && (c.cx < e.coordinate.cx ? r.isBlock = !0 : c.cx === e.coordinate.cx ? (this.faction !== e.faction && (r.isTarget = !0), r.isBlock = !0) : r.isBlock = !1)), c.cx === this.coordinate.cx && (c.cy > this.coordinate.cy ? n && (c.cy > n.coordinate.cy ? r.isBlock = !0 : c.cy === n.coordinate.cy ? (this.faction !== n.faction && (r.isTarget = !0), r.isBlock = !0) : r.isBlock = !1) : h && (c.cy < h.coordinate.cy ? r.isBlock = !0 : c.cy === h.coordinate.cy ? (this.faction !== h.faction && (r.isTarget = !0), r.isBlock = !0) : r.isBlock = !1));
    }), t;
  }
}
class d {
  constructor(t, i, e, s) {
    o(this, "triangleAngle", 5);
    o(this, "triangleWidth", 0);
    o(this, "ctx");
    o(this, "cid");
    o(this, "coordinate");
    o(this, "x");
    o(this, "y");
    o(this, "width");
    o(this, "height");
    o(this, "strokeStyle", "#000000");
    o(this, "backgroundColor", "#ffffff");
    o(this, "text", "");
    o(this, "id", Date.now().toFixed());
    o(this, "isFocus", !1);
    o(this, "faction", "");
    o(this, "isTarget", !1);
    o(this, "isBlock", !1);
    this.ctx = t, this.coordinate = i, this.cid = i.cid, this.x = i.x, this.y = i.y, this.width = e, this.height = s;
  }
  print() {
    var t;
    this.ctx.save(), this.ctx.translate(this.x, this.y), this.ctx.beginPath(), this.ctx.arc(0, 0, this.width / 2, 0, 2 * Math.PI), this.ctx.lineWidth = 5, this.ctx.strokeStyle = "black", (t = this.ctx) == null || t.stroke(), this.ctx.fillStyle = "gainsboro", this.ctx.fill(), this.ctx.restore();
  }
  print2() {
    var t;
    this.ctx.save(), this.ctx.translate(this.x, this.y), this.ctx.beginPath(), this.ctx.arc(0, 0, this.width / 2 + 5, 0, 2 * Math.PI), this.ctx.lineWidth = 5, this.ctx.strokeStyle = "red", (t = this.ctx) == null || t.stroke(), this.ctx.restore();
  }
  isInside(t, i) {
    let e = this.x, s = this.y, h = this.width / 2;
    return Math.pow(t, 2) + Math.pow(i, 2) - 2 * e * t - 2 * s * i + Math.pow(e, 2) + Math.pow(s, 2) - Math.pow(h, 2) <= 0 && Math.pow(-2 * e, 2) + Math.pow(-2 * s, 2) - 4 * (Math.pow(e, 2) + Math.pow(s, 2) - Math.pow(h, 2)) > 0;
  }
}
class M extends T {
  constructor(t, i, e, s, h, n) {
    super(t, i, e, s, h, n), this.text = this.faction === "black" ? "將" : "帥";
  }
  initMovePoint() {
    let t = [], i = this.coordinate.clone(-1, 0);
    i !== null && i.cx >= 3 && i.cx <= 5 && t.push(new d(this.ctx, i, this.width, this.height));
    let e = this.coordinate.clone(0, -1);
    e !== null && (this.faction === "black" && e.cy >= 0 && e.cy <= 2 || this.faction !== "black" && e.cy >= 7 && e.cy <= 9) && t.push(new d(this.ctx, e, this.width, this.height));
    let s = this.coordinate.clone(0, 1);
    s !== null && (this.faction === "black" && s.cy >= 0 && s.cy <= 2 || this.faction !== "black" && s.cy >= 7 && s.cy <= 9) && t.push(new d(this.ctx, s, this.width, this.height));
    let h = this.coordinate.clone(1, 0);
    return h !== null && h.cx >= 3 && h.cx <= 5 && t.push(new d(this.ctx, h, this.width, this.height)), t;
  }
  decidePoint(t, i) {
    var s;
    super.decidePoint(t, i);
    let e = i.filter((h) => h.coordinate.cx === this.coordinate.cx);
    if (e.length == 2 && e.every((h) => M.prototype.isPrototypeOf(h))) {
      let h = e.find((r) => r.coordinate.cid !== this.coordinate.cid), n = (s = h == null ? void 0 : h.coordinate) == null ? void 0 : s.clone(0, 0), l = new d(this.ctx, n, h.width, h.height);
      l.isBlock = !0, l.isTarget = !0, t.push(l);
    }
    return t;
  }
}
class S extends B {
  decidePoint(t, i) {
    return i.filter((s) => t.some((h) => h.coordinate.cid === s.coordinate.cid)).forEach((s) => {
      let h = t.find((n) => {
        var l;
        return n.cid === ((l = s.coordinate) == null ? void 0 : l.cid);
      });
      h && (s.faction !== this.faction && (h.isTarget = !0), h.isBlock = !0);
    }), t;
  }
}
class H extends S {
  constructor(t, i, e, s, h, n) {
    super(t, i, e, s, h, n), this.text = this.faction === "black" ? "士" : "仕";
  }
  initMovePoint() {
    let t = [];
    if (this.coordinate.cx - 1 >= 3) {
      let i = this.coordinate.clone(-1, -1);
      i !== null && t.push(new d(this.ctx, i, this.width, this.height));
      let e = this.coordinate.clone(-1, 1);
      e !== null && t.push(new d(this.ctx, e, this.width, this.height));
    }
    if (this.coordinate.cx + 1 <= 5) {
      let i = this.coordinate.clone(1, -1);
      i !== null && t.push(new d(this.ctx, i, this.width, this.height));
      let e = this.coordinate.clone(1, 1);
      e !== null && t.push(new d(this.ctx, e, this.width, this.height));
    }
    return t;
  }
}
class I extends S {
  constructor(t, i, e, s, h, n) {
    super(t, i, e, s, h, n), this.text = this.faction === "black" ? "象" : "相";
  }
  initMovePoint() {
    let t = [], i = this.coordinate.clone(-2, -2);
    i !== null && t.push(new d(this.ctx, i, this.width, this.height));
    let e = this.coordinate.clone(-2, 2);
    e !== null && t.push(new d(this.ctx, e, this.width, this.height));
    let s = this.coordinate.clone(2, -2);
    s !== null && t.push(new d(this.ctx, s, this.width, this.height));
    let h = this.coordinate.clone(2, 2);
    return h !== null && t.push(new d(this.ctx, h, this.width, this.height)), t;
  }
  block(t, i) {
    let e = !1;
    return i.forEach((s) => {
      if (this.coordinate.cx === s.cx && this.coordinate.cx === t.cx) {
        if (this.coordinate.cy > s.cy) {
          if (t.cy <= s.cy) {
            e = !0;
            return;
          }
        } else if (t.cy >= s.cy) {
          e = !0;
          return;
        }
      } else if (this.coordinate.cy === s.cy && this.coordinate.cy === t.cy) {
        if (this.coordinate.cx > s.cx) {
          if (t.cx <= s.cx) {
            e = !0;
            return;
          }
        } else if (t.cx >= s.cx) {
          e = !0;
          return;
        }
      }
    }), e;
  }
}
class O extends B {
  decidePoint(t, i) {
    i.filter((r) => t.some((c) => c.coordinate.cid === r.coordinate.cid)).forEach((r) => {
      let c = t.find((m) => {
        var u;
        return m.cid === ((u = r.coordinate) == null ? void 0 : u.cid);
      });
      c && (r.faction !== this.faction && (c.isTarget = !0), c.isBlock = !0);
    });
    let s = i.find((r) => {
      var c;
      return ((c = r.coordinate) == null ? void 0 : c.cx) == this.coordinate.cx - 1;
    }), h = i.find((r) => {
      var c;
      return ((c = r.coordinate) == null ? void 0 : c.cx) == this.coordinate.cx + 1;
    }), n = i.find((r) => {
      var c;
      return ((c = r.coordinate) == null ? void 0 : c.cy) == this.coordinate.cy - 1;
    }), l = i.find((r) => {
      var c;
      return ((c = r.coordinate) == null ? void 0 : c.cy) == this.coordinate.cy + 1;
    });
    if (s) {
      let r = t.filter((c) => c.coordinate.cx < this.coordinate.cx && (c.coordinate.cy == this.coordinate.cy + 1 || c.coordinate.cy == this.coordinate.cy - 1));
      r && r.forEach((c) => c.isBlock = !0);
    }
    if (h) {
      let r = t.filter((c) => c.coordinate.cx > this.coordinate.cx && (c.coordinate.cy == this.coordinate.cy + 1 || c.coordinate.cy == this.coordinate.cy - 1));
      r && r.forEach((c) => c.isBlock = !0);
    }
    if (n) {
      let r = t.filter((c) => c.coordinate.cy < this.coordinate.cy && (c.coordinate.cx == this.coordinate.cx + 1 || c.coordinate.cx == this.coordinate.cx - 1));
      r && r.forEach((c) => c.isBlock = !0);
    }
    if (l) {
      let r = t.filter((c) => c.coordinate.cy > this.coordinate.cy && (c.coordinate.cx == this.coordinate.cx + 1 || c.coordinate.cx == this.coordinate.cx - 1));
      r && r.forEach((c) => c.isBlock = !0);
    }
    return t;
  }
}
class W extends O {
  constructor(t, i, e, s, h, n) {
    super(t, i, e, s, h, n), this.text = this.faction === "black" ? "馬" : "傌";
  }
  initMovePoint() {
    let t = [], i = this.coordinate.clone(-2, -1);
    i !== null && t.push(new d(this.ctx, i, this.width, this.height));
    let e = this.coordinate.clone(-1, -2);
    e !== null && t.push(new d(this.ctx, e, this.width, this.height));
    let s = this.coordinate.clone(-2, 1);
    s !== null && t.push(new d(this.ctx, s, this.width, this.height));
    let h = this.coordinate.clone(-1, 2);
    h !== null && t.push(new d(this.ctx, h, this.width, this.height));
    let n = this.coordinate.clone(2, -1);
    n !== null && t.push(new d(this.ctx, n, this.width, this.height));
    let l = this.coordinate.clone(1, -2);
    l !== null && t.push(new d(this.ctx, l, this.width, this.height));
    let r = this.coordinate.clone(2, 1);
    r !== null && t.push(new d(this.ctx, r, this.width, this.height));
    let c = this.coordinate.clone(1, 2);
    return c !== null && t.push(new d(this.ctx, c, this.width, this.height)), t;
  }
}
class C extends T {
  constructor(t, i, e, s, h, n) {
    super(t, i, e, s, h, n), this.text = this.faction === "black" ? "車" : "俥";
  }
  initMovePoint() {
    let t = [];
    for (let i = 1; i <= 8; i++) {
      let e = this.coordinate.clone(-i, 0);
      e !== null && t.push(new d(this.ctx, e, this.width, this.height));
      let s = this.coordinate.clone(i, 0);
      s !== null && t.push(new d(this.ctx, s, this.width, this.height));
    }
    for (let i = 1; i <= 9; i++) {
      let e = this.coordinate.clone(0, -i);
      e !== null && t.push(new d(this.ctx, e, this.width, this.height));
      let s = this.coordinate.clone(0, i);
      s !== null && t.push(new d(this.ctx, s, this.width, this.height));
    }
    return t;
  }
}
class A extends B {
  decidePoint(t, i) {
    let e, s, h, n, l, r, c, m, u = i.filter((f) => t.some((g) => g.coordinate.cid === f.coordinate.cid));
    return u.forEach((f) => {
      if (f.coordinate.cy === this.coordinate.cy) {
        let g = u.filter((x) => x.coordinate.cy === this.coordinate.cy);
        if (f.coordinate.cx > this.coordinate.cx) {
          let x = g.filter((w) => w.coordinate.cx > this.coordinate.cx).sort((w, k) => this.orderCxDesc(w, k));
          h = x[0], x.length >= 2 && (n = x[1]);
        } else {
          let x = g.filter((w) => w.coordinate.cx < this.coordinate.cx).sort((w, k) => this.orderCxAsc(w, k));
          e = x[0], x.length >= 2 && (s = x[1]);
        }
      }
      if (f.coordinate.cx === this.coordinate.cx) {
        let g = u.filter((x) => x.coordinate.cx === this.coordinate.cx);
        if (f.coordinate.cy > this.coordinate.cy) {
          let x = g.filter((w) => w.coordinate.cy > this.coordinate.cy).sort((w, k) => this.orderCyAsc(w, k));
          c = x[0], x.length >= 2 && (m = x[1]);
        } else {
          let x = g.filter((w) => w.coordinate.cy < this.coordinate.cy).sort((w, k) => this.orderCyDesc(w, k));
          l = x[0], x.length >= 2 && (r = x[1]);
        }
      }
    }), t.forEach((f) => {
      let g = f.coordinate;
      g.cy === this.coordinate.cy && (g.cx > this.coordinate.cx ? (h && (g.cx >= h.coordinate.cx ? f.isBlock = !0 : f.isBlock = !1), n && f.coordinate.cid === (n == null ? void 0 : n.coordinate.cid) && n.faction !== this.faction && (f.isTarget = !0)) : (e && (g.cx <= e.coordinate.cx ? f.isBlock = !0 : f.isBlock = !1), s && f.coordinate.cid === (s == null ? void 0 : s.coordinate.cid) && s.faction !== this.faction && (f.isTarget = !0))), g.cx === this.coordinate.cx && (g.cy > this.coordinate.cy ? (c && (g.cy >= c.coordinate.cy ? f.isBlock = !0 : f.isBlock = !1), m && f.coordinate.cid === (m == null ? void 0 : m.coordinate.cid) && m.faction !== this.faction && (f.isTarget = !0)) : (l && (g.cy <= l.coordinate.cy ? f.isBlock = !0 : f.isBlock = !1), r && f.coordinate.cid === (r == null ? void 0 : r.coordinate.cid) && (console.log(f.faction, this.faction), r.faction !== this.faction && (f.isTarget = !0))));
    }), t;
  }
}
class X extends A {
  constructor(t, i, e, s, h, n) {
    super(t, i, e, s, h, n), this.text = this.faction === "black" ? "砲" : "炮";
  }
  initMovePoint() {
    let t = [];
    for (let i = 1; i <= 8; i++) {
      let e = this.coordinate.clone(-i, 0);
      e !== null && t.push(new d(this.ctx, e, this.width, this.height));
      let s = this.coordinate.clone(i, 0);
      s !== null && t.push(new d(this.ctx, s, this.width, this.height));
    }
    for (let i = 1; i <= 9; i++) {
      let e = this.coordinate.clone(0, -i);
      e !== null && t.push(new d(this.ctx, e, this.width, this.height));
      let s = this.coordinate.clone(0, i);
      s !== null && t.push(new d(this.ctx, s, this.width, this.height));
    }
    return t;
  }
}
class L extends T {
  constructor(t, i, e, s, h, n) {
    super(t, i, e, s, h, n), this.text = this.faction === "black" ? "卒" : "兵";
  }
  initMovePoint() {
    let t = [];
    if (this.faction === "black") {
      if (this.coordinate.cy >= 5) {
        let e = this.coordinate.clone(-1, 0);
        if (e !== null && t.push(new d(this.ctx, e, this.width, this.height)), this.coordinate.cy - 1 > 5) {
          let h = this.coordinate.clone(0, -1);
          h !== null && t.push(new d(this.ctx, h, this.width, this.height));
        }
        let s = this.coordinate.clone(1, 0);
        s !== null && t.push(new d(this.ctx, s, this.width, this.height));
      }
      let i = this.coordinate.clone(0, 1);
      i !== null && t.push(new d(this.ctx, i, this.width, this.height));
    } else {
      if (this.coordinate.cy <= 4) {
        let e = this.coordinate.clone(-1, 0);
        if (e !== null && t.push(new d(this.ctx, e, this.width, this.height)), this.coordinate.cy + 1 < 4) {
          let h = this.coordinate.clone(0, 1);
          h !== null && t.push(new d(this.ctx, h, this.width, this.height));
        }
        let s = this.coordinate.clone(1, 0);
        s !== null && t.push(new d(this.ctx, s, this.width, this.height));
      }
      let i = this.coordinate.clone(0, -1);
      i !== null && t.push(new d(this.ctx, i, this.width, this.height));
    }
    return t;
  }
}
class y {
  constructor(t, i, e) {
    o(this, "columnWidth");
    o(this, "columnHeight");
    o(this, "x");
    o(this, "y");
    o(this, "cid");
    o(this, "cx");
    o(this, "cy");
    this.cid = t, this.columnWidth = i, this.columnHeight = e, this.cx = this.getCX(this.cid), this.cy = this.getCY(this.cid), this.x = this.getX(this.cid), this.y = this.getY(this.cid);
  }
  getCX(t) {
    let i = v.Xids.indexOf(t.substring(0, 1));
    if (i < 0)
      throw "id is error";
    return i;
  }
  getCY(t) {
    let i = parseInt(t.substring(1, 2));
    if (Number.isNaN(i))
      throw "id is error";
    return i;
  }
  getX(t) {
    return this.columnWidth * this.getCX(t) + v.originX;
  }
  getY(t) {
    return this.columnHeight * this.getCY(t) + v.originY;
  }
  moveX(t) {
    this.cx + t >= 0 && this.cx + t <= 8 && (this.cx = this.cx + t, this.cid = v.Xids[this.cx] + this.cy, this.x = this.getX(this.cid));
  }
  moveY(t) {
    this.cy + t >= 0 && this.cy + t <= 9 && (this.cy = this.cy + t, this.cid = v.Xids[this.cx] + this.cy, this.y = this.getY(this.cid));
  }
  clone(t, i) {
    if (this.cx + t >= 0 && this.cx + t <= 8 && this.cy + i >= 0 && this.cy + i <= 9) {
      let e = new y(this.cid, this.columnWidth, this.columnHeight);
      return e.moveX(t), e.moveY(i), e;
    } else
      return null;
  }
}
class Y {
  constructor(t, i, e, s, h, n, l, r, c) {
    o(this, "ctx");
    o(this, "x");
    o(this, "y");
    o(this, "coordinate");
    o(this, "width");
    o(this, "height");
    o(this, "text");
    o(this, "id");
    o(this, "strokeStyle", "");
    o(this, "isFocus", !1);
    o(this, "color");
    o(this, "click");
    o(this, "faction", "");
    this.ctx = t, this.id = i, this.x = e, this.y = s, this.width = h, this.height = n, this.text = l, this.color = r, this.click = c;
  }
  isInside(t, i) {
    return this.x <= t && t <= this.x + this.width && this.y <= i && i <= this.y + this.height;
  }
  move(t) {
    this.x = t.x, this.y = t.y, this.coordinate = t;
  }
  resize(t, i) {
    this.width = t, this.height = i;
  }
  print() {
    this.ctx.save(), this.ctx.translate(this.x, this.y), this.ctx.beginPath(), this.ctx.strokeStyle = "black", this.ctx.fillStyle = this.color, this.ctx.rect(0, 0, this.width, this.height), this.ctx.fill(), this.ctx.stroke(), this.ctx.fillStyle = "white", this.ctx.font = "normal normal 900 16px sans-serif", this.ctx.textBaseline = "middle", this.ctx.fillText(this.text, this.width / 3 - 2, this.height / 2), this.ctx.restore();
  }
  isOverlapping(t, i, e, s) {
    return this.x <= t && t <= this.x + this.width && this.y <= i && i <= this.y + this.height && this.x <= t + e && t + e <= this.x + this.width && this.y <= i + s && i + s <= this.y + this.height;
  }
}
class R {
  constructor(t, i, e, s, h, n, l, r) {
    o(this, "ctx");
    o(this, "x");
    o(this, "y");
    o(this, "width");
    o(this, "height");
    o(this, "id");
    o(this, "strokeStyle", "black");
    o(this, "isFocus", !1);
    o(this, "click");
    o(this, "buttons", []);
    this.ctx = t, this.id = i, this.x = e, this.y = s, this.width = h, this.height = n, this.buttons = [
      new Y(
        this.ctx,
        this.id + "s",
        this.x + 10,
        this.y + 10,
        80,
        40,
        "確定",
        "dodgerblue",
        l
      ),
      new Y(
        this.ctx,
        this.id + "e",
        this.x + this.width - 90,
        this.y + 10,
        80,
        40,
        "取消",
        "red",
        r
      )
    ];
  }
  print() {
    this.ctx.save(), this.ctx.translate(this.x, this.y), this.ctx.beginPath(), this.ctx.fillStyle = "white", this.ctx.rect(0, 0, this.width, this.height), this.ctx.fill(), this.ctx.restore(), this.buttons.forEach((t) => t.print());
  }
  isOverlapping(t, i, e, s) {
    return this.x <= t && t <= this.x + this.width && this.y <= i && i <= this.y + this.height && this.x <= t + e && t + e <= this.x + this.width && this.y <= i + s && i + s <= this.y + this.height;
  }
  onclick(t, i) {
    let e = !1;
    return this.buttons.forEach((s) => {
      s.isInside(t, i) && (s.click(), e = !0);
    }), e;
  }
}
class b {
  constructor(t, i, e, s, h) {
    o(this, "id");
    o(this, "newCid");
    o(this, "oldCid");
    o(this, "removeItem");
    o(this, "message");
    this.id = t, this.newCid = i, this.oldCid = e, this.removeItem = s, this.message = h;
  }
}
const D = ["A", "B", "C", "D", "E", "F", "G", "H", "I"], p = class {
  constructor(t) {
    o(this, "canvas");
    o(this, "ctx", null);
    o(this, "width");
    o(this, "height");
    o(this, "startX", 0);
    o(this, "startY", 0);
    o(this, "offsetX", 0);
    o(this, "offsetY", 0);
    o(this, "scrollX", 0);
    o(this, "scrollY", 0);
    o(this, "columnX", 8);
    o(this, "columnY", 9);
    o(this, "columnWidth", 0);
    o(this, "columnHeight", 0);
    o(this, "currnetFaction", "black");
    o(this, "isDown", !1);
    o(this, "isDrop", !1);
    o(this, "isMove", !1);
    o(this, "isOver", !1);
    o(this, "items", []);
    o(this, "selectedItem", null);
    o(this, "movePoints", []);
    o(this, "$confirm", null);
    o(this, "oncommit");
    o(this, "removeItem");
    this.width = t.width - p.originX * 2, this.height = t.height - p.originY * 2, this.canvas = t, this.columnWidth = Math.floor(this.width / 8), this.columnHeight = Math.floor(this.height / 9), this.canvas.getContext ? (this.ctx = this.canvas.getContext("2d"), this.offsetX = this.canvas.offsetLeft, this.offsetY = this.canvas.offsetTop, this.scrollX = window.scrollX, this.scrollY = window.scrollY, this.canvas.onresize = (i) => this.handleResize(i), this.canvas.onscroll = (i) => this.handleResize(i), this.canvas.onmousedown = async (i) => await this.handleMouseDown(i), this.canvas.onmousemove = async (i) => await this.handleMouseMove(i), this.canvas.onmouseup = (i) => this.handleMouseUp(i), this.canvas.onmouseout = (i) => this.handleMouseOut(i)) : alert("error");
  }
  handleResize(t) {
    t.preventDefault(), t.stopPropagation(), this.offsetX = this.canvas.offsetLeft, this.offsetY = this.canvas.offsetTop, this.scrollX = window.scrollX, this.scrollY = window.scrollY;
  }
  handleScroll(t) {
    t.preventDefault(), t.stopPropagation(), this.scrollX = window.scrollX, this.scrollY = window.scrollY;
  }
  async handleMouseDown(t) {
    if (t.preventDefault(), t.stopPropagation(), this.isOver)
      return;
    this.startX = t.clientX - this.offsetX + this.scrollX, this.startY = t.clientY - this.offsetY + this.scrollY;
    let i = this.selectedItem != null;
    this.$confirm ? i = this.$confirm.onclick(this.startX, this.startY) : (this.items.forEach((e) => {
      e.isInside(this.startX, this.startY) && e.faction === this.currnetFaction ? (this.selectedItem !== null && this.selectedItem.id === e.id ? (this.movePoints = e.focus(!1), this.selectedItem = null) : (this.movePoints = e.focus(!0), this.movePoints = e.decidePoint(this.movePoints, this.items), this.selectedItem = e), i = !0) : e.focus(!1);
    }), this.movePoints && this.movePoints.forEach((e) => {
      var s;
      if (e.isInside(this.startX, this.startY)) {
        this.isMove = !0;
        let h = e.coordinate.clone(0, 0);
        if (this.movePoints = [], this.movePoints.push(
          new d(
            this.ctx,
            this.selectedItem.coordinate,
            this.selectedItem.width,
            this.selectedItem.height
          )
        ), e.isTarget)
          for (let l = 0; l < this.items.length; l++)
            ((s = this.items[l].coordinate) == null ? void 0 : s.cid) === e.cid && (this.removeItem = this.items.splice(l, 1)[0]);
        this.selectedItem.move(h);
        let n = Date.now().toFixed();
        this.$confirm = new R(
          this.ctx,
          n,
          this.width / 3,
          this.height / 2,
          200,
          60,
          this.commit(),
          this.rollback()
        );
      }
    }), this.isMove || this.items.filter((e) => e.isFocus).length == 0 && (this.selectedItem = null, this.movePoints = [])), this.isDown = !0, i && (await this.clear(), await this.print());
  }
  handleMouseUp(t) {
    t.preventDefault(), t.stopPropagation(), this.isDown = !1;
  }
  handleMouseOut(t) {
    t.preventDefault(), t.stopPropagation(), this.isDown = !1;
  }
  async handleMouseMove(t) {
    t.preventDefault(), t.stopPropagation();
  }
  printBorder() {
    this.ctx.save(), this.ctx.translate(p.originX, p.originY), this.ctx.beginPath();
    for (let t = 0; t <= 8; t++)
      this.ctx.moveTo(t * this.columnWidth, 0), this.ctx.lineTo(t * this.columnWidth, this.columnHeight * 9), this.ctx.fillText(D[t], t * this.columnWidth, -5);
    for (let t = 0; t <= 9; t++)
      this.ctx.moveTo(0, t * this.columnHeight), this.ctx.lineTo(this.columnWidth * 8, t * this.columnHeight), this.ctx.fillText(t.toString(), -10, t * this.columnHeight);
    this.ctx.moveTo(3 * this.columnWidth, 0), this.ctx.lineTo(5 * this.columnWidth, 2 * this.columnHeight), this.ctx.moveTo(5 * this.columnWidth, 0), this.ctx.lineTo(3 * this.columnWidth, 2 * this.columnHeight), this.ctx.moveTo(3 * this.columnWidth, 7 * this.columnHeight), this.ctx.lineTo(5 * this.columnWidth, 9 * this.columnHeight), this.ctx.moveTo(5 * this.columnWidth, 7 * this.columnHeight), this.ctx.lineTo(3 * this.columnWidth, 9 * this.columnHeight), this.ctx.strokeStyle = "#99999", this.ctx.stroke(), this.ctx.clearRect(
      1,
      4 * this.columnHeight + 1,
      this.columnWidth * 8 - 2,
      this.columnHeight - 2
    ), this.ctx.restore(), this.ctx.save(), this.ctx.font = "normal normal 900 30px sans-serif", this.ctx.textBaseline = "middle", this.ctx.translate(this.columnWidth * 2 + this.columnWidth / 2, 4 * this.columnHeight + p.originY + this.columnHeight / 2), this.ctx.fillText("楚河", 0, 0), this.ctx.restore(), this.ctx.save(), this.ctx.font = "normal normal 900 30px sans-serif", this.ctx.textBaseline = "middle", this.ctx.translate(this.columnWidth * 6 + this.columnWidth / 2, 4 * this.columnHeight + p.originY + this.columnHeight / 2), this.ctx.rotate(180 * Math.PI / 180), this.ctx.fillText("漢界", 0, 0), this.ctx.restore();
  }
  print() {
    return new Promise((t) => {
      this.printBorder(), this.items && this.items.forEach((i) => {
        i.print();
      }), this.movePoints && this.movePoints.forEach((i) => {
        i.isBlock ? i.isTarget && (i.isTarget = !0, i.print2()) : i.print();
      }), this.isMove && this.$confirm && this.$confirm.print(), t();
    });
  }
  clear() {
    return new Promise((t) => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height), t();
    });
  }
  isOverSide(t, i, e, s) {
    return t < 0 || i < 0 || t + e > this.width ? !0 : i + s > this.height;
  }
  init() {
    return new Promise((t) => {
      this.items = [], this.isOver = !1;
      let i = p.itemWidth, e = p.itemHeight;
      ["black", "red"].forEach((h) => {
        let n = "0", l = Date.now().toFixed();
        h !== "black" && (n = "9"), this.items.push(
          new M(
            this.ctx,
            l,
            new y("E" + n, this.columnWidth, this.columnHeight),
            i,
            e,
            h
          )
        ), this.items.push(
          new H(
            this.ctx,
            l,
            new y("D" + n, this.columnWidth, this.columnHeight),
            i,
            e,
            h
          )
        ), this.items.push(
          new H(
            this.ctx,
            l,
            new y("F" + n, this.columnWidth, this.columnHeight),
            i,
            e,
            h
          )
        ), this.items.push(
          new I(
            this.ctx,
            l,
            new y("G" + n, this.columnWidth, this.columnHeight),
            i,
            e,
            h
          )
        ), this.items.push(
          new I(
            this.ctx,
            l,
            new y("C" + n, this.columnWidth, this.columnHeight),
            i,
            e,
            h
          )
        ), this.items.push(
          new W(
            this.ctx,
            l,
            new y("B" + n, this.columnWidth, this.columnHeight),
            i,
            e,
            h
          )
        ), this.items.push(
          new W(
            this.ctx,
            l,
            new y("H" + n, this.columnWidth, this.columnHeight),
            i,
            e,
            h
          )
        ), this.items.push(
          new C(
            this.ctx,
            l,
            new y("A" + n, this.columnWidth, this.columnHeight),
            i,
            e,
            h
          )
        ), this.items.push(
          new C(
            this.ctx,
            l,
            new y("I" + n, this.columnWidth, this.columnHeight),
            i,
            e,
            h
          )
        ), this.items.push(
          new X(
            this.ctx,
            l,
            new y("B" + (h == "black" ? "2" : "7"), this.columnWidth, this.columnHeight),
            i,
            e,
            h
          )
        ), this.items.push(
          new X(
            this.ctx,
            l,
            new y("H" + (h == "black" ? "2" : "7"), this.columnWidth, this.columnHeight),
            i,
            e,
            h
          )
        );
        for (let r = 0; r < 10; r = r + 2)
          this.items.push(
            new L(
              this.ctx,
              l,
              new y(D[r] + (h == "black" ? "3" : "6"), this.columnWidth, this.columnHeight),
              i,
              e,
              h
            )
          );
      }), t();
    });
  }
  commit() {
    return () => {
      var e, s;
      let t = this.movePoints[0].cid, i = (s = (e = this.selectedItem) == null ? void 0 : e.coordinate) == null ? void 0 : s.cid;
      this.movePoints = this.selectedItem.focus(!1), this.$confirm = null, this.isMove = !1, this.isDown = !1, this.currnetFaction = this.currnetFaction === "black" ? "red" : "black", this.oncommit && (this.removeItem ? M.prototype.isPrototypeOf(this.removeItem) ? (this.isOver = !0, this.oncommit(new b(
        this.selectedItem.id,
        i,
        t,
        this.removeItem.constructor.name,
        `${this.removeItem.faction === "black" ? "red" : "black"}方是贏家`
      ))) : this.oncommit(new b(
        this.selectedItem.id,
        i,
        t,
        this.removeItem.constructor.name,
        `${this.removeItem.text}被吃掉了`
      )) : this.oncommit(new b(
        this.selectedItem.id,
        i,
        t,
        void 0,
        void 0
      ))), this.removeItem = void 0;
    };
  }
  rollback() {
    return () => {
      this.selectedItem.move(this.movePoints[0].coordinate).then(() => {
        this.$confirm = null, this.isMove = !1, this.removeItem && (this.items.push(this.removeItem), this.removeItem = void 0), this.movePoints = this.selectedItem.focus(!0);
      });
    };
  }
};
let v = p;
o(v, "itemWidth", 30), o(v, "itemHeight", 30), o(v, "originX", 20), o(v, "originY", 20), o(v, "Xids", ["A", "B", "C", "D", "E", "F", "G", "H", "I"]);
document.querySelector("#app").innerHTML = `
<div class="left">
  黑子先行
  <div id="message">
  </div>
</div>
<div class="rigth">
  <canvas width="500" height="500" id="canvas"></canvas>
</div>

`;
const $ = document.getElementById("canvas"), P = new v($);
z();
addEventListener("resize", async (a) => {
  P.handleResize(a);
});
addEventListener("scroll", async (a) => {
  P.handleScroll(a);
});
function z() {
  P.init(), P.print(), P.oncommit = (a) => {
    console.log("oncommit", a), a.message && (document.getElementById("message").innerHTML += "<li>" + a.message + "</li>");
  };
}
