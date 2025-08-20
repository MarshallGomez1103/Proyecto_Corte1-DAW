document.querySelectorAll('.plus').forEach(btn => {
  btn.addEventListener('click', function() {
    const info = btn.closest('.info_cita').querySelector('.container-info-products');
    info.classList.toggle('hidden-info');
    const desc = info.querySelector('.descripcion');
    if (desc) desc.classList.toggle('hidden-info');
  });
});