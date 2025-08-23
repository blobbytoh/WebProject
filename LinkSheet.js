const sheetName = 'Form data';                                              //define the name of the sheet
const scriptProp = PropertiesService.getScriptProperties();                 //store the spreadsheet ID

function initialSetup() {                                                   // run to initialise the script, storing the ID of the current spreadsheet into a 'key'
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  scriptProp.setProperty('key', activeSpreadsheet.getId());
}   

function doPost(e) {                                                        // triggered when Post request is send from the HTMl form
  const lock = LockService.getScriptLock();
  lock.waitLock(2000);                                                      // wait for 2 second to acquire the lock which ensures that only one script writes to the spreadsheet at a time

  try {
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));     // getting the ID of the sheet
    const sheet = doc.getSheetByName(sheetName);                            // name of the sheet used 'Form Data'

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];  // read the first row of each col to see the name
    const nextRow = sheet.getLastRow() + 1;                                         // go to the next row to enter the entered data

    const newRow = headers.map(function (header) {
      return header === 'Date' ? new Date() : e.parameter[header] || '';    // insert the data of the data
    });

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);       // goes on to the next row of the sheet

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', row: nextRow }))    // success response
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: error.message }))  // unsuccessful response
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();     // release lock allowing other submissions
  }
}