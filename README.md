# Lone Star Scholars CRM

A lightweight CRM web app for college prep and admissions counseling, built with Next.js, Prisma, and SQLite. Includes Google Sheets sync for human-readable data access outside the app.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite via Prisma ORM
- **Auth**: JWT-based with httpOnly cookies
- **Sync**: Google Sheets API via service account

## Quick Start (Local Dev)

### 1. Install dependencies

```bash
cd crm
npm install
```

### 2. Set up environment

Copy the example env file:

```bash
cp .env.example .env
```

Edit `.env` with your values. For local dev, the defaults work out of the box.

### 3. Initialize the database

```bash
npx prisma db push
```

### 4. (Optional) Seed sample data

```bash
npm run db:seed
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Login

- **Email**: `admin@lonestarscholars.com`
- **Password**: `admin123`

## Setting a Custom Admin Password

Generate a bcrypt hash for your password:

```bash
node -e "console.log(require('bcryptjs').hashSync('YourSecurePassword', 10))"
```

Set the result as `ADMIN_PASSWORD_HASH` in your `.env` file. Also update `ADMIN_EMAIL` if desired.

## Google Sheets Sync Setup

The sync feature pushes data from the app to Google Sheets. The app database is always the source of truth.

### 1. Create a Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Enable the **Google Sheets API**:
   - Go to APIs & Services > Library
   - Search for "Google Sheets API"
   - Click Enable
4. Create a Service Account:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "Service Account"
   - Give it a name (e.g., "LSS CRM Sync")
   - Click Done
5. Create a key for the service account:
   - Click on the service account you created
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key" > JSON
   - Download the JSON file

### 2. Create a Google Sheet

1. Create a new Google Sheet
2. Share it with the service account email (found in the JSON key file as `client_email`) with **Editor** access
3. Copy the spreadsheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`

### 3. Configure Environment Variables

Add these to your `.env`:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID="your_spreadsheet_id"
```

**Important**: The `GOOGLE_PRIVATE_KEY` value must be a single line with `\n` for newlines (copy it exactly from the JSON key file's `private_key` field).

### 4. Use Sync

Navigate to the **Sync** page in the app and click "Sync Now". The app will:
- Create "Contacts" and "Interactions" tabs if they don't exist
- Clear and rewrite all data with current database contents
- Format headers in bold
- Log the sync result

## Data Model

### Contacts
Single source of truth for all contacts (parents, students, partners). Contains:
- Personal info (name, email, phone, school)
- Lead segmentation (source, interest, budget, priority)
- Pipeline tracking (status, follow-up dates, next steps)
- Client onboarding (package, contract, payment status)

### Interactions
Append-only log of all communications:
- Type (Call, Email, Text, Meeting, Workshop, DM)
- Summary and outcome
- Linked to contact via contact_id
- Automatically updates contact's `lastContactDate`

### Audit Log
Tracks all field-level changes on contacts for accountability.

## Views

| View | Purpose |
|------|---------|
| **Dashboard** | KPIs, status counts, lead source performance, upcoming follow-ups |
| **Pipeline** | Active leads filtered by pipeline stages, sorted by follow-up date |
| **Clients** | Active clients with quick onboarding actions |
| **All Contacts** | Full contact directory with search, filter, CSV export |
| **Contact Detail** | Full profile, interaction timeline, audit trail |
| **Sync** | Google Sheets sync controls and status |

## Deployment

### Vercel (Recommended)

1. Push your code to a Git repository
2. Import the project in [Vercel](https://vercel.com)
3. Set environment variables in Vercel's dashboard
4. **Important**: For SQLite on Vercel, you'll need to switch to Postgres:
   - Create a Vercel Postgres or Supabase database
   - Update `prisma/schema.prisma` to use `provider = "postgresql"`
   - Update `DATABASE_URL` to your Postgres connection string
   - Run `npx prisma db push`

### Render / Fly.io

1. Deploy as a Node.js app
2. SQLite works fine on persistent disk (Render) or volumes (Fly.io)
3. Set environment variables via the platform's dashboard
4. Build command: `npm run build`
5. Start command: `npm start`

## Prisma Commands

```bash
npx prisma studio          # Visual database browser
npx prisma db push         # Push schema changes to DB
npx prisma generate        # Regenerate Prisma client
npm run db:seed            # Seed sample data
```

## Project Structure

```
crm/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Sample data
├── src/
│   ├── app/
│   │   ├── (app)/          # Authenticated routes
│   │   │   ├── dashboard/
│   │   │   ├── pipeline/
│   │   │   ├── clients/
│   │   │   ├── contacts/
│   │   │   └── sync/
│   │   ├── api/            # API routes
│   │   │   ├── auth/
│   │   │   ├── contacts/
│   │   │   ├── dashboard/
│   │   │   ├── interactions/
│   │   │   └── sync/
│   │   ├── login/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Badge.tsx
│   │   ├── ContactForm.tsx
│   │   ├── InteractionForm.tsx
│   │   ├── Modal.tsx
│   │   └── Sidebar.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── constants.ts
│   │   ├── prisma.ts
│   │   └── sheets.ts
│   └── middleware.ts
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```
