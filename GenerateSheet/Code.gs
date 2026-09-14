/**
 * Menu kustom
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Alat EnkaTextile')
    .addItem('Cari & Pindah Roll', 'showDialog')
    .addItem('Cek Otomatis (Pembelian vs Barang)', 'autoCheckMutasi')
    .addItem('[DEBUG] Cek Struktur Kolom', 'debugStrukturKolom')
    .addItem('[DEBUG] Cek Barcode Match', 'debugBarcodeMatch')
    .addToUi();
}

/**
 * DEBUG: Tampilkan struktur kolom sheet Pembelian dan Barang
 * Jalankan ini untuk memastikan index kolom sudah benar sebelum menjalankan Cek Otomatis
 */
function debugStrukturKolom() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetPembelian = ss.getSheetByName("Pembelian");
  var sheetBarang    = ss.getSheetByName("Barang");
  
  var msg = "=== SHEET PEMBELIAN (Baris 1 = Header) ===\n";
  if (sheetPembelian) {
    var hP = sheetPembelian.getRange(1, 1, 1, Math.min(15, sheetPembelian.getLastColumn())).getValues()[0];
    for (var i = 0; i < hP.length; i++) {
      msg += "Kolom " + (i) + " (Kol " + String.fromCharCode(65+i) + "): [" + hP[i] + "]\n";
    }
    // Sampel baris data ke-2
    var r2P = sheetPembelian.getRange(2, 1, 1, Math.min(15, sheetPembelian.getLastColumn())).getValues()[0];
    msg += "\nBaris 2 (data):\n";
    for (var i = 0; i < r2P.length; i++) {
      msg += "  idx " + i + ": [" + r2P[i] + "]\n";
    }
  } else {
    msg += "Sheet Pembelian TIDAK DITEMUKAN!\n";
  }
  
  msg += "\n=== SHEET BARANG (Baris 1 = Header) ===\n";
  if (sheetBarang) {
    var hB = sheetBarang.getRange(1, 1, 1, Math.min(15, sheetBarang.getLastColumn())).getValues()[0];
    for (var i = 0; i < hB.length; i++) {
      msg += "Kolom " + (i) + " (Kol " + String.fromCharCode(65+i) + "): [" + hB[i] + "]\n";
    }
    // Sampel baris data ke-2
    var r2B = sheetBarang.getRange(2, 1, 1, Math.min(15, sheetBarang.getLastColumn())).getValues()[0];
    msg += "\nBaris 2 (data):\n";
    for (var i = 0; i < r2B.length; i++) {
      msg += "  idx " + i + ": [" + r2B[i] + "]\n";
    }
  } else {
    msg += "Sheet Barang TIDAK DITEMUKAN!\n";
  }
  
  SpreadsheetApp.getUi().alert("DEBUG Struktur Kolom", msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * DEBUG LANJUT: Cek apakah barcode di Pembelian ada di Barang dan cocokkan roll-nya
 */
function debugBarcodeMatch() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetPembelian = ss.getSheetByName("Pembelian");
  var sheetBarang    = ss.getSheetByName("Barang");
  
  if (!sheetPembelian || !sheetBarang) {
    SpreadsheetApp.getUi().alert("Sheet tidak ditemukan!"); return;
  }
  
  var dataPembelian = sheetPembelian.getDataRange().getValues();
  var dataBarang    = sheetBarang.getDataRange().getValues();
  
  // Deteksi kolom "Roll N" berdasarkan header
  var headerP = dataPembelian[0];
  var pRollCols = [];
  for (var h = 0; h < headerP.length; h++) {
    if (/^Roll \d+$/.test(String(headerP[h]).trim())) pRollCols.push(h);
  }
  
  var headerB = dataBarang[0];
  var bRollCols = [];
  for (var h = 0; h < headerB.length; h++) {
    if (/^Roll \d+$/.test(String(headerB[h]).trim())) bRollCols.push(h);
  }
  
  // Buat index barcode Barang
  var barangBarcodes = {};
  for (var b = 1; b < dataBarang.length; b++) {
    var bc = String(dataBarang[b][1]).trim();
    if (bc) barangBarcodes[bc] = b;
  }
  
  var msg = "Kolom Roll di Pembelian: " + pRollCols.length + " (idx: " + pRollCols.slice(0,3).join(",") + "...)\n";
  msg += "Kolom Roll di Barang: " + bRollCols.length + " (idx: " + bRollCols.slice(0,3).join(",") + "...)\n\n";
  var checked = 0;
  
  for (var i = 1; i < dataPembelian.length && checked < 5; i++) {
    var pBarcode = String(dataPembelian[i][4]).trim();
    if (!pBarcode) continue;
    
    // Kumpulkan roll Pembelian hanya dari kolom "Roll N"
    var pRolls = [];
    for (var ri = 0; ri < pRollCols.length; ri++) {
      var v = dataPembelian[i][pRollCols[ri]];
      var n = (typeof v === 'string') ? parseFloat(v.replace(',','.')) : Number(v);
      if (v !== "" && !isNaN(n) && n > 0) pRolls.push(n);
    }
    
    var bIdx = barangBarcodes[pBarcode];
    msg += "Pembelian baris " + (i+1) + ":\n";
    msg += "  Barcode: " + pBarcode + "\n";
    msg += "  Roll Pembelian (" + pRolls.length + "): " + pRolls.slice(0,5).join(", ") + (pRolls.length > 5 ? "..." : "") + "\n";
    
    if (bIdx !== undefined) {
      // Kumpulkan roll Barang hanya dari kolom "Roll N"
      var bRolls = [];
      for (var ri = 0; ri < bRollCols.length; ri++) {
        var bv = dataBarang[bIdx][bRollCols[ri]];
        var bn = (typeof bv === 'string') ? parseFloat(bv.replace(',','.')) : Number(bv);
        if (bv !== "" && !isNaN(bn) && bn > 0) bRolls.push(bn);
      }
      msg += "  \u2705 Barcode DITEMUKAN di Barang baris " + (bIdx+1) + "\n";
      msg += "  Roll Barang (" + bRolls.length + "): " + bRolls.slice(0,5).join(", ") + (bRolls.length > 5 ? "..." : "") + "\n";
      
      // Cek sliding window manual — cari posisi yang cocok
      var found = false;
      var matchPos = -1;
      if (pRolls.length > 0 && bRolls.length >= pRolls.length) {
        for (var s = 0; s <= bRolls.length - pRolls.length; s++) {
          var ok = true;
          for (var k = 0; k < pRolls.length; k++) {
            if (Math.abs(bRolls[s+k] - pRolls[k]) > 0.11) { ok = false; break; }
          }
          if (ok) { found = true; matchPos = s; break; }
        }
      }
      if (found) {
        var matchedVals = bRolls.slice(matchPos, matchPos + Math.min(pRolls.length, 5));
        msg += "  \u2705 COCOK! Posisi di Barang: Roll ke-" + (matchPos+1) + " s/d Roll ke-" + (matchPos+pRolls.length) + "\n";
        msg += "  Nilai yang cocok: " + matchedVals.join(", ") + (pRolls.length > 5 ? "..." : "") + "\n";
      } else {
        msg += "  \u274c Tidak cocok\n";
      }
    } else {
      msg += "  \u274c Barcode TIDAK ADA di sheet Barang\n";
    }
    msg += "\n";
    checked++;
  }
  
  SpreadsheetApp.getUi().alert("DEBUG Barcode Match (5 baris pertama)", msg, SpreadsheetApp.getUi().ButtonSet.OK);

}

