/**
 * Menu kustom
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Alat EnkaTextile')
    .addItem('Cari & Pindah Roll', 'showDialog')
    .addToUi();
}

function showDialog() {
  var html = HtmlService.createHtmlOutputFromFile('Index')
    .setWidth(900)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Cari & Pindah Roll (Batch)');
}

/**
 * Load semua pasangan Kategori + Nama Barang sekaligus (untuk batch mode)
 */
function getAllBarangPairs() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetBarang = ss.getSheetByName("Barang");
  if (!sheetBarang) throw new Error("Sheet 'Barang' tidak ditemukan.");
  
  var data = sheetBarang.getDataRange().getValues();
  var katSet = {};
  var pairs = {}; // {kategori: [namaBarang, ...]}
  
  for (var i = 1; i < data.length; i++) {
    var nama = String(data[i][2]).trim();
    var kat = String(data[i][3]).trim();
    if (!kat || kat.toLowerCase() === "kategori") continue;
    if (!nama || nama === "") continue;
    
    katSet[kat] = true;
    if (!pairs[kat]) pairs[kat] = {};
    pairs[kat][nama] = true;
  }
  
  var result = {};
  Object.keys(pairs).sort().forEach(function(k) {
    result[k] = Object.keys(pairs[k]).sort();
  });
  return result;
}

/**
 * Proses satu pencarian roll
 */
function searchRolls(kategori, namaBarang, startVal, endVal, expectedCount, expectedTotal) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetBarang = ss.getSheetByName("Barang");
  if (!sheetBarang) throw new Error("Sheet 'Barang' tidak ditemukan.");
  
  var dataBarang = sheetBarang.getDataRange().getValues();
  var matches = [];
  
  for (var i = 1; i < dataBarang.length; i++) {
    var row = dataBarang[i];
    var rowNama = String(row[2]).trim().toLowerCase();
    var rowKat  = String(row[3]).trim().toLowerCase();
    if (rowNama !== String(namaBarang).trim().toLowerCase()) continue;
    if (rowKat  !== String(kategori).trim().toLowerCase()) continue;
    
    // Kumpulkan kolom numerik
    var numericCols = [];
    for (var j = 9; j < row.length; j++) {
      var cv = row[j];
      var nv = (typeof cv === 'string') ? parseFloat(cv.replace(',', '.')) : cv;
      if (cv !== "" && cv !== null && !isNaN(nv)) {
        numericCols.push({ value: nv, raw: cv, col: j + 1 });
      }
    }
    
    // Sliding fixed-window scan
    for (var s = 0; s < numericCols.length; s++) {
      if (numericCols[s].value !== startVal) continue;
      
      if (expectedCount) {
        if (s + expectedCount > numericCols.length) continue;
        var win = numericCols.slice(s, s + expectedCount);
        if (win[win.length - 1].value !== endVal) continue;
        
        var total = 0;
        win.forEach(function(x) { total += x.value; });
        total = Math.round(total * 1000) / 1000;
        
        if (expectedTotal !== null && expectedTotal !== "" && Math.abs(total - expectedTotal) > 2) continue;
        
        matches.push({
          id: "match_" + matches.length,
          rowIndex: i + 1,
          sequence: win.map(function(x){ return x.raw; }),
          cells: win.map(function(x){ return {row: i+1, col: x.col}; }),
          total: total,
          count: win.length
        });
      } else {
        var seq = [], cells = [];
        for (var k = s; k < numericCols.length; k++) {
          seq.push(numericCols[k].raw);
          cells.push({row: i+1, col: numericCols[k].col});
          if (numericCols[k].value === endVal && seq.length > 1) {
            var total2 = 0;
            seq.forEach(function(v){ total2 += (typeof v === 'string' ? parseFloat(v.replace(',','.')) : v); });
            total2 = Math.round(total2 * 1000) / 1000;
            if (expectedTotal !== null && expectedTotal !== "" && Math.abs(total2 - expectedTotal) > 2) break;
            matches.push({
              id: "match_" + matches.length, rowIndex: i+1,
              sequence: seq.slice(), cells: cells.slice(), total: total2, count: seq.length
            });
            break;
          }
        }
      }
    }
  }
  return matches;
}

/**
 * Proses batch: terima array jobs, return hasil masing-masing
 * Jika 1 match → langsung copy ke targetCell & warnai hijau
 * Jika 0 atau >1 match → kembalikan ke client untuk review
 */
function processBatch(jobs) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetBarang = ss.getSheetByName("Barang");
  var sheetPembelian = ss.getSheetByName("Pembelian");
  if (!sheetPembelian) throw new Error("Sheet 'Pembelian' tidak ditemukan.");
  
  var results = [];
  
  for (var ji = 0; ji < jobs.length; ji++) {
    var job = jobs[ji];
    var startVal = parseFloat(String(job.startVal).replace(',', '.'));
    var endVal   = parseFloat(String(job.endVal).replace(',', '.'));
    var expectedCount = job.expectedCount ? parseInt(job.expectedCount) : null;
    var expectedTotal = job.expectedTotal ? parseFloat(String(job.expectedTotal).replace(',', '.')) : null;
    
    var matches = searchRolls(job.kategori, job.namaBarang, startVal, endVal, expectedCount, expectedTotal);
    
    if (matches.length === 1) {
      // Auto copy
      var match = matches[0];
      var targetRange = sheetPembelian.getRange(job.targetCell);
      var targetRow = targetRange.getRow();
      var targetCol = targetRange.getColumn();
      
      for (var r = 0; r < match.sequence.length; r++) {
        sheetPembelian.getRange(targetRow, targetCol + r).setValue(match.sequence[r]);
      }
      if (sheetBarang) {
        match.cells.forEach(function(c) {
          sheetBarang.getRange(c.row, c.col).setBackground("#34a853");
        });
      }
      results.push({ jobIndex: ji, status: "done", total: match.total, count: match.count, targetCell: job.targetCell });
      
    } else if (matches.length === 0) {
      results.push({ jobIndex: ji, status: "notfound" });
    } else {
      results.push({ jobIndex: ji, status: "multiple", matches: matches });
    }
  }
  return results;
}

/**
 * Copy satu match yang dipilih user (dari conflict resolution)
 */
function moveSelectedRoll(matchData, targetCell) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetBarang   = ss.getSheetByName("Barang");
  var sheetPembelian = ss.getSheetByName("Pembelian");
  if (!sheetPembelian) throw new Error("Sheet 'Pembelian' tidak ditemukan.");
  
  var targetRange = sheetPembelian.getRange(targetCell);
  var targetRow = targetRange.getRow();
  var targetCol = targetRange.getColumn();
  
  for (var r = 0; r < matchData.sequence.length; r++) {
    sheetPembelian.getRange(targetRow, targetCol + r).setValue(matchData.sequence[r]);
  }
  if (sheetBarang) {
    matchData.cells.forEach(function(c) {
      sheetBarang.getRange(c.row, c.col).setBackground("#34a853");
    });
  }
  sheetPembelian.activate();
  sheetPembelian.getRange(targetRow, targetCol, 1, matchData.sequence.length).activate();
  
  return matchData.count + " roll (Total " + String(matchData.total).replace('.', ',') + " yds) berhasil disalin ke " + targetCell + ".";
}
