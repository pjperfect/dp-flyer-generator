// DP / Flyer Generator (client-side)
(() => {
  const CANVAS_SIZE = 2048;

  // Circle placement (derived from the frame's transparent hole)
  const cx = 1024.0;
  const cy = 1275.0;
  const diameter = 607; // pixels
  const r = diameter / 2;

  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');

  const fileInput = document.getElementById('file');
  const zoomEl = document.getElementById('zoom');
  const offxEl = document.getElementById('offx');
  const offyEl = document.getElementById('offy');
  const resetBtn = document.getElementById('reset');
  const dlBtn = document.getElementById('download');

  // Fullscreen preview modal
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modalImg');
  const closeModalBtn = document.getElementById('closeModal');

  const frameImg = new Image();
  frameImg.src = 'frame.png';

  let userImg = null;

  function drawPlaceholder() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // soft placeholder circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = '#cfcfd6';
    ctx.fillRect(cx - r, cy - r, diameter, diameter);
    ctx.restore();

    // draw frame on top (if ready)
    if (frameImg.complete) {
      ctx.drawImage(frameImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    } else {
      frameImg.onload = () => {
        ctx.drawImage(frameImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      };
    }
  }

  function render() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const zoom = parseFloat(zoomEl.value);
    const offx = parseFloat(offxEl.value);
    const offy = parseFloat(offyEl.value);

    // 1) Draw user's image clipped inside a circle
    if (userImg) {
      const iw = userImg.naturalWidth || userImg.width;
      const ih = userImg.naturalHeight || userImg.height;

      // cover-fit: scale so the circle is fully covered
      const baseScale = Math.max(diameter / iw, diameter / ih);
      const scale = baseScale * zoom;

      const sw = iw * scale;
      const sh = ih * scale;

      const dx = cx - sw / 2 + offx;
      const dy = cy - sh / 2 + offy;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(userImg, dx, dy, sw, sh);
      ctx.restore();
    } else {
      // no user image: placeholder
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#cfcfd6';
      ctx.fillRect(cx - r, cy - r, diameter, diameter);
      ctx.restore();
    }

    // 2) Draw the frame on top
    if (frameImg.complete) {
      ctx.drawImage(frameImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
  }

  function resetControls() {
    zoomEl.value = '1.2';
    offxEl.value = '0';
    offyEl.value = '0';
    render();
  }

  fileInput.addEventListener('change', () => {
    const f = fileInput.files && fileInput.files[0];
    if (!f) return;

    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      userImg = img;
      dlBtn.disabled = false;
      resetControls();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });

  [zoomEl, offxEl, offyEl].forEach((el) =>
    el.addEventListener('input', render)
  );

  resetBtn.addEventListener('click', () => {
    resetControls();
  });

  dlBtn.addEventListener('click', () => {
    // Export PNG
    const a = document.createElement('a');
    a.download = 'flyer.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  });

  // Full screen preview
  function openModal() {
    // Render a fresh frame and show as an image (fast + sharp on mobile)
    modalImg.src = canvas.toDataURL('image/png');
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('noscroll');
  }
  function closeModal() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('noscroll');
  }

  canvas.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // initial
  frameImg.onload = () => {
    drawPlaceholder();
  };
  drawPlaceholder();
})();
