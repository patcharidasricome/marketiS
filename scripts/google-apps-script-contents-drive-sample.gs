/**
 * Contents Library — Sheet + Drive (merged sample)
 *
 * SETUP (ทำครั้งเดียว):
 * 1. Apps Script → ⚙ Project Settings → Script properties → Add row:
 *    Property: CONTENTS_DRIVE_FOLDER_ID
 *    Value:    15FybFsxGZrG3b9Khlv_EuY0kB5BX0NnB
 *
 * 2. ใน Sheet แถวหัวตาราง — เพิ่มคอลัมน์ท้ายสุด (คอลัมน์ที่ 11) เช่น:
 *    Drive Image URL   (ชื่ออื่นก็ได้ แค่ให้สอดคล้องกับข้อมูลในคอลัมน์นั้น)
 *
 * 3. Deploy → Manage deployments → เวอร์ชันใหม่ของ Web app → บันทึก
 *    (และให้ URL เดิมใน CONTENTS_SCRIPT_URL ของ MarketiS ชี้ deployment นี้)
 *
 *    สำคัญ: Who has access ต้องเป็น **Anyone** (ใครก็ได้ / anonymous)
 *    ไม่ใช่แค่ “Anyone with Google account” — เซิร์ฟเวอร์ Next.js เรียก Apps Script
 *    แบบไม่มี cookie ล็อกอิน Google ถ้าตั้งผิดจะได้หน้า HTML (login) แทน JSON
 *
 * 4. สิทธิ์ Drive (ถ้าไม่อนุมัติ จะ error “You do not have permission to call DriveApp…”):
 *    - ใน Editor ให้เพิ่มฟังก์ชัน authorizeDriveOnce() ด้านล่างไฟล์นี้ → เลือกใน dropdown → Run
 *    - กด Review permissions → เลือกบัญชีเดียวกับ Execute as → Advanced → Allow “Google Drive API” / เข้าถึงไฟล์
 *    - หรือเปิดไฟล์ appsscript.json (Project Settings → แสดง manifest) แล้วใส่ oauthScopes ตามตัวอย่าง
 *      scripts/google-apps-script-appsscript.json.example แล้ว Save + Run authorizeDriveOnce อีกครั้ง
 *
 * POST body จาก MarketiS (เมื่อมีรูป):
 *   driveImageDataUrl   — data URL (แนะนำ JPEG เพื่อให้ POST เล็ก — Apps Script รับ MIME จาก data URL)
 *   driveImageFileName  — เช่น Author_Idea.jpg
 */

const STATUS_VALUES = ["drafted", "scheduled", "archived", "posted"];

function normalizeStatus(value) {
  const status = String(value || "").trim();
  const lower = status.toLowerCase();

  if (lower === "scheduled") return "Scheduled";
  if (lower === "archived") return "Archived";
  if (lower === "posted") return "Posted";
  return "Drafted";
}

function sanitizeDriveFileName_(name) {
  var n = String(name || "").trim();
  if (!n) n = "content.jpg";
  n = n.replace(/[/\\:*?"<>|]+/g, "_").replace(/\s+/g, " ").trim();
  if (!/\.(png|jpe?g|webp|gif)$/i.test(n)) n += ".jpg";
  return n.slice(0, 240);
}

function uploadDataUrlToDrive_(dataUrl, folderId, preferredFileName) {
  var trimmed = String(dataUrl || "").trim();
  var match = /^data:([^;]+);base64,([\s\S]+)$/i.exec(trimmed);
  if (!match) return "";

  var mimeType = match[1];
  var bytes = Utilities.base64Decode(match[2].replace(/\s+/g, ""));
  var finalName = sanitizeDriveFileName_(preferredFileName);

  var folder = DriveApp.getFolderById(folderId);
  var blob = Utilities.newBlob(bytes, mimeType, finalName);
  var file = folder.createFile(blob);

  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return file.getUrl();
}

function doPost(e) {
  try {
    var raw =
      e.postData && typeof e.postData.contents === "string" ? e.postData.contents : "";
    if (!raw || !raw.trim()) {
      return ContentService.createTextOutput(
        JSON.stringify({ ok: false, error: "Missing POST body (postData.contents empty)." }),
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(raw);

    var sheet = SpreadsheetApp
      .openById("1wiy3u0o0Rv9GTQVpq63xqsiNLKHGGai0eTQgdSscEzQ")
      .getActiveSheet();

    var driveUrl = "";
    var folderId = PropertiesService.getScriptProperties().getProperty("CONTENTS_DRIVE_FOLDER_ID");
    if (data.driveImageDataUrl && folderId) {
      var preferredName =
        data.driveImageFileName && String(data.driveImageFileName).trim()
          ? String(data.driveImageFileName).trim()
          : sanitizeDriveFileName_(
              String(data.author || "Author").trim() +
                "_" +
                String(data.title || "Untitled").trim() +
                ".jpg",
            );
      driveUrl = uploadDataUrlToDrive_(data.driveImageDataUrl, folderId, preferredName);
    }

    sheet.appendRow([
      data.thumbnailImage || "",
      data.title || "",
      data.author || "",
      data.dateCreated || "",
      data.dateScheduled || "",
      normalizeStatus(data.status || "Drafted"),
      (data.platforms || []).join(", "),
      data.linkedinCaption || "",
      data.facebookCaption || "",
      data.instagramCaption || "",
      driveUrl || "",
    ]);

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (err) {
    var msg = err && err.message ? String(err.message) : String(err);
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: msg })).setMimeType(
      ContentService.MimeType.JSON,
    );
  }
}

function doGet() {
  const sheet = SpreadsheetApp
    .openById("1wiy3u0o0Rv9GTQVpq63xqsiNLKHGGai0eTQgdSscEzQ")
    .getActiveSheet();

  const rows = sheet.getDataRange().getValues();

  const data = rows.map(function (row) {
    const rawStatus = String(row[5] || "").trim();
    const hasStatusValue = STATUS_VALUES.indexOf(rawStatus.toLowerCase()) !== -1;

    const hasNewStatusColumn =
      hasStatusValue || (rawStatus === "" && row.length >= 10);
    const platformIndex = hasNewStatusColumn ? 6 : 5;

    return {
      thumbnailImage: row[0],
      title: row[1],
      author: row[2],
      dateCreated: row[3],
      dateScheduled: row[4],
      status: hasStatusValue ? normalizeStatus(rawStatus) : "Drafted",
      platforms: row[platformIndex]
        ? String(row[platformIndex]).split(", ").filter(Boolean)
        : [],
      linkedinCaption: row[platformIndex + 1],
      facebookCaption: row[platformIndex + 2],
      instagramCaption: row[platformIndex + 3],
      driveImageUrl: row[platformIndex + 4] || "",
    };
  });

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * รันครั้งเดียวใน Editor เพื่อให้โปรเจกต์ขอสCOPE Drive แล้วอนุมัติบัญชีที่เป็นเจ้าของสคริปต์
 * (หลังรันสำเร็จแล้วลบฟังก์ชันนี้ออกก็ได้)
 */
function authorizeDriveOnce() {
  DriveApp.getRootFolder();
  SpreadsheetApp.openById("1wiy3u0o0Rv9GTQVpq63xqsiNLKHGGai0eTQgdSscEzQ");
}
