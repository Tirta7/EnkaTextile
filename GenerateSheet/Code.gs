/**
 * Menu kustom
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Alat EnkaTextile')
    .addItem('Cari & Pindah Roll', 'showDialog')
    .addItem('Cek Otomatis (Tandai Kuning)', 'autoCheckMutasi')
    .addItem('Tampilkan Detail Tidak Cocok', 'tampilkanDetailTidakCocok')
    .addItem('Hapus Roll Terpasang (Geser Kiri)', 'hapusRollTerpasang')
    .addSeparator()
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
 * Hapus Roll Terpasang: Cocokkan roll Pembelian dengan Barang berdasarkan Barcode,
 * lalu HAPUS nilai roll yang cocok dan GESER sisanya ke kiri tanpa ada sel kosong.
 * Gunakan fungsi ini SETELAH menjalankan "Cek Otomatis" untuk konfirmasi match.
 */
function hapusRollTerpasang() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetPembelian = ss.getSheetByName("Pembelian");
  var sheetBarang    = ss.getSheetByName("Barang");
  
  if (!sheetPembelian || !sheetBarang) {
    SpreadsheetApp.getUi().alert("Sheet 'Pembelian' atau 'Barang' tidak ditemukan!");
    return;
  }
  
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    '⚠️ Konfirmasi HAPUS',
    'Proses ini akan MENGHAPUS nilai roll yang cocok di sheet Barang dan menggeser sisa roll ke kiri.\n\nAksi ini TIDAK BISA DIBATALKAN!\n\nLanjutkan?',
    ui.ButtonSet.YES_NO
  );
  if (response !== ui.Button.YES) return;
  
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
  
  if (bRollCols.length === 0) {
    ui.alert("Tidak ditemukan kolom Roll di sheet Barang!"); return;
  }
  
  // Buat index Barang: barcode → [{rowIdx, rolls:[{value,col}]}]
  var barangIndex = {};
  for (var b = 1; b < dataBarang.length; b++) {
    var bcode = String(dataBarang[b][1]).trim();
    if (!bcode || bcode.toLowerCase() === "barcode") continue;
    
    var bRolls = [];
    for (var ri = 0; ri < bRollCols.length; ri++) {
      var c  = bRollCols[ri];
      var cv = dataBarang[b][c];
      var nv = (typeof cv === 'string') ? parseFloat(cv.replace(',', '.')) : Number(cv);
      if (cv !== "" && !isNaN(nv) && nv > 0) bRolls.push({ value: nv, col: c });
    }
    
    if (!barangIndex[bcode]) barangIndex[bcode] = [];
    barangIndex[bcode].push({ rowIdx: b, rolls: bRolls });
  }
  
  // Track kolom mana saja yang akan dihapus per baris Barang
  var toDelete = {};     // { "rowIdx": { col: true } }
  var deletedKeys = {};  // "rowIdx_col" → true (untuk cegah reuse)
  var matchCount = 0;
  
  for (var i = 1; i < dataPembelian.length; i++) {
    var pRow     = dataPembelian[i];
    var pBarcode = String(pRow[4]).trim();
    if (!pBarcode) continue;
    
    var pRolls = [];
    for (var ri = 0; ri < pRollCols.length; ri++) {
      var pv = pRow[pRollCols[ri]];
      var pn = (typeof pv === 'string') ? parseFloat(pv.replace(',', '.')) : Number(pv);
      if (pv !== "" && !isNaN(pn) && pn > 0) pRolls.push(pn);
    }
    if (pRolls.length === 0) continue;
    
    var barangRows = barangIndex[pBarcode];
    if (!barangRows) continue;
    
    for (var bi = 0; bi < barangRows.length; bi++) {
      var entry    = barangRows[bi];
      var bRollArr = entry.rolls;
      var bRowIdx  = entry.rowIdx;
      
      if (bRollArr.length < pRolls.length) continue;
      
      // Sliding window
      for (var s = 0; s <= bRollArr.length - pRolls.length; s++) {
        var isMatch = true;
        for (var k = 0; k < pRolls.length; k++) {
          var cellKey = bRowIdx + "_" + bRollArr[s+k].col;
          if (deletedKeys[cellKey]) { isMatch = false; break; }
          if (Math.abs(bRollArr[s+k].value - pRolls[k]) > 0.11) { isMatch = false; break; }
        }
        
        if (isMatch) {
          if (!toDelete[bRowIdx]) toDelete[bRowIdx] = {};
          for (var k = 0; k < pRolls.length; k++) {
            var colIdx = bRollArr[s+k].col;
            toDelete[bRowIdx][colIdx] = true;
            deletedKeys[bRowIdx + "_" + colIdx] = true;
          }
          matchCount++;
          break; // lanjut ke Pembelian berikutnya
        }
      }
    }
  }
  
  // Terapkan penghapusan: kumpulkan sisa roll, tulis ulang dari kiri
  var rowsAffected = 0;
  for (var rowIdxStr in toDelete) {
    var rowIdx = parseInt(rowIdxStr);
    var deletedColSet = toDelete[rowIdxStr];
    
    // Kumpulkan nilai roll yang TIDAK dihapus
    var remaining = [];
    for (var ri = 0; ri < bRollCols.length; ri++) {
      var c = bRollCols[ri];
      if (!deletedColSet[c]) {
        var cv = dataBarang[rowIdx][c];
        var nv = (typeof cv === 'string') ? parseFloat(cv.replace(',', '.')) : Number(cv);
        if (cv !== "" && !isNaN(nv) && nv > 0) remaining.push(nv);
      }
    }
    
    // Tulis ulang seluruh kolom Roll: sisa dari kiri, lalu kosongkan yang sudah tidak ada
    var firstRollCol = bRollCols[0] + 1; // 1-based untuk getRange
    var numRollCols  = bRollCols.length;
    var newRow = [];
    for (var ri = 0; ri < numRollCols; ri++) {
      newRow.push(ri < remaining.length ? remaining[ri] : "");
    }
    sheetBarang.getRange(rowIdx + 1, firstRollCol, 1, numRollCols).setValues([newRow]);
    rowsAffected++;
  }
  
  ui.alert(
    "Selesai",
    "Berhasil mencocokkan " + matchCount + " deret roll.\n" +
    rowsAffected + " baris Barang telah diperbarui:\n" +
    "• Roll yang terpasang di Pembelian → DIHAPUS\n" +
    "• Sisa roll → DIGESER ke kiri (tanpa sel kosong)",
    ui.ButtonSet.OK
  );
}

