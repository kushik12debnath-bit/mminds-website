/* ============================================================
   MMinds v2 — interactions
   Lenis smooth scroll · GSAP scrub · scroll themes · particles
   multi-step booking · checklist · counters · tabs · modal
   Every enhancement is guarded: no CDN → site still works.
   ============================================================ */
(function(){
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer=matchMedia('(hover: hover) and (pointer: fine)').matches;
  if(reduced)document.documentElement.classList.add('no-motion');

  /* ---------- Floating nav: blur on scroll + active page ---------- */
  const pill=$('#navPill');
  addEventListener('scroll',()=>pill&&pill.classList.toggle('scrolled',scrollY>24),{passive:true});
  const page=document.body.dataset.page;
  if(page)$$('.nav-link[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===page));
  const mBtn=$('#menuBtn'),mPanel=$('#mobileMenu');
  if(mBtn&&mPanel)mBtn.addEventListener('click',()=>{
    const open=mPanel.classList.toggle('hidden');
    mBtn.setAttribute('aria-expanded',String(!open));
  });

  /* ---------- Lenis smooth scroll (darkroomengineering/lenis) ---------- */
  let lenis=null;
  if(window.Lenis&&!reduced){
    lenis=new Lenis({duration:1.15,smoothWheel:true});
    const raf=t=>{lenis.raf(t);requestAnimationFrame(raf)};
    requestAnimationFrame(raf);
    if(window.ScrollTrigger)lenis.on('scroll',()=>window.ScrollTrigger.update());
  }
  $$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const id=a.getAttribute('href');if(id.length<2)return;
    const t=document.querySelector(id);if(!t)return;e.preventDefault();
    if(lenis)lenis.scrollTo(t,{offset:-90});else t.scrollIntoView({behavior:'smooth'});
  }));

  /* ---------- Scroll progress bar ---------- */
  const prog=$('#progress');
  const paint=p=>{if(prog)prog.style.transform=`scaleX(${Math.min(1,Math.max(0,p))})`};
  if(lenis)lenis.on('scroll',({progress})=>paint(progress??0));
  addEventListener('scroll',()=>{
    const h=document.documentElement;
    paint(h.scrollTop/((h.scrollHeight-h.clientHeight)||1));
  },{passive:true});

  /* ---------- Scroll-driven color themes ---------- */
  const themed=$$('[data-theme]');
  if(themed.length&&'IntersectionObserver' in window){
    const tio=new IntersectionObserver(es=>es.forEach(e=>{
      if(e.isIntersecting)document.body.dataset.theme=e.target.dataset.theme;
    }),{rootMargin:'-40% 0px -55% 0px'});
    themed.forEach(el=>tio.observe(el));
  }

  /* ---------- Reveal on scroll ---------- */
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}
  }),{threshold:.12});
  $$('.reveal').forEach(el=>io.observe(el));

  /* ---------- Animated counters ---------- */
  const cio=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;cio.unobserve(e.target);
    const el=e.target,end=parseFloat(el.dataset.count),
      dec=parseInt(el.dataset.decimals||0),suf=el.dataset.suffix||'';
    const t0=performance.now(),dur=1600;
    (function tick(t){const p=Math.min(1,(t-t0)/dur),ez=1-Math.pow(1-p,3);
      el.textContent=(end*ez).toFixed(dec)+suf;
      if(p<1)requestAnimationFrame(tick)})(t0);
  }),{threshold:.5});
  $$('[data-count]').forEach(el=>cio.observe(el));

  /* ---------- Accordions + tabs ---------- */
  $$('.acc-head').forEach(h=>h.addEventListener('click',()=>{
    const acc=h.closest('.acc'),was=acc.classList.contains('open');
    $$('.acc.open',acc.closest('[data-acc-group]')||document)
      .forEach(a=>{a.classList.remove('open');
        a.querySelector('.acc-head')?.setAttribute('aria-expanded','false')});
    if(!was){acc.classList.add('open');h.setAttribute('aria-expanded','true')}
  }));
  $$('[data-tabs]').forEach(w=>{
    const btns=$$('[data-tab-btn]',w),panes=$$('[data-tab-pane]',w);
    btns.forEach(b=>b.addEventListener('click',()=>{
      btns.forEach(x=>x.classList.remove('active'));
      panes.forEach(p=>p.classList.add('hidden'));
      b.classList.add('active');
      w.querySelector(`[data-tab-pane="${b.dataset.tabBtn}"]`)?.classList.remove('hidden');
    }));
  });

  /* ---------- Footer year + newsletter ---------- */
  $$('#year').forEach(el=>el.textContent=new Date().getFullYear());
  $$('#nlForm').forEach(f=>f.addEventListener('submit',e=>{
    e.preventDefault();const em=$('input[type=email]',f);
    if(!em||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)){em?.classList.add('err');return}
    em.classList.remove('err');f.reset();
    const ok=$('#nlOk');
    if(ok){ok.classList.remove('hidden');setTimeout(()=>ok.classList.add('hidden'),4000)}
  }));

  /* ---------- Live character counters ---------- */
  $$('[data-count-to]').forEach(field=>{
    const out=document.querySelector(field.dataset.countTo);if(!out)return;
    const max=parseInt(field.getAttribute('maxlength')||500);
    const upd=()=>out.textContent=`${field.value.length} / ${max}`;
    field.addEventListener('input',upd);upd();
  });

  /* ---------- Audit checklist pills ---------- */
  $$('.check-pill').forEach(p=>p.addEventListener('click',()=>{
    const on=p.getAttribute('aria-pressed')==='true';
    p.setAttribute('aria-pressed',String(!on));
    const box=p.querySelector('[data-tick]');if(box)box.textContent=on?'○':'●';
  }));

  /* ---------- Multi-step booking form ---------- */
  const ms=$('#bookForm');
  if(ms){
    const steps=$$('.mstep',ms),dots=$$('.step-dot',ms);
    const prev=$('#bkPrev'),next=$('#bkNext'),bar=$('#bkBar');
    let i=0;const N=steps.length;
    const show=(n,focus=true)=>{
      i=Math.max(0,Math.min(N-1,n));
      steps.forEach((s,k)=>s.classList.toggle('hidden',k!==i));
      dots.forEach((d,k)=>{
        d.classList.toggle('on',k===i);
        d.classList.toggle('done',k<i);
        d.textContent=k<i?'✓':String(k+1);
      });
      if(bar)bar.style.width=((i+1)/N*100)+'%';
      prev.classList.toggle('hidden',i===0);
      next.innerHTML=i===N-1
        ? '<span id="bkSpin" class="spin hidden"></span><span id="bkLabel">Request Free Audit</span>'
        : 'Continue →';
      $('#bkErr')?.classList.add('hidden');
      if(focus)steps[i].querySelector('input,select,textarea')?.focus({preventScroll:true});
    };
    const bad=n=>{n.classList.add('err');
      n.parentElement?.querySelector('.ferr')?.classList.remove('hidden');return false};
    const good=n=>{n.classList.remove('err');
      n.parentElement?.querySelector('.ferr')?.classList.add('hidden');return true};
    const validStep=()=>{
      let ok=true;
      $$('[required]',steps[i]).forEach(f=>{
        let fOk=f.value.trim().length>1;
        if(f.type==='email')fOk=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value);
        if(f.tagName==='SELECT')fOk=!!f.value;
        if(f.id==='cfMsg')fOk=f.value.trim().length>=10;
        ok=(fOk?good(f):bad(f))&&ok;
      });
      // Step 2 requires ≥1 audit focus pill
      if(steps[i].dataset.needCheck){
        const any=$$('.check-pill[aria-pressed="true"]',steps[i]).length>0;
        $('#bkCheckErr')?.classList.toggle('hidden',any);
        ok=ok&&any;
      }
      if(!ok)$('#bkErr')?.classList.remove('hidden');
      return ok;
    };
    // Live review summary before submit
    const review=()=>{
      const g=id=>$('#'+id)?.value||'—';
      const picks=$$('.check-pill[aria-pressed="true"]')
        .map(p=>p.textContent.replace(/[○●]/g,'').trim()).join(' · ')||'—';
      const map={rvName:g('cfName'),rvEmail:g('cfEmail'),rvSite:g('cfSite'),
        rvSvc:g('cfService'),rvPicks:picks,rvMsg:g('cfMsg')};
      Object.entries(map).forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.textContent=v});
    };
    prev.addEventListener('click',()=>show(i-1));
    next.addEventListener('click',()=>{
      if(i<N-1){if(!validStep())return;if(i===N-2)review();show(i+1);return}
      if(!validStep())return; // final validation
      next.disabled=true;$('#bkSpin')?.classList.remove('hidden');
      const lbl=$('#bkLabel');if(lbl)lbl.textContent='Sending…';
      setTimeout(()=>{
        ms.classList.add('hidden');$('#bkDone')?.classList.remove('hidden');
        $('#bkDone')?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'center'});
      },1500);
    });
    $$('.field',ms).forEach(f=>f.addEventListener('input',()=>good(f)));
    show(0,false);
  }

  /* ---------- Audit modal ---------- */
  const modal=$('#auditModal');
  $$('[data-open-audit]').forEach(b=>b.addEventListener('click',e=>{
    e.preventDefault();modal?.classList.remove('hidden');
    document.body.style.overflow='hidden';if(lenis)lenis.stop();
  }));
  const close=()=>{modal?.classList.add('hidden');
    document.body.style.overflow='';if(lenis)lenis.start()};
  $('#auditClose')?.addEventListener('click',close);
  modal?.addEventListener('click',e=>{if(e.target===modal)close()});
  addEventListener('keydown',e=>{if(e.key==='Escape')close()});

  /* ================= FX ================= */

  /* ---------- Cursor glow (fine pointers only) ---------- */
  const cur=$('#cursor');
  if(cur&&finePointer&&!reduced){
    let x=innerWidth/2,y=innerHeight/2,cx=x,cy=y,shown=false;
    addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;
      if(!shown){shown=true;cur.style.opacity='1'}},{passive:true});
    document.addEventListener('mouseleave',()=>{shown=false;cur.style.opacity='0'});
    (function loop(){cx+=(x-cx)*.08;cy+=(y-cy)*.08;
      cur.style.transform=`translate(${cx}px,${cy}px)`;requestAnimationFrame(loop)})();
  }

  /* ---------- Split-text headings ---------- */
  $$('[data-split]').forEach(el=>{
    const walk=node=>{
      if(node.nodeType===3){
        const frag=document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(part=>{
          if(!part)return;
          if(/^\s+$/.test(part)){frag.appendChild(document.createTextNode(' '));return}
          const w=document.createElement('span');w.className='w-line';
          const inner=document.createElement('span');
          inner.className='w-inner';inner.textContent=part;
          w.appendChild(inner);frag.appendChild(w);
        });
        node.replaceWith(frag);
      }else if(node.nodeType===1)node.childNodes.forEach(walk);
    };
    el.childNodes.forEach(walk);
  });

  /* ---------- GSAP choreography + scrub parallax ---------- */
  if(window.gsap&&!reduced){
    if(window.ScrollTrigger)gsap.registerPlugin(ScrollTrigger);
    $$('[data-split]').forEach((el,i)=>{
      gsap.to(el.querySelectorAll('.w-inner'),
        {yPercent:0,duration:1.1,ease:'power4.out',stagger:.055,delay:.15+i*.1});
    });
    if(window.ScrollTrigger){
      $$('[data-parallax]').forEach(el=>{
        gsap.to(el,{yPercent:parseFloat(el.dataset.parallax||.15)*100,ease:'none',
          scrollTrigger:{trigger:el.closest('section')||el,
            start:'top bottom',end:'bottom top',scrub:1}});
      });
      $$('.ticker').forEach(t=>gsap.to(t,{xPercent:-8,ease:'none',
        scrollTrigger:{trigger:t,start:'top bottom',end:'bottom top',scrub:2}}));
    }
  }else $$('.w-inner').forEach(w=>w.style.transform='none');

  /* ---------- Hero particle network ---------- */
  const cv=$('#stars');
  if(cv){
    const ctx=cv.getContext('2d');
    let W,H,mx=-999,my=-999,visible=true;
    const pts=[],N=innerWidth<640?36:70;
    const size=()=>{const r=cv.parentElement.getBoundingClientRect(),
      d=Math.min(2,devicePixelRatio||1);
      W=r.width;H=r.height;cv.width=W*d;cv.height=H*d;ctx.setTransform(d,0,0,d,0,0)};
    size();addEventListener('resize',size);
    for(let k=0;k<N;k++)pts.push({x:Math.random(),y:Math.random(),
      vx:(Math.random()-.5)*.0009,vy:(Math.random()-.5)*.0009,r:Math.random()*1.6+.4});
    cv.parentElement.addEventListener('mousemove',e=>{
      const r=cv.getBoundingClientRect();
      mx=(e.clientX-r.left)/r.width;my=(e.clientY-r.top)/r.height},{passive:true});
    cv.parentElement.addEventListener('mouseleave',()=>{mx=my=-999});
    new IntersectionObserver(es=>visible=es[0].isIntersecting).observe(cv);
    (function draw(){
      ctx.clearRect(0,0,W,H);
      const P=pts.map(p=>({x:p.x*W,y:p.y*H,p}));ctx.lineWidth=1;
      for(let a=0;a<P.length;a++)for(let b=a+1;b<P.length;b++){
        const dx=P[a].x-P[b].x,dy=P[a].y-P[b].y,d=Math.hypot(dx,dy),max=W*.14;
        if(d<max){ctx.strokeStyle=`rgba(99,102,241,${(1-d/max)*.28})`;
          ctx.beginPath();ctx.moveTo(P[a].x,P[a].y);ctx.lineTo(P[b].x,P[b].y);ctx.stroke()}
      }
      P.forEach(q=>{
        const d=Math.hypot(q.x-mx*W,q.y-my*H);
        ctx.fillStyle=d<120?'rgba(52,211,153,.9)':'rgba(147,163,255,.8)';
        ctx.beginPath();ctx.arc(q.x,q.y,q.p.r+(d<120?1:0),0,7);ctx.fill();
      });
      if(!reduced&&visible){
        pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;
          const dx=p.x-mx,dy=p.y-my,d=Math.hypot(dx,dy);
          if(d<.09&&d>0){p.x+=dx/d*.0016;p.y+=dy/d*.0016}
          if(p.x<0||p.x>1)p.vx*=-1;if(p.y<0||p.y>1)p.vy*=-1;
          p.x=Math.min(1,Math.max(0,p.x));p.y=Math.min(1,Math.max(0,p.y))});
        requestAnimationFrame(draw);
      }
    })();
  }

  /* ---------- Magnetic CTAs + card spotlights ---------- */
  if(finePointer&&!reduced)$$('[data-magnetic]').forEach(el=>{
    el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();
      el.style.transform=
        `translate(${(e.clientX-r.left-r.width/2)/r.width*10}px,${(e.clientY-r.top-r.height/2)/r.height*8}px)`},
      {passive:true});
    el.addEventListener('mouseleave',()=>el.style.transform='');
  });
  if(finePointer)$$('.card').forEach(c=>{
    c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect();
      c.style.setProperty('--mx',(e.clientX-r.left)+'px');
      c.style.setProperty('--my',(e.clientY-r.top)+'px')},{passive:true});
  });
})();
