import WAWebJS from "whatsapp-web.js";
import { ITransaction, IUserConnected, Rekap } from "../../types";
import { Model } from "mongoose";

const rekapFormat = (month: string, year: string, outgoing: Number, incoming: Number, total: Number) => {
  const teksRekap = `
      📊 *REKAP ${month.toUpperCase()} ${year}* 📊

    📈 Pemasukan: *Rp ${incoming.toLocaleString('id-ID')}*
    📉 Pengeluaran: *Rp ${outgoing.toLocaleString('id-ID')}*
    __________________________

    Total Transaksi: ${total} kali
    `.trim();

  return teksRekap;
}

export const transactionRecordCurrentMonth = async (
  checkConnectedUser: IUserConnected,
  message: WAWebJS.Message,
  Transaction: Model<ITransaction>,
) => {
  let pengeluaran = 0;
  let pemasukan = 0;
  let jumlahTransaksi = 0;

  const getDate = new Date();
  const currentMonth = getDate.getMonth() + 1;
  const currentYear = getDate.getFullYear();

  const rekap = await Transaction.aggregate([
    {
      $match: {
        userId: checkConnectedUser.userId,
        $expr: {
          $and: [
            { $eq: [{ $month: "$date" }, currentMonth] },
            { $eq: [{ $year: "$date" }, currentYear] }
          ]
        }
      }
    },
    {
      $group: {
        _id: "$type", // Kelompokkan berdasarkan 'IN' atau 'OUT'
        total: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    }
  ]);

  rekap.forEach((item: Rekap) => {
    if (item._id === 'OUT') {
      pengeluaran = item.total;
      jumlahTransaksi = item.count;
    } else if (item._id === 'IN') {
      pemasukan = item.total;
    }
  });

  const longMonth = getDate.toLocaleString('id-ID', { month: 'long' });

  if (jumlahTransaksi === 0) {
    message.reply(`📭 *Rekap ${longMonth} ${currentYear}*\n\nBelum ada transaksi yang dicatat bulan ini.`);
  } else {
    const recordTextFormat = rekapFormat(
      longMonth,
      currentYear.toString(),
      pengeluaran,
      pemasukan,
      jumlahTransaksi
    );

    message.reply(recordTextFormat);
  }
}