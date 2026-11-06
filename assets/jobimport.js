/* SUHAS GROUP - job importer
 * Turns a pasted job link and/or job text (copied by the admin from LinkedIn, BDJobs, Indeed...)
 * into the fields of the "Post a job" form. Pure text parsing: it never fetches other websites.
 */
(function (root) {
  'use strict';

  var CATEGORIES = [
    ['Quality Assurance / QC', /\b(qa|qc|qas|quality|inspect\w*|audit\w*|testing|laborator\w*|lab|aql|compliance)\b/gi],
    ['Merchandising', /\b(merchandis\w*|buyer|buying|sourcing|sampling|costing|order\s+management|tna)\b/gi],
    ['Production & Operations', /\b(production|operations?|factory|supervisor|plant|manufactur\w*|cutting|sewing|finishing|washing|maintenance|industrial\s+engineer\w*|line\s+chief|floor|planning|supply\s+chain|logistics|store)\b/gi],
    ['HR & Admin', /\b(hr|human\s+resources?|admin\w*|recruit\w*|payroll|talent|welfare|office\s+assistant|secretary|receptionist)\b/gi]
  ];

  var TITLE_WORDS = /\b(manager|officer|executive|engineer|supervisor|merchandiser|assistant|analyst|head|director|lead|specialist|coordinator|inspector|developer|designer|technician|operator|auditor|consultant|intern|trainee|controller|administrator|incharge|in-charge|chief|gm|agm|dgm|vp|president|associate|representative)\b/i;

  var NOISE = [
    /^(share|save|saved|apply|easy apply|apply now|show more|show less|show more options|see more|see less|report this job|set alert|message|premium|meet the hiring team|about the company|similar jobs|skip to main content|try premium.*|people also viewed.*|more jobs.*)$/i,
    /^promoted by hirer.*$/i,
    /^responses managed off linkedin$/i,
    /^be an early applicant$/i,
    /^actively (reviewing|recruiting).*$/i,
    /^reactivated.*$/i,
    /^see how you compare.*$/i,
    /^referrals increase your chances.*$/i,
    /^get notified.*$/i,
    /^this job is sourced from.*$/i,
    /^(over\s+)?\d[\d,.]*\+?\s+(connections?|followers?|employees?|applicants?|people clicked apply).*$/i,
    /^[\d,.]+\s+(applicants?|people clicked apply)$/i
  ];

  var META_LABELS = /^(seniority level|employment type|job function|industries|job type|workplace type)$/i;
  var DESC_MARKERS = /^(about the job|job description|job details|description|position summary|about this role|about the role)\s*:?$/i;
  var TYPE_RE = /\b(full[- ]?time|part[- ]?time|contract(?:ual)?|internship|temporary|freelance|volunteer)\b/i;
  var PLACE_RE = /\b(remote|hybrid|on[- ]?site)\b/i;
  var TIME_RE = /\b(ago|applicants?|reposted|posted|clicked apply|hours?|days?|weeks?|months?)\b/i;
  var MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };

  function trim(s) { return String(s).replace(/[​-‍﻿]/g, '').replace(/ /g, ' ').replace(/[ \t]+/g, ' ').trim(); }
  function isNoise(l) { return NOISE.some(function (r) { return r.test(l); }); }

  function titleCase(slug) {
    return slug.split('-').filter(Boolean).map(function (w) {
      return w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
  }

  function words(s) { return String(s).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean); }
  function similarity(a, b) {
    var A = words(a), B = words(b); if (!A.length || !B.length) return 0;
    var common = A.filter(function (w) { return B.indexOf(w) > -1; }).length;
    return common / Math.max(A.length, B.length);
  }

  /* ---------- links ---------- */
  function sourceOf(host) {
    host = host.toLowerCase();
    if (/(^|\.)linkedin\.com$/.test(host) || host === 'lnkd.in') return 'LinkedIn';
    if (/(^|\.)bdjobs\.com$/.test(host)) return 'BDJobs';
    if (/(^|\.)indeed\.com$/.test(host)) return 'Indeed';
    return 'Other';
  }

  function cleanLink(raw) {
    var u;
    try { u = new URL(raw.replace(/[.,;)\]]+$/, '')); } catch (e) { return null; }
    if (!/^https?:$/.test(u.protocol)) return null;
    var src = sourceOf(u.hostname), out = { url: u.href, source: src, slugTitle: '', slugCompany: '' };
    if (src === 'LinkedIn') {
      var m = /\/jobs\/view\/(?:([a-z0-9%\-]+?)-)?(\d{6,})/i.exec(u.pathname);
      var id = m ? m[2] : (u.searchParams.get('currentJobId') || '');
      if (/^\d{6,}$/.test(id)) {
        out.url = 'https://www.linkedin.com/jobs/view/' + id + '/';
        if (m && m[1]) {
          var slug = decodeURIComponent(m[1]).toLowerCase(), at = slug.lastIndexOf('-at-');
          if (at > 0) { out.slugTitle = titleCase(slug.slice(0, at)); out.slugCompany = titleCase(slug.slice(at + 4)); }
          else { out.slugTitle = titleCase(slug); }
        }
      } else {
        u.search = ''; u.hash = ''; out.url = u.href;
      }
    } else if (src === 'Indeed') {
      var jk = u.searchParams.get('jk') || u.searchParams.get('vjk');
      if (jk) out.url = u.origin + '/viewjob?jk=' + jk;
    } else {
      var drop = [];
      u.searchParams.forEach(function (v, k) { if (/^(utm_|trk|tracking|refid|fbclid|gclid|mc_)/i.test(k)) drop.push(k); });
      drop.forEach(function (k) { u.searchParams.delete(k); });
      u.hash = '';
      out.url = u.href;
    }
    return out;
  }

  /* ---------- dates ---------- */
  function iso(y, m, d) {
    y = +y; m = +m; d = +d;
    if (y < 2020 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
    var dt = new Date(Date.UTC(y, m - 1, d));
    if (dt.getUTCMonth() !== m - 1) return null;
    return y + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
  }

  function parseDate(s) {
    s = trim(s).replace(/(\d)(st|nd|rd|th)\b/gi, '$1');
    var m;
    if ((m = /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/.exec(s))) return iso(m[1], m[2], m[3]);
    if ((m = /\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})\b/.exec(s))) return iso(m[3], m[2], m[1]); /* day first (Bangladesh) */
    if ((m = /\b(\d{1,2})\s*[\-\s]\s*([A-Za-z]{3,9})[a-z]*\.?,?\s*[\-\s]?\s*(\d{4})\b/.exec(s)) && MONTHS[m[2].slice(0, 4).toLowerCase()] || (m && MONTHS[m[2].slice(0, 3).toLowerCase()])) {
      var mon = MONTHS[m[2].slice(0, 4).toLowerCase()] || MONTHS[m[2].slice(0, 3).toLowerCase()];
      return iso(m[3], mon, m[1]);
    }
    if ((m = /\b([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})\b/.exec(s))) {
      var mon2 = MONTHS[m[1].slice(0, 4).toLowerCase()] || MONTHS[m[1].slice(0, 3).toLowerCase()];
      if (mon2) return iso(m[3], mon2, m[2]);
    }
    return null;
  }

  function findDeadline(text) {
    var re = /(?:application\s+deadline|deadline|apply\s+before|apply\s+by|last\s+date(?:\s+of\s+(?:application|apply|submission))?|closing\s+date|closes?\s+on)\s*(?:of\s+application)?\s*[:\-–—]?\s*([0-9A-Za-z ,.\/\-]{4,32})/gi, m;
    while ((m = re.exec(text))) { var d = parseDate(m[1]); if (d) return d; }
    return null;
  }

  /* ---------- main parser ---------- */
  function parse(raw) {
    raw = String(raw || '').replace(/\r/g, '');
    var res = { url: null, source: null, title: '', company: '', location: '', country: '', salary: '', experience: '', requirements: '', urgent: false, job_type: '', category: null, deadline: null, description: '', filled: [], notes: [] };
    if (!trim(raw)) { res.notes.push('Nothing to read. Paste the job link and the job text.'); return res; }

    /* links */
    var urlRe = /https?:\/\/[^\s<>"']+/gi, links = (raw.match(urlRe) || []).map(cleanLink).filter(Boolean);
    var link = links.filter(function (l) { return l.source !== 'Other'; })[0] || links[0] || null;
    if (link) { res.url = link.url; res.source = link.source; }
    var text = raw.replace(urlRe, ' ');

    /* lines */
    var lines = text.split('\n').map(trim);
    var all = lines.filter(Boolean);
    var linkedinLike = /\b(easy apply|applicants?|promoted by hirer|seniority level|linkedin)\b/i.test(text);
    if (!res.source && linkedinLike) res.source = 'LinkedIn';

    /* metadata blocks (Seniority level / Employment type / Job function / Industries) */
    var meta = {};
    var bodyLines = [];
    for (var i = 0; i < all.length; i++) {
      var l = all[i];
      if (META_LABELS.test(l) && i + 1 < all.length && !META_LABELS.test(all[i + 1])) {
        meta[l.toLowerCase()] = all[i + 1]; i++; continue;
      }
      bodyLines.push(l);
    }

    /* description marker */
    var mi = -1;
    for (i = 0; i < bodyLines.length; i++) { if (DESC_MARKERS.test(bodyLines[i])) { mi = i; break; } }

    /* location anchor: "Dhaka, Bangladesh · 2 days ago · 45 applicants" */
    var limit = mi > -1 ? mi : Math.min(bodyLines.length, 40), li = -1;
    for (i = 0; i < limit; i++) {
      if (/[·•|]/.test(bodyLines[i]) && TIME_RE.test(bodyLines[i])) { li = i; break; }
    }
    var headerPool, afterHeader;
    if (li > -1) {
      res.location = trim(bodyLines[li].split(/[·•|]/)[0]);
      headerPool = bodyLines.slice(0, li).filter(function (x) { return !isNoise(x); }).slice(-2);
      afterHeader = bodyLines.slice(li + 1, mi > -1 ? mi : undefined);
    } else {
      headerPool = bodyLines.slice(0, mi > -1 ? mi : 6).filter(function (x) { return !isNoise(x); });
      if (mi > -1) headerPool = headerPool.slice(-3);
      headerPool = headerPool.filter(function (x) { return x.length < 120 && !TYPE_RE.test(x) || TITLE_WORDS.test(x); }).slice(0, 3);
      afterHeader = [];
      var locLine = bodyLines.slice(0, limit).filter(function (x) {
        return x.length < 80 && /^[A-Z][\w.'\- ]+(,\s*[A-Z][\w.'\- ]+)+$/.test(x) && headerPool.indexOf(x) === -1;
      })[0];
      if (locLine) res.location = locLine;
    }
    var lab = /^(?:job\s+)?location\s*[:\-]\s*(.+)$/i, lm;
    for (i = 0; i < bodyLines.length && !res.location; i++) { if ((lm = lab.exec(bodyLines[i]))) res.location = trim(lm[1]); }

    /* title / company */
    var cands = headerPool.map(function (x) { return x.replace(/\s*[\-|–]\s*linkedin$/i, '').replace(/\s+with verification$/i, '').replace(/\s*\((verified job)\)$/i, '').replace(/…$/, '').trim(); }).filter(Boolean);
    var title = '', company = '';
    if (link && link.slugTitle && cands.length) {
      var bestT = -1, bestS = 0.4;
      cands.forEach(function (c, k) { var s = similarity(c, link.slugTitle); if (s > bestS) { bestS = s; bestT = k; } });
      if (bestT > -1) { title = cands[bestT]; company = cands.filter(function (c, k) { return k !== bestT; })[0] || ''; }
    }
    if (!title && cands.length) {
      if (cands.length === 1) title = cands[0];
      else {
        var t0 = TITLE_WORDS.test(cands[0]), t1 = TITLE_WORDS.test(cands[1]);
        if (!t0 && t1) { title = cands[1]; company = cands[0]; }
        else { title = cands[0]; company = cands[1]; }
      }
    }
    if (!res.location) {
      var lc = cands.filter(function (c) { return c !== title && c !== company && /^[A-Z][\w.'\- ]+(,\s*[A-Z][\w.'\- ]+)+$/.test(c); })[0];
      if (lc) res.location = lc;
    }
    if (!title && link && link.slugTitle) { title = link.slugTitle; res.notes.push('Title taken from the link. Please check it.'); }
    if (!company && link && link.slugCompany) { company = link.slugCompany; res.notes.push('Company taken from the link. Please check it.'); }
    res.title = title; res.company = company.replace(/\s*[·•|].*$/, '');

    /* type */
    var typeSrc = [meta['employment type'], meta['job type'], res.location, headerPool.join(' '), afterHeader.join(' ')].join(' ');
    var tm = TYPE_RE.exec(typeSrc), pm = PLACE_RE.exec([meta['workplace type'], afterHeader.join(' ')].join(' '));
    if (tm) {
      var t = tm[1].toLowerCase().replace(/\s|-/g, '');
      res.job_type = { fulltime: 'Full-time', parttime: 'Part-time', contract: 'Contract', contractual: 'Contract', internship: 'Internship', temporary: 'Temporary', freelance: 'Freelance', volunteer: 'Volunteer' }[t] || '';
    }
    if (pm) { var p = pm[1].toLowerCase().replace(/[\s-]/g, ''); var pn = p === 'onsite' ? 'On-site' : p.charAt(0).toUpperCase() + p.slice(1); res.job_type = res.job_type ? res.job_type + ', ' + pn : pn; }

    /* description */
    var dstart = mi > -1 ? mi + 1 : (li > -1 ? li + 1 : Math.min(headerPool.length, bodyLines.length));
    var desc = bodyLines.slice(dstart).filter(function (x) { return !isNoise(x); });
    if (mi === -1 && li > -1) { /* drop header chips that sit between location line and the text */
      desc = desc.filter(function (x) { return !(x.length < 40 && (TYPE_RE.test(x) || PLACE_RE.test(x))); });
    }
    var d = desc.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    if (d.length > 5000) { d = d.slice(0, 5000); d = d.slice(0, Math.max(d.lastIndexOf('\n'), 4000)).trim() + '\n...'; }
    res.description = d;

    /* deadline */
    res.deadline = findDeadline(text);

    /* category */
    var fn = meta['job function'] || '', best = null, bestScore = 0;
    CATEGORIES.forEach(function (c) {
      var s = ((res.title.match(c[1]) || []).length) * 3 + ((fn.match(c[1]) || []).length) * 2 + ((d.slice(0, 1500).match(c[1]) || []).length);
      if (s > bestScore) { bestScore = s; best = c[0]; }
    });
    res.category = best;

    /* extra fields: country, salary, experience, requirements, urgent */
    var locParts = String(res.location || '').split(',').map(trim).filter(Boolean);
    res.country = locParts.length > 1 ? locParts[locParts.length - 1] : (locParts.length === 1 && /^(bangladesh|cambodia|india|pakistan|sri lanka|vietnam|malaysia|china|qatar|saudi arabia|united arab emirates|uae|kuwait|oman|bahrain|jordan|egypt|turkey|singapore|united states|united kingdom|canada|australia)$/i.test(locParts[0]) ? locParts[0] : '');
    var sm = /(?:salary|compensation|pay(?:\s+range)?|remuneration)\s*(?:range)?\s*[:\-–]\s*([^\n]{3,70})/i.exec(text) ||
      /((?:BDT|Tk\.?|৳|USD|US\$|\$|AED|SAR|QAR|KWD|MYR|KHR|INR|EUR|£)\s?[\d][\d,.]*\s?(?:k|K)?(?:\s?(?:-|–|to)\s?(?:BDT|Tk\.?|৳|USD|US\$|\$|AED|SAR|QAR|KWD|MYR|KHR|INR|EUR|£)?\s?[\d][\d,.]*\s?(?:k|K)?)?(?:\s?(?:\/|per\s)\s?(?:month|mo|year|yr|annum|hour|hr|day))?)/i.exec(text);
    res.salary = sm ? trim(sm[1]).replace(/[.;,]+$/, '') : '';
    var em = /(\d{1,2}\s*(?:\+|(?:-|–|to)\s*\d{1,2})?\s*years?(?:\s+of)?\s+(?:(?:relevant|proven|hands-on|related|working|professional)\s+)*(?:work\s+)?experience)/i.exec(text) ||
      /experience\s*[:\-–]\s*([^\n]{3,50})/i.exec(text) ||
      /((?:minimum|min\.?|at least)\s+\d{1,2}\s*\+?\s*years?)/i.exec(text);
    res.experience = em ? trim(em[1]).replace(/[.;,]+$/, '') : '';
    var reqHead = /^(requirements?|key requirements?|qualifications?|required (?:skills|qualifications)|what you(?:'|’)?ll need|what we(?:'|’)?re looking for|skills?\s*(?:&|and)\s*qualifications?|educational? (?:requirements?|qualifications?)|job requirements?)\s*:?$/i;
    var stopHead = /^(responsibilit\w*|duties|key responsibilit\w*|benefits?|what we offer|about (?:us|the company|company)|how to apply|compensation|salary|job (?:description|summary)|why join us|apply\b.*)\s*:?$/i;
    var dl = d.split('\n'), rs = -1;
    for (i = 0; i < dl.length; i++) { if (reqHead.test(trim(dl[i]).replace(/^[#*\-•\s]+/, ''))) { rs = i; break; } }
    if (rs > -1) {
      var rq = [];
      for (i = rs + 1; i < dl.length && rq.length < 15; i++) {
        var cl = trim(dl[i]); if (!cl) { if (rq.length) break; else continue; }
        if (stopHead.test(cl.replace(/^[#*\-•\s]+/, ''))) break;
        rq.push(cl);
      }
      res.requirements = rq.join('\n');
    } else { res.requirements = ''; }
    res.urgent = /\b(urgent(?:ly)?|immediate(?:ly)?\s+(?:joiner|joining|hiring|opening|requirement)|walk-?in)\b/i.test(res.title + '\n' + d.slice(0, 600));

    /* what was filled */
    [['title', 'Title'], ['company', 'Company'], ['location', 'Location'], ['country', 'Country'], ['salary', 'Salary'], ['experience', 'Experience'], ['requirements', 'Requirements'], ['job_type', 'Job type'], ['category', 'Category'], ['deadline', 'Deadline'], ['description', 'Description'], ['source', 'Source'], ['url', 'Link']].forEach(function (p) {
      if (res[p[0]]) res.filled.push(p[1]);
    });
    if (!res.url) res.notes.push('No job link found. Paste the link too, so people can open the original post.');
    if (!res.title) res.notes.push('Could not find the job title. Copy from the job title downward and paste again.');
    return res;
  }

  root.JobImport = { parse: parse, parseDate: parseDate, cleanLink: cleanLink };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.JobImport;
})(typeof window !== 'undefined' ? window : globalThis);
