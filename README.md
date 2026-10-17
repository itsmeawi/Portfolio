# Portfolio Connect - Lead Intake Form (Google Sheets & Apps Script)

A responsive lead intake and contact portal that submits user information directly into a **Google Spreadsheet** using **Google Apps Script** as a serverless backend API.

Repository: [https://github.com/itsmeawi/Portfolio.git](https://github.com/itsmeawi/Portfolio.git)

---

## Form Fields Handled

The form captures and validates the following fields:

1. **`name`** (First Name) - Validated minimum 2 characters.
2. **`lastname`** (Last Name) - Validated minimum 2 characters.
3. **`gmail`** (Email / Gmail) - Validates valid email format; includes 1-click `+ @gmail.com` autofill.
4. **`contact`** (Contact / Phone Number) - Intelligent number formatting, handles international & local mobile numbers.
5. **`address`** (Complete Physical Address) - Multiline textarea with live character counter (up to 250 characters).

---

## Features

- **Google Sheets Cloud Database**: Each form submission is appended as a new row in your private Google Sheet.
- **Google Apps Script Web App (`Code.gs`)**: Handles concurrent submissions with lock service, auto-creates and styles headers (`Submission ID`, `Timestamp`, `First Name`, `Last Name`, `Gmail`, `Contact Number`, `Address`, `User Agent`).
- **Live Digital Card Preview**: Updates avatar initials and mirrors form data in real time as the user types.
- **Glassmorphism & Rich Aesthetics**: Curated dark palette, neon ambient light orbs, CSS variables, and modern Google Fonts (`Plus Jakarta Sans` & `JetBrains Mono`).
- **Interactive UI & Feedback**:
  - Confetti burst animation upon successful submission.
  - Receipt summary modal with unique Submission ID.
  - Toast notification alerts.
  - Session-based recent submission history log.
  - Auto-draft saving (prevents data loss on accidental page refresh).
  - Built-in Setup & Settings Modal with a 1-click **Test Connection** button.

---

## Quick Setup Guide: Google Sheet & Google Apps Script

Follow these 3 easy steps to connect your form to your own Google Sheet:

### Step 1: Create a Google Sheet
1. Open [sheets.new](https://sheets.new) in your browser.
2. Name the spreadsheet (e.g. `Portfolio Contact Leads`).
3. In the top menu, navigate to: **Extensions** > **Apps Script**.

### Step 2: Paste `Code.gs`
1. In the Apps Script code editor, delete any existing placeholder code.
2. Open [`Code.gs`](file:///Code.gs) from this project, copy the entire code, and paste it into the editor.
3. *(Optional)* If you want an email alert every time someone fills the form, change:
   ```javascript
   var SEND_EMAIL_NOTIFICATION = true;
   var NOTIFICATION_EMAIL = "your-email@gmail.com";
   ```
4. Click **Save** (disk icon or `Ctrl+S`).

### Step 3: Deploy as a Web App
1. Click the blue **Deploy** button (top right) > **New deployment**.
2. Click the gear icon next to "Select type" and select **Web app**.
3. Configure the settings:
   - **Description**: `Portfolio Form API`
   - **Execute as**: `Me (<your-email>)`
   - **Who has access**: `Anyone` *(IMPORTANT: Must be "Anyone" so visitors can submit without a Google account login)*
4. Click **Deploy**.
5. Click **Authorize access**, select your Google account, click **Advanced**, and then click **Go to [Project Name] (unsafe)** > **Allow**.
6. Copy the generated **Web app URL** (the URL ends in `/exec`).

### Step 4: Connect the Web App URL
1. Open `index.html` in your browser.
2. Click the gear icon in the top header (or click the status badge).
3. Paste your Web App URL into the field.
4. Click **Test Connection** to verify, then click **Save Webhook URL**.
5. Submit a test response and check your Google Sheet!

---

## Local Development & Testing

You can run this project with any local server or simply open `index.html` in your browser.

Using Node / Vite / NPX:
```bash
# Using Python
python -m http.server 8080

# Using Node http-server or live-server
npx http-server . -p 8080
```

---

## File Structure

```
Portfolio/
├── index.html       # Responsive web form with live preview & modals
├── styles.css       # Design system, glassmorphism, glowing ambient lighting
├── app.js           # Validation, preview synchronization & Apps Script fetch logic
├── Code.gs          # Backend Google Apps Script (copy to Google Sheets)
├── .gitignore       # Git ignore rules
└── README.md        # Documentation and deployment instructions
```

---

## License

MIT License. Created by [itsmeawi](https://github.com/itsmeawi).
