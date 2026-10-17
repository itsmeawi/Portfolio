/**
 * ===================================================================
 * Google Sheets + Google Apps Script Form Handler
 * ===================================================================
 * Repository: https://github.com/itsmeawi/Portfolio.git
 * 
 * Spreadsheet URL: https://docs.google.com/spreadsheets/d/1ZBKFAWajAClVhBj17anFys4ACJGHy9NJBof75dew_iQ/edit
 * Spreadsheet ID: 1ZBKFAWajAClVhBj17anFys4ACJGHy9NJBof75dew_iQ
 * 
 * Fields Handled:
 * 1. Timestamp (Auto-generated)
 * 2. Name (First Name)
 * 3. Lastname (Last Name)
 * 4. Gmail (Email address)
 * 5. Contact (Phone / Contact number)
 * 6. Address (Full Address)
 *
 * HOW TO DEPLOY TO YOUR SPREADSHEET:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1ZBKFAWajAClVhBj17anFys4ACJGHy9NJBof75dew_iQ/edit
 * 2. In the top menu, click: Extensions > Apps Script
 * 3. Delete any code in the editor and paste this entire file (Code.gs)
 * 4. Click "Save" (Disk icon or Ctrl+S)
 * 5. Click the blue "Deploy" button (top right) > "New deployment"
 * 6. Click the gear icon next to "Select type" > choose "Web app"
 * 7. Set the following options:
 *    - Description: "Portfolio Form API v1"
 *    - Execute as: "Me (your email)"
 *    - Who has access: "Anyone" (CRITICAL: Must be "Anyone" so visitors can submit without login)
 * 8. Click "Deploy"
 * 9. Grant permissions if prompted (Click Advanced > Go to [project name] (unsafe) > Allow)
 * 10. Copy the "Web app URL" (ends in `/exec`)
 * 11. Paste that Web app URL into your portfolio settings or app.js!
 * ===================================================================
 */

// Configuration
var SPREADSHEET_ID = "1ZBKFAWajAClVhBj17anFys4ACJGHy9NJBof75dew_iQ";
var SHEET_NAME = "Submissions";
var SEND_EMAIL_NOTIFICATION = false; // Set to true if you want an email alert on new submission
var NOTIFICATION_EMAIL = ""; // Put your email here if SEND_EMAIL_NOTIFICATION is true

/**
 * Handle HTTP GET Requests (Health check & JSONP support)
 */
function doGet(e) {
  var output = {
    status: "active",
    message: "Google Apps Script Form Service is running successfully!",
    timestamp: new Date().toISOString()
  };
  
  // Return JSON response with CORS headers
  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle HTTP POST Requests (Form Submissions)
 */
function doPost(e) {
  // Use a script lock to prevent race conditions during concurrent submissions
  var lock = LockService.getScriptLock();
  var lockAcquired = lock.tryLock(10000); // Wait up to 10 seconds
  
  if (!lockAcquired) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "Server busy, please try submitting again in a few moments."
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    }
    var sheet = ss.getSheetByName(SHEET_NAME);
    
    // If the sheet doesn't exist, create it or use the active one
    if (!sheet) {
      sheet = ss.getActiveSheet();
      sheet.setName(SHEET_NAME);
    }
    
    // Check if header row exists, if not, create styled headers
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Submission ID",
        "Timestamp",
        "First Name",
        "Last Name",
        "Gmail",
        "Contact Number",
        "Address",
        "User Agent"
      ];
      sheet.appendRow(headers);
      
      // Style headers
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1e1b4b"); // Deep Indigo
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // Extract submitted data from JSON payload or form-encoded parameters
    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter;
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    // Clean and validate inputs
    var name = (data.name || data.firstName || "").toString().trim();
    var lastname = (data.lastname || data.lastName || "").toString().trim();
    var gmail = (data.gmail || data.email || "").toString().trim();
    var contact = (data.contact || data.phone || "").toString().trim();
    var address = (data.address || "").toString().trim();
    var userAgent = (data.userAgent || "Web Form").toString().trim();

    if (!name && !gmail) {
      throw new Error("Missing required form data (Name and Gmail are required).");
    }

    var timestamp = new Date();
    var submissionId = "SUB-" + Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyyMMdd-HHmmss") + "-" + Math.floor(Math.random() * 1000);

    // Format new row
    var newRow = [
      submissionId,
      timestamp,
      name,
      lastname,
      gmail,
      "'" + contact, // prefix with apostrophe to keep phone formatting as text
      address,
      userAgent
    ];

    sheet.appendRow(newRow);

    // Auto-fit column widths
    for (var col = 1; col <= newRow.length; col++) {
      sheet.autoResizeColumn(col);
    }

    // Optional email notification
    if (SEND_EMAIL_NOTIFICATION && NOTIFICATION_EMAIL) {
      try {
        var subject = "New Portfolio Lead: " + name + " " + lastname;
        var body = "You have received a new submission from your Portfolio Form:\n\n" +
                   "Name: " + name + " " + lastname + "\n" +
                   "Gmail: " + gmail + "\n" +
                   "Contact: " + contact + "\n" +
                   "Address: " + address + "\n" +
                   "Submitted At: " + timestamp.toString();
        MailApp.sendEmail(NOTIFICATION_EMAIL, subject, body);
      } catch (mailError) {
        Logger.log("Failed to send notification email: " + mailError.toString());
      }
    }

    // Return JSON response
    var response = {
      status: "success",
      message: "Form submission saved successfully!",
      submissionId: submissionId,
      rowNumber: sheet.getLastRow(),
      timestamp: timestamp.toISOString()
    };

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error processing submission: " + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}
