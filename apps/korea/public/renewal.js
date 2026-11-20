document.addEventListener('DOMContentLoaded',function(){
 var toggle=document.querySelector('.rn-menu-toggle'),nav=document.getElementById('rn-navigation');
 if(!toggle||!nav)return;
 function close(){nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','메뉴 열기');nav.querySelectorAll('details[open]').forEach(function(d){d.open=false;});}
 toggle.addEventListener('click',function(){var open=toggle.getAttribute('aria-expanded')!=='true';nav.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');});
 nav.querySelectorAll('.rn-nav-group').forEach(function(group){group.addEventListener('toggle',function(){if(group.open)nav.querySelectorAll('.rn-nav-group').forEach(function(other){if(other!==group)other.open=false;});});});
 document.addEventListener('click',function(event){if(!nav.contains(event.target)&&!toggle.contains(event.target))close();});
 document.addEventListener('keydown',function(event){if(event.key==='Escape'){var focused=nav.contains(document.activeElement);close();if(focused)toggle.focus();}});
 nav.addEventListener('click',function(event){if(event.target.closest('a'))close();});
 window.matchMedia('(min-width:1200px)').addEventListener('change',close);
});
