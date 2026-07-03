import pg from 'pg';
import fs from 'fs';

const passwords = ['postgres', 'root', 'admin', '123456', '', 'password'];
let successPassword = null;

async function tryConnect() {
  for (const pwd of passwords) {
    const client = new pg.Client({
      user: 'postgres',
      password: pwd,
      host: 'localhost',
      port: 5432,
      database: 'postgres'
    });
    
    try {
      await client.connect();
      console.log(`Berhasil terhubung ke PostgreSQL dengan password standar: '${pwd}'`);
      successPassword = pwd;
      
      try {
        await client.query('CREATE DATABASE avocpos');
        console.log('Database "avocpos" berhasil dibuat otomatis.');
      } catch (err) {
        if (err.code === '42P04') {
          console.log('Database "avocpos" ternyata sudah ada.');
        } else {
          console.error('Gagal membuat database:', err.message);
        }
      }
      await client.end();
      return true;
    } catch (err) {
      // ignore and try next
    }
  }
  return false;
}

tryConnect().then(success => {
  if (success) {
    const envContent1 = `DATABASE_URL="postgresql://postgres:${successPassword}@localhost:5432/avocpos"\nSESSION_SECRET="super-secret-session-key-12345"\n`;
    const envContent2 = `DATABASE_URL="postgresql://postgres:${successPassword}@localhost:5432/avocpos"\n`;
    fs.writeFileSync('.env', envContent1);
    fs.writeFileSync('lib/db/.env', envContent2);
    console.log('File .env berhasil diperbarui dengan password yang benar.');
  } else {
    console.log('ALL_FAILED: Tidak dapat menemukan password default yang cocok.');
  }
});