/**
 * Cek Otomatis: Cocokkan roll di Sheet Pembelian dengan Sheet Barang berdasarkan BARCODE.
 * Logika:
 *   1. Baca setiap baris di Sheet Pembelian (mulai baris 2).
 *   2. Ambil Barcode dari kolom B dan nilai roll dari kolom J ke kanan.
 *   3. Cari baris di Sheet Barang yang memiliki Barcode yang sama (kolom B).
 *   4. Gunakan sliding-window untuk menemukan urutan roll yang cocok di Barang.
 *   5. Jika urutan cocok dan belum pernah dikuningkan → warnai kuning.
 */
function autoCheckMutasi() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetPembelian = ss.getSheetByName("Pembelian");
  var sheetBarang    = ss.getSheetByName("Barang");
  
  if (!sheetPembelian || !sheetBarang) {
    SpreadsheetApp.getUi().alert("Sheet 'Pembelian' atau 'Barang' tidak ditemukan!");
    return;
  }
  
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    'Konfirmasi',
    'Proses ini akan mencocokkan roll di Pembelian dengan Barang berdasarkan Barcode, lalu mewarnai kuning posisi roll yang ditemukan. Lanjutkan?',
    ui.ButtonSet.YES_NO
  );
  if (response !== ui.Button.YES) return;
  
  // ── Baca semua data sekaligus (efisien) ──
  var dataPembelian = sheetPembelian.getDataRange().getValues();
  var dataBarang    = sheetBarang.getDataRange().getValues();
  var bgBarang      = sheetBarang.getDataRange().getBackgrounds();
  
  // ── Cari kolom "Roll N" di header Pembelian (baris 1) ──
  // Hanya kolom dengan header "Roll 1", "Roll 2", dst yang dianggap sebagai roll
  var headerP = dataPembelian[0];
  var pRollCols = []; // index kolom di Pembelian yang merupakan "Roll N"
  for (var h = 0; h < headerP.length; h++) {
    var hname = String(headerP[h]).trim();
    if (/^Roll \d+$/.test(hname)) pRollCols.push(h);
  }
  
  // ── Cari kolom "Roll N" di header Barang (baris 1) ──
  var headerB = dataBarang[0];
  var bRollCols = []; // index kolom di Barang yang merupakan "Roll N"
  for (var h = 0; h < headerB.length; h++) {
    var hname = String(headerB[h]).trim();
    if (/^Roll \d+$/.test(hname)) bRollCols.push(h);
  }
  
  // ── Buat index Barang: barcode → [{rowIdx, rolls:[{value,col}]}] ──
  // Hanya ambil nilai dari kolom Roll N yang sudah teridentifikasi
  var barangIndex = {};
  for (var b = 1; b < dataBarang.length; b++) {
    var bcode = String(dataBarang[b][1]).trim();
    if (!bcode || bcode === "" || bcode.toLowerCase() === "barcode") continue;
    
    var bRolls = [];
    for (var ri = 0; ri < bRollCols.length; ri++) {
      var c   = bRollCols[ri];
      var cv  = dataBarang[b][c];
      var nv  = (typeof cv === 'string') ? parseFloat(cv.replace(',', '.')) : Number(cv);
      if (cv !== "" && cv !== null && !isNaN(nv) && nv > 0) {
        bRolls.push({ value: nv, col: c }); // col = 0-based index
      }
    }
    
    if (!barangIndex[bcode]) barangIndex[bcode] = [];
    barangIndex[bcode].push({ rowIdx: b, rolls: bRolls });
  }
  
  // ── Loop setiap baris Pembelian ──
  var matchCount = 0;
  var batchUpdates = []; // kumpulkan dulu, baru tulis sekaligus
  
  for (var i = 1; i < dataPembelian.length; i++) {
    var pRow    = dataPembelian[i];
    var pBarcode = String(pRow[4]).trim(); // Kolom E (index 4) = Barcode di sheet Pembelian
    if (!pBarcode || pBarcode === "") continue;
    
    // Ambil nilai roll HANYA dari kolom "Roll N" yang sudah teridentifikasi di header
    var pRolls = [];
    for (var ri = 0; ri < pRollCols.length; ri++) {
      var pv = pRow[pRollCols[ri]];
      var pn = (typeof pv === 'string') ? parseFloat(pv.replace(',', '.')) : Number(pv);
      if (pv !== "" && pv !== null && !isNaN(pn) && pn > 0) {
        pRolls.push(pn);
      }
    }
    if (pRolls.length === 0) continue;

    
    // Cari baris Barang dengan Barcode yang sama
    var barangRows = barangIndex[pBarcode];
    if (!barangRows || barangRows.length === 0) continue;
    
    for (var bi = 0; bi < barangRows.length; bi++) {
      var entry  = barangRows[bi];
      var bRollArr = entry.rolls;
      var bRowIdx  = entry.rowIdx; // 0-based row index di dataBarang
      
      if (bRollArr.length < pRolls.length) continue;
      
      // ── Sliding window: cari urutan pRolls di dalam bRollArr ──
      for (var s = 0; s <= bRollArr.length - pRolls.length; s++) {
        var isMatch  = true;
        var hasYellow = false;
        
        for (var k = 0; k < pRolls.length; k++) {
          var bColIdx = bRollArr[s + k].col; // 0-based
          
          // Sudah dikuningkan sebelumnya? Anggap bukan kandidat
          if (bgBarang[bRowIdx] && bgBarang[bRowIdx][bColIdx] === "#ffff00") {
            hasYellow = true;
            isMatch   = false;
            break;
          }
          // Toleransi 0.11 yard
          if (Math.abs(bRollArr[s + k].value - pRolls[k]) > 0.11) {
            isMatch = false;
            break;
          }
        }
        
        if (isMatch) {
          // Tandai juga di memori bgBarang agar baris Pembelian berikutnya tidak mengklaim lagi
          for (var k = 0; k < pRolls.length; k++) {
            var bColIdx = bRollArr[s + k].col;
            bgBarang[bRowIdx][bColIdx] = "#ffff00";
            batchUpdates.push({ row: bRowIdx + 1, col: bColIdx + 1 }); // 1-based
          }
          matchCount++;
          break; // Window ditemukan, tidak perlu scan lagi untuk baris Pembelian ini
        }
      }
    }
  }
  
  // ── Tulis warna kuning sekaligus (batch) ── 
  for (var u = 0; u < batchUpdates.length; u++) {
    sheetBarang.getRange(batchUpdates[u].row, batchUpdates[u].col).setBackground("#ffff00");
  }
  
  ui.alert(
    "Selesai",
    "Berhasil mencocokkan dan menandai kuning " + matchCount + " deret roll di sheet Barang (berdasarkan Barcode).",
    ui.ButtonSet.OK
  );
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
