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

// Tarik data dari semua GAS Cabang yang terdaftar
function getAllBranchesData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Master");
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  let branches = [];
  
  // Looping mulai baris ke-2 (index 1)
  for (let i = 1; i < data.length; i++) {
    const lokasi = data[i][0];
    const url = data[i][1];
    const secret = data[i][2];
    const owner = data[i][3];
    
    if (!url) continue; // Skip jika URL kosong
    
    try {
      // Panggil doGet endpoint dari GAS Cabang dengan secret key
      const response = UrlFetchApp.fetch(`${url}?secret=${secret}`, { muteHttpExceptions: true });
      if (response.getResponseCode() === 200) {
        const result = JSON.parse(response.getContentText());
        branches.push({
          lokasi,
          owner,
          url,
          secret,
          status: "ONLINE",
          licenses: result.licenses || []
        });
      } else {
        branches.push({ lokasi, owner, url, secret, status: "OFFLINE", error: "HTTP " + response.getResponseCode(), licenses: [] });
      }
    } catch (err) {
      branches.push({ lokasi, owner, status: "OFFLINE", error: "Error Koneksi", licenses: [] });
    }
  }
  
  return branches;
}

// Fungsi untuk memperbarui status cabang (dipanggil dari frontend HTML)
function updateLicenseStatus(url, secret, licenseKey, newStatus) {
  try {
    const payload = {
      action: "update_status",
      licenseKey: licenseKey,
      status: newStatus,
      secret: secret
    };

    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    return result;
  } catch (e) {
    return { valid: false, error: e.toString() };
  }
}

// Fungsi untuk meng-generate License Key baru (perpanjangan lisensi)
function generateNewLicenseKey(url, secret, storeName, plan) {
  try {
    const payload = {
      action: "generate_key",
      secret: secret,
      storeName: storeName,
      plan: plan
    };

    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    return result;
  } catch (e) {
    return { valid: false, error: e.toString() };
  }
}