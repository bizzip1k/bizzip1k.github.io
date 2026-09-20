/**
 * BIZZIP Drive -> Website content sync
 * Source: bizsenior5080@gmail.com / BIZZIP / 01_표준원고
 * Trigger: 주제 DB의 '원고 상태'가 정확히 '발행'인 원고
 * Destination: GitHub Pages repository posts.json
 * Classification: intentionally left blank. Admin assigns it later.
 */
const BIZZIP_SYNC = {
  DB_ID: '16eATg14_2-60c1bytApgzjtc0qzSxze9yrIyzSxH6Fc',
  SHEET_NAME: '주제 DB',
  SOURCE_FOLDER_ID: '1qyk1DGN6UIM-iDswl1LLehfgkHmYbPN-',
  SOURCE_STATUS: '발행',
  GITHUB_OWNER: 'bizzip1k',
  GITHUB_REPO: 'bizzip1k.github.io',
  GITHUB_BRANCH: 'main',
  POSTS_PATH: 'posts.json',
  SITE_BASE: 'https://bizzip1k.github.io/',
  DAILY_SYNC_HOUR: 9
};

function syncPublishedBizzipContent() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('다른 동기화 작업이 실행 중입니다.');

  try {
    const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
    if (!token) throw new Error('Script Properties에 GITHUB_TOKEN을 먼저 등록하세요.');

    const ss = SpreadsheetApp.openById(BIZZIP_SYNC.DB_ID);
    const sheet = ss.getSheetByName(BIZZIP_SYNC.SHEET_NAME);
    if (!sheet) throw new Error('주제 DB 시트를 찾을 수 없습니다.');

    const values = sheet.getDataRange().getValues();
    const headerRow = values.findIndex(r => r.some(v => String(v).trim() === '콘텐츠 ID'));
    if (headerRow < 0) throw new Error('주제 DB에서 헤더 행을 찾을 수 없습니다.');

    const headers = values[headerRow].map(v => String(v).trim());
    const col = name => {
      const i = headers.indexOf(name);
      if (i < 0) throw new Error(`필수 컬럼이 없습니다: ${name}`);
      return i;
    };

    const cId = col('콘텐츠 ID');
    const cStatus = col('원고 상태');
    const cModified = col('최종 수정일');
    const cSiteStatus = col('사이트 발행상태');
    const cSiteDate = col('사이트 발행일');
    const cSiteUrl = col('사이트 URL');

    const gh = githubGetFile_(BIZZIP_SYNC.POSTS_PATH, token);
    const posts = JSON.parse(Utilities.newBlob(Utilities.base64Decode(gh.content.replace(/\s/g, ''))).getDataAsString('UTF-8'));
    const existing = new Set(posts.map(p => String(p.id || '')));

    const sourceDocs = buildSourceDocMap_();
    const pending = [];

    for (let r = headerRow + 1; r < values.length; r++) {
      const row = values[r];
      const contentId = String(row[cId] || '').trim();
      const status = String(row[cStatus] || '').trim();
      if (!contentId || status !== BIZZIP_SYNC.SOURCE_STATUS) continue;

      const siteUrl = `${BIZZIP_SYNC.SITE_BASE}post.html?id=${encodeURIComponent(contentId)}`;

      if (existing.has(contentId)) {
        // 이미 등록된 글이라도 관리 컬럼이 비어 있으면 상태를 맞춰 둡니다.
        if (String(row[cSiteStatus] || '').trim() !== '최신 콘텐츠 등록') {
          pending.push({rowIndex: r + 1, siteUrl, imported: false});
        }
        continue;
      }

      const prefix = docPrefixFromContentId_(contentId);
      const file = sourceDocs[prefix];
      if (!file) {
        console.log(`원고 파일을 찾지 못해 건너뜁니다: ${contentId} / ${prefix}`);
        continue;
      }

      const parsed = parseStandardManuscript_(file.getId());
      if (!parsed.title || !parsed.sections.length) {
        console.log(`원고 파싱 결과가 비어 있어 건너뜁니다: ${contentId}`);
        continue;
      }

      const date = normalizeDate_(row[cModified]) || Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
      posts.push({
        id: contentId,
        title: parsed.title,
        date: date,
        category: '',
        categoryLabel: '',
        subcategory: '',
        subcategoryLabel: '',
        subcategoryPage: '',
        summary: parsed.summary,
        sections: parsed.sections,
        source: 'google-drive-standard-manuscript',
        sourceDocumentId: file.getId(),
        sourceDocumentTitle: file.getName(),
        sitePlacement: 'unassigned'
      });
      existing.add(contentId);
      pending.push({rowIndex: r + 1, siteUrl, imported: true});
    }

    const importedCount = pending.filter(x => x.imported).length;
    if (importedCount > 0) {
      githubPutFile_(BIZZIP_SYNC.POSTS_PATH, JSON.stringify(posts, null, 2), gh.sha, token,
        `Auto sync ${importedCount} BIZZIP content item(s) from Google Drive`);
    }

    const today = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
    pending.forEach(x => {
      sheet.getRange(x.rowIndex, cSiteStatus + 1).setValue('최신 콘텐츠 등록');
      if (!sheet.getRange(x.rowIndex, cSiteDate + 1).getValue()) sheet.getRange(x.rowIndex, cSiteDate + 1).setValue(today);
      sheet.getRange(x.rowIndex, cSiteUrl + 1).setValue(x.siteUrl);
    });

    console.log(`BIZZIP 동기화 완료: 신규 ${importedCount}건, 상태확인 ${pending.length - importedCount}건`);
    return { imported: importedCount, touched: pending.length };
  } finally {
    lock.releaseLock();
  }
}

