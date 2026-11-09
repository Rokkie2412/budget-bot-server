# Budget Bot Server 📊🤖

Budget Bot Server is an automated WhatsApp bot designed to track personal expenses and income in real-time. The bot uses **Groq** for smart transaction categorization, with a local keyword-based matcher as a fallback.

---

## 🚀 Key Features

- **Automated Logging**: Send simple WhatsApp messages (e.g., `makan sate 12000` or `masuk 5000000 gajian`), and the bot will record them instantly.
- **Smart Categorization (Groq)**: Leverages generative AI to analyze transaction descriptions and automatically group them into budget categories.
- **Shorthand Hashtag & Keyword Fallback**: 
  - Manually assign/override a category by appending a hashtag (e.g., `#Shopping`).
  - Automatically falls back to a local keyword matcher if Groq is unavailable or quota-limited.
- **Monthly Summary (`.rekap`)**: Displays incoming and outgoing totals, alongside a percentage breakdown of spending per category.
- **Transaction History (`.cek` / `.history`)**: View recent transactions with their date, description, category name, and custom emoji.
- **Undo Transaction (`.batal` / `.undo`)**: Easily delete the last recorded transaction in case of typos.

---

## 🛠️ Prerequisites

Before you get started, make sure you have:
- **Node.js** (v18+) or **Bun** (highly recommended for performance)
- **Google Chrome** or **Chromium** (required to run the WhatsApp Web client)
- A **Supabase** project (the same project used by `budget-tracker-pwa`)
- An API key from [Groq](https://console.groq.com/keys)

---

## ⚙️ Setup & Installation

### 1. Clone the Repository & Install Dependencies
Navigate to the project root and run:

```bash
# If using npm
npm install

# If using Bun (Recommended)
bun install
```

### 2. Configure Environment Variables (`.env`)
Create a file named `.env` in the root of the project and fill in the following configuration:

```env
NODE_ENV=development
PORT=1001

# Encryption key for transaction descriptions (at least 32 bytes).
# Must match budget-tracker-pwa so both apps can read the same data.
ENCRYPTION_KEY="i1F2n8H3mJ5pL1vD4sT7uX0zF6qW4eY2"

# Groq API Key
GROQ_API_KEY="your-groq-api-key"

# WhatsApp number that users can contact to request access
ADMIN_NUMBER="6285156141278"

# Supabase project shared with budget-tracker-pwa
PUBLIC_SUPABASE_URL_DEV="https://your-dev-project.supabase.co"
PUBLIC_SUPABASE_PUBLISHABLE_KEY_DEV="your-dev-publishable-key"
PUBLIC_SUPABASE_URL="https://your-prod-project.supabase.co"
PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-prod-publishable-key"

# Server-only secret keys (bypass RLS). Never expose or commit these.
# Get them from Supabase dashboard > Project Settings > API keys.
SUPABASE_SERVICE_ROLE_KEY_DEV="your-dev-service-role-key"
SUPABASE_SERVICE_ROLE_KEY="your-prod-service-role-key"
```

> **IMPORTANT**: The bot writes to the same Supabase project as `budget-tracker-pwa`.
> Users link their WhatsApp number and enable chat from the PWA profile page; the bot
> only records transactions for accounts where `allowChat` is enabled. Transaction
> descriptions are encrypted with the shared `ENCRYPTION_KEY`.

### 3. Install Compatible Chrome for Puppeteer (Windows Only)
If you are on Windows and Puppeteer fails to find Chrome during launch, run this command:
```bash
npx puppeteer browsers install chrome
```

---

## 🏃 Running the Application

### Development Mode
Runs the project locally with built-in hot-reloading:

```bash
# Using npm
npm run dev

# Using Bun (Instant execution and hot-reloading)
bun run dev
```

### Production Mode
```bash
# Using npm
npm run build
npm start

# Using Bun
bun run build
bun start
```

After launching:
1. A QR Code will be printed in the terminal.
2. Open WhatsApp on your phone, go to **Linked Devices**, and scan the QR code.
3. Wait until the terminal outputs: `✅ WhatsApp client is ready!`.

---

## 💬 Bot Commands

| Command | Description | Example |
| :--- | :--- | :--- |
| `masuk [amount] [description]` | Record incoming income | `masuk 5000000 monthly salary` |
| `[amount] [description]` | Record an expense | `15000 lunch sate` |
| `[description] [amount]` | Record an expense (reversed format) | `gasoline pertamax 20000` |
| `[description] [amount] #[hashtag]` | Record an expense with a manual category override | `50000 pay arisan #loans` |
| `.rekap` | View the monthly summary report | `.rekap` |
| `.cek` or `.history` | View a list of your recent transactions | `.cek` |
| `.batal` or `.undo` | Delete the last recorded transaction | `.batal` |
| `.help` | Show a guide containing commands | `.help` |

---

## 📁 Financial Categories
Transactions will be automatically classified into one of the following:
- 💡 `Bills` (Subscriptions & Utility Bills)
- 🎓 `Education` (School, Courses & Books)
- 🏠 `Family Needs` (Baby & Household Expenses)
- 🍔 `Food & Drinks` (Meals, Drinks, Coffee & Snacks)
- 🎁 `Gift and Chartiy` (Donations, Charity, Gifts & Angpao)
- 🛒 `Groceries` (Supermarket & Kitchen Supplies)
- 🏥 `Health & personal care` (Medicine, Doctors, Skincare & Haircuts)
- 🎮 `Hobby & Entertaiment` (Cinema, Games & Streaming Services)
- 💸 `Loans` (Installments, Debts & Paylater)
- 📈 `Saving & Investment` (Savings, Gold, Stocks & Crypto)
- 🛍️ `Shopping` (Clothes, Shoes & E-commerce orders)
- ⚽ `sports` (Gym, Futsal, Badminton & Workout equipment)
- 🚗 `Transportaion` (Gas, Ride-hailing, Parking & Car maintenance)
- ✈️ `Traveling` (Hotels, Flights, Stays & Vacations)
- 📦 `Other` (Default/Miscellaneous category)
