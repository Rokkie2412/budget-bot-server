import { BUDGET_CATEGORIES } from "../constants";
import type { BudgetCategory } from "../types";

/**
 * Checks if the user explicitly provided a category via hashtag (e.g. #shopping).
 */
export const getExplicitHashtagCategory = (description: string): BudgetCategory | null => {
  const desc = description.toLowerCase();
  
  // Extract all hashtags (e.g. #makan -> "makan")
  const hashtags = [...desc.matchAll(/#([a-z0-9&]+)/g)].map(m => m[1]!);

  if (hashtags.length === 0) return null;

  const categoryHashtagMap: Record<Exclude<BudgetCategory, "Other">, string[]> = {
    "Bills": ["bill", "bills", "listrik", "wifi", "pulsa", "tagihan", "kos", "internet", "token"],
    "Education": ["edu", "education", "sekolah", "kuliah", "spp", "ukt", "les", "buku"],
    "Family Needs": ["family", "anak", "rumah", "istri", "suami", "popok", "susu"],
    "Food & Drinks": ["food", "drinks", "makan", "minum", "kopi", "cafe", "resto", "kuliner", "grabfood", "gofood", "bakso", "nasi"],
    "Gift and Chartiy": ["gift", "charity", "donasi", "sedekah", "amal", "zakat", "kado", "hadiah", "kondangan"],
    "Groceries": ["groceries", "belanja", "pasar", "bulanan", "indomaret", "alfamart", "superindo", "sayur"],
    "Health & personal care": ["health", "care", "obat", "dokter", "skincare", "salon", "apotek", "klinik"],
    "Hobby & Entertaiment": ["hobby", "entertainment", "game", "play", "hiburan", "nonton", "bioskop", "netflix", "spotify"],
    "Loans": ["loan", "loans", "utang", "hutang", "cicilan", "paylater", "credit"],
    "Saving & Investment": ["save", "saving", "investment", "invest", "tabungan", "saham", "emas", "crypto", "bibit"],
    "Shopping": ["shopping", "shop", "beli", "baju", "sepatu", "celana", "shopee", "tokopedia"],
    "sports": ["sports", "sport", "gym", "olahraga", "futsal", "badminton", "running"],
    "Transportaion": ["transportation", "transport", "bensin", "ojek", "gojek", "grab", "parkir", "tol", "mrt", "krl"],
    "Traveling": ["traveling", "travel", "liburan", "hotel", "tiket", "wisata", "staycation"]
  };

  for (const hashtag of hashtags) {
    // 1. Check exact sanitized category match first
    for (const category of BUDGET_CATEGORIES) {
      const sanitizedCategory = category.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (hashtag === sanitizedCategory) {
        return category;
      }
    }

    // 2. Check keyword/shorthand map match
    for (const [category, keywords] of Object.entries(categoryHashtagMap)) {
      if (keywords.includes(hashtag)) {
        return category as BudgetCategory;
      }
    }
  }

  return null;
};

/**
 * Categorize description using local keyword matching rules when Gemini is unavailable.
 */
export const getLocalFallbackCategory = (description: string): BudgetCategory => {
  const desc = description.toLowerCase();

  const keywordMap: Record<Exclude<BudgetCategory, "Other">, string[]> = {
    "Bills": [
      "listrik", "air", "pdam", "wifi", "internet", "token", "tagihan", "kos", "kontrakan", 
      "pulsa", "kuota", "bpjs", "asuransi", "pajak", "netflix", "spotify", "bill", "bills", 
      "subscription", "langganan", "kartu kredit", "cc", "indihome", "pln", "telkom", "pbb", 
      "kredit", "first media", "biznet", "myrepublic", "pascabayar", "prabayar", "pajak motor", 
      "pajak mobil", "stnk", "e-spt", "youtube premium", "icloud", "google one", "disney+", "hbo"
    ],
    "Education": [
      "sekolah", "kuliah", "buku", "spp", "ukt", "kursus", "seminar", "alat tulis", "bimbel", 
      "bootcamp", "education", "s2", "s1", "sd", "smp", "sma", "tpa", "les", "kelas", "udemy", 
      "coursera", "pendaftaran", "tuition", "universitas", "biaya pendaftaran", "atk", "pen", 
      "pensil", "buku tulis", "fotokopi", "skripsi", "tugas", "wisuda", "jurnal", "academy", 
      "training", "sertifikasi", "iuran kelas"
    ],
    "Family Needs": [
      "popok", "susu anak", "kebutuhan anak", "belanja rumah", "jajan anak", "istri", "suami", 
      "anak", "family", "pampers", "susu", "bayi", "baby", "diapers", "ortu", "orang tua", "ibu", 
      "ayah", "kebutuhan bayi", "susu bayi", "pakaian anak", "mainan anak", "ibu mertua", "mertua", 
      "keponakan", "sepupu", "uang belanja istri", "belanja harian"
    ],
    "Food & Drinks": [
      "makan", "minum", "kopi", "cafe", "resto", "kuliner", "grabfood", "gofood", "food", 
      "beverage", "warteg", "sate", "bakso", "nasi", "teh", "boba", "starbucks", "mcd", "kfc", 
      "burger", "mie", "bakmie", "restoran", "coffe", "coffee", "snack", "jajan", "cemilan", 
      "roti", "sarapan", "dinner", "lunch", "gopay-kuliner", "shopeefood", "ice cream", "jus", 
      "juice", "soto", "martabak", "gorengan", "pecel", "ayam", "bebek", "warung", "bubur", 
      "pecel lele", "ketoprak", "gulai", "rendang", "padang", "sushi", "ramen", "pizza", 
      "donat", "kebab", "esteh", "es doger", "chatime", "kopikenangan", "kopi janji jiwa", 
      "mixue", "seblak", "siomay", "batagor", "cimol", "martabak manis", "martabak telur", 
      "taichan", "steak", "angkringan", "nasgor", "warkop", "indomie"
    ],
    "Gift and Chartiy": [
      "donasi", "zakat", "infaq", "sedekah", "kado", "hadiah", "kondangan", "nikahan", 
      "sumbangan", "gift", "charity", "amal", "tips", "thr", "kolekte", "perpuluhan", 
      "melayat", "syukuran", "angpao", "tumpengan", "saweran", "kitabisa", "sumbangan duka", 
      "karangan bunga", "hadiah wisuda", "kado nikah"
    ],
    "Groceries": [
      "belanja bulanan", "superindo", "indomaret", "alfamart", "sayur", "beras", "minyak", 
      "bumbu", "pasar", "bulanan", "hypermart", "carrefour", "minimarket", "groceries", "bawang", 
      "daging", "telur", "sabun cuci", "detergen", "detergent", "laundry", "pelembut", "supermarket", 
      "toko kelontong", "gallon", "galon", "aqua", "gas", "elpiji", "lpg", "minyak goreng", 
      "sabun mandi", "odol", "pasta gigi", "shampoo", "kondisioner", "tisu", "tissue", "pewangi", 
      "karbol", "wipol", "pembersih lantai", "beras cianjur", "rokok", "laundry kiloan", "dry clean", 
      "sayur mayur", "ikan asin", "tempe", "tahu", "cabe", "cabai"
    ],
    "Health & personal care": [
      "obat", "dokter", "rumah sakit", "klinik", "apotek", "skincare", "makeup", "potong rambut", 
      "barber", "salon", "vitamin", "sikat gigi", "sabun", "sampo", "shampoo", "masker", 
      "parasetamol", "kesehatan", "health", "personal care", "pelembab", "facial", "softlens", 
      "kacamata", "parfum", "body lotion", "sunscreen", "panadol", "bodrex", "bidan", "rs", 
      "obat batuk", "sirup", "sanaflu", "inza", "decolgen", "salonpas", "betadine", "plester", 
      "alkohol", "antiseptik", "minyak telon", "minyak kayu putih", "kapas", "pembalut", 
      "pantyliner", "pomade", "wax", "lulur", "facial wash", "serum", "sunblock", "deodorant", 
      "dokter gigi", "tambal gigi", "bpjs kesehatan"
    ],
    "Hobby & Entertaiment": [
      "bioskop", "nonton", "game", "steam", "netflix", "spotify", "konser", "karaoke", "main", 
      "topup game", "top up game", "topup ml", "hobby", "entertainment", "hiburan", "mabar", 
      "recreation", "hobi", "buku novel", "komik", "playstation", "ps5", "ps4", "xbox", 
      "nintendo", "top up", "cinema", "xxi", "cgv", "toys", "mainan", "top up ff", "top up pubg", 
      "tinder", "bumble", "dufan", "trans studio", "timezone", "warnet", "manga", "action figure", 
      "gundam", "board game", "kartu pokemon", "alat musik", "gitar", "piano", "fandom"
    ],
    "Loans": [
      "utang", "hutang", "cicilan", "bayar utang", "pinjol", "angsuran", "loan", "loans", 
      "kredit", "paylater", "shopeepaylater", "spaylater", "gopaylater", "kredivo", "akulaku", 
      "bunga", "dana cicil", "home credit", "adira", "fif", "kpr", "leasing", "pegadaian", 
      "pinjaman", "gadai", "bayar arisan", "arisan"
    ],
    "Saving & Investment": [
      "tabungan", "investasi", "reksadana", "saham", "emas", "crypto", "bibit", "ajaib", 
      "tabung", "save", "saving", "investment", "deposit", "reksa dana", "obligasi", "sbn", 
      "ori", "deposito", "pluang", "tokocrypto", "indodax", "beli emas", "logam mulia", 
      "antam", "pegadaian emas", "p2p", "p2p lending", "saham us", "bitcoin", "ethereum", 
      "usdt", "usdc"
    ],
    "Shopping": [
      "baju", "sepatu", "celana", "pakaian", "e-commerce", "shopee", "tokopedia", "lazada", 
      "mall", "beli", "olshop", "shopping", "belanjaan", "tas", "jaket", "jam tangan", "aksesoris", 
      "fashion", "kaos", "jersey", "toko", "kado pacar", "jaket hoodie", "blazer", "rok", "gaun", 
      "kardigan", "sandal", "flatshoes", "topi", "ikat pinggang", "dompet", "kacamata hitam", 
      "tote bag", "ransel", "koper", "blibli", "zalora", "uniqlo", "h&m", "zara"
    ],
    "sports": [
      "gym", "olahraga", "badminton", "futsal", "sepedaan", "running", "lari", "sepatu bola", 
      "sewa lapangan", "sports", "sport", "fitness", "yoga", "renang", "raket", "sepeda", 
      "workout", "member gym", "muay thai", "lapangan badminton", "sewa raket", "kok", "shuttlecock", 
      "kacamata renang", "tiket kolam renang", "dumble", "barbel", "pilates", "karate", "taekwondo", 
      "sepeda lipat", "running shoes"
    ],
    "Transportaion": [
      "bensin", "pertamax", "pertalite", "ojek", "grab", "gojek", "go-ride", "grab-ride", 
      "kereta", "krl", "bus", "busway", "tj", "mrt", "lrt", "tol", "parkir", "service motor", 
      "oli", "transportation", "transport", "taxi", "taksi", "angkot", "ojol", "go-car", 
      "grab-car", "shell", "spbu", "commuterline", "bengkel", "tambal ban", "pertamax turbo", 
      "solar", "dexlite", "e-toll", "flazz", "emoney", "e-money", "brizzi", "tapcash", "tiket kereta", 
      "kai", "transjakarta", "ojek online", "cuci motor", "cuci mobil", "ban bocor", "ganti ban"
    ],
    "Traveling": [
      "hotel", "tiket pesawat", "liburan", "travel", "penginapan", "staycation", "rekreasi", 
      "jalan-jalan", "traveling", "tiket", "pesawat", "kereta api", "wisata", "villa", "passport", 
      "paspor", "airbnb", "agoda", "traveloka", "koper", "tour", "pegipegi", "tiketcom", "klook", 
      "tripadvisor", "tiket wisata", "pantai", "gunung", "museum", "candi", "snorkeling", "camping"
    ]
  };

  const matched = getExplicitHashtagCategory(description);
  if (matched) {
    return matched;
  }

  for (const [category, keywords] of Object.entries(keywordMap)) {
    for (const kw of keywords) {
      const escaped = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(desc)) {
        return category as BudgetCategory;
      }
    }
  }

  return "Other";
};
