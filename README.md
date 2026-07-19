# Budget Bot Server 📊🤖

Budget Bot Server is an automated WhatsApp bot designed to track personal expenses and income in real-time. The bot is powered by **Gemini 3.5 Flash** for smart transaction categorization, with a robust local keyword-based regex matcher as a fallback.

---

## 🚀 Key Features

- **Automated Logging**: Send simple WhatsApp messages (e.g., `makan sate 12000` or `masuk 5000000 gajian`), and the bot will record them instantly.
- **Smart Categorization (Gemini 3.5 Flash)**: Leverages generative AI to analyze transaction descriptions and automatically group them into 15 specific categories.
- **Shorthand Hashtag & Keyword Fallback**: 
  - Manually assign/override a category by appending a hashtag (e.g., `#Shopping`).
  - Automatically falls back to a local regex keyword matcher if the Gemini API is offline or quota-limited.
- **Monthly Summary (`.rekap`)**: Displays incoming and outgoing totals, alongside a percentage breakdown of spending per category.
- **Transaction History (`.cek` / `.history`)**: View recent transactions with their date, description, category name, and custom emoji.
- **Undo Transaction (`.batal` / `.undo`)**: Easily delete the last recorded transaction in case of typos.

---

## 🛠️ Prerequisites

Before you get started, make sure you have:
- **Node.js** (v18+) or **Bun** (highly recommended for performance)
- **Google Chrome** or **Chromium** (required to run the WhatsApp Web client)
- A **MongoDB Atlas** account (cloud database)
- An API Key from **Google AI Studio** (to run Gemini 3.5 Flash)

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
# MongoDB Atlas Database URI
MONGO_URI_PROD="mongodb+srv://..."
MONGO_URI_DEV="mongodb://..."
NODE_ENV=development
PORT=1001

# Encryption Keys for Transaction Descriptions (32 characters)
ENCRYPTION_KEY="i1F2n8H3mJ5pL1vD4sT7uX0zF6qW4eY2"
STATIC_SALT="\$2a\$10\$V2sL5gN8jQ8rT1pV1cX3yC"

# Google Gemini API Key
GEMINI_API_KEY="AQ.Ab8RN6..."

# Optional: If Chrome cannot be found automatically on Windows
# PUPPETEER_EXECUTABLE_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

> **IMPORTANT**: Make sure your current IP address is whitelisted in your MongoDB Atlas dashboard under **Network Access** to allow successful database connections.

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
