/** Browser-only: save `isi` as a local file. Nothing is sent anywhere. */
export function unduh(namaFile: string, isi: string, type: string) {
  const url = URL.createObjectURL(new Blob([isi], { type: `${type};charset=utf-8` }));
  const a = document.createElement('a');
  a.href = url;
  a.download = namaFile;
  a.click();
  URL.revokeObjectURL(url);
}
