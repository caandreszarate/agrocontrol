// ===================================================
// Modal Reutilizable
// ===================================================
export const modal = {
  _el: null,

  init() {
    if (this._el) return;
    this._el = document.createElement('div');
    this._el.className = 'modal-backdrop hidden';
    this._el.innerHTML = `
      <div class="modal animate-scale">
        <div class="modal-header">
          <h3 class="modal-title" id="modal-title">Modal</h3>
          <button class="modal-close" id="modal-close-btn">✕</button>
        </div>
        <div class="modal-body" id="modal-body"></div>
        <div class="modal-footer hidden" id="modal-footer"></div>
      </div>
    `;
    document.body.appendChild(this._el);

    document.getElementById('modal-close-btn').addEventListener('click', () => this.close());
    this._el.addEventListener('click', (e) => {
      if (e.target === this._el) this.close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  },

  open({ title, body, footer = null, size = '' }) {
    this.init();
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = body;

    const footerEl = document.getElementById('modal-footer');
    if (footer) {
      footerEl.innerHTML = footer;
      footerEl.classList.remove('hidden');
    } else {
      footerEl.classList.add('hidden');
    }

    const modalEl = this._el.querySelector('.modal');
    modalEl.style.maxWidth = size === 'lg' ? '700px' : size === 'sm' ? '380px' : '';

    this._el.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  close() {
    if (this._el) {
      this._el.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },

  setLoading(loading) {
    const btn = this._el?.querySelector('#modal-submit-btn');
    if (btn) {
      btn.disabled = loading;
      btn.textContent = loading ? 'Guardando...' : btn.dataset.originalText;
    }
  }
};
