/**
 * ============================================================
 *  LIC ADVISOR LEAD COLLECTION – GOOGLE APPS SCRIPT
 * ============================================================
 *
 *  HOW TO SET UP (step-by-step):
 *
 *  1. Open Google Sheets: https://sheets.google.com
 *     → Create a new blank spreadsheet
 *     → Name it "LIC Advisor Applications"
 *
 *  2. In the spreadsheet, click:
 *     Extensions → Apps Script
 *
 *  3. Delete any existing code in the editor.
 *     Paste THIS ENTIRE FILE into the editor.
 *
 *  4. Click Save (💾) – name the project "LIC Lead Collector"
 *
 *  5. Click Deploy → New deployment
 *     → Type: Web App
 *     → Execute as: Me
 *     → Who has access: Anyone
 *     → Click Deploy
 *
 *  6. Copy the Web App URL (looks like:
 *     https://script.google.com/macros/s/ABC123.../exec)
 *
 *  7. Paste that URL into BOTH:
 *     → form.html  (line: const SHEET_URL = "...")
 *     → admin.html (line: const SHEET_URL  = "...")
 *
 *  ✅ Done! Your form will now save to Google Sheets.
 *
 *  NOTE: Every time you edit this script, you must
 *  create a NEW deployment (Deploy → New deployment)
 *  and update the URL in your HTML files.
 * ============================================================
 */

// Name of the sheet tab to write data into
var SHEET_NAME = "Applications";

// Column headers (must match the order in appendRow below)
var HEADERS = [
  "Timestamp",
  "Name",
  "Phone",
  "Email",
  "Age",
  "Gender",
  "City",
  "Address",
  "Qualification",
  "Caste"
];

/**
 * Called when the web app receives a POST request (form submission).
 */
function doPost(e) {
  try {
    var sheet = getOrCreateSheet();
    var data  = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.timestamp     || new Date().toLocaleString("en-IN"),
      data.name          || "",
      data.phone         || "",
      data.email         || "",
      data.age           || "",
      data.gender        || "",
      data.city          || "",
      data.address       || "",
      data.qualification || "",
      data.caste         || ""
    ]);

    return jsonResponse({ success: true, message: "Data saved." });

  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

/**
 * Called when the admin page loads and fetches all applicants.
 * URL: ?action=get
 */
function doGet(e) {
  try {
    var action = e && e.parameter && e.parameter.action;

    if (action === "get") {
      var sheet = getOrCreateSheet();
      var rows  = sheet.getDataRange().getValues();

      // Skip header row
      var data = rows.slice(1).map(function(row) {
        return {
          timestamp:     row[0]  || "",
          name:          row[1]  || "",
          phone:         row[2]  || "",
          email:         row[3]  || "",
          age:           row[4]  || "",
          gender:        row[5]  || "",
          city:          row[6]  || "",
          address:       row[7]  || "",
          qualification: row[8]  || "",
          caste:         row[9]  || ""
        };
      });

      // Return newest first
      data.reverse();
      return jsonResponse({ success: true, data: data });
    }

    // Default: return a simple status page
    return HtmlService.createHtmlOutput(
      "<h2>✅ LIC Lead Collector is running.</h2>" +
      "<p>Web app is active. Use <code>?action=get</code> to fetch data.</p>"
    );

  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

/**
 * Gets the Applications sheet, or creates it with headers if missing.
 */
function getOrCreateSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);

    // Write header row
    sheet.appendRow(HEADERS);

    // Style the header row
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground("#0d1f3c");
    headerRange.setFontColor("#e8c96a");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(11);

    // Auto-resize columns
    sheet.autoResizeColumns(1, HEADERS.length);

    // Freeze header row
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Returns a JSON response with CORS headers.
 */
function jsonResponse(obj) {
  var output = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}
