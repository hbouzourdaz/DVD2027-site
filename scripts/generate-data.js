const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const rootArg = process.argv[2] || 'E:\\DVD2027\\files';
const outArg = process.argv[3] || 'data.json';
const root = path.resolve(rootArg);
const outPath = path.resolve(outArg);

const CAT = [
  [/^(pdf|doc|docx|ppt|pptx|txt|rtf|odt)$/, 'مستند/درس'],
  [/^(xls|xlsx|csv)$/, 'جدول/تمارين'],
  [/^(jpg|jpeg|png|webp|gif|svg)$/, 'صورة/رسم'],
  [/^(mp4|avi|mkv|mov|webm)$/, 'فيديو'],
  [/^(mp3|wav|m4a|ogg)$/, 'صوت'],
  [/^(zip|rar|7z)$/, 'أرشيف'],
  [/^(html|htm)$/, 'صفحة ويب'],
  [/^(exe|msi|bat|cmd)$/, 'برنامج']
];
function category(ext) {
  for (const [re, cat] of CAT) if (re.test(ext)) return cat;
  return 'أخرى';
}

const psScript = `
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$root = '${root.replace(/'/g, "''")}'
function Walk($dir){
  try { $children = @(Get-ChildItem -LiteralPath $dir -Force -ErrorAction Stop) } catch { return }
  foreach($c in $children){
    if($c.PSIsContainer){
      $isLink = $false
      try { $isLink = [bool]($c.Attributes -band [IO.FileAttributes]::ReparsePoint) } catch { $isLink = $false }
      if($isLink){ continue }
      Walk $c.FullName
    } else {
      if(($c.Attributes -band [IO.FileAttributes]::Hidden) -or ($c.Attributes -band [IO.FileAttributes]::System)){ continue }
      if($c.Name -eq '.gitkeep'){ continue }
      $rel = $c.FullName.Substring($root.Length + 1)
      $ext = ''
      if($c.Extension){ $ext = $c.Extension.Substring(1).ToLowerInvariant() }
      $o = [ordered]@{ p=$rel; n=$c.Name; e=$ext; s=[math]::Round([double]$c.Length/1MB, 2); d=$c.LastWriteTime.ToString('yyyy-MM-dd') }
      [Console]::WriteLine((ConvertTo-Json $o -Compress))
    }
  }
}
if(Test-Path -LiteralPath $root){ Walk $root }
`;

console.log('Scanning ' + root + ' (read-only) ...');
const b64 = Buffer.from(psScript, 'utf16le').toString('base64');
let stdout;
try {
  stdout = execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', b64], { maxBuffer: 512 * 1024 * 1024 });
} catch (e) {
  console.error('PowerShell scan failed:', e.message);
  process.exit(1);
}

const lines = stdout.toString('utf8').split(/\r?\n/).filter(l => l.startsWith('{'));
const data = lines.map(l => {
  const o = JSON.parse(l);
  const seg = o.p.split('\\');
  o.g = seg.length > 1 ? seg[0] : '';
  o.c = category(o.e);
  return o;
});

fs.writeFileSync(outPath, JSON.stringify(data));
fs.writeFileSync(path.join(path.dirname(outPath), 'data.js'), 'window.DVD2027_DATA = ' + JSON.stringify(data) + ';');
const totalMB = data.reduce((a, f) => a + f.s, 0);
console.log('Wrote ' + outPath + ' (+ data.js) with ' + data.length + ' records — ' + (totalMB / 1024).toFixed(2) + ' GB');
