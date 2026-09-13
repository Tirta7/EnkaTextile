/**
 * Menu kustom
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Alat EnkaTextile')
    .addItem('Cari & Pindah Roll', 'showDialog')
    .addItem('Cek Otomatis (Pembelian vs Barang)', 'autoCheckMutasi')
    .addToUi();
}

/**
 * Fungsi untuk mencocokkan rentangan roll di sheet Pembelian dengan sheet Barang
 * Jika cocok, berikan warna kuning pada roll di sheet Barang.
 */
function autoCheckMutasi() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetPembelian = ss.getSheetByName("Pembelian");
  var sheetBarang = ss.getSheetByName("Barang");
  
  if (!sheetPembelian || !sheetBarang) {
    SpreadsheetApp.getUi().alert("Sheet 'Pembelian' atau 'Barang' tidak ditemukan!");
    return;
  }
  
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert('Konfirmasi', 'Proses ini akan membaca semua baris di Pembelian dan mencari deret roll yang sama di Barang, lalu mewarnainya kuning. Lanjutkan?', ui.ButtonSet.YES_NO);
  if (response !== ui.Button.YES) return;
  
  var dataPembelian = sheetPembelian.getDataRange().getValues();
  var dataBarang = sheetBarang.getDataRange().getValues();
  
  // Ambil warna background saat ini agar tidak mengecek cell yang sudah dikuningkan sebelumnya
  var bgBarang = sheetBarang.getDataRange().getBackgrounds();
  
  var matchCount = 0;
  
  // Looping data Pembelian mulai baris 2 (indeks 1)
  for (var i = 1; i < dataPembelian.length; i++) {
    var pRow = dataPembelian[i];
    var pNama = String(pRow[5]).trim().toLowerCase(); // Kolom F (index 5)
    if (!pNama) continue;
    
    // Kumpulkan roll dari Pembelian (mulai dari kolom J / index 9)
    var pRolls = [];
    for (var j = 9; j < pRow.length; j++) {
      var cv = pRow[j];
      var nv = (typeof cv === 'string') ? parseFloat(cv.replace(',', '.')) : cv;
      if (cv !== "" && cv !== null && !isNaN(nv)) {
        pRolls.push(nv);
      }
    }
    
    if (pRolls.length === 0) continue; // Lewati jika tidak ada roll
    
    var foundMatchForThisPembelian = false;
    
    // Cari di data Barang
    for (var b = 1; b < dataBarang.length; b++) {
      if (foundMatchForThisPembelian) break;
      
      var bRow = dataBarang[b];
      var bNama = String(bRow[2]).trim().toLowerCase(); // Kolom C (index 2)
      
      if (bNama !== pNama) continue;
      
      // Kumpulkan roll dari Barang (mulai kolom J / index 9)
      var bNumericCols = [];
      for (var c = 9; c < bRow.length; c++) {
        var bcv = bRow[c];
        var bnv = (typeof bcv === 'string') ? parseFloat(bcv.replace(',', '.')) : bcv;
        if (bcv !== "" && bcv !== null && !isNaN(bnv)) {
          bNumericCols.push({ value: bnv, col: c });
        }
      }
      
      // Cari apakah pRolls ada di dalam bNumericCols (Sliding window)
      for (var s = 0; s <= bNumericCols.length - pRolls.length; s++) {
        var isMatch = true;
        var hasYellow = false;
        
        for (var k = 0; k < pRolls.length; k++) {
          var bColIndex = bNumericCols[s + k].col;
          // Cek nilai (toleransi 0.01)
          if (Math.abs(bNumericCols[s + k].value - pRolls[k]) > 0.01) {
            isMatch = false;
            break;
          }
          // Cek apakah cell ini sudah dikuningkan sebelumnya
          if (bgBarang[b][bColIndex] === "#ffff00") {
            hasYellow = true;
            isMatch = false;
            break;
          }
        }
        
        if (isMatch) {
          // Ketemu! Warnai kuning pada cell tersebut
          for (var k = 0; k < pRolls.length; k++) {
            var bColIndex = bNumericCols[s + k].col;
            sheetBarang.getRange(b + 1, bColIndex + 1).setBackground("#ffff00");
            bgBarang[b][bColIndex] = "#ffff00"; // Update state memory
          }
          matchCount++;
          foundMatchForThisPembelian = true;
          break; // Lanjut ke baris Pembelian berikutnya
        }
      }
    }
  }
  
  ui.alert("Selesai", "Berhasil menemukan dan menandai kuning " + matchCount + " deret roll di sheet Barang.", ui.ButtonSet.OK);
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
