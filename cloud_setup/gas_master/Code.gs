// Setup Initial Sheet jika belum ada
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Master");
  if (!sheet) {
    sheet = ss.insertSheet("Master");
    sheet.appendRow(["Nama Lokasi", "GAS Webapp URL", "GAS Secret", "Nama Owner", "Alamat Cabang"]);
    sheet.getRange("A1:E1").setFontWeight("bold");
    sheet.getRange("A1:E1").setBackground("#0f172a");
    sheet.getRange("A1:E1").setFontColor("white");
    
    // Beri contoh data
    sheet.appendRow(["SCUFF BILLIARD", "https://script.google.com/macros/s/AKfycb...", "secret123", "ADE SCUFF", "Jl. Tulang Bawang"]);
  }
}

// Render UI Dashboard atau Kembalikan Data JSON
function doGet(e) {
  if (e.parameter.action === "data") {
    return ContentService.createTextOutput(JSON.stringify(getAllBranchesData()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return HtmlService.createTemplateFromFile("Dashboard").evaluate()
    .setTitle("VOC MASTER CENTRAL COMMAND")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Tarik data dari semua GAS Cabang yang terdaftar (PARALEL - lebih cepat)
function getAllBranchesData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Master");
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();

  // Kumpulkan semua cabang yang valid terlebih dahulu
  const validRows = [];
  for (let i = 1; i < data.length; i++) {
    const lokasi = data[i][0];
    const url = data[i][1];
    const secret = data[i][2];
    const owner = data[i][3];
    if (!url) continue;
    validRows.push({ lokasi, url, secret, owner });
  }

  if (validRows.length === 0) return [];

  // Buat semua request sekaligus (PARALEL)
  const requests = validRows.map(row => ({
    url: `${row.url}?secret=${row.secret}`,
    muteHttpExceptions: true,
    followRedirects: true,
    method: "get"
  }));

  let responses;
  try {
    responses = UrlFetchApp.fetchAll(requests);
  } catch (err) {
    // Jika fetchAll gagal total, kembalikan semua sebagai OFFLINE
    return validRows.map(row => ({
      lokasi: row.lokasi, owner: row.owner, url: row.url, secret: row.secret,
      status: "OFFLINE", error: "Gagal koneksi massal", licenses: []
    }));
  }

  // Proses hasil secara bersamaan
  const branches = responses.map((response, idx) => {
    const row = validRows[idx];
    try {
      if (response.getResponseCode() === 200) {
        const result = JSON.parse(response.getContentText());
        return {
          lokasi: row.lokasi, owner: row.owner, url: row.url, secret: row.secret,
          status: "ONLINE",
          licenses: result.licenses || []
        };
      } else {
        return {
          lokasi: row.lokasi, owner: row.owner, url: row.url, secret: row.secret,
          status: "OFFLINE", error: "HTTP " + response.getResponseCode(), licenses: []
        };
      }
    } catch (err) {
      return {
        lokasi: row.lokasi, owner: row.owner, url: row.url, secret: row.secret,
        status: "OFFLINE", error: "Error parsing response", licenses: []
      };
    }
  });

  return branches;
}

// Helper: parse JSON dengan aman - jika response adalah HTML, kembalikan error yang jelas
function safeParseJson(responseText) {
  const trimmed = responseText.trim();
  if (trimmed.startsWith("<")) {
    // GAS mengembalikan HTML — biasanya karena redirect login atau perlu deploy ulang
    return { valid: false, error: "GAS Cabang belum di-deploy ulang setelah update kode. Silakan buka GAS Cabang dan klik Deploy → New Version." };
  }
  return JSON.parse(trimmed);
}

// Fungsi untuk memperbarui status cabang (dipanggil dari frontend HTML)
function updateLicenseStatus(url, secret, licenseKey, newStatus) {
  try {
    const payload = { action: "update_status", licenseKey, status: newStatus, secret };
    const options = { method: "post", contentType: "application/json", payload: JSON.stringify(payload), muteHttpExceptions: true };
    const response = UrlFetchApp.fetch(url, options);
    return safeParseJson(response.getContentText());
  } catch (e) {
    return { valid: false, error: e.toString() };
  }
}

// Fungsi untuk meng-generate License Key baru (perpanjangan lisensi)
function generateNewLicenseKey(url, secret, storeName, plan) {
  try {
    const payload = { action: "generate_key", secret, storeName, plan };
    const options = { method: "post", contentType: "application/json", payload: JSON.stringify(payload), muteHttpExceptions: true };
    const response = UrlFetchApp.fetch(url, options);
    return safeParseJson(response.getContentText());
  } catch (e) {
    return { valid: false, error: e.toString() };
  }
}

// Fungsi untuk mengedit tanggal/plan lisensi tertentu
function editLicense(url, secret, licenseKey, expiresAt, plan) {
  try {
    const payload = { action: "edit_license", secret, licenseKey, expiresAt, plan };
    const options = { method: "post", contentType: "application/json", payload: JSON.stringify(payload), muteHttpExceptions: true };
    const response = UrlFetchApp.fetch(url, options);
    return safeParseJson(response.getContentText());
  } catch (e) {
    return { valid: false, error: e.toString() };
  }
}

// Fungsi untuk menghapus lisensi tertentu
function deleteLicense(url, secret, licenseKey) {
  try {
    const payload = { action: "delete_license", secret, licenseKey };
    const options = { method: "post", contentType: "application/json", payload: JSON.stringify(payload), muteHttpExceptions: true };
    const response = UrlFetchApp.fetch(url, options);
    return safeParseJson(response.getContentText());
  } catch (e) {
    return { valid: false, error: e.toString() };
  }
}