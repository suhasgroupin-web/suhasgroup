/* SUHAS CV Studio Plus - additive helpers for resume-builder.html
   Real PDF/DOC download (10pt), old-CV (PDF/DOCX) auto-fill parser, signature background remover.
   Free/open-source libraries only (pdf-lib, docx, JSZip, pdf.js), loaded on demand from assets/vendor/. */
(function () {
  'use strict';
  var SCRIPT = document.currentScript && document.currentScript.src ? document.currentScript.src : location.href;
  var VENDOR = new URL('vendor/', SCRIPT).href;
  var FONT_PT = 10;
  var loaded = {};

  function loadScript(name, globalName) {
    if (globalName && window[globalName]) return Promise.resolve();
    if (loaded[name]) return loaded[name];
    loaded[name] = new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = VENDOR + name; s.async = true;
      s.onload = function () { res(); };
      s.onerror = function () { delete loaded[name]; rej(new Error('Could not load ' + name + '. Check your connection.')); };
      document.head.appendChild(s);
    });
    return loaded[name];
  }

  /* ---------- small helpers ---------- */
  function toLines(s) { return String(s || '').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean); }
  var BUL = /^\s*[-•▪●◦*·]\s*/;
  function loadImg(src) {
    return new Promise(function (res, rej) {
      var i = new Image(); i.onload = function () { res(i); }; i.onerror = function () { rej(new Error('Image load failed')); }; i.src = src;
    });
  }
  function fileToURL(file) {
    return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = rej; r.readAsDataURL(file); });
  }
  function bytes(url) { return fetch(url).then(function (r) { return r.arrayBuffer(); }); }
  async function circlePNG(dataUrl, size) {
    var img = await loadImg(dataUrl);
    var c = document.createElement('canvas'); c.width = c.height = size;
    var x = c.getContext('2d');
    x.beginPath(); x.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); x.closePath(); x.clip();
    var s = Math.min(img.width, img.height);
    x.fillStyle = '#fff'; x.fillRect(0, 0, size, size);
    x.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
    return c.toDataURL('image/png');
  }
  function save(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  function fileBase(d) {
    return ((d.name || d.title || 'CV').replace(/[^\w\-]+/g, '_').replace(/^_+|_+$/g, '') || 'CV') + '_CV';
  }


  /* ---------- structured Professional Experience (company / position | dates / responsibilities) ---------- */
  function parseExperience(text) {
    return String(text || '').split(/\n\s*\n/).map(toLines).filter(function (b) { return b.length; }).map(function (ls) {
      var company = '', role = '', period = '', i = 0;
      var looksHead = function (l) { return !BUL.test(l) && (/\s\|\s/.test(l) || RE_RANGE.test(l)); };
      if (!looksHead(ls[0])) { company = ls[0].replace(BUL, ''); i = 1; }
      if (ls[i] && looksHead(ls[i])) {
        var parts = ls[i].split(/\s\|\s/);
        if (parts.length > 1) { role = parts[0].trim(); period = parts.slice(1).join(' | ').trim(); }
        else { var m = ls[i].match(RE_RANGE); if (m) { period = m[0].trim(); role = ls[i].replace(m[0], '').replace(/[|,\-–—()\s]+$/, '').trim(); } else role = ls[i]; }
        i++;
      }
      return { company: company, role: role, period: period, details: ls.slice(i).map(function (l) { return l.replace(BUL, ''); }) };
    });
  }
  function formatExperience(entries) {
    return entries.map(function (e) {
      return [e.company, [e.role, e.period].filter(Boolean).join(' | ')].concat((e.details || []).map(function (d) { return '• ' + d; })).filter(Boolean).join('\n');
    }).filter(Boolean).join('\n\n');
  }
  function parseEmployment(ls) {
    var idx = [];
    ls.forEach(function (l, i) { if (RE_RANGE.test(l)) idx.push(i); });
    if (!idx.length) return ls.length ? [{ company: '', role: '', period: '', details: ls.map(function (l) { return l.replace(BUL, ''); }) }] : [];
    var isHdr = function (l) { return l && l.length <= 80 && !BUL.test(l) && !/[.;]$/.test(l) && !RE_RANGE.test(l); };
    var entries = [], starts = [];
    idx.forEach(function (di, k) {
      var prev = k ? idx[k - 1] : -1, hs = [], j = di - 1;
      while (j > prev && hs.length < 2 && isHdr(ls[j])) { hs.unshift(ls[j]); j--; }
      var line = ls[di], m = line.match(RE_RANGE), rest = line.replace(m[0], '').replace(/[|,\-–—()]+/g, ' ').trim(), hasRest = rest && rest.length > 2;
      var firstHdr = di - hs.length;
      if (hasRest) hs.push(rest);
      starts.push(firstHdr);
      var DES = /\b(engineer|manager|merchandiser|officer|executive|supervisor|director|head|analyst|coordinator|assistant|inspector|controller|specialist|lead|consultant|technician|incharge|in-charge|auditor|chief)\b/i;
      if (hs.length > 1 && DES.test(hs[0]) && !DES.test(hs[1])) hs = [hs[1], hs[0]].concat(hs.slice(2));
      entries.push({ company: hs[0] || '', role: hs.slice(1).join(' | '), period: m[0].trim(), details: [] });
    });
    idx.forEach(function (di, k) {
      var end = k + 1 < idx.length ? starts[k + 1] : ls.length;
      entries[k].details = ls.slice(di + 1, Math.max(di + 1, end)).map(function (l) { return l.replace(BUL, ''); });
    });
    return entries;
  }

  /* ---------- section model shared by PDF and DOC (same order as the live preview) ---------- */
  function model(d) {
    var contact = [d.phone, d.email, d.linkedin, d.location].filter(Boolean);
    var side = [
      ['Contact', contact, 'plain'],
      ['Core Competencies', toLines(d.competencies).map(function (l) { return l.replace(BUL, ''); }), 'bullet'],
      ['Language Skills', toLines(d.languages), 'plain'],
      ['Training Skills', toLines(d.training), 'plain'],
      ['Technical Skills', toLines(d.technical), 'plain'],
      ['Personal Info', toLines(d.personal), 'plain'],
      ['Permanent Address', toLines(d.address), 'plain'],
      ['Reference', toLines(d.reference), 'plain']
    ].filter(function (b) { return b[1].length; });
    var main = [
      ['Professional Summary', toLines(d.summary)],
      ['Professional Experience', toLines(d.experience), 'exp', parseExperience(d.experience)],
      ['Key Achievement', toLines(d.achievements)],
      ['Professional Expertise', toLines(d.expertise)],
      ['Employment History', toLines(d.employment)],
      ['Buyer Exposure', toLines(d.buyers)],
      ['Academic Qualifications', toLines(d.education)],
      ['Additional Skills', toLines(d.skills)],
      ['Declaration', toLines(d.declaration)]
    ].filter(function (b) { return b[1].length; });
    return { side: side, main: main };
  }

  /* ---------- PDF (pdf-lib): selectable text, A4, two-column, 10pt ---------- */
  async function exportPdf(d) {
    await loadScript('pdf-lib.min.js', 'PDFLib');
    var P = PDFLib, m = model(d);
    var doc = await P.PDFDocument.create();
    var F = await doc.embedFont(P.StandardFonts.Helvetica), B = await doc.embedFont(P.StandardFonts.HelveticaBold), O = await doc.embedFont(P.StandardFonts.HelveticaOblique);
    var cs = [new Set(F.getCharacterSet()), new Set(B.getCharacterSet())];
    var safe = function (t, f) {
      var set = cs[f === B ? 1 : 0];
      t = String(t).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/ /g, ' ').replace(/[\r\n\t]+/g, ' ');
      return Array.from(t).map(function (ch) { return set.has(ch.codePointAt(0)) ? ch : '?'; }).join('');
    };
    var W = 595.28, H = 841.89, SB = Math.round(W * 0.34), PAD = 16, MR = 30, TOP = 38, BOT = 40;
    var NAVY = P.rgb(0.04, 0.16, 0.4), LINE = P.rgb(0.45, 0.58, 0.77), GREY = P.rgb(0.965, 0.965, 0.965);
    var INK = P.rgb(0.1, 0.1, 0.1), MUTE = P.rgb(0.27, 0.31, 0.42);
    var SZ = FONT_PT, LH = SZ * 1.38;
    var pages = [];
    function pg(i) {
      while (pages.length <= i) {
        var p = doc.addPage([W, H]);
        p.drawRectangle({ x: 0, y: 0, width: SB, height: H, color: GREY });
        pages.push(p);
      }
      return pages[i];
    }
    function Col(x0, w) { this.x0 = x0; this.w = w; this.i = 0; this.y = H - TOP; }
    Col.prototype.need = function (h) { if (this.y - h < BOT) { this.i++; this.y = H - TOP; } };
    Col.prototype.page = function () { return pg(this.i); };
    var S = new Col(PAD, SB - 2 * PAD), M = new Col(SB + 22, W - SB - 22 - MR);
    pg(0);

    function wrap(text, f, size, maxW) {
      var out = [], words = safe(text, f).split(' '), cur = '';
      words.forEach(function (w) {
        while (f.widthOfTextAtSize(w, size) > maxW) {
          var k = w.length; while (k > 1 && f.widthOfTextAtSize(w.slice(0, k), size) > maxW) k--;
          if (cur) { out.push(cur); cur = ''; }
          out.push(w.slice(0, k)); w = w.slice(k);
        }
        var t = cur ? cur + ' ' + w : w;
        if (f.widthOfTextAtSize(t, size) <= maxW) cur = t; else { if (cur) out.push(cur); cur = w; }
      });
      if (cur) out.push(cur);
      return out;
    }
    function text(C, t, o) {
      o = o || {};
      var f = o.bold ? B : F, size = o.size || SZ, ind = o.indent || 0, lh = o.lh || size * 1.38;
      wrap(t, f, size, C.w - ind).forEach(function (ln, idx) {
        C.need(lh);
        var x = C.x0 + ind;
        if (o.center) x = C.x0 + (C.w - f.widthOfTextAtSize(ln, size)) / 2;
        if (o.bullet && idx === 0) C.page().drawText('•', { x: C.x0 + 1, y: C.y - size, size: size, font: F, color: INK });
        C.page().drawText(ln, { x: x, y: C.y - size, size: size, font: f, color: o.color || INK });
        C.y -= lh;
      });
    }
    function head(C, t) {
      C.need(44); C.y -= 8;
      C.page().drawText(safe(t, B), { x: C.x0, y: C.y - 10, size: 10.5, font: B, color: NAVY });
      C.y -= 15;
      C.page().drawLine({ start: { x: C.x0, y: C.y }, end: { x: C.x0 + C.w, y: C.y }, thickness: 0.9, color: LINE });
      C.y -= 6;
    }
    function lines(C, arr, bulletAll) {
      arr.forEach(function (l) {
        var isB = bulletAll || BUL.test(l);
        text(C, isB ? l.replace(BUL, '') : l, { bullet: isB, indent: isB ? 11 : 0 });
        C.y -= isB ? 1.5 : 1;
      });
    }

    /* sidebar */
    if (d.photo) {
      var img = await doc.embedPng(await bytes(await circlePNG(d.photo, 320)));
      var ps = Math.min(104, S.w);
      pg(0).drawImage(img, { x: S.x0 + (S.w - ps) / 2, y: S.y - ps, width: ps, height: ps });
      S.y -= ps + 14;
    }
    if (d.name) text(S, d.name.toUpperCase(), { bold: true, size: 16, color: NAVY, center: true, lh: 19 });
    if (d.role) { S.y -= 2; text(S, d.role.toUpperCase(), { size: SZ, center: true, bold: true }); }
    if (d.company) text(S, d.company, { size: SZ, center: true, color: MUTE });
    m.side.forEach(function (b) { head(S, b[0]); lines(S, b[1], b[2] === 'bullet'); });

    /* main */
    function expPdf(entries) {
      entries.forEach(function (e, idx) {
        if (idx) M.y -= 5;
        if (e.company) { M.need(LH * 3); text(M, e.company, { bold: true }); }
        if (e.role || e.period) {
          var pw = e.period ? F.widthOfTextAtSize(safe(e.period, F), SZ) : 0;
          var rl = e.role ? wrap(e.role, O, SZ, M.w - pw - 10) : [''];
          rl.forEach(function (ln, k) {
            M.need(LH);
            if (ln) M.page().drawText(ln, { x: M.x0, y: M.y - SZ, size: SZ, font: O, color: NAVY });
            if (k === 0 && e.period) M.page().drawText(safe(e.period, F), { x: M.x0 + M.w - pw, y: M.y - SZ, size: SZ, font: F, color: MUTE });
            M.y -= LH;
          });
        }
        M.y -= 1; lines(M, e.details || [], true);
      });
    }
    m.main.forEach(function (b) { head(M, b[0]); if (b[2] === 'exp') expPdf(b[3]); else lines(M, b[1], false); M.y -= 4; });
    if (d.signatureImage) {
      M.need(86); M.y -= 18;
      var si = await doc.embedPng(await bytes(d.signatureImage));
      var sc = Math.min(120 / si.width, 42 / si.height);
      M.page().drawImage(si, { x: M.x0 + 10 + (145 - si.width * sc) / 2, y: M.y - si.height * sc, width: si.width * sc, height: si.height * sc });
      M.y -= si.height * sc + 4;
      M.page().drawLine({ start: { x: M.x0 + 10, y: M.y }, end: { x: M.x0 + 155, y: M.y }, thickness: 0.8, color: INK });
      M.y -= 3;
      var sn = d.signature || d.name || '';
      if (sn) { var sx = M.x0; M.x0 = M.x0 + 10; var sw = M.w; M.w = 145; text(M, sn, { bold: true, size: 9, center: true }); M.x0 = sx; M.w = sw; }
    } else if (d.signature) {
      M.need(50); M.y -= 26;
      M.page().drawLine({ start: { x: M.x0 + 10, y: M.y }, end: { x: M.x0 + 155, y: M.y }, thickness: 0.8, color: INK });
      M.y -= 3;
      var sx2 = M.x0; M.x0 += 10; var sw2 = M.w; M.w = 145; text(M, d.signature, { bold: true, size: 9, center: true }); M.x0 = sx2; M.w = sw2;
    }
    doc.setTitle((d.name || 'CV') + ' - CV');
    return new Blob([await doc.save()], { type: 'application/pdf' });
  }

  /* ---------- DOC (.docx) ---------- */
  async function exportDocx(d) {
    await loadScript('docx.iife.js', 'docx');
    var X = docx, m = model(d), NAVY = '0A2A66', LINE = '7196C4', SIZE = FONT_PT * 2;
    var run = function (t, o) { return new X.TextRun(Object.assign({ text: t, font: 'Arial', size: SIZE }, o || {})); };
    var para = function (t, o, po) { return new X.Paragraph(Object.assign({ children: [run(t, o)], spacing: { after: 50 } }, po || {})); };
    var bullet = function (t) { return new X.Paragraph({ children: [run(t)], bullet: { level: 0 }, spacing: { after: 40 } }); };
    var head = function (t) {
      return new X.Paragraph({ children: [run(t, { bold: true, size: 21, color: NAVY })], keepNext: true, spacing: { before: 200, after: 70 },
        border: { bottom: { style: X.BorderStyle.SINGLE, size: 6, color: LINE, space: 2 } } });
    };
    var body = function (arr, all) {
      return arr.map(function (l) { var b = all || BUL.test(l); return b ? bullet(l.replace(BUL, '')) : para(l); });
    };
    var side = [], main = [];
    if (d.photo) {
      var pb = new Uint8Array(await bytes(await circlePNG(d.photo, 320)));
      side.push(new X.Paragraph({ alignment: X.AlignmentType.CENTER, spacing: { after: 140 }, children: [new X.ImageRun({ type: 'png', data: pb, transformation: { width: 104, height: 104 } })] }));
    }
    if (d.name) side.push(new X.Paragraph({ alignment: X.AlignmentType.CENTER, spacing: { after: 50 }, children: [run(d.name.toUpperCase(), { bold: true, size: 32, color: NAVY })] }));
    if (d.role) side.push(para(d.role.toUpperCase(), { bold: true }, { alignment: X.AlignmentType.CENTER }));
    if (d.company) side.push(para(d.company, { color: '44506A' }, { alignment: X.AlignmentType.CENTER }));
    m.side.forEach(function (b) { side.push(head(b[0])); body(b[1], b[2] === 'bullet').forEach(function (p) { side.push(p); }); });
    if (!side.length) side.push(para(''));
    var expDocx = function (entries) {
      var out = [];
      entries.forEach(function (e, idx) {
        if (e.company) out.push(new X.Paragraph({ children: [run(e.company, { bold: true })], keepNext: true, spacing: { before: idx ? 130 : 20, after: 10 } }));
        if (e.role || e.period) {
          out.push(new X.Paragraph({ keepNext: !!(e.details && e.details.length), tabStops: [{ type: X.TabStopType.RIGHT, position: 6880 }], spacing: { after: 40 },
            children: [run(e.role || '', { italics: true, color: NAVY })].concat(e.period ? [new X.TextRun({ children: [new X.Tab(), e.period], font: 'Arial', size: SIZE, color: '44506A' })] : []) }));
        }
        (e.details || []).forEach(function (t) { out.push(bullet(t)); });
      });
      return out;
    };
    m.main.forEach(function (b) { main.push(head(b[0])); (b[2] === 'exp' ? expDocx(b[3]) : body(b[1], false)).forEach(function (p) { main.push(p); }); });
    if (d.signatureImage) {
      var im = await loadImg(d.signatureImage), sc = Math.min(120 / im.width, 42 / im.height);
      main.push(new X.Paragraph({ spacing: { before: 300, after: 20 }, children: [new X.ImageRun({ type: 'png', data: new Uint8Array(await bytes(d.signatureImage)), transformation: { width: Math.round(im.width * sc), height: Math.round(im.height * sc) } })] }));
    } else if (d.signature) main.push(new X.Paragraph({ spacing: { before: 300 }, children: [] }));
    if (d.signature || d.name) main.push(new X.Paragraph({ spacing: { after: 40 }, border: { top: { style: X.BorderStyle.SINGLE, size: 6, color: '222222', space: 2 } }, indent: { right: 5200 }, alignment: X.AlignmentType.CENTER, children: [run(d.signature || d.name, { bold: true, size: 18 })] }));
    if (!main.length) main.push(para(''));
    var none = { style: X.BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    var cell = function (w, kids, fill, mg) {
      return new X.TableCell({ width: { size: w, type: X.WidthType.DXA }, children: kids, margins: mg,
        shading: fill ? { type: X.ShadingType.CLEAR, fill: fill, color: 'auto' } : undefined, borders: { top: none, bottom: none, left: none, right: none } });
    };
    var table = new X.Table({
      width: { size: 11906, type: X.WidthType.DXA }, columnWidths: [4048, 7858],
      borders: { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none },
      rows: [new X.TableRow({ height: { value: 15900, rule: X.HeightRule.ATLEAST }, children: [
        cell(4048, side, 'F6F6F6', { top: 360, bottom: 360, left: 300, right: 260 }),
        cell(7858, main, null, { top: 360, bottom: 360, left: 440, right: 520 })
      ] })]
    });
    var out = new X.Document({
      title: (d.name || 'CV') + ' - CV',
      styles: { default: { document: { run: { font: 'Arial', size: SIZE } } } },
      sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 300, right: 0, bottom: 300, left: 0 } } },
        children: [table, new X.Paragraph({ spacing: { before: 0, after: 0 }, children: [new X.TextRun({ text: '', size: 2 })] })] }]
    });
    return X.Packer.toBlob(out);
  }

  /* ---------- signature: paper -> transparent, ink only, cropped ---------- */
  async function processSignature(file) {
    var img = await loadImg(await fileToURL(file));
    var W = Math.min(900, img.width), H = Math.max(1, Math.round(img.height * W / img.width));
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0, W, H);
    var d = x.getImageData(0, 0, W, H), p = d.data, n = W * H, hist = new Uint32Array(256), lum = new Uint8Array(n), i, j;
    for (i = 0, j = 0; i < n; i++, j += 4) { var l = (0.299 * p[j] + 0.587 * p[j + 1] + 0.114 * p[j + 2]) | 0; lum[i] = l; hist[l]++; }
    var acc = 0, paper = 255, target = n * 0.8;
    for (i = 0; i < 256; i++) { acc += hist[i]; if (acc >= target) { paper = i; break; } }
    paper = Math.max(paper, 110);
    var minX = W, minY = H, maxX = 0, maxY = 0;
    for (i = 0, j = 0; i < n; i++, j += 4) {
      var drop = (paper - lum[i]) / paper, a = (drop - 0.10) / 0.30; a = a < 0 ? 0 : a > 1 ? 1 : a;
      if (a > 0) {
        p[j] = p[j] * 0.55; p[j + 1] = p[j + 1] * 0.55; p[j + 2] = p[j + 2] * 0.62;
        if (a > 0.25) { var px = i % W, py = (i / W) | 0; if (px < minX) minX = px; if (px > maxX) maxX = px; if (py < minY) minY = py; if (py > maxY) maxY = py; }
      }
      p[j + 3] = (a * 255) | 0;
    }
    x.putImageData(d, 0, 0);
    if (maxX <= minX || maxY <= minY) throw new Error('No signature found. Use a clear photo of the signature on white paper.');
    var pad = 6; minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad); maxX = Math.min(W - 1, maxX + pad); maxY = Math.min(H - 1, maxY + pad);
    var o = document.createElement('canvas'); o.width = maxX - minX + 1; o.height = maxY - minY + 1;
    o.getContext('2d').drawImage(c, minX, minY, o.width, o.height, 0, 0, o.width, o.height);
    return o.toDataURL('image/png');
  }

  /* ---------- import old CV (PDF / DOCX) -> fields of this page ---------- */
  var pdfjsLib = null;
  function groupLines(its) {
    its.sort(function (a, b) { return Math.abs(a.y - b.y) > 3 ? b.y - a.y : a.x - b.x; });
    var rows = [], cur = null;
    its.forEach(function (i) { if (cur && Math.abs(cur.y - i.y) <= 3) cur.items.push(i); else { cur = { y: i.y, items: [i] }; rows.push(cur); } });
    return rows.map(function (r) { r.items.sort(function (a, b) { return a.x - b.x; }); return r.items.map(function (i) { return i.s; }).join(' ').replace(/\s+/g, ' ').trim(); }).filter(Boolean);
  }
  async function pdfLines(buf) {
    if (!pdfjsLib) {
      pdfjsLib = await import(VENDOR + 'pdf.min.js');
      pdfjsLib.GlobalWorkerOptions.workerSrc = VENDOR + 'pdf.worker.min.js';
    }
    var pdf = await pdfjsLib.getDocument({ data: buf }).promise, out = [];
    for (var pn = 1; pn <= pdf.numPages; pn++) {
      var pgx = await pdf.getPage(pn), vp = pgx.getViewport({ scale: 1 }), tc = await pgx.getTextContent();
      var its = tc.items.filter(function (i) { return i.str && i.str.trim(); }).map(function (i) { return { s: i.str, x: i.transform[4], y: i.transform[5], w: i.width || 0 }; });
      var cut = vp.width * 0.36;
      var left = its.filter(function (i) { return i.x < cut && i.x + i.w < cut + 20; });
      var right = its.filter(function (i) { return left.indexOf(i) < 0; });
      var clustered = function (arr) { var b = {}, best = 0; arr.forEach(function (i) { var k = Math.round(i.x / 4); b[k] = (b[k] || 0) + 1; if (b[k] > best) best = b[k]; }); return arr.length && best / arr.length >= 0.6; };
      var groups = (left.length >= 3 && right.length >= 3 && clustered(right) && clustered(left)) ? [left, right] : [its];
      groups.forEach(function (g) { out = out.concat(groupLines(g)); });
    }
    return out;
  }
  async function docxLines(buf) {
    await loadScript('jszip.min.js', 'JSZip');
    var zip = await JSZip.loadAsync(buf), f = zip.file('word/document.xml');
    if (!f) throw new Error('Not a valid DOCX file');
    var xml = new DOMParser().parseFromString(await f.async('string'), 'application/xml'), out = [];
    Array.prototype.forEach.call(xml.getElementsByTagName('w:p'), function (p) {
      var t = '';
      Array.prototype.forEach.call(p.getElementsByTagName('*'), function (n) {
        if (n.nodeName === 'w:t') t += n.textContent; else if (n.nodeName === 'w:tab') t += ' '; else if (n.nodeName === 'w:br') t += '\n';
      });
      var isLi = p.getElementsByTagName('w:numPr').length > 0;
      t.split('\n').forEach(function (l) { l = l.replace(/\s+/g, ' ').trim(); if (l) out.push((isLi ? '• ' : '') + l); });
    });
    return out;
  }
  var HEADS = [
    ['summary', /^((professional|career|executive)\s+)?(summary|profile|objective)$|^about(\s+me)?$/i],
    ['experience', /^((professional|work|relevant)\s+)experience$/i],
    ['achievements', /^(key\s+)?achievements?(\s*(&|and)\s*awards)?$/i],
    ['expertise', /^((professional|quality|key)\s+)(\/\s*professional\s+)?expertise$|^expertise$/i],
    ['competencies', /^core\s+competenc(y|ies)$|^key\s+(skills|strengths)$|^strengths$|^competenc(y|ies)$/i],
    ['technical', /^(technical|it|computer)\s+skills?$/i],
    ['training', /^training(\s+skills?)?$|^trainings?(\s*&\s*certifications?)?$|^certifications?$|^courses$/i],
    ['skills', /^((additional|other|professional|key)\s+)?skills$/i],
    ['employment', /^(employment|career|work)\s+(history|record|summary)$|^employment$/i],
    ['buyers', /^buyers?(\s+(exposure|handled|worked|experience))?$|^brands?(\s+handled)?$|^buyer\s*\/\s*client\s+exposure$/i],
    ['education', /^(academic|educational)(\s+(qualifications?|background|credentials))?$|^education(al)?(\s+(qualifications?|background))?$|^qualifications?$/i],
    ['languages', /^(language\s+skills?|languages?)$/i],
    ['personal', /^personal\s+(info|information|details|data)$/i],
    ['address', /^(permanent\s+|present\s+)?address$/i],
    ['reference', /^references?$/i],
    ['declaration', /^declaration$/i],
    ['contact', /^contact(\s+(details|info(rmation)?))?$/i],
    ['skip', /^(signature|hobbies|interests|applicant'?s signature)$/i]
  ];
  function headingOf(line) {
    var t = line.replace(/[:：]\s*$/, '').trim();
    if (t.length > 42 || t.split(/\s+/).length > 6) return null;
    for (var i = 0; i < HEADS.length; i++) if (HEADS[i][1].test(t)) return HEADS[i][0];
    return null;
  }
  var RE_MAIL = /[\w.+-]+@[\w-]+(\.[\w-]+)+/, RE_PHONE = /(\+?\d[\d\s\-().]{8,}\d)/, RE_LI = /(https?:\/\/)?(www\.)?linkedin\.com\/[^\s]+/i, RE_WEB = /((https?:\/\/)|www\.)[^\s]+/i;
  var RE_RANGE = /((jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s*)?(19|20)\d{2}\s*(-|–|—|to)\s*(((jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s*)?(19|20)\d{2}|present|current|till date|date|now)/i;
  var LEVELS = /(native|fluent|advanced|intermediate|basic|proficient|mother tongue)/i;

  function eduRows(ls) {
    var out = [], buf = [], trim = function (t) { return t.replace(/^[\s|,\-–—]+|[\s|,\-–—]+$/g, ''); };
    ls.forEach(function (l) {
      l = l.replace(BUL, '');
      var y = l.match(/\b(19|20)\d{2}\b/);
      if (y) {
        var rest = trim(l.replace(/\b(19|20)\d{2}\b/g, '')), parts = buf.concat(rest ? [rest] : []);
        var degree = parts[0] || '', inst = parts.slice(1).join(', ');
        out.push((inst ? [inst, degree, y[0]] : [degree, '', y[0]]).filter(function (v, i) { return v || i === 2; }).join(' — '));
        buf = [];
      } else buf.push(trim(l));
    });
    if (buf.length) out.push(buf.join(' — '));
    return out;
  }
  function langRows(ls) {
    var rows = [];
    ls.join(',').split(/[,;\n]/).forEach(function (t) {
      t = t.replace(BUL, '').trim(); if (!t) return;
      var m = t.match(/^([A-Za-z][A-Za-z ]+?)\s*[-–—:(]\s*([A-Za-z ]+)\)?$/), lang = t, lvl = 'Fluent';
      if (m && LEVELS.test(m[2])) { lang = m[1].trim(); var lv = m[2].match(LEVELS)[1].toLowerCase(); lvl = lv === 'mother tongue' ? 'Native' : lv === 'proficient' ? 'Advanced' : lv.charAt(0).toUpperCase() + lv.slice(1); }
      else if (m) lang = m[1].trim();
      rows.push(lang + ' — ' + lvl);
    });
    return rows;
  }
  function refRows(ls) {
    ls = ls.map(function (l) { return l.replace(BUL, ''); });
    return (ls.length <= 4 ? [ls.join(' — ')] : ls).filter(Boolean);
  }
  function parseCV(all) {
    var x = {}, head = [], cur = 'head', S = {};
    all.forEach(function (l) {
      var h = headingOf(l);
      if (h) { cur = h; S[h] = S[h] || []; return; }
      if (cur === 'head') head.push(l); else (S[cur] = S[cur] || []).push(l);
    });
    var text = all.join('\n'), m;
    x.email = (m = text.match(RE_MAIL)) ? m[0] : '';
    x.linkedin = (m = text.match(RE_LI)) ? m[0] : '';
    var noLi = text.replace(RE_LI, '').replace(RE_MAIL, '');
    if (!x.linkedin && (m = noLi.match(RE_WEB))) x.linkedin = m[0];
    x.phone = '';
    var pool = head.concat(S.contact || []).map(function (l) { return l.replace(RE_MAIL, '').trim(); });
    for (var i = 0; i < pool.length; i++) { if (RE_RANGE.test(pool[i])) continue; var pm = pool[i].match(RE_PHONE); if (pm) { x.phone = pm[0].trim(); break; } }
    var isContact = function (l) { return RE_MAIL.test(l) || RE_PHONE.test(l) || RE_LI.test(l) || RE_WEB.test(l) || /^(phone|mobile|email|e-mail|tel|location|address|website)\b/i.test(l); };
    var nm = head.filter(function (l) { return /[A-Za-z]/.test(l) && !isContact(l) && !/^(curriculum vitae|resume|cv|photo)$/i.test(l); });
    x.name = nm[0] && nm[0].split(/\s+/).length <= 6 ? nm[0] : '';
    x.role = nm[1] || '';
    x.company = nm[2] && nm[2].length <= 60 ? nm[2] : '';
    x.location = '';
    for (var k = 0; k < all.length; k++) {
      var lm = all[k].match(/^(location|address)\s*[:\-]\s*(.+)$/i);
      if (lm) { x.location = lm[2]; break; }
    }
    if (!x.location) { var cl = (S.contact || []).filter(function (l) { return !isContact(l); }); if (cl[0]) x.location = cl[0]; }
    var J = function (k2) { return (S[k2] || []).join('\n'); };
    x.summary = (S.summary || []).join(' ');
    x.experience = formatExperience(parseEmployment(S.experience || [])); x.achievements = J('achievements'); x.expertise = J('expertise');
    x.employment = J('employment'); x.buyers = (S.buyers || []).map(function (l) { return l.replace(BUL, ''); }).join(', ');
    x.competencies = (S.competencies || []).map(function (l) { return l.replace(BUL, ''); }).join('\n');
    x.technical = (S.technical || []).map(function (l) { return l.replace(BUL, ''); }).join(', ');
    x.training = J('training'); x.skills = (S.skills || []).map(function (l) { return l.replace(BUL, ''); }).join(', ');
    x.personal = J('personal'); x.address = (S.address || []).join(', ');
    x.declaration = (S.declaration || []).join(' ');
    x.languages = langRows(S.languages || []).join('\n');
    x.education = eduRows(S.education || []).join('\n');
    x.reference = refRows(S.reference || []).join('\n');
    // generic CVs often have only "Work Experience" with dates: keep it as experience text (format is free text here)
    return x;
  }
  async function parseFile(file) {
    var buf = await file.arrayBuffer(), ls;
    if (/\.pdf$/i.test(file.name) || file.type === 'application/pdf') ls = await pdfLines(buf);
    else if (/\.docx$/i.test(file.name)) ls = await docxLines(buf);
    else throw new Error('Auto-fill works with PDF and DOCX files.');
    if (ls.length < 3) throw new Error('No readable text found. Scanned/image CVs cannot be read automatically.');
    var x = parseCV(ls);
    x.title = file.name.replace(/\.[^.]+$/, '').slice(0, 90) || 'Imported CV';
    return x;
  }

  window.SuhasCvPlus = { exportPdf: exportPdf, exportDocx: exportDocx, processSignature: processSignature, parseFile: parseFile, parseExperience: parseExperience, formatExperience: formatExperience, save: save, fileBase: fileBase, version: '2026.11.18.1' };
})();
