import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';

/**
 * Utility to export table data to Microsoft Excel (.xlsx)
 */
export function exportToExcel(
  filename: string,
  sheetName: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const data = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Auto column widths
  const colWidths = headers.map((header, colIdx) => {
    let maxLen = header.length;
    rows.forEach((row) => {
      const cellVal = row[colIdx] != null ? String(row[colIdx]) : '';
      if (cellVal.length > maxLen) maxLen = cellVal.length;
    });
    return { wch: Math.min(Math.max(maxLen + 3, 12), 50) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Write file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Utility to export report data to Microsoft Word (.doc) with official formatting
 */
export function exportToWord(
  filename: string,
  docTitle: string,
  headers: string[],
  rows: (string | number)[][],
  subTitle?: string
) {
  const tableHeadersHtml = headers
    .map(
      (h) =>
        `<th style="background-color: #0d9488; color: #ffffff; padding: 10px; border: 1px solid #cbd5e1; font-size: 11px; text-align: left;">${h}</th>`
    )
    .join('');

  const tableRowsHtml = rows
    .map(
      (row, idx) =>
        `<tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">` +
        row
          .map(
            (cell) =>
              `<td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 11px; color: #1e293b; vertical-align: top;">${
                cell != null ? String(cell).replace(/\n/g, '<br/>') : '-'
              }</td>`
          )
          .join('') +
        `</tr>`
    )
    .join('');

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${docTitle}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; margin: 30px; color: #0f172a; }
        .kop-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; border-bottom: 3px double #000; }
        .kop-header { text-align: center; }
        .kop-title { font-size: 14pt; font-weight: bold; text-transform: uppercase; margin: 0; }
        .kop-subtitle { font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 2px 0; color: #0f766e; }
        .kop-address { font-size: 9pt; margin: 0; color: #475569; }
        .doc-title { text-align: center; font-size: 13pt; font-weight: bold; text-transform: uppercase; margin-top: 20px; margin-bottom: 5px; text-decoration: underline; }
        .doc-sub { text-align: center; font-size: 10pt; color: #64748b; margin-bottom: 20px; }
        table.data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .footer-note { margin-top: 30px; font-size: 9pt; color: #94a3b8; text-align: right; font-style: italic; }
      </style>
    </head>
    <body>
      <div className="kop-header">
        <p className="kop-title">PEMERINTAH KOTA PASURUAN - DINAS PENDIDIKAN DAN KEBUDAYAAN</p>
        <p className="kop-subtitle">UPT SMP NEGERI 7 PASURUAN</p>
        <p className="kop-address">Jl. SPG No. 8 Pasuruan • Telepon (0343) 426845 • Pos-el: smp7pas@yahoo.co.id</p>
      </div>
      <hr style="border: none; border-top: 3px double #000; margin-top: 10px; margin-bottom: 20px;" />

      <div className="doc-title">${docTitle}</div>
      ${subTitle ? `<div className="doc-sub">${subTitle}</div>` : ''}

      <table className="data-table">
        <thead>
          <tr>${tableHeadersHtml}</tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>

      <div className="footer-note">
        Dokumen rekapitulasi ini diunduh dari Sistem E-PASS TEMENAN SPANJU UPT SMPN 7 Pasuruan pada ${new Date().toLocaleDateString(
          'id-ID',
          { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        )}.
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Utility to export individual official report to Word (.doc)
 */
export function exportOfficialReportToWordDoc(
  filename: string,
  judulLaporan: string,
  nomorSurat: string | undefined,
  tanggalSurat: string | undefined,
  fields: { label: string; value: any }[],
  catatanUtama?: { judul: string; isi: string },
  pejabat?: {
    kepalaNama: string;
    kepalaNip: string;
    kepalaJabatan: string;
    kepalaTtd?: string;
    guruNama: string;
    guruNip: string;
    guruJabatan: string;
    guruTtd?: string;
  },
  linkFoto?: string
) {
  const fieldsRowsHtml = fields
    .map(
      (f) => `
      <tr>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: bold; width: 30%; background-color: #f8fafc; font-size: 11px;">${
          f.label
        }</td>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 11px; color: #1e293b;">${
          f.value != null ? String(f.value).replace(/\n/g, '<br/>') : '-'
        }</td>
      </tr>`
    )
    .join('');

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${judulLaporan}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; margin: 40px; color: #0f172a; }
        .kop-header { text-align: center; }
        .kop-title { font-size: 12pt; font-weight: bold; text-transform: uppercase; margin: 0; }
        .kop-subtitle { font-size: 15pt; font-weight: bold; text-transform: uppercase; margin: 2px 0; color: #0d9488; }
        .kop-address { font-size: 9pt; margin: 0; color: #475569; }
        .doc-title { text-align: center; font-size: 13pt; font-weight: bold; text-transform: uppercase; margin-top: 20px; margin-bottom: 2px; text-decoration: underline; }
        .doc-no { text-align: center; font-size: 10pt; color: #334155; margin-bottom: 20px; }
        table.fields-table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; }
        .catatan-box { background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; margin-bottom: 25px; }
        .catatan-title { font-weight: bold; text-transform: uppercase; font-size: 10pt; color: #0f172a; margin-bottom: 5px; }
        .ttd-table { width: 100%; margin-top: 40px; border-collapse: collapse; }
        .ttd-cell { width: 50%; text-align: center; font-size: 10pt; vertical-align: top; }
        .ttd-space { height: 70px; }
      </style>
    </head>
    <body>
      <div className="kop-header">
        <p className="kop-title">PEMERINTAH KOTA PASURUAN - DINAS PENDIDIKAN DAN KEBUDAYAAN</p>
        <p className="kop-subtitle">UPT SMP NEGERI 7 PASURUAN</p>
        <p className="kop-address">Jl. SPG No. 8 Pasuruan • Telepon (0343) 426845 • Pos-el: smp7pas@yahoo.co.id</p>
      </div>
      <hr style="border: none; border-top: 3px double #000; margin-top: 10px; margin-bottom: 20px;" />

      <div className="doc-title">${judulLaporan}</div>
      ${nomorSurat ? `<div className="doc-no">Nomor: ${nomorSurat}</div>` : ''}

      <table className="fields-table">
        <tbody>
          ${fieldsRowsHtml}
        </tbody>
      </table>

      ${
        catatanUtama
          ? `<div className="catatan-box">
              <div className="catatan-title">${catatanUtama.judul}</div>
              <div style="font-size: 10pt; color: #334155; white-space: pre-wrap;">${catatanUtama.isi}</div>
            </div>`
          : ''
      }

      ${
        linkFoto
          ? `<div style="margin-top: 15px; margin-bottom: 20px; text-align: center;">
              <p style="font-weight: bold; font-size: 10pt; text-align: left; margin-bottom: 8px; text-transform: uppercase;">Lampiran Dokumentasi Kegiatan:</p>
              <img src="${linkFoto}" style="max-width: 100%; max-height: 380px; border-radius: 8px; border: 1px solid #cbd5e1;" />
            </div>`
          : ''
      }

      ${
        pejabat
          ? `<table className="ttd-table">
              <tr>
                <td className="ttd-cell">
                  <p>Mengetahui,</p>
                  <p style="font-weight: bold;">${pejabat.kepalaJabatan}</p>
                  <div style="height: 75px; position: relative; margin: 6px auto; text-align: center;">
                    ${
                      pejabat.kepalaTtd && pejabat.kepalaTtd.startsWith('data:image')
                        ? `<img src="${pejabat.kepalaTtd}" style="height: 65px; max-width: 140px;" />
                           <img src="https://i.ibb.co.com/wrcwZdrK/STEMPEL.png" style="height: 75px; width: 75px; vertical-align: middle; margin-left: -50px; opacity: 0.85;" />`
                        : `<div className="ttd-space"></div>`
                    }
                  </div>
                  <p style="font-weight: bold; text-decoration: underline;">${pejabat.kepalaNama}</p>
                  <p style="font-size: 9pt;">NIP. ${pejabat.kepalaNip}</p>
                </td>
                <td className="ttd-cell">
                  <p>Pasuruan, ${tanggalSurat || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p style="font-weight: bold;">${pejabat.guruJabatan}</p>
                  <div style="height: 75px; margin: 6px auto; text-align: center;">
                    ${
                      pejabat.guruTtd && pejabat.guruTtd.startsWith('data:image')
                        ? `<img src="${pejabat.guruTtd}" style="height: 65px; max-width: 140px;" />`
                        : `<div className="ttd-space"></div>`
                    }
                  </div>
                  <p style="font-weight: bold; text-decoration: underline;">${pejabat.guruNama}</p>
                  <p style="font-size: 9pt;">NIP. ${pejabat.guruNip}</p>
                </td>
              </tr>
            </table>`
          : ''
      }

    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Utility to export a DOM element directly to a downloadable PDF file (.pdf)
 */
export async function exportElementToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id '${elementId}' not found for PDF export.`);
    return;
  }

  const opt = {
    margin: [8, 8, 8, 8],
    filename: `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  try {
    // @ts-ignore
    await html2pdf().set(opt).from(element).save();
  } catch (err) {
    console.error('html2pdf error, attempting canvas fallback:', err);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}.pdf`);
    } catch (fallbackErr) {
      console.error('PDF generation failed completely:', fallbackErr);
      alert('Gagal mengunduh PDF secara langsung. Membuka dialog cetak...');
      window.print();
    }
  }
}

/**
 * Utility to trigger browser print dialog cleanly for a specific DOM element.
 * Works reliably inside iframe, desktop, and mobile browsers.
 */
export function triggerPrintElement(elementId: string, docTitle: string = 'Laporan Resmi') {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'print-engine-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    window.print();
    return;
  }

  const stylesHtml = Array.from(
    document.querySelectorAll('style, link[rel="stylesheet"]')
  )
    .map((el) => el.outerHTML)
    .join('\n');

  const contentHtml = element.innerHTML;

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <title>${docTitle}</title>
        ${stylesHtml}
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          *, *::before, *::after {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
            margin: 0 !important;
            padding: 10px !important;
          }
          .print\\:hidden, button, .no-print {
            display: none !important;
          }
          .dark {
            color-scheme: light !important;
          }
        </style>
      </head>
      <body>
        <div class="printable-root">
          ${contentHtml}
        </div>
      </body>
    </html>
  `);
  iframeDoc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn('Iframe print error, falling back to window.print():', e);
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }
  }, 600);
}
