import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, Users, Plus, Check, X, Search, ChevronDown, CheckSquare, Square } from 'lucide-react';
import { SiswaItem } from '../types';
import { StorageService } from '../services/storage';

interface StudentPickerWidgetProps {
  title?: string;
  targetRoleLabel?: string;
  value: string;
  classValue: string;
  onValueChange: (val: string) => void;
  onClassChange: (cls: string) => void;
  defaultClass?: string;
  colorScheme?: 'red' | 'blue';
  autoFormatClassPrefix?: boolean; // e.g. "Kelas 7A" vs "7A"
}

export const StudentPickerWidget: React.FC<StudentPickerWidgetProps> = ({
  title = 'Pilih atau Input Siswa:',
  targetRoleLabel = 'Nama Siswa',
  value,
  classValue,
  onValueChange,
  onClassChange,
  defaultClass = '7A',
  colorScheme = 'red',
  autoFormatClassPrefix = false,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(defaultClass);
  const [singleSearchText, setSingleSearchText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMultiModalOpen, setIsMultiModalOpen] = useState(false);
  const [multiSearchText, setMultiSearchText] = useState('');
  const [multiSelectedNames, setMultiSelectedNames] = useState<string[]>([]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const KELAS_LIST_7 = ['7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H'];
  const KELAS_LIST_8 = ['8A', '8B', '8C', '8D', '8E', '8F', '8G', '8H'];
  const KELAS_LIST_9 = ['9A', '9B', '9C', '9D', '9E', '9F', '9G', '9H'];

  // Get all students from masterSiswa
  const allMasterSiswa: SiswaItem[] = useMemo(() => {
    try {
      const db = StorageService.getDb();
      return Array.isArray(db.masterSiswa) ? db.masterSiswa : [];
    } catch {
      return [];
    }
  }, []);

  // Class counts mapping for badges/options
  const classCounts = useMemo(() => {
    const map: Record<string, number> = {};
    allMasterSiswa.forEach((s) => {
      const k = (s.kelas || '').trim().toUpperCase();
      map[k] = (map[k] || 0) + 1;
    });
    return map;
  }, [allMasterSiswa]);

  // Filter students for the current selected class
  const classStudents = useMemo(() => {
    return allMasterSiswa.filter(
      (s) => s.kelas.trim().toUpperCase() === selectedClass.trim().toUpperCase()
    );
  }, [allMasterSiswa, selectedClass]);

  // Filtered students for single-select dropdown
  const filteredSingleStudents = useMemo(() => {
    const q = singleSearchText.trim().toLowerCase();
    if (!q) return classStudents;
    return classStudents.filter(
      (s) =>
        s.namaLengkap.toLowerCase().includes(q) ||
        (s.nis && s.nis.toLowerCase().includes(q)) ||
        (s.nisn && s.nisn.toLowerCase().includes(q))
    );
  }, [classStudents, singleSearchText]);

  // Filtered students for multi-select modal
  const filteredMultiStudents = useMemo(() => {
    const q = multiSearchText.trim().toLowerCase();
    if (!q) return classStudents;
    return classStudents.filter(
      (s) =>
        s.namaLengkap.toLowerCase().includes(q) ||
        (s.nis && s.nis.toLowerCase().includes(q))
    );
  }, [classStudents, multiSearchText]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync class formatting
  const applyClassValue = (cls: string) => {
    const formatted = autoFormatClassPrefix ? (cls.startsWith('Kelas ') ? cls : `Kelas ${cls}`) : cls;
    onClassChange(formatted);
  };

  // Extract currently entered names as array
  const currentNamesList = useMemo(() => {
    if (!value || !value.trim()) return [];
    return value
      .split(/[,;\n]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
  }, [value]);

  // Add single student
  const handleAddSingleStudent = (nameToAdd?: string) => {
    const candidate = (nameToAdd || singleSearchText).trim();
    if (!candidate) return;

    // Check if name already in list
    const existing = currentNamesList.map((n) => n.toLowerCase());
    if (existing.includes(candidate.toLowerCase())) {
      setSingleSearchText('');
      setIsDropdownOpen(false);
      return;
    }

    const updated = [...currentNamesList, candidate];
    onValueChange(updated.join(', '));
    applyClassValue(selectedClass);
    setSingleSearchText('');
    setIsDropdownOpen(false);
  };

  // Remove one student chip
  const handleRemoveStudent = (nameToRemove: string) => {
    const updated = currentNamesList.filter(
      (n) => n.toLowerCase() !== nameToRemove.toLowerCase()
    );
    onValueChange(updated.join(', '));
  };

  // Open multi-modal and initialize with existing selections
  const handleOpenMultiModal = () => {
    const initial = classStudents
      .filter((s) => currentNamesList.some((c) => c.toLowerCase() === s.namaLengkap.toLowerCase()))
      .map((s) => s.namaLengkap);
    setMultiSelectedNames(initial);
    setMultiSearchText('');
    setIsMultiModalOpen(true);
  };

  // Toggle multi-select checkbox
  const handleToggleMultiItem = (name: string) => {
    setMultiSelectedNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // Select all visible in multi modal
  const handleSelectAllMulti = () => {
    const allNames = filteredMultiStudents.map((s) => s.namaLengkap);
    setMultiSelectedNames((prev) => Array.from(new Set([...prev, ...allNames])));
  };

  // Clear all in multi modal
  const handleClearAllMulti = () => {
    setMultiSelectedNames([]);
  };

  // Apply multi selection
  const handleApplyMulti = () => {
    // Keep names that are from other sources/classes, plus newly selected
    const nonClassNames = currentNamesList.filter(
      (name) => !classStudents.some((s) => s.namaLengkap.toLowerCase() === name.toLowerCase())
    );
    const combined = Array.from(new Set([...nonClassNames, ...multiSelectedNames]));
    onValueChange(combined.join(', '));
    if (multiSelectedNames.length > 0) {
      applyClassValue(selectedClass);
    }
    setIsMultiModalOpen(false);
  };

  const isRed = colorScheme === 'red';

  return (
    <div className="w-full bg-slate-50/60 dark:bg-slate-900/50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
      {/* Title matching user's screenshot */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight">
          {title}
        </h4>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Kelas:</span>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              applyClassValue(e.target.value);
            }}
            className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <optgroup label="Kelas 7 (7A - 7H)">
              {KELAS_LIST_7.map((k) => (
                <option key={k} value={k}>
                  Kelas {k} ({classCounts[k] || 0} Siswa)
                </option>
              ))}
            </optgroup>
            <optgroup label="Kelas 8 (8A - 8H)">
              {KELAS_LIST_8.map((k) => (
                <option key={k} value={k}>
                  Kelas {k} ({classCounts[k] || 0} Siswa)
                </option>
              ))}
            </optgroup>
            <optgroup label="Kelas 9 (9A - 9H)">
              {KELAS_LIST_9.map((k) => (
                <option key={k} value={k}>
                  Kelas {k} ({classCounts[k] || 0} Siswa)
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Subheader Row matching screenshot: [Icon + Pilih Nama Siswa + Badge] ... [Multi-Pilih Siswa (>10)] */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <User className={`w-4 h-4 ${isRed ? 'text-rose-500' : 'text-blue-500'}`} />
            <span>Pilih {targetRoleLabel}</span>
          </div>

          {/* Badge: "32 Siswa Tersedia" (in screenshot style) */}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              isRed
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
            }`}
          >
            {classStudents.length} Siswa Tersedia
          </span>
        </div>

        {/* Multi-Pilih Button matching screenshot */}
        <button
          type="button"
          onClick={handleOpenMultiModal}
          className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-2 transition-all shadow-xs ${
            isRed
              ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
              : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950/70 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
          }`}
          title="Pilih beberapa siswa sekaligus"
        >
          <Users className="w-4 h-4" />
          <div className="text-left leading-tight">
            <div>Multi-Pilih Siswa</div>
            <div className="text-[10px] font-medium opacity-80">(&gt;10 / Banyak)</div>
          </div>
        </button>
      </div>

      {/* Input container with User icon + search/typing input + [Pilih] button */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-rose-500 focus-within:border-transparent transition-all shadow-xs">
          <User className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={singleSearchText}
            onChange={(e) => {
              setSingleSearchText(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSingleStudent();
              }
            }}
            placeholder="Ketik / pilih nama siswa..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
          />

          {singleSearchText && (
            <button
              type="button"
              onClick={() => setSingleSearchText('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors shrink-0 ${
              isRed
                ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
            }`}
          >
            Pilih
          </button>
        </div>

        {/* Dropdown list of students */}
        {isDropdownOpen && (
          <div className="absolute z-30 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
            <div className="p-2 bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10 flex items-center justify-between text-[11px] font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <span>Daftar Siswa Kelas {selectedClass} ({filteredSingleStudents.length})</span>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Tutup
              </button>
            </div>

            {filteredSingleStudents.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500">
                Tidak ada siswa yang cocok dengan &quot;{singleSearchText}&quot;
              </div>
            ) : (
              filteredSingleStudents.map((siswa, idx) => {
                const isAlreadySelected = currentNamesList.some(
                  (n) => n.toLowerCase() === siswa.namaLengkap.toLowerCase()
                );
                return (
                  <button
                    key={siswa.id || idx}
                    type="button"
                    onClick={() => {
                      setSingleSearchText(siswa.namaLengkap);
                      handleAddSingleStudent(siswa.namaLengkap);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                      isAlreadySelected
                        ? 'bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 w-5">
                        {idx + 1}.
                      </span>
                      <div>
                        <div className="font-bold">{siswa.namaLengkap}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>NIS: {siswa.nis}</span>
                          <span>JK: {siswa.jenisKelamin}</span>
                        </div>
                      </div>
                    </div>
                    {isAlreadySelected ? (
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Terpilih
                      </span>
                    ) : (
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                        + Tambah
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Prominent Action Button matching screenshot: [+ Tambah 1 Siswa Ini] */}
      <button
        type="button"
        onClick={() => handleAddSingleStudent()}
        disabled={!singleSearchText.trim()}
        className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] ${
          !singleSearchText.trim()
            ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-70'
            : isRed
            ? 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 shadow-rose-500/20'
            : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-blue-500/20'
        }`}
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        <span>+ Tambah 1 Siswa Ini</span>
      </button>

      {/* Chips of currently selected students */}
      {currentNamesList.length > 0 && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-600 dark:text-slate-400">
              Siswa Terpilih ({currentNamesList.length}):
            </span>
            <button
              type="button"
              onClick={() => onValueChange('')}
              className="text-rose-500 hover:text-rose-700 font-bold hover:underline"
            >
              Bersihkan Semua
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
            {currentNamesList.map((name, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
              >
                <span>{name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveStudent(name)}
                  className="p-0.5 rounded hover:bg-rose-100 dark:hover:bg-rose-950/80 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Hapus siswa ini"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Modal Multi-Pilih Siswa */}
      {isMultiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${isRed ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'}`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                    Multi-Pilih Siswa Kelas {selectedClass}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pilih beberapa siswa atau seluruh anggota kelompok (&gt;10 siswa)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMultiModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter and Quick Actions */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={multiSearchText}
                    onChange={(e) => setMultiSearchText(e.target.value)}
                    placeholder="Cari nama atau NIS siswa..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    applyClassValue(e.target.value);
                  }}
                  className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500 shrink-0"
                >
                  <optgroup label="Kelas 7 (7A - 7H)">
                    {KELAS_LIST_7.map((k) => (
                      <option key={k} value={k}>
                        Kelas {k} ({classCounts[k] || 0})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Kelas 8 (8A - 8H)">
                    {KELAS_LIST_8.map((k) => (
                      <option key={k} value={k}>
                        Kelas {k} ({classCounts[k] || 0})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Kelas 9 (9A - 9H)">
                    {KELAS_LIST_9.map((k) => (
                      <option key={k} value={k}>
                        Kelas {k} ({classCounts[k] || 0})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllMulti}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Pilih Semua ({filteredMultiStudents.length})
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={handleClearAllMulti}
                    className="font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:underline"
                  >
                    Batal Semua
                  </button>
                </div>
                <span className="font-extrabold text-rose-600 dark:text-rose-400">
                  {multiSelectedNames.length} Siswa Dipilih
                </span>
              </div>
            </div>

            {/* Checklist of students */}
            <div className="p-3 overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-slate-800 flex-1">
              {filteredMultiStudents.map((siswa, idx) => {
                const isChecked = multiSelectedNames.includes(siswa.namaLengkap);
                return (
                  <div
                    key={siswa.id || idx}
                    onClick={() => handleToggleMultiItem(siswa.namaLengkap)}
                    className={`pt-1.5 pb-1.5 px-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-rose-50/70 dark:bg-rose-950/40 text-slate-900 dark:text-white'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isChecked
                            ? 'bg-rose-600 border-rose-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                        }`}
                      >
                        {isChecked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                      </button>
                      <div>
                        <div className="text-xs font-bold">{siswa.namaLengkap}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>NIS: {siswa.nis}</span>
                          <span>JK: {siswa.jenisKelamin}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Total: <span className="text-slate-900 dark:text-white">{multiSelectedNames.length}</span> siswa terpilih
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMultiModalOpen(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplyMulti}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all"
                >
                  Gunakan {multiSelectedNames.length} Siswa Terpilih
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
