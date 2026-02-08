document.addEventListener('DOMContentLoaded',()=>{
  const sections = [
    {key:'descriptive', title:'Descriptive Composition'},
    {key:'narrative', title:'Narrative & Stories'},
    {key:'expository', title:'Expository / Opinion'}
  ];

  const anchors = Array.from(document.querySelectorAll('#source a'));

  // categorize by keywords (simple heuristics)
  function categorize(text){
    const t = text.toLowerCase();
    if(/\b(describ|description|describe in detail|describe)\b/.test(t)) return 'descriptive';
    if(/\b(narrat|story|short story|narrate|incident)\b/.test(t)) return 'narrative';
    if(/\b(express your views|express your views either|express your views either for|discuss|explain|give your views|opinion|write an account)\b/.test(t)) return 'expository';
    // fallback heuristics
    if(/\b(write a composition|composition|composition \(350|compose)\b/.test(t)) return 'descriptive';
    return 'expository';
  }

  const data = {};
  sections.forEach(s=>data[s.key]=[]);

  anchors.forEach(a=>{
    const txt = (a.textContent||a.innerText||'').trim();
    const cat = categorize(txt);
    data[cat].push({text:txt, href:a.href});
  });

  // render
  const list = document.getElementById('list');
  list.innerHTML='';
  sections.forEach(s=>{
    const card = document.createElement('section');
    card.className='card';
    card.dataset.key = s.key;

    const h = document.createElement('h2');
    h.textContent = s.title;
    card.appendChild(h);

    const ul = document.createElement('ul');
    if(data[s.key].length===0){
      const li = document.createElement('li'); li.textContent = 'No items found for this section.'; li.style.color='var(--muted)'; ul.appendChild(li);
    } else {
      data[s.key].forEach(item=>{
        const li = document.createElement('li');
        const a = document.createElement('a'); a.href = item.href; a.textContent = item.text; a.target='_blank';
        li.appendChild(a); ul.appendChild(li);
      });
    }

    card.appendChild(ul);
    list.appendChild(card);
  });

  // filter buttons
  const buttons = document.querySelectorAll('.topics button');
  const listContainer = document.getElementById('list');
  function setFilter(name){
    buttons.forEach(b=>b.classList.toggle('active', b.dataset.filter===name));
    const cards = Array.from(document.querySelectorAll('.card'));
    if(name==='all'){
      cards.forEach(c=>c.classList.remove('hidden'));
      listContainer.classList.add('rows');
    } else {
      cards.forEach(c=> c.dataset.key===name ? c.classList.remove('hidden') : c.classList.add('hidden'));
      listContainer.classList.remove('rows');
    }
  }
  buttons.forEach(b=> b.addEventListener('click', ()=> setFilter(b.dataset.filter)));

  // search
  const search = document.getElementById('search');
  function doSearch(q){
    q = (q||'').trim().toLowerCase();
    const items = document.querySelectorAll('.card li');
    let matchCount=0;
    items.forEach(li=>{
      const text = (li.textContent||'').toLowerCase();
      const matched = text.includes(q);
      li.style.display = matched ? '' : 'none';
      if(matched) matchCount++;
    });
    // toggle section collapse if no matches in it
    document.querySelectorAll('.card').forEach(card=>{
      const visible = card.querySelectorAll('li:not([style*="display: none"])').length;
      card.style.display = visible ? '' : 'none';
    });
    return matchCount;
  }
  search.addEventListener('input', e=>{
    const q=e.target.value;
    doSearch(q);
    // reset filter buttons to All while searching
    if(q.length>0) setFilter('all');
  });

  // theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  function applyTheme(t){
    document.documentElement.setAttribute('data-theme', t);
    themeToggle.textContent = t==='dark' ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-pressed', t==='dark');
    localStorage.setItem('essay.theme', t);
  }
  themeToggle.addEventListener('click', ()=>{
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(cur==='dark' ? 'light' : 'dark');
  });

  // initial theme
  (function(){
    const saved = localStorage.getItem('essay.theme');
    if(saved){ applyTheme(saved); }
    else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){ applyTheme('dark'); }
    else applyTheme('light');
  })();

  // initial: show descriptive first (already in order) and set 'all' filter
  setFilter('all');
});