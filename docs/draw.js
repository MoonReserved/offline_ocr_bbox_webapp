// draw.js — extract drawItem as a global for reuse
(function(){
  function drawItem(item, selections){
    const canvas = document.getElementById('canvas-'+item.id);
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      item.imgW = img.naturalWidth;
      item.imgH = img.naturalHeight;

      const containerW = canvas.parentElement.clientWidth;
      const cssW = Math.min(item.imgW, containerW);
      const cssH = Math.round(item.imgH * (cssW / item.imgW));
      const dpr = window.devicePixelRatio || 1;

      canvas.style.width  = cssW + 'px';
      canvas.style.height = cssH + 'px';
      canvas.width  = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.drawImage(img, 0, 0, cssW, cssH);

      const s = cssW / item.imgW;
      item.scaleCSS = s;

      if (item.words && item.words.length){
        ctx.lineWidth = 2;
        item.words.forEach((w, idx) => {
          const { x0, y0, x1, y1 } = w.bbox;
          const x = x0 * s, y = y0 * s, wdt = (x1 - x0) * s, hgt = (y1 - y0) * s;
          const sel = selections.get(item.id)?.has(idx);
          ctx.strokeStyle = sel ? '#2a7' : '#07f';
          ctx.strokeRect(x, y, wdt, hgt);
          if (sel){
            ctx.globalAlpha = 0.15; ctx.fillStyle = '#2a7';
            ctx.fillRect(x, y, wdt, hgt); ctx.globalAlpha = 1.0;
          }
        });
      }

      canvas.onclick = (ev) => {
        if (!item.words) return;
        const rect = canvas.getBoundingClientRect();
        const cx = ev.clientX - rect.left;
        const cy = ev.clientY - rect.top;
        const s = item.scaleCSS;
        let hit = -1;
        for (let i=0;i<item.words.length;i++){
          const b = item.words[i].bbox;
          const x=b.x0*s, y=b.y0*s, w=(b.x1-b.x0)*s, h=(b.y1-b.y0)*s;
          if (cx>=x && cx<=x+w && cy>=y && cy<=y+h){ hit=i; break; }
        }
        if (hit>=0){
          let set = selections.get(item.id);
          if (!set){ set = new Set(); selections.set(item.id, set); }
          if (set.has(hit)) set.delete(hit); else set.add(hit);
          if (typeof window._afterSelect === 'function') window._afterSelect(item);
        }
      };
    };
    img.src = item.url;
  }
  window.drawItem = drawItem;
})();