/**
 * admin-shared.js — Career Assessment System
 * True accordion sidebar: open one → all others close automatically.
 */

const ADMIN_NAV = [
  { type:'link', label:'Dashboard', icon:'bi-grid-1x2-fill',
    href:'../dashboard/dashboard.html' },

  { type:'group', id:'g-users', label:'Users', icon:'bi-people',
    items:[
      { label:'User Management', icon:'bi-person-lines-fill', href:'../users/users.html' }
    ]
  },
  { type:'group', id:'g-assessment', label:'Assessment', icon:'bi-clipboard-check',
    items:[
      { label:'Questions',        icon:'bi-patch-question', href:'../questions/questions.html' },
      { label:'Categories',       icon:'bi-grid-3x3-gap',   href:'../categories/categories.html' },
      { label:'Score Management', icon:'bi-sliders',        href:'../scoring/scoring.html' }
    ]
  },
  { type:'group', id:'g-config', label:'Configuration', icon:'bi-sliders2',
    items:[
      { label:'Personality',  icon:'bi-emoji-smile', href:'../personality/personality.html' },
      { label:'Interests',    icon:'bi-heart',       href:'../interests/interests.html' },
      { label:'Skills',       icon:'bi-tools',       href:'../skills/skills.html' }
    ]
  },
  { type:'group', id:'g-careers', label:'Careers', icon:'bi-briefcase',
    items:[
      { label:'Career Management', icon:'bi-briefcase', href:'../careers/careers.html' },
      { label:'Career Mapping',    icon:'bi-diagram-3', href:'../mapping/mapping.html' }
    ]
  },
  { type:'group', id:'g-reports', label:'Reports', icon:'bi-bar-chart-line',
    items:[
      { label:'Assessment Results', icon:'bi-clipboard2-data',  href:'../results/results.html' },
      { label:'PDF Reports',        icon:'bi-file-earmark-pdf', href:'../reports/reports.html' },
      { label:'Search & Filter',    icon:'bi-funnel',           href:'../search/search.html' }
    ]
  },
  { type:'link', label:'Analytics', icon:'bi-graph-up', href:'../analytics/analytics.html' },
  { type:'link', label:'Settings',  icon:'bi-gear',     href:'../settings/settings.html' }
];

// ── Build sidebar HTML ─────────────────────────────────────────────────────
function buildSidebar() {
  const cur = location.pathname.split('/').pop();
  let html = '';

  ADMIN_NAV.forEach(node => {
    if (node.type === 'link') {
      const active = node.href.split('/').pop() === cur ? 'active' : '';
      html += `
        <a href="${node.href}" class="nav-item ${active}" data-tip="${node.label}">
          <i class="bi ${node.icon}"></i>
          <span class="nav-lbl">${node.label}</span>
        </a>`;
      return;
    }

    // Auto-open if a child page is active
    const hasActive = node.items.some(c => c.href.split('/').pop() === cur);
    const isOpen = hasActive; // only open by default if current page is in this group

    html += `
      <div class="nav-group" id="${node.id}">
        <div class="nav-group-hd ${isOpen ? 'open' : ''}" onclick="toggleGroup('${node.id}',this)">
          <span class="nav-group-left">
            <i class="bi ${node.icon}"></i>
            <span class="nav-lbl">${node.label}</span>
          </span>
          <i class="bi bi-chevron-right nav-chevron"></i>
        </div>
        <div class="nav-group-body" style="height:${isOpen ? 'auto' : '0'};">
          <div class="nav-group-inner">`;

    node.items.forEach(child => {
      const active = child.href.split('/').pop() === cur ? 'active' : '';
      html += `
            <a href="${child.href}" class="nav-sub-item ${active}">
              <i class="bi ${child.icon}"></i>
              <span class="nav-lbl">${child.label}</span>
            </a>`;
    });

    html += `
          </div>
        </div>
      </div>`;
  });

  return html;
}

// ── Toggle accordion ── close all others, open clicked one ─────────────────
function toggleGroup(id, hd) {
  const allHds    = document.querySelectorAll('.nav-group-hd');
  const allBodies = document.querySelectorAll('.nav-group-body');
  const clickedBody = hd.nextElementSibling;
  const isAlreadyOpen = hd.classList.contains('open');

  // 1. Close EVERY group (animate them shut)
  allHds.forEach(h => h.classList.remove('open'));
  allBodies.forEach(b => {
    b.style.height = b.scrollHeight + 'px'; // pin height so transition works
    requestAnimationFrame(() => {
      b.style.height = '0';
    });
  });

  // 2. If the clicked group was CLOSED, open it
  if (!isAlreadyOpen) {
    hd.classList.add('open');
    const inner = clickedBody.querySelector('.nav-group-inner');
    const targetH = inner.scrollHeight;
    // Give the collapse a tiny head start, then expand
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        clickedBody.style.height = targetH + 'px';
        clickedBody.addEventListener('transitionend', () => {
          if (hd.classList.contains('open')) {
            clickedBody.style.height = 'auto'; // allow natural reflow
          }
        }, { once: true });
      });
    });
  }
}

// ── Sidebar collapse (icon-only mode, desktop) ─────────────────────────────
function toggleCollapse() {
  const s = document.getElementById('sidebar');
  const collapsed = s.classList.toggle('collapsed');
  localStorage.setItem('agy_col', collapsed ? '1' : '0');
}

// ── Mobile drawer ──────────────────────────────────────────────────────────
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
}

// ── Modal helpers ──────────────────────────────────────────────────────────
function openModal(id)       { document.getElementById(id).classList.add('show'); }
function closeModal(id)      { document.getElementById(id).classList.remove('show'); }
function closeOutside(e, id) { if (e.target.id === id) closeModal(id); }

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('sidebarNav');
  if (nav) nav.innerHTML = buildSidebar();

  // Restore sidebar collapse preference (desktop only)
  if (window.innerWidth > 768 && localStorage.getItem('agy_col') === '1') {
    document.getElementById('sidebar')?.classList.add('collapsed');
  }
});
