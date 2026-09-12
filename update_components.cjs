const fs = require('fs');
const path = require('path');

const components = [
  'PiketHarianForm.tsx',
  'SabtuBeliTehCeriForm.tsx',
  'KebunLuasBerseriForm.tsx',
  'SenandungSerasiForm.tsx',
  'ELaporPerundunganForm.tsx',
  'BukuTamuForm.tsx',
  'MasterSiswaView.tsx',
  'MasterGuruView.tsx',
];

for (const comp of components) {
  const filePath = path.join('src', 'components', comp);
  if (!fs.existsSync(filePath)) continue;
  
  let code = fs.readFileSync(filePath, 'utf8');

  // 1. In Master Views, the save function is inside a modal submit or similar.
  if (comp.startsWith('Master')) {
    // For MasterSiswaView: `const handleSaveSiswa = (siswaData: ...) => {`
    // We change it to `const handleSaveSiswa = async (siswaData: ...) => {`
    code = code.replace(/const (handleSave(?:Siswa|Guru)) = \(([^)]+)\) => \{/, 'const $1 = async ($2) => {');
    // add await to StorageService.save
    code = code.replace(/StorageService\.save(?:Siswa|Guru)\(/g, 'await StorageService.save' + (comp === 'MasterSiswaView.tsx' ? 'Siswa' : 'Guru') + '(');
  } else {
    // For Form components: `const handleSubmit = (e: React.FormEvent) => {`
    code = code.replace(/const handleSubmit = \(e: React\.FormEvent\) => \{/, 'const handleSubmit = async (e: React.FormEvent) => {');
    code = code.replace(/StorageService\.save(\w+)\(/g, 'await StorageService.save$1(');
    
    // We should wrap the save and rest in try-catch and isSyncing.
    // Since it's tricky to find the exact end of the block, let's just make `isSyncing` true at start and false at end.
    // Actually, we can replace `await StorageService` with:
    /*
      setIsSyncing(true);
      try {
        await StorageService.saveXXX(...);
    */
    // Wait, regex for this is:
    code = code.replace(/(await StorageService\.save\w+\(\{[\s\S]*?\}\);)/, `setIsSyncing(true);\n    try {\n      $1`);
    // Then we need to find the `setActiveTab('rekap');` or `loadData();` and put `} catch (err: any) { alert(err.message); } finally { setIsSyncing(false); }`
    // Wait, let's just replace `setActiveTab('rekap');` with:
    // `setActiveTab('rekap');\n    } catch (e: any) { alert(e.message || 'Gagal menyimpan ke database cloud'); } finally { setIsSyncing(false); }`
    code = code.replace(/(setActiveTab\('rekap'\);|loadData\(\);(\s*setActiveTab\('rekap'\);)?)/g, `$1\n    } catch (err: any) {\n      alert(err.message || 'Gagal menyimpan ke database cloud Supabase');\n    } finally {\n      setIsSyncing(false);\n    }`);
  }
  
  fs.writeFileSync(filePath, code);
}
