const btnOpen = document.getElementById('btn-open');
const btnClose = document.getElementById('btn-close');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const sidebarLinks = document.querySelectorAll('.sidebar-link');

function openMenu() {
  sidebar.classList.add('active');
  overlay.classList.add('active');
}

function closeMenu() {
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
}

btnOpen.addEventListener('click', openMenu);
btnClose.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);

// Cerrar sidebar al hacer clic en un enlace del menú
sidebarLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});