function buildSourceDocMap_() {
  const folder = DriveApp.getFolderById(BIZZIP_SYNC.SOURCE_FOLDER_ID);
  const files = folder.getFiles();
  const map = {};
  while (files.hasNext()) {
    const file = files.next();
    const m = file.getName().match(/^(BIZZIP_\d{3})_/);
    if (m) map[m[1]] = file;
  }
  return map;
}

function docPrefixFromContentId_(contentId) {
  const m = String(contentId).match(/BZ-(\d+)/i);
  if (!m) return '';
  return 'BIZZIP_' + String(parseInt(m[1], 10)).padStart(3, '0');
}

function parseStandardManuscript_(documentId) {
  const doc = DocumentApp.openById(documentId);
  const body = doc.getBody();
  let title = '';
  let seenTitle = false;
  let current = null;
  const sections = [];
  const intro = { heading: '', paragraphs: [], bullets: [] };

  const ensureCurrent = () => {
    if (!current) {
      if (!sections.includes(intro)) sections.push(intro);
      current = intro;
    }
    return current;
  };

  for (let i = 0; i < body.getNumChildren(); i++) {
    const el = body.getChild(i);
    const type = el.getType();
    let txt = '';
    try { txt = el.getText().trim(); } catch (e) { continue; }
    if (!txt) continue;

    if (type === DocumentApp.ElementType.PARAGRAPH) {
      const p = el.asParagraph();
      const heading = p.getHeading();
      if (heading === DocumentApp.ParagraphHeading.HEADING1) {
        title = txt;
        seenTitle = true;
        current = null;
        continue;
      }
      if (!seenTitle) continue; // BIZZIP ID / 콘텐츠 유형 / 상태 메타정보는 제외
      if (heading === DocumentApp.ParagraphHeading.HEADING2) {
        current = { heading: txt, paragraphs: [], bullets: [] };
        sections.push(current);
        continue;
      }
      ensureCurrent().paragraphs.push(txt);
      continue;
    }

    if (type === DocumentApp.ElementType.LIST_ITEM && seenTitle) {
      ensureCurrent().bullets.push(txt);
    }
  }

  const cleaned = sections
    .map(s => ({
      heading: s.heading || '',
      paragraphs: (s.paragraphs || []).filter(Boolean),
      bullets: (s.bullets || []).filter(Boolean)
    }))
    .filter(s => s.heading || s.paragraphs.length || s.bullets.length);

  const firstParagraph = cleaned.flatMap(s => s.paragraphs || [])[0] || '';
  return { title, summary: firstSentence_(firstParagraph), sections: cleaned };
}

function firstSentence_(text) {
  const s = String(text || '').trim();
  if (!s) return '';
  const m = s.match(/^(.{1,220}?[.!?])(?:\s|$)/);
  if (m) return m[1];
  return s.length > 180 ? s.slice(0, 177) + '...' : s;
}

function normalizeDate_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value)) {
    return Utilities.formatDate(value, 'Asia/Seoul', 'yyyy-MM-dd');
  }
  const s = String(value).trim();
  const m = s.match(/(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  return m ? `${m[1]}-${String(m[2]).padStart(2,'0')}-${String(m[3]).padStart(2,'0')}` : '';
}

function githubGetFile_(path, token) {
  const url = `https://api.github.com/repos/${BIZZIP_SYNC.GITHUB_OWNER}/${BIZZIP_SYNC.GITHUB_REPO}/contents/${path}?ref=${BIZZIP_SYNC.GITHUB_BRANCH}`;
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, headers: githubHeaders_(token) });
  if (res.getResponseCode() >= 300) throw new Error(`GitHub 읽기 실패 ${res.getResponseCode()}: ${res.getContentText().slice(0,300)}`);
  return JSON.parse(res.getContentText());
}

function githubPutFile_(path, text, sha, token, message) {
  const url = `https://api.github.com/repos/${BIZZIP_SYNC.GITHUB_OWNER}/${BIZZIP_SYNC.GITHUB_REPO}/contents/${path}`;
  const bytes = Utilities.newBlob(text, 'application/json', 'posts.json').getBytes();
  const payload = {
    message: message,
    content: Utilities.base64Encode(bytes),
    sha: sha,
    branch: BIZZIP_SYNC.GITHUB_BRANCH
  };
  const res = UrlFetchApp.fetch(url, {
    method: 'put',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
    headers: githubHeaders_(token)
  });
  if (res.getResponseCode() >= 300) throw new Error(`GitHub 저장 실패 ${res.getResponseCode()}: ${res.getContentText().slice(0,300)}`);
  return JSON.parse(res.getContentText());
}

function githubHeaders_(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'BIZZIP-Drive-Sync'
  };
}

/** 최초 1회 실행: 매일 오전 9시(Asia/Seoul) 동기화 트리거 생성 */
function installDailyTrigger() {
  removeDailyTriggers();
  ScriptApp.newTrigger('syncPublishedBizzipContent')
    .timeBased()
    .everyDays(1)
    .atHour(BIZZIP_SYNC.DAILY_SYNC_HOUR)
    .create();
  console.log('BIZZIP 매일 동기화 트리거를 생성했습니다.');
}

function removeDailyTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'syncPublishedBizzipContent') ScriptApp.deleteTrigger(t);
  });
}
