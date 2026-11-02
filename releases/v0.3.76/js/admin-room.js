
/*
 * BlackFoxia — Admin Room UI
 * Независимый интерфейс комнаты администратора.
 *
 * Внимание: это клиентский интерфейс,
 * а не серверная система авторизации.
 */

const STYLE_ID = 'blackfoxia-admin-room-style';

function loadStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const link = document.createElement('link');

  link.id = STYLE_ID;
  link.rel = 'stylesheet';
  link.href = new URL(
    '../css/admin-room.css',
    import.meta.url
  ).href;

  document.head.appendChild(link);
}

export function setAdminRoomMode(enabled) {
  loadStyles();

  document.body.classList.toggle(
    'admin-room-mode',
    Boolean(enabled)
  );
}

export function adminDialogMarkup() {
  return `
    <div
      class="admin500-dialog-backdrop"
      role="presentation"
    >
      <section
        class="admin500-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin500-dialog-title"
      >
        <header class="admin500-dialog-header">
          <h2 id="admin500-dialog-title">
            Комната администратора
          </h2>
        </header>

        <div class="admin500-dialog-body">
          <p>
            Независимая система окон
            администратора работает.
          </p>
        </div>

        <footer class="admin500-dialog-footer">
          <button
            type="button"
            class="admin500-dialog-button"
            data-action="admin-close-dialog"
          >
            Закрыть
          </button>
        </footer>
      </section>
    </div>
  `;
}

loadStyles();
