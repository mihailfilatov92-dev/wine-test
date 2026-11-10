// «Наша полка» в модулях: реальные вина из ассортимента по теме модуля и под каждой карточкой сорта.
// Данные — SHELF из shelf.js. Магазин сотрудник выбирает один раз, выбор хранится на телефоне.
(function(){
const STORES=['Б.Октябрьская','Горвал','Иваново','Нахимсона'];
const SKEY='wine-shelf-store';
const F={a:0,n:1,t:2,c:3,s:4,co:5,r:6,gr:7,k:8,vr:9};
const W=(typeof SHELF!=='undefined'?SHELF:[]).map(r=>{const o={};for(const k in F)o[k]=r[F[k]];return o;});
let store=null; try{ const s=localStorage.getItem(SKEY); store=s===null?null:+s; if(isNaN(store))store=null; }catch(e){}
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const qty=w=>store===null?w.k.reduce((a,b)=>a+b,0):w.k[store];
const nm=w=>w.n.replace(/,\s*(19|20)\d\d\b/,'');

// --- фильтры
const G=(re)=>w=>re.test(w.gr);
const has=(...res)=>w=>res.every(re=>re.test(w.gr));
const CO=(...c)=>w=>c.includes(w.co);
const R=(...r)=>w=>r.includes(w.r);
const T=(...t)=>w=>t.includes(w.t);
const and=(...f)=>w=>f.every(x=>x(w));
const not=f=>w=>!f(w);
const red=w=>w.c==='Красное', white=w=>w.c==='Белое', still=T('Тихое вино');
const sweet=w=>/сладк|полусладк/i.test(w.s)||w.t==='Крепленое';

// Карточки сортов: заголовок h3 -> фильтр
const GRAPE={
 'Альбариньо':G(/альбариньо|алвариньу/),'Грюнер вельтлинер':G(/грюнер/),'Мюскаде (мелон де бургонь)':G(/мелон/),
 'Пино гри / пино гриджо':G(/пино гри/),'Совиньон блан':G(/совиньон блан/),'Соаве (гарганега)':G(/гарганега/),'Верментино':G(/верментино/),
 'Шардоне':G(/шардоне/),'Семильон':G(/семильон/),'Вионье':G(/вионье/),'Марсан и руссан (белый купаж Роны)':G(/марсан|руссан/),
 'Рислинг':G(/(^|, )рислинг(?! итальянск)/),'Гевюрцтраминер':G(/гевюрц|траминер/),'Мускат (мускат блан, москато)':G(/мускат|москато/),
 'Шенен блан':G(/шенен/),'Торронтес':G(/торронтес/),
 'Пино нуар':G(/пино нуар|пино неро/),'Гамэ':G(/гаме|гамэ/),'Мерло':G(/мерло/),'Каберне фран':G(/каберне фран/),'Санджовезе':G(/санджовезе/),
 'Барбера':G(/барбера/),'Гренаш / гарнача':and(G(/гренаш|гарнача/),not(G(/гарнача бланка|гренаш блан/))),'Менсия':G(/менсия/),'Карменер':G(/карменер/),
 'Кариньян / кариньена':G(/кариньян|кариньена/),'Монтепульчано':G(/монтепульчано/),'Негроамаро':G(/негроамаро/),'Корвина (купаж Вальполичеллы)':G(/корвин/),
 'Зинфандель / примитиво':G(/зинфандель|примитиво/),'Каберне совиньон':G(/каберне совиньон/),
 'Купаж Бордо':and(R('Бордо'),red),'Пти вердо':G(/пти вердо/),'Мальбек':G(/мальбек/),'Сира / шираз':G(/сира|шираз/),
 'Купаж GSM (гренаш — сира — мурведр)':w=>[/гренаш|гарнача/,/сира|шираз/,/мурведр|монастрель/].filter(re=>re.test(w.gr)).length>=2,
 'Мурведр / монастрель':G(/мурведр|монастрель/),'Птит сира (дюриф)':G(/птит сира|дюриф/),'Неббиоло':G(/неббиоло/),'Альянико':G(/альянико/),
 "Неро д'Авола":G(/неро д.авола/),'Темпранильо':G(/темпранильо|тинта рориш|тинто фино|тинта де торо|тинта рорис/),'Турига насьональ':G(/турига/),'Пинотаж':G(/пинотаж/)
};

// Модули: группы вин «по теме»
const MOD={
 m4:'countries', m5:[['Шампанское',T('Шампанское')],['Креманы',w=>/креман|cremant/i.test(w.n)],['Просекко',w=>/prosecco|просекко/i.test(w.n)],['Кава',w=>/cava|кава/i.test(w.n)],['Другое игристое',w=>w.t==='Игристое'&&!/креман|cremant|prosecco|просекко|cava|кава/i.test(w.n)]],
 r3:[['Белые российские',and(CO('Россия'),white)],['Красные российские',and(CO('Россия'),red)]],
 v5:[['Италия: местные сорта',and(CO('Италия'),still)],['Испания и Португалия',and(CO('Испания','Португалия'),still)]],
 v6:[['Грузия',CO('Грузия')],['Россия',CO('Россия')],['Новый Свет',CO('Чили','Аргентина','Австралия','Новая Зеландия','Южная Африка','Соединенные Штаты Америки')]],
 l2:[['Франция',CO('Франция')]], l3:[['Италия',CO('Италия')]], l4:[['Испания',CO('Испания')],['Португалия',CO('Португалия')]], l5:[['Германия',CO('Германия')],['Австрия',CO('Австрия')]],
 l6:[['Россия',CO('Россия')],['Новый Свет',CO('Чили','Аргентина','Австралия','Новая Зеландия','Южная Африка','Соединенные Штаты Америки')]],
 f1:'regions:Франция', f2:[['Бордо',R('Бордо')]], f3:[['Бургундия',R('Бургундия')]], f4:[['Шампань',T('Шампанское')]],
 f5:[['Луара',R('Долина Луары')],['Эльзас',R('Эльзас')]], f6:[['Рона',R('Долина Роны')],['Лангедок-Руссильон',R('Лангедок-Руссильон')],['Прованс',R('Прованс')],['Юго-Запад',R('Юго-Запад')]],
 f7:[['Сладкие и креплёные Франции',and(CO('Франция'),sweet)]],
 z1:[['Бордо',R('Бордо')]], z2:[['Бургундия',R('Бургундия')]], z3:[['Шампань',T('Шампанское')]], z4:[['Луара',R('Долина Луары')],['Эльзас',R('Эльзас')]], z5:[['Рона',R('Долина Роны')],['Юг Франции',R('Лангедок-Руссильон','Прованс','Юго-Запад')]],
 i1:'regions:Италия', i2:[['Пьемонт',R('Пьемонт')],['Венето',R('Венето')],['Ломбардия',R('Ломбардия')],['Трентино-Альто-Адидже',R('Трентино-Альто Адидже')],['Фриули',R('Фриули-Венеция-Джулия')]],
 i3:[['Тоскана',R('Тоскана')],['Умбрия, Марке, Абруццо',R('Умбрия','Марке','Абруццо')]], i4:[['Сицилия',R('Сицилия')],['Апулия',R('Апулия')],['Кампания',R('Кампания')],['Сардиния',R('Сардиния')]],
 i5:[['Сладкие вина Италии',and(CO('Италия'),sweet)]],
 x1:[['Пьемонт',R('Пьемонт')]], x2:[['Венето',R('Венето')],['Ломбардия',R('Ломбардия')],['Трентино-Альто-Адидже',R('Трентино-Альто Адидже')],['Фриули',R('Фриули-Венеция-Джулия')],['Эмилия-Романья',R('Эмилия-Романья')]],
 x3:[['Тоскана',R('Тоскана')],['Умбрия, Марке, Абруццо',R('Умбрия','Марке','Абруццо')]], x4:[['Сицилия',R('Сицилия')],['Апулия',R('Апулия')],['Кампания',R('Кампания')],['Сардиния',R('Сардиния')]],
 e1:'regions:Испания', e2:[['Галисия',R('Галисия')],['Риоха',R('Риоха')],['Наварра',R('Наварра')],['Арагон',R('Арагон')]], e3:[['Кастилия и Леон (Рибера, Торо, Руэда, Бьерсо)',R('Кастилия и Леон')],['Кастилия — Ла-Манча',R('Кастилия Ла Манча')]],
 e4:[['Каталония (кава, Приорат)',R('Каталония')],['Валенсия, Мурсия',R('Валенсия','Мурсия')]], e5:[['Андалусия (херес)',R('Андалусия')]],
 p1:[['Португалия: тихие',and(CO('Португалия'),not(T('Крепленое')))]], p2:[['Портвейн и мадейра',and(CO('Португалия'),T('Крепленое'))]],
 d1:'regions:Германия', d2:'regions:Германия', d3:[['Сладкие вина Германии',and(CO('Германия'),sweet)]],
 a1:'regions:Австрия', a2:'regions:Австрия', h1:[['Венгрия',CO('Венгрия')]], h2:[['Токай',R('Токай')]], h3:[['Молдова',CO('Республика Молдова')]],
 q1:[['Грузия',CO('Грузия')]], q2:'regions:Грузия', y1:'regions:Армения', r1:'regions:Россия', r2:'regions:Россия',
 n1:[['США',CO('Соединенные Штаты Америки')]], n2:'regions:Чили', n3:'regions:Аргентина', n4:'regions:Австралия', n5:'regions:Новая Зеландия', n6:'regions:Южная Африка'
};
function groupsFor(id){
  const g=MOD[id]; if(!g) return null;
  if(g==='countries'){ const by={}; W.forEach(w=>{ if(w.co){ (by[w.co]=by[w.co]||[]).push(w);} });
    return Object.entries(by).sort((a,b)=>b[1].length-a[1].length).map(([c,l])=>[c,l]); }
  if(typeof g==='string'&&g.startsWith('regions:')){ const c=g.slice(8), by={};
    W.filter(w=>w.co===c).forEach(w=>{ const r=w.r||'Без региона'; (by[r]=by[r]||[]).push(w); });
    return Object.entries(by).sort((a,b)=>b[1].length-a[1].length); }
  return g.map(([t,f])=>[t,W.filter(f)]).filter(x=>x[1].length);
}
function sortL(l){ return l.slice().sort((a,b)=>(qty(b)>0)-(qty(a)>0) || a.n.localeCompare(b.n,'ru')); }
function item(w){
  const here=store===null?'':(qty(w)>0?'<span class="sh-ok">есть у тебя</span>':'<span class="sh-no">нет в твоём</span>');
  const meta=[w.c,w.s,w.r||w.co].filter(Boolean).join(' · ');
  return `<li><span class="sh-n">${esc(w.n)}</span><span class="sh-m">${esc(meta)}${w.gr?' · '+esc(w.gr):''}${w.vr&&w.vr.length?' · есть также '+esc(w.vr.join(', ')):''}</span><span class="sh-r">${here}</span></li>`;
}
function list(l,limit){
  const s=sortL(l), n=store===null?l.length:l.filter(w=>qty(w)>0).length;
  const lim=limit||12;
  return {n, html:`<ul class="sh-list">${s.slice(0,lim).map(item).join('')}</ul>`+(s.length>lim?`<details class="sh-more"><summary>ещё ${s.length-lim}</summary><ul class="sh-list">${s.slice(lim).map(item).join('')}</ul></details>`:'')};
}
function picker(){
  return `<div class="sh-pick"><span>Мой магазин:</span>`+['Все',...STORES].map((s,i)=>`<button type="button" class="sh-st${(i===0&&store===null)||(i>0&&store===i-1)?' on':''}" data-st="${i-1}">${s}</button>`).join('')+`</div>`;
}
let lastMod=null, lastEl=null;
function render(m, el){
  lastMod=m; lastEl=el;
  el.querySelectorAll('.sh-box,.sh-grape').forEach(x=>x.remove());
  // под карточками сортов
  el.querySelectorAll('h3').forEach(h=>{
    const f=GRAPE[h.textContent.replace(/\s+/g,' ').trim()]; if(!f) return;
    const l=W.filter(f); if(!l.length) return;
    let after=h.nextElementSibling; while(after && after.tagName!=='UL' && after.tagName!=='H3' && after.tagName!=='H2') after=after.nextElementSibling;
    const L=list(l,8);
    const d=document.createElement('details'); d.className='sh-grape';
    d.innerHTML=`<summary>Вся наша полка: ${l.length}${store!==null?` · в твоём магазине: ${L.n}`:''}</summary>`+L.html;
    (after&&after.tagName==='UL'?after:h).after(d);
  });
  // по теме модуля
  const gs=groupsFor(m.id); if(!gs||!gs.length) return;
  const box=document.createElement('div'); box.className='card sh-box';
  box.innerHTML=`<p class="eyebrow">Наша полка</p><h3 style="margin:0">Вина по теме модуля</h3><p class="lead" style="font-size:14px">Ассортимент на ${typeof SHELF_DATE!=='undefined'?SHELF_DATE:''}. Выбери свой магазин — сначала будет то, что стоит у тебя.</p>`+picker()+
    gs.map(([t,l])=>{ const L=list(l,10); return `<details class="sh-g"${gs.length<=2?' open':''}><summary><b>${esc(t)}</b> <span class="count">${l.length}${store!==null?` · у тебя ${L.n}`:''}</span></summary>${L.html}</details>`; }).join('');
  el.appendChild(box);
}
document.addEventListener('click',e=>{
  const b=e.target.closest('.sh-st'); if(!b) return;
  const v=+b.dataset.st; store=v<0?null:v; try{ store===null?localStorage.removeItem(SKEY):localStorage.setItem(SKEY,String(store)); }catch(_){}
  if(lastMod&&lastEl) render(lastMod,lastEl);
});
window.shelfAugment=render;
const css=`.sh-box{margin-top:18px}.sh-pick{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:14px;color:var(--muted)}
.sh-st{border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:999px;padding:5px 10px;font:inherit;font-size:13px;cursor:pointer}
.sh-st.on{background:var(--wine);border-color:var(--wine);color:#fff}
.sh-g,.sh-grape{border-top:1px solid var(--line);padding-top:8px;margin-top:8px}
.sh-g summary,.sh-grape summary,.sh-more summary{cursor:pointer;color:var(--wine);font-size:14px}
.sh-grape{margin:4px 0 14px;border:1px dashed var(--line);border-radius:10px;padding:8px 10px}
.sh-list{list-style:none;padding:0;margin:8px 0 0;display:grid;gap:8px}
.sh-list li{display:grid;grid-template-columns:1fr auto;gap:2px 10px;font-size:14px;line-height:1.35}
.sh-n{font-weight:500}
.sh-m{grid-column:1/2;color:var(--muted);font-size:12.5px}.sh-r{grid-column:2/3;grid-row:1/3;text-align:right;font-size:13px;white-space:nowrap}
.sh-ok{display:block;color:var(--ok);font-size:12px}.sh-no{display:block;color:var(--muted);font-size:12px}`;
const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
})();
