const copyLinkClickHandler = (link) => {
  navigator.clipboard.writeText(link);

  const toast = $('#toast');
  const [el] = toast;
  el.classList.remove('d-none');
  el.getElementsByClassName('toast__content')[0].innerText = 'Link copied to clipboard';
  
  toast.toast('show');
}