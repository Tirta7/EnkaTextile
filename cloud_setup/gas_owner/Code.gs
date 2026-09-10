const SCRIPT_SECRET = "secret123";

// Setup Initial Sheet jika belum ada
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Lisensi");
  if (!sheet) {
    sheet = ss.insertSheet("Lisensi");
    sheet.appendRow(["Machine ID", "License Key", "Toko", "Plan", "Masa Berlaku", "Status"]);
    sheet.getRange("A1:F1").setFontWeight("bold");
    
    // Beri contoh data
    sheet.appendRow(["", "VOC-CABANG-202610-A3B7", "TMC POS Cabang 1", "1month", "", "Aktif"]);
  }
}

// Endpoint untuk aplikasi TMC POS (Klien) & Master
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    const licenseKey = postData.licenseKey;
    const machineId = postData.machineId;
    const secret = postData.secret;

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Lisensi");
    const data = sheet.getDataRange().getValues();

    // Logika untuk Master mengubah status (Aktif / Darurat)
    if (action === "update_status") {
      if (secret !== SCRIPT_SECRET) {
        return ContentService.createTextOutput(JSON.stringify({ valid: false, error: "Unauthorized" })).setMimeType(ContentService.MimeType.JSON);
      }
      
      const newStatus = postData.status;
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === licenseKey) {
          sheet.getRange(i + 1, 6).setValue(newStatus);
          return ContentService.createTextOutput(JSON.stringify({ valid: true, message: "Status updated" })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ valid: false, error: "License not found" })).setMimeType(ContentService.MimeType.JSON);
    }

    // Logika untuk Master membuat License Key baru (perpanjangan)
    if (action === "generate_key") {
      if (secret !== SCRIPT_SECRET) {
        return ContentService.createTextOutput(JSON.stringify({ valid: false, error: "Unauthorized" })).setMimeType(ContentService.MimeType.JSON);
      }

      const plan = postData.plan || "1month";
      const storeName = postData.storeName || "";

      // Generate kode acak: VOC-XXXX-YYMMDD-ZZZZ
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const rand = (n) => Array.from({length: n}, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      const now = new Date();
      const yymmdd = String(now.getFullYear()).slice(-2) + String(now.getMonth()+1).padStart(2,"0") + String(now.getDate()).padStart(2,"0");
      const newKey = `VOC-${rand(4)}-${yymmdd}-${rand(4)}`;

      // Nonaktifkan key lama yang masih aktif untuk toko yang sama (jika ada)
      for (let i = 1; i < data.length; i++) {
        if (data[i][2] === storeName && data[i][5].toString().toLowerCase() === "aktif") {
          sheet.getRange(i + 1, 6).setValue("Kedaluwarsa");
        }
      }

      // Tambahkan baris baru: MachineID kosong, expiresAt kosong (dihitung saat aktivasi pertama)
      sheet.appendRow(["", newKey, storeName, plan, "", "Aktif"]);

      return ContentService.createTextOutput(JSON.stringify({ valid: true, newKey, plan, storeName })).setMimeType(ContentService.MimeType.JSON);
    }

    // Logika validasi dari Klien
    if (!licenseKey || !machineId) {
      return ContentService.createTextOutput(JSON.stringify({ valid: false, error: "Data tidak lengkap" })).setMimeType(ContentService.MimeType.JSON);
    }

    let found = false;
    let valid = false;
    let expiresAt = null;
    let daysLeft = 0;
    let storeName = "";
    let error = "License Key tidak ditemukan atau sudah diblokir";

    // Looping data sheet (Skip baris pertama/header)
    for (let i = 1; i < data.length; i++) {
      const rowMachineId = data[i][0];
      const rowLicenseKey = data[i][1];
      const rowStore = data[i][2];
      const rowPlan = data[i][3];
      const rowExpiresAt = data[i][4];
      const rowStatus = data[i][5];

      if (rowLicenseKey === licenseKey) {
        found = true;
        
        // Cek binding Machine ID
        if (rowMachineId && rowMachineId !== machineId) {
          error = "Lisensi ini sudah terikat dengan mesin/perangkat lain.";
          break;
        }

        // Ikat (Bind) Machine ID jika belum ada yang terikat
        if (!rowMachineId) {
          sheet.getRange(i + 1, 1).setValue(machineId);
        }

        if (rowStatus.toString().toLowerCase() === "darurat" || rowStatus.toString().toLowerCase() === "kunci") {
          error = "LOCKED_EMERGENCY";
          break;
        }

        if (rowStatus.toString().toLowerCase() !== "aktif") {
          error = "Lisensi sudah dinonaktifkan oleh Admin.";
          break;
        }

        let expiredDate = rowExpiresAt ? new Date(rowExpiresAt) : null;
        
        // Hitung masa berlaku jika baru pertama kali diaktifkan
        if (!expiredDate || isNaN(expiredDate.getTime())) {
          expiredDate = new Date();
          let monthsToAdd = 1;
          if (rowPlan === '3month') monthsToAdd = 3;
          if (rowPlan === '6month') monthsToAdd = 6;
          if (rowPlan === '1year') monthsToAdd = 12;
          
          expiredDate.setMonth(expiredDate.getMonth() + monthsToAdd);
          sheet.getRange(i + 1, 5).setValue(expiredDate);
        }

        // Cek kedaluwarsa
        const now = new Date();
        if (now > expiredDate) {
          error = "Lisensi sudah kedaluwarsa.";
          break;
        }

        daysLeft = Math.ceil((expiredDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        valid = true;
        expiresAt = expiredDate.toISOString();
        storeName = rowStore;
        error = null;
        break;
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      valid,
      expiresAt,
      daysLeft,
      storeName,
      error
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ valid: false, error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Endpoint untuk ditarik datanya oleh GAS Master (Pusat)
function doGet(e) {
  // Jika diakses oleh GAS Master (ada secret valid), kembalikan data JSON
  const paramSecret = e.parameter.secret;
  if (paramSecret === SCRIPT_SECRET) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Lisensi");
    const data = sheet.getDataRange().getValues();

    let licenses = [];
    for (let i = 1; i < data.length; i++) {
      licenses.push({
        machineId: data[i][0],
        licenseKey: data[i][1],
        storeName: data[i][2],
        plan: data[i][3],
        expiresAt: data[i][4],
        status: data[i][5]
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      storeName: ss.getName(),
      licenses: licenses
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // Jika diakses langsung via browser tanpa secret, tampilkan halaman informasi HTML
  return HtmlService.createHtmlOutputFromFile("index").setTitle("TMC POS - GAS Cabang");
}
