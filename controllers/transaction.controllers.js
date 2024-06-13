const Tripay = require('node-tripay');

const tripay = new Tripay({
    apiKey: 'API_KEY_ANDA',
    privateKey: 'PRIVATE_KEY_ANDA',
    merchantCode: 'MERCHANT_CODE_ANDA'
});

// Data transaksi
const transactionData = {
    method: 'BRIVA', // Metode pembayaran, misal BRIVA, BCA, OVO, dll.
    merchant_ref: 'INV123456789', // Nomor referensi transaksi Anda
    amount: 100000, // Jumlah pembayaran
    customer_name: 'John Doe', // Nama pelanggan
    customer_email: 'john.doe@example.com', // Email pelanggan
    customer_phone: '081234567890' // Nomor telepon pelanggan
};

// Membuat transaksi
tripay.createTransaction(transactionData)
    .then(response => {
        console.log('Transaksi berhasil dibuat:');
        console.log(response);
    })
    .catch(error => {
        console.error('Terjadi kesalahan saat membuat transaksi:');
        console.error(error);
    });
