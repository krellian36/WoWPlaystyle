// PNG and ZIP export. Renders a clean, non-editable copy off-screen and turns it into an image.
import { sheetHTML, tooltipHTML } from './render.js';
import { slug, iconUrl, FALLBACK_ICON } from './model.js';

const PIXEL_RATIO = 2;

// A dark square drawn locally, for when Wowhead can't be reached at all.
let blankIcon = '';
function blankIconUrl() {
  if (!blankIcon) {
    const canvas = Object.assign(document.createElement('canvas'), { width: 1, height: 1 });
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1b1d24';
    ctx.fillRect(0, 0, 1, 1);
    blankIcon = canvas.toDataURL();
  }
  return blankIcon;
}

// A broken or unreachable icon must never stop an export: swap in the question mark, and if even
// that can't load, a local blank square. html-to-image rejects outright on any image it can't fetch.
async function settleImage(img) {
  try {
    await img.decode();
    return;
  } catch { /* fall through to the question mark */ }
  img.src = iconUrl(FALLBACK_ICON, img.src.includes('/medium/') ? 'medium' : 'large');
  try {
    await img.decode();
  } catch {
    img.src = blankIconUrl();
    await img.decode().catch(() => {});
  }
}

async function renderPng(html) {
  const { toBlob } = await import('./vendor/html-to-image.js');
  const host = document.createElement('div');
  host.className = 'export-host';
  host.innerHTML = html;
  document.body.append(host);
  try {
    await document.fonts.ready;
    await Promise.all([...host.querySelectorAll('img')].map(settleImage));
    const blob = await toBlob(host.firstElementChild, { pixelRatio: PIXEL_RATIO });
    if (!blob) throw new Error('the browser returned an empty image');
    return blob;
  } finally {
    host.remove();
  }
}

const tooltipBlock = (p, item) => `<div class="tooltip-export">${tooltipHTML(item, p)}</div>`;

export async function exportSheet(p) {
  return { blob: await renderPng(sheetHTML(p)), filename: `${slug(p.name)}.png` };
}

export async function exportTooltip(p, item) {
  return { blob: await renderPng(tooltipBlock(p, item)), filename: `${slug(p.name)}-${slug(item.name || 'item')}.png` };
}

export async function exportAllTooltips(p) {
  const { zipSync } = await import('./vendor/fflate.js');
  const files = {};
  for (const [index, item] of p.items.entries()) {
    const base = slug(item.name || `item-${index + 1}`);
    let name = `${base}.png`;
    for (let n = 2; files[name]; n += 1) name = `${base}-${n}.png`;
    files[name] = new Uint8Array(await (await renderPng(tooltipBlock(p, item))).arrayBuffer());
  }
  // PNGs are already compressed; storing them is faster and the ZIP is no bigger.
  const zip = zipSync(files, { level: 0 });
  return { blob: new Blob([zip], { type: 'application/zip' }), filename: `${slug(p.name)}-tooltips.zip` };
}

export function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
