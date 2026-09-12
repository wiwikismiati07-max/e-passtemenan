import fs from 'fs';

let code = fs.readFileSync('src/services/storage.ts', 'utf8');

const targets = [
  'savePiketHarian',
  'saveSabtuBeliTehCeri',
  'saveKebunLuasBerseri',
  'saveSenandungSerasi',
  'saveELapor',
  'saveBukuTamu',
  'saveSiswa',
  'saveGuru'
];

for (const method of targets) {
  const regex = new RegExp(`(public static async ${method}[\\s\\S]*?)(this\\.unmarkDeleted\\(saved\\.id\\);\\s*this\\.saveDb\\(\\);)([\\s\\S]*?throw new Error\\(upsertRes\\.error\\.message \\|\\| 'Gagal menyimpan ke Supabase'\\);\\s*\\})`);
  
  code = code.replace(regex, (match, before, localSave, after) => {
    return `${before}${after}\n    ${localSave}`;
  });
}

fs.writeFileSync('src/services/storage.ts', code);
