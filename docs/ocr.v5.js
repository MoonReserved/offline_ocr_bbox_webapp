// ocr.v5.js — Scheme A: display the SAME downscaled blob used for OCR
(function(){
  const filesEl = document.getElementById('files');
  const startEl = document.getElementById('start');
  const langEl = document.getElementById('lang');
  const grid = document.getElementById('grid');
  const exportEl = document.getElementById('export');
  const selCountEl = document.getElementById('selCount');
  const copyBtn = document.getElementById('copy');
  const clearSelBtn = document.getElementById('clearSel');
  const autoStart = document.getElementById('autostart');

  // v5 worker
  let worker = null;
  async function ensureWorker(lang){
    if (worker) return worker;
    worker = await Tesseract.createWorker(
      lang, 1,
      { workerPath:'tesseract/worker.min.js',
        corePath:'tesseract/tesseract-core.wasm.js',
        langPath:'tessdata',
        logger: m => console.log(m) }
    );
    await worker.setParameters({
      preserve_interword_spaces:'1',
      tessedit_pageseg_mode:'6'
    });
    return worker;
  }

  // state
  let items = [];
  let selections = new Map();

  function updateSelCount(){
    let n = 0; selections.forEach(s => n += s.size);
    selCountEl.textContent = n + ' selected';
  }

  function renderItemCard(item){
    const card = document.createElement('div'); card.className='card'; card.dataset.id=item.id;
    const head = document.createElement('div'); head.className='head';
    head.innerHTML = `<div>${item.file.name}</div><div class="badge" id="badge-${item.id}">queued</div>`;
    card.appendChild(head);
    const wrap = document.createElement('div'); wrap.className='canvas-wrap';
    const canvas = document.createElement('canvas'); canvas.id='canvas-'+item.id;
    wrap.appendChild(canvas); card.appendChild(wrap);
    const status = document.createElement('div'); status.className='legend'; status.id='status-'+item.id; status.textContent='waiting...';
    card.appendChild(status);
    grid.appendChild(card);
  }

  function buildExport(){
    const parts = [];
    for (const item of items){
      const set = selections.get(item.id);
      if (!set || set.size === 0) continue;
      const indices = [...set].sort((a,b)=>a-b);
      const text = indices.map(i => item.words[i].text).join(' ');
      parts.push(`# ${item.file.name}\n${text}`);
    }
    exportEl.value = parts.join('\n\n');
  }

  // downscale, return blob
  async function downscaleBlob(file, maxW=1600, maxH=1600){
    const imgURL = URL.createObjectURL(file);
    const img = await new Promise(r => { const i=new Image(); i.onload=()=>r(i); i.src=imgURL; });
    const scale = Math.min(1, maxW/img.naturalWidth, maxH/img.naturalHeight);
    if (scale === 1) return file;
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth*scale);
    c.height = Math.round(img.naturalHeight*scale);
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return await new Promise(res => c.toBlob(b=>res(b), 'image/jpeg', 0.85));
  }

  async function ocrOne(item, lang){
    const badge = document.getElementById('badge-'+item.id);
    const status = document.getElementById('status-'+item.id);
    badge.textContent='loading'; status.textContent='initializing...';
    const w = await ensureWorker(lang);
    badge.textContent='running'; status.textContent='recognizing...';

    // SCHEME A: use the same downscaled blob for OCR and display
    const blob = await downscaleBlob(item.file, 1600, 1600);
    const urlFromBlob = URL.createObjectURL(blob);
    item.url = urlFromBlob; // display exactly the same image as OCR uses

    const { data } = await w.recognize(blob);
    const words = (data.words || []).map(w => ({ text:w.text, bbox:{x0:w.bbox.x0,y0:w.bbox.y0,x1:w.bbox.x1,y1:w.bbox.y1}, conf:w.confidence }));
    item.words = words;

    badge.textContent=`done (${words.length} boxes)`; status.textContent='tap boxes to select';
    window.drawItem(item, selections);
    updateSelCount(); buildExport();
  }

  function reset(){
    items=[]; selections=new Map(); grid.innerHTML=''; exportEl.value=''; updateSelCount();
  }

  filesEl.addEventListener('change', () => {
    reset();
    const list = Array.from(filesEl.files || []);
    list.forEach((f, idx) => {
      const id = `img_${Date.now()}_${idx}`;
      const url = URL.createObjectURL(f); // temporary preview before OCR
      const it = { id, file:f, url, words:[] };
      items.push(it); renderItemCard(it);
      window.drawItem(it, selections);
    });
    if (autoStart.checked) startEl.click();
  });

  window._afterSelect = function(item){ window.drawItem(item, selections); buildExport(); };

  startEl.addEventListener('click', async () => {
    if (!items.length){ alert('Select images first'); return; }
    const lang = langEl.value;
    for (const it of items){ await ocrOne(it, lang); }
    if (worker){ await worker.terminate(); worker=null; }
  });

  copyBtn.onclick = async () => {
    try { await navigator.clipboard.writeText(exportEl.value); copyBtn.textContent='Copied'; setTimeout(()=>copyBtn.textContent='Copy', 900); }
    catch(e){ alert('Copy failed'); }
  };
  clearSelBtn.onclick = () => { selections = new Map(); updateSelCount(); items.forEach(it => window.drawItem(it, selections)); buildExport(); };
})();