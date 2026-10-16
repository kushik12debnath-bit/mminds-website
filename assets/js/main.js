/* MMinds — interactions + FX layer (Lenis smooth scroll, GSAP scrub, scroll themes) */
(function(){
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer=matchMedia('(hover: hover) and (pointer: fine)').matches;
  if(reduced)document.documentElement.classList.add('no-motion');

  // ---------- Navbar + mobile ----------
  const nav=$('#navbar');
  const onScroll=()=>{nav&&nav.classList.toggle('scrolled',window.scrollY>12)};
  onScroll();window.addEventListener('scroll',onScroll,{passive:true});
  const mBtn=$('#menuBtn'),mPanel=$('#mobileMenu');
  if(mBtn&&mPanel){mBtn.addEventListener('click',()=>{const o=mPanel.classList.toggle('hidden');mBtn.setAttribute('aria-expanded',String(!o))})}

  // ---------- Lenis smooth scroll (CDN: darkroomengineering/lenis) ----------
  let lenis=null;
  if(window.Lenis&&!reduced){
    lenis=new Lenis({duration:1.15,smoothWheel:true});
    const raf=t=>{lenis.raf(t);requestAnimationFrame(raf)};
    requestAnimationFrame(raf);
    if(window.ScrollTrigger)lenis.on('scroll',()=>window.ScrollTrigger.update());
  }
  // Anchor jumps play nice with Lenis
  $$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const id=a.getAttribute('href');if(id.length<2)return;
    const t=document.querySelector(id);if(!t)return;
    e.preventDefault();
    if(lenis)lenis.scrollTo(t,{offset:-80});else t.scrollIntoView({behavior:'smooth'});
  }));

  // ---------- Scroll progress ----------
  const prog=$('#progress');
  const setProg=p=>{if(prog)prog.style.transform=`scaleX(${Math.min(1,Math.max(0,p))})`};
  if(lenis)lenis.on('scroll',({progress})=>setProg(progress??0));
  window.addEventListener('scroll',()=>{
    const h=document.documentElement,p=h.scrollTop/(h.scrollHeight-h.clientHeight||1);setProg(p);
  },{passive:true});

  // ---------- Scroll-driven color themes ----------
  const themed=$$('[data-theme]');
  if(themed.length&&'IntersectionObserver' in window){
    const tio=new IntersectionObserver(es=>es.forEach(e=>{
      if(e.isIntersecting)document.body.dataset.theme=e.target.dataset.theme;
    }),{rootMargin:'-40% 0px -55% 0px'});
    themed.forEach(el=>tio.observe(el));
  }

  // ---------- Reveal on scroll (fallback / base layer) ----------
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
  $$('.reveal').forEach(el=>io.observe(el));

  // ---------- Counters ----------
  const cio=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;cio.unobserve(e.target);
    const el=e.target,end=parseFloat(el.dataset.count),dec=parseInt(el.dataset.decimals||0),suf=el.dataset.suffix||'';
    const t0=performance.now(),dur=1600;
    (function tick(t){const p=Math.min(1,(t-t0)/dur),ease=1-Math.pow(1-p,3);
      el.textContent=(end*ease).toFixed(dec)+suf;if(p<1)requestAnimationFrame(tick)})(t0);
  }),{threshold:.5});
  $$('[data-count]').forEach(el=>cio.observe(el));

  // ---------- Accordions ----------
  $$('.acc-head').forEach(h=>h.addEventListener('click',()=>{
    const acc=h.closest('.acc'),was=acc.classList.contains('open');
    $$('.acc.open',acc.closest('[data-acc-group]')||document).forEach(a=>{a.classList.remove('open');a.querySelector('.acc-head')?.setAttribute('aria-expanded','false')});
    if(!was){acc.classList.add('open');h.setAttribute('aria-expanded','true')}
  }));

  // ---------- Tabs ----------
  $$('[data-tabs]').forEach(wrap=>{
    const btns=$$('[data-tab-btn]',wrap),panes=$$('[data-tab-pane]',wrap);
    btns.forEach(b=>b.addEventListener('click',()=>{
      btns.forEach(x=>x.classList.remove('active'));panes.forEach(p=>p.classList.add('hidden'));
      b.classList.add('active');wrap.querySelector(`[data-tab-pane="${b.dataset.tabBtn}"]`)?.classList.remove('hidden');
    }));
  });

  // ---------- Footer year ----------
  $$('#year').forEach(el=>el.textContent=new Date().getFullYear());

  // ---------- Newsletter ----------
  $$('#nlForm').forEach(f=>f.addEventListener('submit',e=>{
    e.preventDefault();const em=$('input[type=email]',f);
    if(!em||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)){em?.classList.add('err');return}
    em.classList.remove('err');f.reset();
    const ok=$('#nlOk');if(ok){ok.classList.remove('hidden');setTimeout(()=>ok.classList.add('hidden'),4000)}
  }));

  // ---------- Contact form ----------
  const cf=$('#contactForm');
  if(cf){
    const setErr=(n,bad)=>{n.classList.toggle('err',bad);const e=n.parentElement?.querySelector('.ferr');if(e)e.classList.toggle('hidden',!bad);return !bad};
    cf.addEventListener('submit',e=>{
      e.preventDefault();
      const name=$('#cfName'),email=$('#cfEmail'),svc=$('#cfService'),msg=$('#cfMsg');
      let ok=true;
      ok=setErr(name,name.value.trim().length<2)&&ok;
      ok=setErr(email,!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))&&ok;
      ok=setErr(msg,msg.value.trim().length<10)&&ok;
      if(svc)ok=setErr(svc,!svc.value)&&ok;
      if(!ok){$('#cfError')?.classList.remove('hidden');return}
      $('#cfError')?.classList.add('hidden');
      const btn=$('#cfSubmit'),spin=$('#cfSpin'),lbl=$('#cfLabel');
      btn.disabled=true;spin?.classList.remove('hidden');if(lbl)lbl.textContent='Sending…';
      setTimeout(()=>{cf.reset();btn.disabled=false;spin?.classList.add('hidden');if(lbl)lbl.textContent='Request Free Audit';
        $('#cfSuccess')?.classList.remove('hidden');$('#cfSuccess')?.scrollIntoView({behavior:'smooth',block:'center'});
        setTimeout(()=>$('#cfSuccess')?.classList.add('hidden'),8000);
      },1400);
    });
    $$('.field',cf).forEach(n=>n.addEventListener('input',()=>n.classList.remove('err')));
  }

  // ---------- Audit modal ----------
  const modal=$('#auditModal');
  $$('[data-open-audit]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();modal?.classList.remove('hidden');document.body.style.overflow='hidden';if(lenis)lenis.stop()}));
  const close=()=>{modal?.classList.add('hidden');document.body.style.overflow='';if(lenis)lenis.start()};
  $('#auditClose')?.addEventListener('click',close);
  modal?.addEventListener('click',e=>{if(e.target===modal)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});

  /* ================= FX ================= */

  // ---------- Cursor glow ----------
  const cur=$('#cursor');
  if(cur&&finePointer&&!reduced){
    let x=innerWidth/2,y=innerHeight/2,cx=x,cy=y,shown=false;
    addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;
      if(!shown){shown=true;cur.style.opacity='1'}
      cur.style.background='radial-gradient(circle,rgba(99,102,241,.16),transparent 62%)';
    },{passive:true});
    document.addEventListener('mouseleave',()=>{shown=false;cur.style.opacity='0'});
    (function loop(){cx+=(x-cx)*.08;cy+=(y-cy)*.08;
      cur.style.transform=`translate(${cx}px,${cy}px)`;requestAnimationFrame(loop)})();
  }

  // ---------- Split-text hero reveal ----------
  $$('[data-split]').forEach(el=>{
    const walk=node=>{
      if(node.nodeType===3){
        const frag=document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(part=>{
          if(!part)return;
          if(/^\s+$/.test(part)){frag.appendChild(document.createTextNode(' '));return}
          const w=document.createElement('span');w.className='w-line';
          const inner=document.createElement('span');inner.className='w-inner';inner.textContent=part;
          w.appendChild(inner);frag.appendChild(w);
        });
        node.replaceWith(frag);
      }else if(node.nodeType===1)node.childNodes.forEach(walk);
    };
    el.childNodes.forEach(walk);
  });

  // ---------- GSAP choreography + scrub parallax ----------
  if(window.gsap&&!reduced){
    if(window.ScrollTrigger)gsap.registerPlugin(ScrollTrigger);
    $$('[data-split]').forEach((el,i)=>{
      gsap.to(el.querySelectorAll('.w-inner'),
        {yPercent:0,duration:1.1,ease:'power4.out',stagger:.06,delay:.15+i*.1});
    });
    if(window.ScrollTrigger){
      $$('[data-parallax]').forEach(el=>{
        const sp=parseFloat(el.dataset.parallax||.15);
        gsap.to(el,{yPercent:sp*100,ease:'none',
          scrollTrigger:{trigger:el.closest('section')||el,start:'top bottom',end:'bottom top',scrub:1}});
      });
      $$('.ticker').forEach(t=>gsap.to(t,{xPercent:-8,ease:'none',
        scrollTrigger:{trigger:t,start:'top bottom',end:'bottom top',scrub:2}}));
    }
  }else{
    // No GSAP (CDN blocked): show split text statically
    $$('.w-inner').forEach(w=>w.style.transform='none');
  }

  // ---------- Hero particle network ----------
  const cv=$('#stars');
  if(cv){
    const ctx=cv.getContext('2d');
    let W,H,pts=[],mx=-999,my=-999;
    const N=innerWidth<640?36:70;
    const size=()=>{const r=cv.parentElement.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);
      W=r.width;H=r.height;cv.width=W*d;cv.height=H*d;ctx.setTransform(d,0,0,d,0,0)};
    size();addEventListener('resize',size);
    for(let i=0;i<N;i++)pts.push({x:Math.random(),y:Math.random(),vx:(Math.random()-.5)*.0009,vy:(Math.random()-.5)*.0009,r:Math.random()*1.6+.4});
    cv.parentElement.addEventListener('mousemove',e=>{const r=cv.getBoundingClientRect();mx=(e.clientX-r.left)/r.width;my=(e.clientY-r.top)/r.height},{passive:true});
    cv.parentElement.addEventListener('mouseleave',()=>{mx=my=-999});
    let visible=true;
    new IntersectionObserver(es=>visible=es[0].isIntersecting).observe(cv);
    const draw=()=>{
      ctx.clearRect(0,0,W,H);
      const P=pts.map(p=>({x:p.x*W,y:p.y*H,p}));
      ctx.lineWidth=1;
      for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){
        const dx=P[i].x-P[j].x,dy=P[i].y-P[j].y,d=Math.hypot(dx,dy),max=W*.14;
        if(d<max){ctx.strokeStyle=`rgba(99,102,241,${(1-d/max)*.28})`;
          ctx.beginPath();ctx.moveTo(P[i].x,P[i].y);ctx.lineTo(P[j].x,P[j].y);ctx.stroke()}
      }
      P.forEach(q=>{
        const dx=q.x-mx*W,dy=q.y-my*H,d=Math.hypot(dx,dy);
        ctx.fillStyle=d<120?'rgba(52,211,153,.9)':'rgba(147,163,255,.8)';
        ctx.beginPath();ctx.arc(q.x,q.y,q.p.r+(d<120?1:0),0,7);ctx.fill();
      });
      if(!reduced&&visible){
        pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;
          const dx=p.x-mx,dy=p.y-my,d=Math.hypot(dx,dy);
          if(d<.09&&d>0){p.x+=dx/d*.0016;p.y+=dy/d*.0016}
          if(p.x<0||p.x>1)p.vx*=-1;if(p.y<0||p.y>1)p.vy*=-1;
          p.x=Math.min(1,Math.max(0,p.x));p.y=Math.min(1,Math.max(0,p.y))});
      }
      if(!reduced&&visible)requestAnimationFrame(draw);
    };
    draw();
  }

  // ---------- Magnetic buttons ----------
  if(finePointer&&!reduced)$$('[data-magnetic]').forEach(el=>{
    el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();
      const x=(e.clientX-r.left-r.width/2)/r.width,y=(e.clientY-r.top-r.height/2)/r.height;
      el.style.transform=`translate(${x*10}px,${y*8}px)`},{passive:true});
    el.addEventListener('mouseleave',()=>el.style.transform='');
  });

  // ---------- Card spotlight ----------
  if(finePointer)$$('.card').forEach(c=>{
    c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect();
      c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')},{passive:true});
  });
})();
