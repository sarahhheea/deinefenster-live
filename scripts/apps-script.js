var SPREADSHEET_ID = '1fGbwql_wOCRznUAHQzWYcmCMD2ZhIEieuCWQoibPWJk';
var BILD_ORDNER_NAME = 'DeineFenster Produktbilder';

var PRODUKTE_HEADERS = ['id','titel','kategorie_key','zustand','system','breite_mm','hoehe_mm','preis_eur','sonderpreis_eur','groesse_klasse','export_modell','farbe','verglasung','u_wert','oeffnungsart','rc_klasse','eigenschaften','lagerbestand','standnummer','bilder','beschreibung','aktiv','created_at'];

var KATEGORIEN_DATEN = [
  {key:'fenster-1fluegel',label:'Einflügelig',icon:'window',reihenfolge:1},
  {key:'fenster-2fluegel',label:'Zweiflügelig',icon:'border_outer',reihenfolge:2},
  {key:'fenster-3fluegel',label:'Dreiflügelig',icon:'view_column',reihenfolge:3},
  {key:'fenster-4fluegel',label:'Vierflügelig',icon:'grid_view',reihenfolge:4},
  {key:'festelement',label:'Festverglasung',icon:'crop_free',reihenfolge:5},
  {key:'kellerfenster',label:'Kellerfenster',icon:'crop_landscape',reihenfolge:6},
  {key:'haustuer',label:'Haustür',icon:'door_front',reihenfolge:7},
  {key:'balkontuer-1fluegel',label:'Balkontür einflüglig',icon:'deck',reihenfolge:8},
  {key:'balkontuer-2fluegel',label:'Balkontür zweiflüglig',icon:'fence',reihenfolge:9},
  {key:'balkontuer-rollo',label:'Balkontür mit Rollo',icon:'roller_shades',reihenfolge:10},
  {key:'schiebetuer-psk',label:'Schiebetür PSK',icon:'meeting_room',reihenfolge:11},
  {key:'schiebetuer-hst',label:'Hebe-Schiebetür',icon:'door_sliding',reihenfolge:12},
  {key:'fenster-oberlicht',label:'Fenster mit Oberlicht',icon:'space_dashboard',reihenfolge:13},
  {key:'fenster-sprossen',label:'Fenster mit Sprossen',icon:'window_open',reihenfolge:14}
];

function doGet(e) {
  try {
    var action = (e.parameter && e.parameter.action) || 'produkte';
    if (action === 'produkte') return ok(getProdukte());
    if (action === 'produkt') return ok(getProduktById(e.parameter.id));
    if (action === 'health') return ok({ok:true});
    return ok({error:'Unbekannte Aktion'});
  } catch(err) {
    return ok({error:err.toString()});
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    if (action === 'login') return ok(handleLogin(body.password));
    if (!validateToken(body.token)) return ok({error:'Nicht autorisiert',code:401});
    if (action === 'insert') return ok(insertProdukt(body.data));
    if (action === 'update') return ok(updateProdukt(body.id, body.data));
    if (action === 'delete') return ok(deleteProdukt(body.id));
    if (action === 'archive') return ok(archiveProdukt(body.id));
    if (action === 'upload_image') return ok(uploadImage(body.imageBase64, body.mimeType, body.fileName));
    return ok({error:'Unbekannte Aktion'});
  } catch(err) {
    return ok({error:err.toString()});
  }
}

// Passwort direkt im Code — kein Property-Setup nötig
var SHOP_PASSWORD = 'Fenster2026';

function handleLogin(password) {
  if (password !== SHOP_PASSWORD) return {error:'Falsches Passwort',code:401};
  var token = Utilities.getUuid();
  var expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 Tage
  var sessions = JSON.parse(PropertiesService.getScriptProperties().getProperty('SESSIONS') || '{}');
  sessions[token] = expiry;
  Object.keys(sessions).forEach(function(t) { if (sessions[t] < Date.now()) delete sessions[t]; });
  PropertiesService.getScriptProperties().setProperty('SESSIONS', JSON.stringify(sessions));
  return {ok:true, token:token};
}

function validateToken(token) {
  if (!token) return false;
  try {
    var sessions = JSON.parse(PropertiesService.getScriptProperties().getProperty('SESSIONS') || '{}');
    return !!(sessions[token] && sessions[token] > Date.now());
  } catch(e) { return false; }
}

function getProdukte() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var kategorien = getKategorienMap(ss);
  var sheet = ss.getSheetByName('Produkte');
  if (!sheet) return {produkte:[], kategorien:kategorien};
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return {produkte:[], kategorien:kategorien};
  var headers = data[0];
  var aktiIdx = headers.indexOf('aktiv');
  var produkte = data.slice(1).filter(function(row) {
    if (!row[0]) return false;
    var v = row[aktiIdx];
    return v === true || v === 'TRUE' || v === 1 || v === '1';
  }).map(function(row) { return rowToObj(headers, row); });
  return {produkte:produkte, kategorien:kategorien};
}

function getProduktById(id) {
  if (!id) return {produkt:null};
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Produkte');
  if (!sheet) return {produkt:null};
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idCol = headers.indexOf('id');
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(id)) return {produkt:rowToObj(headers, data[i])};
  }
  return {produkt:null};
}