/**
 * Cek Otomatis: Cocokkan roll di Sheet Pembelian dengan Sheet Barang berdasarkan BARCODE.
 * Logika:
 *   1. Baca setiap baris di Sheet Pembelian (mulai baris 2).
 *   2. Ambil Barcode dari kolom E (atau kolom header "Barcode") dan nilai roll dari kolom "Roll N".
 *   3. Cari baris di Sheet Barang yang memiliki Barcode yang sama (kolom B).
 *   4. Gunakan sliding-window untuk menemukan urutan roll yang cocok di Barang.
 *   5. Jika cocok → warnai kuning di Barang, hapus keterangan di Pembelian.
 *   6. Jika tidak cocok → beri warna + catatan di sel Barcode sheet Pembelian:
 *      🔴 Merah muda  = Barcode tidak ada di sheet Barang sama sekali
 *      🟠 Oranye muda = Barcode ada di Barang tapi urutan roll tidak cocok
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
    'Proses ini akan mencocokkan roll di Pembelian dengan Barang berdasarkan Barcode, lalu mewarnai kuning posisi roll yang ditemukan.\n\nBaris yang TIDAK cocok akan diberi keterangan warna:\n🔴 Merah = Barcode tidak ada di Barang\n🟠 Oranye = Barcode ada tapi roll tidak cocok\n\nLanjutkan?',
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

  // ── Cari index kolom Barcode di Pembelian (header "Barcode" atau fallback index 4) ──
  var pBarcodeCol = 4; // default kolom E
  for (var h = 0; h < headerP.length; h++) {
    if (String(headerP[h]).trim().toLowerCase() === "barcode") {
      pBarcodeCol = h; break;
    }
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
  var matchCount      = 0;
  var noBarangCount   = 0;  // barcode tidak ada di Barang
  var noRollCount     = 0;  // barcode ada tapi roll tidak cocok
  var batchUpdates    = []; // warna kuning di Barang
  
  // Kumpulkan update warna di Pembelian (batch)
  // { row(1-based), col(1-based), color, note }
  var pembelianUpdates = [];

  for (var i = 1; i < dataPembelian.length; i++) {
    var pRow     = dataPembelian[i];
    var pBarcode = String(pRow[pBarcodeCol]).trim();
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

    var barcodeCol1Based = pBarcodeCol + 1; // kolom barcode 1-based untuk highlight
    
    // Cari baris Barang dengan Barcode yang sama
    var barangRows = barangIndex[pBarcode];
    if (!barangRows || barangRows.length === 0) {
      // ── KASUS 1: Barcode tidak ada di sheet Barang ──
      noBarangCount++;
      pembelianUpdates.push({
        row:   i + 1,
        col:   barcodeCol1Based,
        color: "#f4cccc", // merah muda
        note:  "❌ Barcode tidak ditemukan di sheet Barang"
      });
      continue;
    }
    
    // Barcode ditemukan — coba cocokkan roll
    var foundMatch = false;
    
    for (var bi = 0; bi < barangRows.length; bi++) {
      var entry    = barangRows[bi];
      var bRollArr = entry.rolls;
      var bRowIdx  = entry.rowIdx; // 0-based row index di dataBarang
      
      if (bRollArr.length < pRolls.length) continue;
      
      // ── Sliding window: cari urutan pRolls di dalam bRollArr ──
      for (var s = 0; s <= bRollArr.length - pRolls.length; s++) {
        var isMatch  = true;
        
        for (var k = 0; k < pRolls.length; k++) {
          var bColIdx = bRollArr[s + k].col; // 0-based
          
          // Sudah dikuningkan sebelumnya? Anggap bukan kandidat
          if (bgBarang[bRowIdx] && bgBarang[bRowIdx][bColIdx] === "#ffff00") {
            isMatch = false;
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
          foundMatch = true;

          // ── Hapus keterangan lama di Pembelian jika sebelumnya ditandai tidak cocok ──
          pembelianUpdates.push({
            row:   i + 1,
            col:   barcodeCol1Based,
            color: null, // reset warna
            note:  null  // hapus catatan
          });

          break; // Window ditemukan, tidak perlu scan lagi untuk baris Pembelian ini
        }
      }
      if (foundMatch) break;
    }
    
    if (!foundMatch) {
      // ── KASUS 2: Barcode ada di Barang, tapi nilai roll tidak cocok ──
      noRollCount++;
      var barangNama = String(dataBarang[barangRows[0].rowIdx][2]).trim();
      var rollBarang = barangRows[0].rolls.length;
      pembelianUpdates.push({
        row:   i + 1,
        col:   barcodeCol1Based,
        color: "#fce5cd", // oranye muda
        note:  "⚠️ Barcode ada di Barang (\"" + barangNama + "\") tapi urutan " + pRolls.length +
               " roll tidak cocok. Roll tersedia di Barang: " + rollBarang + " roll."
      });
    }
  }
  
  // ── Tulis warna kuning di Barang (batch) ── 
  for (var u = 0; u < batchUpdates.length; u++) {
    sheetBarang.getRange(batchUpdates[u].row, batchUpdates[u].col).setBackground("#ffff00");
  }

  // ── Tulis warna + catatan di Pembelian (batch) ──
  for (var u = 0; u < pembelianUpdates.length; u++) {
    var upd  = pembelianUpdates[u];
    var cell = sheetPembelian.getRange(upd.row, upd.col);

    if (upd.color === null) {
      // Reset: hapus warna dan catatan (sudah cocok)
      cell.setBackground(null);
      cell.clearNote();
    } else {
      cell.setBackground(upd.color);
      cell.setNote(upd.note);
    }
  }
  
  ui.alert(
    "Selesai",
    "✅ Cocok & ditandai kuning: " + matchCount + " deret roll\n" +
    "🔴 Barcode tidak ada di Barang: " + noBarangCount + " baris\n" +
    "🟠 Roll tidak cocok (barcode ada): " + noRollCount + " baris\n\n" +
    "Lihat catatan (hover) pada sel Barcode di sheet Pembelian untuk detail.",
    ui.ButtonSet.OK
  );
}


/**
 * Tampilkan detail baris Pembelian yang tidak cocok:
 *   🔴 Merah muda  (#f4cccc) = Barcode tidak ada di sheet Barang
 *   🟠 Oranye muda (#fce5cd) = Barcode ada tapi urutan roll tidak cocok
 * Baca catatan (note) di sel Barcode untuk detail masing-masing baris.
 */
