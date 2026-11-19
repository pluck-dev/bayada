/* Legacy appearance is retained; writes are handled by the new site's API. */
document.addEventListener('DOMContentLoaded', function () {
  function responsiveBoards() {
    var width = window.innerWidth;
    var size = width >= 1200 ? 'mb-desktop-large' : width >= 992 ? 'mb-desktop' : width >= 768 ? 'mb-tablet' : 'mb-mobile';
    document.querySelectorAll('.mb-desktop-large,.mb-desktop,.mb-tablet,.mb-mobile').forEach(function (node) {
      node.classList.remove('mb-desktop-large', 'mb-desktop', 'mb-tablet', 'mb-mobile'); node.classList.add(size);
    });
  }
  responsiveBoards(); window.addEventListener('resize', responsiveBoards);
  document.querySelectorAll('[data-korea-search-submit]').forEach(function (button) { button.addEventListener('click', function (event) { event.preventDefault(); button.closest('form').requestSubmit(); }); });
  document.querySelectorAll('form[data-korea-inquiry]').forEach(function (form) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var result = form.querySelector('[data-korea-result]');
      var submit = form.querySelector('[type="submit"]');
      var data = new FormData(form);
      if (submit) submit.disabled = true;
      result.textContent = '접수 중입니다.';
      try {
        var response = await fetch('/api/inquiries', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ formType: form.dataset.koreaForm, title: data.get('you-sub') || '채용 지원', name: data.get('your-name'), phone: data.get('your-contact') || data.get('tel-309'), email: data.get('your-email'), position: data.get('text-712'), services: data.getAll('checkbox-446[]'), location: data.get('loct'), message: data.get('your-message'), privacyConsent: data.get('privacyConsent') === 'on', website: data.get('website') }) });
        var body = await response.json();
        result.textContent = body.message;
        if (response.ok) form.reset();
      } catch (_) { result.textContent = '접수하지 못했습니다. 잠시 후 다시 시도해 주세요.'; }
      finally { if (submit) submit.disabled = false; }
    });
  });
});