function rowToObj(headers, row) {
  var p = {};
  headers.forEach(function(h, i) {
    var v = row[i];
    if (h === 'eigenschaften' || h === 'bilder') {
      if (typeof v === 'string' && v) {
        try { v = JSON.parse(v); } catch(e) { v = []; }
      } else if (!Array.isArray(v)) { v = []; }
    } else if (h === 'export_modell' || h === 'aktiv') {
      v = (v === true || v === 'TRUE' || v === 1 || v === '1');
    } else if (h === 'breite_mm' || h === 'hoehe_mm' || h === 'preis_eur' || h === 'sonderpreis_eur' || h === 'lagerbestand') {
      v = (v === '' || v === null) ? null : Number(v);
    }
    p[h] = v;
  });
  return p;
}

function getKategorienMap(ss) {
  var sheet = ss.getSheetByName('Kategorien');
  if (!sheet) return {};
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return {};
  var headers = data[0];
  var map = {};
  data.slice(1).forEach(function(row) {
    if (!row[0]) return;
    var k = {};
    headers.forEach(function(h, i) { k[h] = row[i]; });
    if (k.aktiv !== false && k.aktiv !== 'FALSE' && k.aktiv !== 0) map[k.key] = k.label;
  });
  return map;
}

function insertProdukt(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Produkte');
  if (!sheet) {
    sheet = ss.insertSheet('Produkte');
    sheet.appendRow(PRODUKTE_HEADERS);
    sheet.setFrozenRows(1);
  }
  var id = Utilities.getUuid();
  var now = new Date().toISOString();
  var row = PRODUKTE_HEADERS.map(function(h) {
    if (h === 'id') return id;
    if (h === 'created_at') return now;
    if (h === 'aktiv') return true;
    var v = data[h];
    if (v === undefined || v === null) return '';
    if (Array.isArray(v)) return JSON.stringify(v);
    return v;
  });
  sheet.appendRow(row);
  return {ok:true, id:id};
}

function updateProdukt(id, data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Produkte');
  if (!sheet) return {error:'Sheet nicht gefunden'};
  var allData = sheet.getDataRange().getValues();
  var headers = allData[0];
  var idCol = headers.indexOf('id');
  for (var i = 1; i < allData.length; i++) {
    if (String(allData[i][idCol]) === String(id)) {
      headers.forEach(function(h, j) {
        if (h === 'id' || h === 'created_at' || data[h] === undefined) return;
        var v = data[h];
        if (Array.isArray(v)) v = JSON.stringify(v);
        if (v === null) v = '';
        sheet.getRange(i + 1, j + 1).setValue(v);
      });
      return {ok:true};
    }
  }
  return {error:'Produkt nicht gefunden'};
}

function deleteProdukt(id) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Produkte');
  if (!sheet) return {error:'Sheet nicht gefunden'};
  var allData = sheet.getDataRange().getValues();
  var headers = allData[0];
  var idCol = headers.indexOf('id');
  for (var i = 1; i < allData.length; i++) {
    if (String(allData[i][idCol]) === String(id)) {
      sheet.deleteRow(i + 1);
      return {ok:true};
    }
  }
  return {error:'Produkt nicht gefunden'};
}

function archiveProdukt(id) {
  return updateProdukt(id, {aktiv:false});
}

function uploadImage(imageBase64, mimeType, fileName) {
  try {
    var folder = getBildOrdner();
    var bytes = Utilities.base64Decode(imageBase64);
    var blob = Utilities.newBlob(bytes, mimeType || 'image/jpeg', fileName || 'bild.jpg');
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var fileId = file.getId();
    return {ok:true, url:'https://lh3.googleusercontent.com/d/' + fileId, fileId:fileId};
  } catch(e) {
    return {error:e.toString()};
  }
}

function getBildOrdner() {
  var iter = DriveApp.getFoldersByName(BILD_ORDNER_NAME);
  if (iter.hasNext()) return iter.next();
  return DriveApp.createFolder(BILD_ORDNER_NAME);
}

function setup() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  var pSheet = ss.getSheetByName('Produkte');
  if (!pSheet) pSheet = ss.insertSheet('Produkte');
  if (pSheet.getLastRow() === 0) {
    pSheet.appendRow(PRODUKTE_HEADERS);
    pSheet.getRange(1,1,1,PRODUKTE_HEADERS.length).setFontWeight('bold').setBackground('#e8f0fe');
    pSheet.setFrozenRows(1);
    Logger.log('Produkte-Sheet erstellt');
  }

  var kSheet = ss.getSheetByName('Kategorien');
  if (!kSheet) kSheet = ss.insertSheet('Kategorien');
  if (kSheet.getLastRow() === 0) {
    var kH = ['id','key','label','icon','aktiv','reihenfolge'];
    kSheet.appendRow(kH);
    kSheet.getRange(1,1,1,kH.length).setFontWeight('bold').setBackground('#e8f0fe');
    KATEGORIEN_DATEN.forEach(function(k,i) {
      kSheet.appendRow([i+1, k.key, k.label, k.icon, true, k.reihenfolge]);
    });
    kSheet.setFrozenRows(1);
    Logger.log('Kategorien-Sheet erstellt');
  }

  Logger.log('Setup fertig!');
}

function ok(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