function tampilkanDetailTidakCocok() {
  var ss             = SpreadsheetApp.getActiveSpreadsheet();
  var sheetPembelian = ss.getSheetByName("Pembelian");
  if (!sheetPembelian) {
    SpreadsheetApp.getUi().alert("Sheet 'Pembelian' tidak ditemukan!");
    return;
  }

  var data    = sheetPembelian.getDataRange().getValues();
  var bgs     = sheetPembelian.getDataRange().getBackgrounds();
  var notes   = sheetPembelian.getDataRange().getNotes();
  var headerP = data[0];

  // Cari kolom Barcode
  var pBarcodeCol = 4; // default kolom E
  for (var h = 0; h < headerP.length; h++) {
    if (String(headerP[h]).trim().toLowerCase() === "barcode") {
      pBarcodeCol = h; break;
    }
  }

  var merahList   = []; // barcode tidak ada di Barang
  var oranyeList  = []; // barcode ada, roll tidak cocok

  for (var i = 1; i < data.length; i++) {
    var bg      = bgs[i][pBarcodeCol];
    var barcode = String(data[i][pBarcodeCol]).trim();
    var catatan = String(notes[i][pBarcodeCol]).trim();
    var namaBarang = String(data[i][2]).trim(); // kolom C = Nama Barang di Pembelian

    if (bg === "#f4cccc") {
      merahList.push("Baris " + (i + 1) + " | " + barcode +
        (namaBarang ? " (" + namaBarang + ")" : "") +
        "\n   → " + (catatan || "Barcode tidak ada di Barang"));
    } else if (bg === "#fce5cd") {
      oranyeList.push("Baris " + (i + 1) + " | " + barcode +
        (namaBarang ? " (" + namaBarang + ")" : "") +
        "\n   → " + (catatan || "Roll tidak cocok"));
    }
  }

  if (merahList.length === 0 && oranyeList.length === 0) {
    SpreadsheetApp.getUi().alert(
      "Tidak Ada Masalah",
      "✅ Semua baris Pembelian sudah cocok atau belum pernah dicek.\n" +
      "Jalankan 'Cek Otomatis' terlebih dahulu.",
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  var msg = "";

  if (merahList.length > 0) {
    msg += "🔴 BARCODE TIDAK ADA DI SHEET BARANG (" + merahList.length + " baris):\n";
    msg += "─────────────────────────────────\n";
    for (var j = 0; j < merahList.length; j++) {
      msg += merahList[j] + "\n\n";
    }
  }

  if (oranyeList.length > 0) {
    if (msg) msg += "\n";
    msg += "🟠 BARCODE ADA TAPI ROLL TIDAK COCOK (" + oranyeList.length + " baris):\n";
    msg += "─────────────────────────────────\n";
    for (var j = 0; j < oranyeList.length; j++) {
      msg += oranyeList[j] + "\n\n";
    }
  }

  msg += "\nTip: Hover sel Barcode yang berwarna untuk melihat catatan lengkap.";

  SpreadsheetApp.getUi().alert(
    "Detail Baris Tidak Cocok (" + (merahList.length + oranyeList.length) + " baris)",
    msg,
    SpreadsheetApp.getUi().ButtonSet.OK
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
