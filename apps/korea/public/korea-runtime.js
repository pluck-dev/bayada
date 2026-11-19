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
  function clearErrors(form) {
    form.querySelectorAll('[data-korea-field-error]').forEach(function (node) { node.remove(); });
    form.querySelectorAll('[aria-invalid="true"]').forEach(function (field) {
      field.removeAttribute('aria-invalid');
      var descriptions = (field.getAttribute('aria-describedby') || '').split(' ').filter(function (id) { return id && !id.startsWith('korea-error-'); });
      if (descriptions.length) field.setAttribute('aria-describedby', descriptions.join(' ')); else field.removeAttribute('aria-describedby');
    });
  }
  function reveal(element, block, focus) {
    // Wait for the hidden form's height change and browser scroll anchoring.
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      element.scrollIntoView({ block: block, behavior: 'auto' });
      if (focus) focus.focus({ preventScroll: true });
    }); });
  }
  function showSuccess(form, body) {
    var careers = form.dataset.koreaForm === 'CAREERS';
    var panel = document.createElement('section'); panel.className = 'korea-submission-success'; panel.tabIndex = -1; panel.setAttribute('role', 'status');
    panel.innerHTML = '<span class="korea-success-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="m8 16 5 5L24 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span><h2></h2><p class="korea-success-description"></p><dl class="korea-success-reference"><dt>접수번호</dt><dd></dd></dl><div class="korea-success-actions"><a class="korea-home-link" href="/">홈으로</a><button class="korea-new-inquiry" type="button">추가 문의 작성</button></div>';
    panel.querySelector('h2').textContent = careers ? '지원이 완료되었습니다.' : '상담 신청이 완료되었습니다.';
    panel.querySelector('.korea-success-description').textContent = '담당자가 내용을 확인한 후 입력하신 연락처로 안내드리겠습니다.';
    var reference = body.reference || (body.message || '').match(/KR-\d{8}-[A-F0-9]{8}/)?.[0];
    if (reference) panel.querySelector('dd').textContent = reference; else panel.querySelector('dl').remove();
    panel.querySelector('.korea-new-inquiry').textContent = careers ? '다른 지원 작성' : '추가 문의 작성';
    panel.querySelector('.korea-new-inquiry').addEventListener('click', function () {
      form.reset(); clearErrors(form); form.querySelector('[data-korea-result]').textContent = ''; form.hidden = false; panel.remove();
      var first = form.querySelector('input:not([type="hidden"]):not([name="website"])'); if (first) first.focus();
    });
    form.before(panel); form.hidden = true; form.reset(); reveal(panel, 'start', panel);
  }
  document.querySelectorAll('form[data-korea-inquiry]').forEach(function (form, index) {
    var inFlight = false;
    form.addEventListener('input', function () { if (!inFlight) clearErrors(form); });
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (inFlight || !form.reportValidity()) return;
      clearErrors(form); inFlight = true;
      var result = form.querySelector('[data-korea-result]');
      var submit = form.querySelector('[type="submit"]');
      var submitLabel = submit ? (submit.tagName === 'INPUT' ? submit.value : submit.textContent) : '';
      var data = new FormData(form);
      if (submit) { submit.disabled = true; submit.setAttribute('aria-busy', 'true'); if (submit.tagName === 'INPUT') submit.value = '접수 중…'; else submit.textContent = '접수 중…'; }
      result.hidden = false; result.dataset.state = 'pending'; result.textContent = '접수 중입니다…';
      try {
        var response = await fetch('/api/inquiries', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ formType: form.dataset.koreaForm, title: form.dataset.koreaForm === 'CAREERS' ? '채용 지원' : data.get('you-sub'), name: data.get('your-name'), contact: data.get('your-contact') || data.get('tel-309'), email: data.get('your-email'), position: data.get('text-712'), services: data.getAll('checkbox-446[]'), location: data.get('loct'), message: data.get('your-message'), privacyConsent: data.get('privacyConsent') === 'on', website: data.get('website') }) });
        var body = await response.json();
        if (response.ok) { result.textContent = ''; showSuccess(form, body); }
        else {
          var fields = { title: 'you-sub', name: 'your-name', contact: form.dataset.koreaForm === 'CAREERS' ? 'tel-309' : 'your-contact', email: 'your-email', position: 'text-712', privacyConsent: 'privacyConsent' };
          var field = Object.prototype.hasOwnProperty.call(fields, body.field) ? form.querySelector('[name="' + fields[body.field] + '"]') : null;
          if (field) {
            result.hidden = true; var error = document.createElement('span'); error.className = 'korea-field-error'; error.dataset.koreaFieldError = ''; error.id = 'korea-error-' + index + '-' + body.field; error.setAttribute('role', 'alert'); error.textContent = body.message;
            (field.closest('label') || field.closest('.wpcf7-form-control-wrap') || field).after(error); field.setAttribute('aria-invalid', 'true'); field.setAttribute('aria-describedby', ((field.getAttribute('aria-describedby') || '') + ' ' + error.id).trim()); reveal(field.closest('label') || field, 'center', field);
          } else { result.dataset.state = 'error'; result.textContent = body.message || '접수하지 못했습니다. 잠시 후 다시 시도해 주세요.'; result.scrollIntoView({ block: 'center' }); }
        }
      } catch (_) { result.hidden = false; result.dataset.state = 'error'; result.textContent = '연결이 원활하지 않아 접수 결과를 확인하지 못했습니다. 입력 내용은 유지됩니다. 잠시 후 다시 시도해 주세요.'; }
      finally { inFlight = false; if (submit) { submit.disabled = false; submit.removeAttribute('aria-busy'); if (submit.tagName === 'INPUT') submit.value = submitLabel; else submit.textContent = submitLabel; } }
    });
  });
});
