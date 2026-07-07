/* Quad AI · shared school-page behaviours.
   Each page sets window.QUAD = { mentors:[[img,name,edu,logoFile]...], students:[[img,name]...] }
   Asset base is ../quad-shared/assets/  */
(function(){
  var A='../quad-shared/assets/';
  var Q=window.QUAD||{};
  var RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  function observe(root){(root||document).querySelectorAll('.rv').forEach(function(el){io.observe(el);});}

  /* count-up */
  function countUp(el){var t=+el.dataset.count,pre=el.dataset.prefix||'',suf=el.dataset.suffix||'',dec=(String(el.dataset.count).split('.')[1]||'').length;if(RM){el.innerHTML=pre+t+'<span class="u">'+suf+'</span>';return;}var s=null;function step(ts){if(!s)s=ts;var p=Math.min((ts-s)/1300,1),e=1-Math.pow(1-p,3);el.innerHTML=pre+(e*t).toFixed(dec)+'<span class="u">'+suf+'</span>';if(p<1)requestAnimationFrame(step);}requestAnimationFrame(step);}
  var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){countUp(e.target);cio.unobserve(e.target);}});},{threshold:.6});
  document.querySelectorAll('.num[data-count]').forEach(function(el){cio.observe(el);});

  /* recruiter marquee (same network across all schools) */
  var logos=['google','microsoft','amazon','adobe','goldman_sachs','uber','swiggy','zomato','paytm','deloitte','accenture','wipro','cognizant','capgemini','mahindra','hdfc','icici','bajaj'];
  var track=document.getElementById('mtrack');
  if(track){var h=logos.map(function(l){return '<div class="lchip"><img src="'+A+'logos/'+l+'.png" alt="'+l+'" loading="lazy"></div>';}).join('');track.innerHTML=h+h;}

  /* mentors — with REAL company logos */
  var mg=document.getElementById('mentorgrid');
  if(mg&&Q.mentors){mg.innerHTML=Q.mentors.map(function(m,i){
    return '<div class="mentor rv '+(i%4===1?'d1':i%4===2?'d2':i%4===3?'d3':'')+'">'+
      '<div class="ph"><img src="'+A+'mentors/'+m[0]+'.jpg" alt="'+m[1]+'" loading="lazy"></div>'+
      '<div class="info"><div class="nm">'+m[1]+'</div><div class="ed">'+m[2]+'</div>'+
      '<div class="co"><img src="'+A+'company/'+m[3]+'" alt="'+(m[4]||'')+'" loading="lazy"></div></div></div>';
  }).join('');observe(mg);}

  /* students */
  var sg=document.getElementById('studentgrid');
  if(sg&&Q.students){sg.innerHTML=Q.students.map(function(s,i){
    return '<div class="stud rv '+(i%4?'d'+(i%4):'')+'"><div class="av"><img src="'+A+'students/'+s[0]+'.jpg" alt="'+s[1]+'" loading="lazy"></div>'+
      '<div class="nm">'+s[1]+'</div><div class="hm">Class of 2026</div></div>';
  }).join('');observe(sg);}

  observe(document);

  /* curriculum tabs */
  var tabs=document.getElementById('tabs');
  if(tabs){tabs.addEventListener('click',function(e){var b=e.target.closest('.tab');if(!b)return;this.querySelectorAll('.tab').forEach(function(t){t.classList.remove('on');});b.classList.add('on');document.querySelectorAll('.panel').forEach(function(p){p.classList.remove('on');});var pn=document.getElementById(b.dataset.p);if(pn)pn.classList.add('on');});}

  /* hero spotlight follow */
  var spot=document.getElementById('spot'),hero=document.querySelector('.hero');
  if(spot&&hero&&!RM){hero.addEventListener('pointermove',function(ev){var r=hero.getBoundingClientRect();spot.style.setProperty('--mx',((ev.clientX-r.left)/r.width*100)+'%');spot.style.setProperty('--my',((ev.clientY-r.top)/r.height*100)+'%');});}

  /* sticky bar after hero */
  var sticky=document.getElementById('sticky'),top=document.getElementById('top');
  if(sticky&&top){new IntersectionObserver(function(es){es.forEach(function(e){sticky.classList.toggle('show',!e.isIntersecting);});},{threshold:0}).observe(top);}

  /* secondary CTAs → focus the lead form */
  function toForm(){var f=document.getElementById('lead');if(!f)return;f.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});setTimeout(function(){var p=document.getElementById('phone');if(p)p.focus({preventScroll:true});},RM?0:500);}
  document.querySelectorAll('[data-scroll],[data-apply],[data-brochure]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();toForm();});});

  /* form (prototype: inline success) */
  function wire(id){var f=document.getElementById(id);if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var t=f.querySelector('input[type=tel]');if(t.value.replace(/\D/g,'').length<10){t.focus();return;}f.classList.add('done');});}
  wire('leadform');wire('leadform2');
})();
