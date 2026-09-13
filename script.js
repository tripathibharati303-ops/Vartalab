/* =====================================================================
   VARTALAB — single-file responsive web app (front-end prototype)
   NOTE: This is a client-side prototype. Passwords here are only lightly
   hashed to demonstrate the flow; a production build MUST hash on the
   server with a slow, salted algorithm (bcrypt/argon2) and never store
   plaintext. Extensible so AI / call-driven services can be added later.
   ===================================================================== */
"use strict";

const $ = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>[...el.querySelectorAll(s)];
const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = () => Math.random().toString(36).slice(2,10);

/* ---------- tiny hash (DEMO ONLY) ---------- */
function hash(s){let h=0;for(let i=0;i<s.length;i++){h=((h<<5)-h+s.charCodeAt(i))|0;}return "v1$"+(h>>>0).toString(36);}

/* ============ STORAGE ============ */
const _mem = {}; // in-memory fallback so the app also runs where localStorage is blocked (e.g. sandboxed previews)
const store = {
  get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):(k in _mem?_mem[k]:d);}catch(e){return (k in _mem?_mem[k]:d);}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){} _mem[k]=v;},
  del(k){try{localStorage.removeItem(k);}catch(e){} delete _mem[k];}
};

/* ============ SEED DATA ============ */
const SKILLS=[
  {id:"tenses",name:"Tenses",cat:"Grammar",lv:"Core"},
  {id:"articles",name:"Articles",cat:"Grammar",lv:"Core"},
  {id:"prep",name:"Prepositions",cat:"Grammar",lv:"Core"},
  {id:"svo",name:"Sentence Structure",cat:"Grammar",lv:"Core"},
  {id:"cond",name:"Conditionals",cat:"Grammar",lv:"Advanced"},
  {id:"reported",name:"Reported Speech",cat:"Grammar",lv:"Advanced"},
  {id:"vocab",name:"Vocabulary",cat:"Lexis",lv:"Core"},
  {id:"cohesion",name:"Cohesion & Linking",cat:"Writing",lv:"Advanced"}
];

const LESSONS=[
  {id:"l-tenses",skill:"tenses",title:"Present Perfect: talking about experience",diff:"Intermediate",tag:"IELTS",
   expl:"The present perfect links the past to now. We form it with <b>have/has + past participle</b>. Use it for life experience, recent actions with a present result, and unfinished time ('so far', 'this week').",
   examples:["I have visited Goa twice.","She has just finished her homework.","We have lived here since 2020."],
   questions:[
     {q:"Choose the correct sentence.",opts:["I have went to the market.","I have gone to the market.","I has gone to the market.","I have go to the market."],a:1,expl:"The past participle of 'go' is 'gone'. 'Have' is used with 'I', giving 'I have gone'."},
     {q:"___ you ever ___ to a music festival?",opts:["Did / go","Have / been","Have / went","Has / be"],a:1,expl:"'Ever' signals life experience, so we use the present perfect 'Have you ever been'."}
   ]},
  {id:"l-articles",skill:"articles",title:"Articles: a, an, the",diff:"Beginner",tag:"General",
   expl:"Use <b>a</b> before consonant sounds, <b>an</b> before vowel sounds, and <b>the</b> when the listener already knows which thing we mean.",
   examples:["I saw a dog.","He is an engineer.","The sun rises in the east."],
   questions:[
     {q:"She bought ___ umbrella.",opts:["a","an","the","no article"],a:1,expl:"'Umbrella' starts with a vowel sound (/ʌ/), so we use 'an'."},
     {q:"I need ___ help with my homework.",opts:["a","an","the","no article"],a:3,expl:"'Help' is an uncountable noun used generally, so no article is needed."}
   ]},
  {id:"l-preps",skill:"prep",title:"Prepositions of time and place",diff:"Intermediate",tag:"IELTS",
   expl:"Use <b>in</b> for months, years and large areas; <b>on</b> for days and dates; <b>at</b> for clock times and very specific points.",
   examples:["The meeting is at 9 am.","We go on holiday in July.","I live on the second floor."],
   questions:[
     {q:"The course starts ___ Monday.",opts:["in","on","at","by"],a:1,expl:"Use 'on' for days of the week."},
     {q:"I'll see you ___ the morning.",opts:["on","at","in","for"],a:2,expl:"Use 'in' with parts of the day like the morning, afternoon and evening."}
   ]},
  {id:"l-svo",skill:"svo",title:"Word order: subject–verb–object",diff:"Beginner",tag:"General",
   expl:"English statements usually follow <b>Subject + Verb + Object</b> (SVO). Adjectives go before the noun and adverbs of frequency go before the main verb.",
   examples:["She reads books.","They often travel.","He drives a red car."],
   questions:[
     {q:"Arrange correctly: 'She / every day / English / studies'",opts:["She studies English every day.","She studies every day English.","She every day studies English.","English she studies every day."],a:0,expl:"SVO order plus time at the end: 'She studies English every day.'"}
   ]},
  {id:"l-cond",skill:"cond",title:"First & second conditionals",diff:"Advanced",tag:"IELTS",
   expl:"<b>First conditional</b> (real future): If + present, will + verb. <b>Second conditional</b> (unreal/hypothetical): If + past, would + verb.",
   examples:["If it rains, I will stay home.","If I were rich, I would travel the world."],
   questions:[
     {q:"If I ___ more time, I would learn a new language.",opts:["have","had","will have","would have"],a:1,expl:"Second conditional uses past simple in the if-clause: 'If I had more time'."}
   ]},
  {id:"l-reported",skill:"reported",title:"Reported speech",diff:"Advanced",tag:"Interview",
   expl:"When we report what someone said, we usually shift tenses back one step and change pronouns and time expressions.",
   examples:["He said, 'I am tired.' → He said he was tired.","'I will go.' → She said she would go."],
   questions:[
     {q:"She said, 'I like coffee.' → She said that she ___ coffee.",opts:["likes","liked","will like","like"],a:1,expl:"Present simple shifts back to past simple in reported speech: 'liked'."}
   ]}
];

function seedQuestions(cont){
  return [
    {q:"Which word is the correct form to complete: 'She ___ to the library every Saturday.'",type:"mcq",skill:"tenses",opts:["go","goes","going","gone"],a:1,score:1},
    {q:"Choose the correct article: 'He is ___ honest man.'",type:"mcq",skill:"articles",opts:["a","an","the","—"],a:1,score:1},
    {q:"Choose the best word to fill the gap: 'The population of the city has ___ rapidly.'",type:"mcq",skill:"vocab",opts:["grown","growing","grow","grew"],a:0,score:1},
    {q:"In the paragraph, which sentence best belongs after sentence 2?",type:"mcq",skill:"cohesion",opts:["Sentence A","Sentence B","Sentence C","Sentence D"],a:2,score:1}
  ];
}

const SEED={
  users:[
    {id:"u-admin",name:"Varta Admin",email:"admin@vartalab.in",ph:hash("admin123"),role:"admin",goal:"General English",level:"B1",vis:"public",avatar:"#4f46e5"},
    {id:"u-1",name:"Ananya S.",email:"ananya@example.com",ph:hash("pass123"),role:"user",goal:"IELTS",level:"B2",vis:"public",avatar:"#6d5efc",rating:1240,peak:1264},
    {id:"u-2",name:"Rahul M.",email:"rahul@example.com",ph:hash("pass123"),role:"user",goal:"Interview",level:"B1",vis:"public",avatar:"#0d9488",rating:1180,peak:1195},
    {id:"u-3",name:"Priya K.",email:"priya@example.com",ph:hash("pass123"),role:"user",goal:"Higher Studies",level:"C1",vis:"public",avatar:"#e11d48",rating:1320,peak:1340},
    {id:"u-4",name:"Dev P.",email:"dev@example.com",ph:hash("pass123"),role:"user",goal:"Speaking",level:"A2",vis:"public",avatar:"#f59e0b",rating:980,peak:990},
    {id:"u-5",name:"Ishita R.",email:"ishita@example.com",ph:hash("pass123"),role:"user",goal:"General English",level:"B1",vis:"public",avatar:"#16a34a",rating:1090,peak:1110},
    {id:"u-6",name:"Meera J.",email:"meera@example.com",ph:hash("pass123"),role:"user",goal:"Writing",level:"B2",vis:"public",avatar:"#7c3aed",rating:1150,peak:1160}
  ],
  achievements:[
    {id:"a-first",name:"First Step",desc:"Completed your diagnostic",ic:"🚀"},
    {id:"a-lesson10",name:"On a Roll",desc:"Completed 10 lessons",ic:"📚"},
    {id:"a-contest",name:"Arena Rookie",desc:"Joined your first IELTS Arena contest",ic:"⚔️"},
    {id:"a-week3",name:"Consistency",desc:"Practised 3 weeks in a row",ic:"🔥"},
    {id:"a-c1300",name:"1300 Club",desc:"Reached a rating of 1300",ic:"🏆"},
    {id:"a-com",name:"Community",desc:"Joined 3 CO-LAB communities",ic:"🤝"}
  ],
  contests:[
    {id:"c-now",title:"Weekly IELTS Arena #42",type:"IELTS",duration:20,start:Date.now()+2*864e5,end:Date.now()+9*864e5,status:"upcoming",rules:["20 minutes, single attempt","4 questions covering grammar, vocabulary & cohesion","Score-based rating update","Practice contest — NOT an official IELTS examination"],questions:seedQuestions("c-now")},
    {id:"c-prev1",title:"Weekly IELTS Arena #41",type:"IELTS",duration:20,start:Date.now()-7*864e5,end:Date.now()-6*864e5,status:"closed",questions:seedQuestions("c-prev1")},
    {id:"c-prev2",title:"Weekly IELTS Arena #40",type:"IELTS",duration:20,start:Date.now()-14*864e5,end:Date.now()-13*864e5,status:"closed",questions:seedQuestions("c-prev2")}
  ],
  communities:[
    {id:"com1",name:"IELTS Boosters",desc:"Weekly band-9 strategy sessions for IELTS aspirants.",goal:"IELTS",level:"B1+",moderator:"Varta Admin",members:[],sessions:[{t:"Band 7 Writing: Task 2 planning",d:"Sat · 6:00 PM IST","on":true}],feed:[{u:"Priya K.",t:"Great session on essay structure! Anyone want to form a 30-min group practice on Tuesday? 🗓️",ts:"2h"}]},
    {id:"com2",name:"Interview Prep Circle",desc:"Mock interview rounds, D-day mindset and body-language tips.",goal:"Interview",level:"Any",moderator:"Rahul M.",members:[],sessions:[{t:"Live mock interview — round 2",d:"Thu · 7:30 PM IST","on":true}],feed:[{u:"Dev P.",t:"Shared my latest mock answers, feedback appreciated! 🙏",ts:"5h"}]},
    {id:"com3",name:"Grammar-first Club",desc:"Daily grammar quirks, mini-quizzes and weak-area drills.",goal:"General English",level:"Beginner+",moderator:"Ananya S.",members:[],sessions:[],feed:[{u:"Ishita R.",t:"The article rule finally clicked after yesterday's session. 🎉",ts:"1d"}]},
    {id:"com4",name:"Speaking Squad",desc:"Practice speaking out loud and get gentle, structured feedback.",goal:"Speaking",level:"A2+",moderator:"Varta Admin",members:[],sessions:[{t:"Fluency circle — 15 min talks",d:"Sun · 5:00 PM IST","on":true}],feed:[{u:"Meera J.",t:"Recording myself each day is making a real difference. 💪",ts:"3h"}]}
  ],
  events:[
    {id:"e1",type:"Movie Discussion",title:"English Movie Discussion: 'Inside Out'",host:"Ananya S.",date:"Sun · 5:30 PM IST",mode:"Online",cap:20,desc:"Watch, discuss and debate emotions vocabulary in a friendly group.",reg:0},
    {id:"e2",type:"Debate",title:"Debate: Social media helps society",host:"Vartalab Team",date:"Sat · 4:00 PM IST",mode:"Online",cap:30,desc:"Structure your argument, use linking words and rebut a view.",reg:0},
    {id:"e3",type:"Interview Practice",title:"Mock Interview: 5-minute rounds",host:"Rahul M.",date:"Thu · 7:30 PM IST",mode:"Online",cap:12,desc:"One-to-one mock interviews with timed feedback.",reg:0},
    {id:"e4",type:"Poetry",title:"Poetry & Rhythm Evening",host:"Meera J.",date:"Wed · 6:00 PM IST",mode:"Online",cap:25,desc:"Read and perform short English poems; focus on stress and flow.",reg:0},
    {id:"e5",type:"Competition",title:"ACT-LAB Speaking Contest",host:"Vartalab Team",date:"Fri · 7:00 PM IST",mode:"Offline",cap:40,desc:"In-person speaking competition at the Vartalab centre.",reg:0},
    {id:"e6",type:"Dialogue",title:"Dialogue Cafe: Role-play scenarios",host:"Priya K.",date:"Tue · 6:30 PM IST",mode:"Online",cap:18,desc:"Simulated everyday and professional dialogues.",reg:0}
  ],
  leaderboard:[
    {id:"u-3",pts:1640},{id:"u-1",pts:1520},{id:"u-2",pts:1410},{id:"u-6",pts:1330},{id:"u-5",pts:1205},{id:"u-4",pts:1010}
  ],
  adminLog:[]
};

/* ============ STATE ============ */
let DB = store.get("vartha_db", null);
if(!DB){ DB = JSON.parse(JSON.stringify(SEED)); store.set("vartha_db", DB); }
function save(){ store.set("vartha_db", DB); }
let SESSION = store.get("vartha_session", null);
let state = { view:"home", contestId:null, lessonId:null, practiceTab:"speaking", lbTab:"global", learnCat:null };

function me(){ return SESSION ? DB.users.find(u=>u.id===SESSION) : null; }
function getUser(id){ return DB.users.find(u=>u.id===id); }
function myAttempts(){ return (DB.attempts||[]).filter(a=>a.userId===SESSION); }
function contestAttemptsOf(uid){ return (DB.cAttempts||[]).filter(a=>a.userId===uid); }

/* persist extra DB collections */
function dbArr(key){ if(!DB[key]) DB[key]=[]; return DB[key]; }

/* ============ ROUTER ============ */
const AUTH_VIEWS = new Set(["dashboard","learn","lesson","practice","arena","contest","result","leaderboard","profile","colab","actlab","admin","onboarding"]);
function needAuth(view){ return AUTH_VIEWS.has(view) || view.startsWith("admin"); }

function go(view, opts={}){
  if(needAuth(view) && !me()){
    toast("Please log in to continue.","err");
    openAuth("login");
    return;
  }
  if(view.startsWith("admin") && me() && me().role!=="admin"){
    toast("Admin access only.","err");
    view="profile";
  }
  state.view=view;
  if(opts.lessonId) state.lessonId=opts.lessonId;
  if(opts.contestId) state.contestId=opts.contestId;
  if(opts.practiceTab) state.practiceTab=opts.practiceTab;
  if(opts.lbTab) state.lbTab=opts.lbTab;
  render();
  window.scrollTo({top:0,behavior:"smooth"});
}

/* ============ RENDER ============ */
function render(){
  renderNav();
  const app=$("#app");
  const v=state.view;
  if(v==="home") app.innerHTML=viewHome();
  else if(v==="how") app.innerHTML=viewHow();
  else if(v==="about") app.innerHTML=viewAbout();
  else if(v==="learn") app.innerHTML=viewLearn();
  else if(v==="lesson") app.innerHTML=viewLesson();
  else if(v==="practice") app.innerHTML=viewPractice();
  else if(v==="arena") app.innerHTML=viewArena();
  else if(v==="contest") app.innerHTML=viewContest();
  else if(v==="result") app.innerHTML=viewResult();
  else if(v==="leaderboard") app.innerHTML=viewLeaderboard();
  else if(v==="profile") app.innerHTML=viewProfile();
  else if(v==="colab") app.innerHTML=viewColab();
  else if(v==="actlab") app.innerHTML=viewActLab();
  else if(v==="onboarding") app.innerHTML=viewOnboarding();
  else if(v==="admin") app.innerHTML=viewAdmin();
  else app.innerHTML=viewHome();
  renderFooter();
  window.dispatchEvent(new Event("appRendered"));
}

/* ============ NAV ============ */
function renderNav(){
  const u=me();
  const links = [
    ["home","Home"],["how","How It Works"],["learn","Learn"],["arena","IELTS Arena"],
    ["practice","Practice"],["colab","CO-LAB"],["actlab","ACT-LAB"],["leaderboard","Leaderboard"],
    ["profile","Profile"],["about","About"]
  ];
  let html = links.map(([k,lbl])=>{
    let href = k==="how"?"#/how":("#/"+k);
    return `<a href="${href}" class="${state.view===k?'active':''}" onclick="go('${k}');return false;">${lbl}</a>`;
  }).join("");
  $("#topnav").innerHTML=html;

  const cta = u
    ? `<span style="display:flex;align-items:center;gap:10px">
         <span style="display:flex;align-items:center;gap:8px">
           <span class="avatar" style="width:32px;height:32px;border-radius:50%;background:${u.avatar}">${esc(u.name.split(" ")[0][0])}</span>
           <span style="font-weight:700;font-size:.9rem">${esc(u.name.split(" ")[0])}</span>
         </span>
         <button class="btn btn-primary btn-sm" onclick="gotoProfile()">Dashboard</button>
         ${u.role==="admin"?`<button class="btn btn-soft btn-sm" onclick="go('admin');return false;">Admin</button>`:""}
         <button class="btn btn-ghost btn-sm" onclick="logout()">Log out</button>
       </span>`
    : `<button class="btn btn-ghost btn-sm" onclick="openAuth('login')">Log in</button>
       <button class="btn btn-primary btn-sm" onclick="openAuth('signup')">Sign up</button>`;
  $("#navcta").innerHTML=cta;

  // mobile menu
  let m = links.map(([k,lbl])=>`<a href="#/${k}" onclick="go('${k}');toggleMenu();return false;">${lbl}</a>`).join("");
  m += `<div class="menu-cta">` + (u
    ? `<a style="text-align:center;color:var(--brand)" onclick="toggleMenu();">${esc(u.name)}</a>
       <button class="btn btn-primary btn-block" onclick="toggleMenu();go('profile');">Dashboard</button>
       ${u.role==="admin"?`<button class="btn btn-soft btn-block" onclick="toggleMenu();go('admin');">Admin</button>`:""}
       <button class="btn btn-ghost btn-block" onclick="toggleMenu();logout();">Log out</button>`
    : `<button class="btn btn-primary btn-block" onclick="toggleMenu();openAuth('signup');">Sign up for free</button>
       <button class="btn btn-ghost btn-block" onclick="toggleMenu();openAuth('login');">Log in</button>`);
  $("#mmenu").innerHTML=m;
}
function gotoProfile(){ go(me()? (me().role==="admin"?"admin":"profile") : "home"); }
function toggleMenu(){ $("#mmenu").style.display = $("#mmenu").style.display==="flex"?"none":"flex"; }
const _burger=()=>toggleMenu();

/* ============ FOOTER ============ */
function renderFooter(){
  $("#footer").innerHTML=`
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <div class="brand-foot" style="margin-bottom:14px"><span class="mark"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 5l7 14L20 5" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span> Vartalab</div>
        <p style="color:#9aa3b8;font-size:.92rem;max-width:300px">A student-focused English communication platform. Learn grammar-first, practise with confidence, and see your progress.</p>
        <div class="chip-row" style="margin-top:16px">
          <span class="tag teal" style="background:rgba(255,255,255,.09);color:#7fe3d4">Learn</span>
          <span class="tag brand" style="background:rgba(255,255,255,.09);color:#b9aaff">CO-LAB</span>
          <span class="tag accent" style="background:rgba(255,255,255,.09);color:#ffb394">ACT-LAB</span>
        </div>
      </div>
      <div>
        <h4>Product</h4>
        <a href="#/learn" onclick="go('learn');return false;">Learn</a>
        <a href="#/arena" onclick="go('arena');return false;">IELTS Arena</a>
        <a href="#/practice" onclick="go('practice');return false;">Practice</a>
        <a href="#/colab" onclick="go('colab');return false;">CO-LAB</a>
        <a href="#/actlab" onclick="go('actlab');return false;">ACT-LAB</a>
      </div>
      <div>
        <h4>Company</h4>
        <a href="#/about" onclick="go('about');return false;">About</a>
        <a href="#/how" onclick="go('how');return false;">How it works</a>
        <a href="#/contact" onclick="go('about');return false;">Contact</a>
        <a href="#/about" onclick="go('about');return false;">Terms of service</a>
        <a href="#/about" onclick="go('about');return false;">Privacy policy</a>
      </div>
      <div>
        <h4>Support</h4>
        <a href="mailto:support@vartalab.in">support@vartalab.in</a>
        <a href="#/colab" onclick="go('colab');return false;">Join a community</a>
        <a href="#/actlab" onclick="go('actlab');return false;">Attend an event</a>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© 2026 Vartalab. All rights reserved.</span>
      <span>Practice contests are not official IELTS examinations.</span>
    </div>
  </div>`;
}

/* ============ TOAST ============ */
function toast(msg, type="success"){
  const t=document.createElement("div");
  t.className="toast "+type;
  t.textContent=msg;
  $("#toasts").appendChild(t);
  setTimeout(()=>{t.style.opacity="0";t.style.transform="translateY(8px)";},2600);
  setTimeout(()=>t.remove(),2900);
}

/* ============ HOME (public) ============ */
function pillar(ic,grad,label,title,desc,href){
  return `<div class="card card-hover pillar pad" onclick="go('${href}');return false;" style="cursor:pointer">
    <span class="ic" style="background:${grad}">${ic}</span>
    <h3>${title}</h3>
    <p>${desc}</p>
    <span class="tag brand" style="align-self:flex-start;margin-top:4px">${label}</span>
  </div>`;
}
function viewHome(){
  const cat = icons;
  return `
  <section class="hero">
    <div class="wrap hero-inner">
      <div>
        <span class="hero-kicker"><span class="dot"></span> Grammar-first · Student-friendly · Mobile-first</span>
        <h1>Build your English. <br><span class="grad">Practise with confidence.</span> <br>See your progress.</h1>
        <p>Vartalab is a student-focused English communication platform. Learn grammar through short lessons, practise speaking and writing, join communities, and compete in weekly IELTS-style contests.</p>
        <div class="hero-cta">
          <button class="btn btn-primary btn-lg" onclick="startLearning()">Start learning<span style="font-size:1.2em;line-height:1">→</span></button>
          <button class="btn btn-ghost btn-lg" onclick="go('arena');return false;">Explore IELTS Arena</button>
        </div>
        <div class="hero-stats">
          <div class="hero-stat"><b>15+</b><span>Grammar skills</span></div>
          <div class="hero-stat"><b>Weekly</b><span>IELTS-style contests</span></div>
          <div class="hero-stat"><b>Live</b><span>CO-LAB communities</span></div>
        </div>
      </div>
      <div class="hero-panel">
        <div class="demo-card">
          <div class="demo-top">
            <span class="avatar" style="background:#6d5efc">A</span>
            <div><b>Ananya S.</b><span>Goal: IELTS · Band 7 target</span></div>
            <span class="demo-chip">▲ +24</span>
          </div>
          <div class="demo-row"><span class="lbl">Weekly progress</span><b style="color:var(--brand)">68%</b></div>
          <div class="bar"><i style="width:68%"></i></div>
          <div class="demo-row"><span class="lbl">Grammar mastery</span><b style="color:var(--brand)">B2</b></div>
          <div class="bar"><i style="width:55%"></i></div>
          <div class="demo-row"><span class="lbl">This week's rating</span><b style="color:var(--accent)">1,240</b></div>
          <div class="bar amber"><i style="width:76%"></i></div>
        </div>
        <div class="demo-float float1" style="display:flex;gap:8px;align-items:center">
          <span class="tag green">🏆 Arena #41</span><b>Rank 2</b>
        </div>
        <div class="demo-float float2">
          <span class="sk">Achievement</span><br><b style="font-size:.9rem">🔥 3-week streak</b>
        </div>
      </div>
    </div>
  </section>

  <section class="section tight">
    <div class="wrap">
      <div class="sec-head">
        <span class="eyebrow">One learning loop</span>
        <h2>Learn → Practise → Participate → Compete → Progress</h2>
        <p>Every part of Vartalab is built around a single motivating cycle designed to turn effort into visible improvement.</p>
      </div>
      <div class="steps">
        ${[["Take a short diagnostic","Discover your starting level and grammar strengths."],
           ["Get your learning path","A personalised route based on your goal."],
           ["Learn grammar-first","Short explanations, examples, then guided practice."],
           ["Practise speaking & writing","Structured prompts with feedback."],
           ["Join community activities","CO-LAB groups and ACT-LAB events."],
           ["Compete in contests","Weekly IELTS-style Arena contests."],
           ["Track rating & progress","Leaderboards, badges and your profile."]]
          .map((s,i)=>`<div class="step"><span class="num">${i+1}</span><h4>${s[0]}</h4><p>${s[1]}</p></div>`).join("")}
      </div>
    </div>
  </section>

  <section class="section tight" style="padding-top:40px">
    <div class="wrap">
      <div class="sec-head">
        <span class="eyebrow">Three core pillars</span>
        <h2>Everything you need, in one place</h2>
        <p>Structured learning, community and real competition — designed specifically for students.</p>
      </div>
      <div class="grid g3">
        ${pillar(cat.grad,"linear-gradient(135deg,var(--brand),var(--brand-2))","Learn","Structured grammar-first learning","Short grammar lessons, interactive questions and instant feedback that record your weak areas.","learn")}
        ${pillar(cat.group,"linear-gradient(135deg,var(--teal),#0f766e)","CO-LAB","Community groups & live sessions","Join communities by goal and level, take part in moderated sessions and support your peers.","colab")}
        ${pillar(cat.flag,"linear-gradient(135deg,#ff7a54,#ff5a36)","ACT-LAB","Activities & events","Debates, movie nights, poetry, mock interviews and competitions online or in person.","actlab")}
      </div>
    </div>
  </section>

  <section class="section" style="background:#fff">
    <div class="wrap">
      <div class="grid g2" style="align-items:center;gap:40px">
        <div>
          <span class="sk">Why grammar-first?</span>
          <h2 style="margin:12px 0 16px">A solid grammar base makes every other skill stronger</h2>
          <p class="muted" style="margin-bottom:18px">Most learners struggle with the same handful of grammar concepts. Vartalab isolates those concepts, teaches them clearly, then reinforces them through speaking, writing and weekly contests — so the rule actually sticks.</p>
          <ul style="display:flex;flex-direction:column;gap:12px">
            ${[["Diagnostic pinpoints your weak areas","We tag every answer to a specific grammar concept."],
               ["Short, focused lessons","Explanations, examples, then practice in minutes."],
               ["Mistakes become a learning plan","Your dashboard shows which skills need attention."]]
              .map(x=>`<li style="display:flex;gap:10px;align-items:flex-start">
                <span style="width:24px;height:24px;flex-shrink:0;border-radius:8px;background:var(--green-soft);color:var(--green);display:grid;place-items:center;font-weight:800">✓</span>
                <div><b>${x[0]}</b><p class="muted" style="font-size:.9rem">${x[1]}</p></div></li>`).join("")}
          </ul>
        </div>
        <div>
          <div class="card pad">
            <div class="aicb" style="margin-bottom:14px"><b>Grammar mastery</b><span class="tag green">Weak areas</span></div>
            <div style="display:flex;flex-direction:column;gap:14px">
              ${[["Present perfect",62],["Conditionals",40],["Articles",85],["Prepositions",70],["Reported speech",32]]
                .map(s=>`<div>
                  <div class="aicb" style="margin-bottom:6px"><span class="small" style="font-weight:600">${s[0]}</span><span class="small muted">${s[1]}%</span></div>
                  <div class="bar ${s[1]<45?'amber':''}"><i style="width:${s[1]}%"></i></div>
                </div>`).join("")}
            </div>
            <button class="btn btn-primary btn-block mt-16" onclick="go('learn');return false;">Boost your weak areas</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="sec-head">
        <span class="eyebrow">Weekly IELTS-style contests</span>
        <h2>Compete in the IELTS Arena</h2>
        <p>Timed practice contests with a score, rank and rating change. Practice contests — not an official IELTS examination.</p>
      </div>
      <div class="grid g3">
        ${["#41 · Closed","#40 · Closed","#39 · Closed"].map((t,i)=>`
          <div class="card card-hover pad">
            <div class="aicb"><span class="tag ${i===0?'green':i===1?'amber':'brand'}">${t}</span><span class="rating-badge">1,240</span></div>
            <h3 style="margin-top:10px">Weekly IELTS Arena</h3>
            <p class="muted small" style="margin-top:6px">Timed practice · 4 questions · 20 minutes</p>
            <div class="aicb mt-16" style="font-weight:700;font-size:.9rem">Top scorer <span>Band 7.2</span></div>
          </div>`).join("")}
      </div>
      <div class="center mt-24"><button class="btn btn-accent btn-lg" onclick="go('arena');return false;">Join the Arena</button></div>
    </div>
  </section>

  <section class="section" style="background:#fff">
    <div class="wrap">
      <div class="grid g2" style="align-items:center;gap:36px">
        <div class="right" style="display:grid;justify-items:end">
          <div class="card pad" style="max-width:360px;width:100%">
            <div style="display:flex;gap:12px;align-items:center;margin-bottom:16px">
              <span class="avatar" style="background:#7c3aed">P</span>
              <div><b>Priya K.</b><span class="muted" style="font-size:.8rem">Goal: Higher Studies</span></div>
              <span class="rating-badge" style="margin-left:auto">1,320</span>
            </div>
            <div class="aicb small"><span style="font-weight:600">Overall progress</span><b>72%</b></div>
            <div class="bar" style="margin:6px 0 16px"><i style="width:72%"></i></div>
            <div class="chip-row"><span class="tag brand">📚 12 lessons</span><span class="tag green">⚔️ 3 contests</span><span class="tag amber">🔥 3-week streak</span></div>
          </div>
        </div>
        <div>
          <span class="sk">Personal progress</span>
          <h2 style="margin:12px 0 16px">Your progress, rating and achievements — all in one profile</h2>
          <p class="muted" style="margin-bottom:18px">Track your learning goal, current rating, highest rating, percentile, contest history, skill progress and badges. Control whether your profile is public or private.</p>
          <button class="btn btn-primary" onclick="gotoProfile()">See your profile</button>
        </div>
      </div>
    </div>
  </section>

  <section class="section tight" style="padding-top:0;background:#fff">
    <div class="wrap">
      <div class="sec-head">
        <span class="eyebrow">Community activity</span>
        <h2>What's happening in CO-LAB</h2>
      </div>
      <div class="grid g2">
        ${DB.communities.slice(0,4).map(c=>`
          <div class="card card-hover pad">
            <div class="aicb"><b>${esc(c.name)}</b><span class="tag ${c.goal==='IELTS'?'accent':c.goal==='Interview'?'brand':'teal'}">${esc(c.goal)}</span></div>
            <p class="muted small" style="margin:8px 0 12px">${esc(c.desc)}</p>
            <div class="aicb">
              <span class="small muted">${c.feed.length} recent activity</span>
              <button class="btn btn-soft btn-sm" onclick="go('colab');return false;">View group</button>
            </div>
          </div>`).join("")}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="band">
        <h2>Ready to build your English?</h2>
        <p>Start with a short diagnostic, get your personalised learning path, and see real progress within days.</p>
        <button class="btn btn-white btn-lg" onclick="startLearning()">Take the diagnostic</button>
        <div style="margin-top:16px">
          <button class="btn btn-lg" style="background:rgba(255,255,255,.15);color:#fff" onclick="go('how');return false;">How it works</button>
        </div>
      </div>
    </div>
  </section>
  `;
}

function startLearning(){ me() ? go("learn") : openAuth("signup"); }

/* ============ HOW IT WORKS ============ */
function viewHow(){
  return `
  <section class="hero" style="padding-bottom:30px">
    <div class="wrap" style="text-align:center;padding:70px 0 40px;max-width:760px">
      <span class="hero-kicker" style="margin:0 auto"><span class="dot"></span> How it works</span>
      <h1>From first diagnostic to visible progress</h1>
      <p style="margin:16px auto 0;max-width:560px">Vartalab is a simple, motivating loop. Here's exactly how you move through it.</p>
    </div>
  </section>
  <section class="section tight">
    <div class="wrap" style="max-width:860px">
      <div style="display:flex;flex-direction:column;gap:14px">
        ${[["Take a short diagnostic","Tell us your goal, self-assess your level and answer a quick grammar check. You're placed on a path in minutes.","🚀"],
           ["Get your learning path","Based on your goal (IELTS, interview, higher studies, general, speaking or writing) and diagnostic result.","🧭"],
           ["Learn grammar-first","Open a short lesson — explanation, examples, then interactive questions with instant feedback.","📚"],
           ["Practise speaking & writing","Switch between Speaking and Writing, choose a goal, respond to a prompt and receive structured feedback.","🎤"],
           ["Join community activities","Meet peers in CO-LAB groups and attend ACT-LAB events like debates and mock interviews.","🤝"],
           ["Compete in weekly contests","Join the IELTS Arena for a timed practice contest and compete for the best score.","⚔️"],
           ["Track your rating & progress","See your rank, rating change, score breakdown, badges and skill growth on your profile.","📈"]]
          .map((s,i)=>`<div class="card pad" style="display:flex;gap:16px;align-items:flex-start">
            <span style="width:44px;height:44px;flex-shrink:0;border-radius:12px;background:linear-gradient(135deg,var(--brand),var(--brand-2));color:#fff;display:grid;place-items:center;font-size:1.1rem">${s[2]}</span>
            <div>
              <h3 style="margin-bottom:4px">${i+1}. ${s[0]}</h3>
              <p class="muted">${s[1]}</p>
            </div>
          </div>`).join("")}
      </div>
      <div class="notice info mt-32" style="margin-top:32px">
        <span style="font-size:1.2rem">💡</span>
        <div><b>Important:</b> Weekly contests are <b>practice contests</b> for building skill and confidence — they are not an official IELTS examination.</div>
      </div>
      <div class="center mt-24">
        <button class="btn btn-primary btn-lg" onclick="startLearning()">Start your diagnostic</button>
      </div>
    </div>
  </section>`;
}

/* ============ ABOUT / CONTACT ============ */
function viewAbout(){
  return `
  <section class="hero" style="padding-bottom:20px">
    <div class="wrap" style="text-align:center;padding:64px 0 30px;max-width:720px">
      <span class="hero-kicker" style="margin:0 auto"><span class="dot"></span> About Vartalab</span>
      <h1>Helping students speak, write and grow</h1>
      <p style="margin:16px auto 0;max-width:560px">Vartalab is a student-focused English communication platform that turns structured learning, community and competition into real, visible progress.</p>
    </div>
  </section>
  <section class="section tight">
    <div class="wrap">
      <div class="grid g3">
        ${[["📚","Learn","Grammar-first structured lessons and exercises."],
           ["🤝","CO-LAB","Community groups and moderated live sessions."],
           ["🎯","ACT-LAB","Debates, movie nights, mock interviews and competitions."]]
          .map(p=>`<div class="card pad"><div style="font-size:1.6rem">${p[0]}</div><h3 style="margin:10px 0 6px">${p[1]}</h3><p class="muted small">${p[2]}</p></div>`).join("")}
      </div>
      <div class="band mt-32" id="contactband">
        <h2>Get in touch</h2>
        <p>Questions, feedback or support — we'd love to hear from you.</p>
      </div>
      <div class="card pad" style="max-width:620px;margin:-30px auto 0;position:relative;z-index:2">
        <h3 style="margin-bottom:16px">Contact us</h3>
        <div class="field"><label>Your name</label><input id="cname" placeholder="Your name"></div>
        <div class="field"><label>Email</label><input id="cemail" type="email" placeholder="you@example.com"></div>
        <div class="field"><label>Message</label><textarea id="cmsg" rows="4" placeholder="How can we help?"></textarea></div>
        <button class="btn btn-primary btn-block" onclick="submitContact()">Send message</button>
        <p class="muted small center" style="margin-top:14px">For general support email <a href="mailto:support@vartalab.in" style="color:var(--brand)">support@vartalab.in</a></p>
      </div>
    </div>
  </section>`;
}
function submitContact(){
  const n=$("#cname").value.trim(),e=$("#cemail").value.trim(),m=$("#cmsg").value.trim();
  if(!n){return toast("Please enter your name.","err");}
  if(!e||!/[^@ ]+@[^@ ]+[.][^@ ]+/.test(e)){return toast("Please enter a valid email.","err");}
  if(!m){return toast("Please enter a message.","err");}
  toast("Thanks! Your message has been sent.");
  $("#cname").value=$("#cemail").value=$("#cmsg").value="";
}

/* ============ AUTH MODALS ============ */
function openAuth(mode){
  $("#modal").classList.add("open");
  $("#modalBody").innerHTML=`
    <div class="aicb" style="margin-bottom:6px">
      <span class="brand" style="font-size:1.1rem"><span class="mark" style="width:30px;height:30px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 5l7 14L20 5" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>Vart<em>alab</em></span>
      <button onclick="closeModal()" style="background:none;border:none;font-size:1.4rem;color:var(--muted)">×</button>
    </div>
    <p class="muted small" style="margin-bottom:18px">Vartalab is an educational platform to help you build your English.</p>
    ${mode==="signup"?signupHtml():mode==="reset"?resetHtml():loginHtml()}
    <div style="text-align:center;margin-top:16px;font-size:.88rem" class="muted">${mode==="signup"
      ? `Already have an account? <a href="#" onclick="openAuth('login');return false;" style="color:var(--brand);font-weight:700">Log in</a>`
      : `New here? <a href="#" onclick="openAuth('signup');return false;" style="color:var(--brand);font-weight:700">Create an account</a>`}</div>
  `;
}
function loginHtml(){
  return `
    <div class="field"><label>Email or phone</label><input id="loginu" placeholder="you@example.com or +91..."></div>
    <div class="field"><label>Password</label><input id="loginp" type="password" placeholder="••••••••"></div>
    <div class="aicb" style="margin-bottom:16px">
      <label class="small" style="display:flex;align-items:center;gap:6px;font-weight:600"><input type="checkbox" id="remember" checked> Remember me</label>
      <a href="#" onclick="openAuth('reset');return false;" style="color:var(--brand);font-weight:700;font-size:.82rem">Forgot password?</a>
    </div>
    <div class="err" id="loginErr"></div>
    <button class="btn btn-primary btn-block" onclick="doLogin()">Log in</button>
  `;
}
function signupHtml(){
  return `
    <div class="field"><label>Full name</label><input id="su-name" placeholder="Your full name"></div>
    <div class="field"><label>Email</label><input id="su-email" type="email" placeholder="you@example.com"></div>
    <div class="field"><label>Phone (optional)</label><input id="su-phone" placeholder="+91 98765 43210"></div>
    <div class="field"><label>Password</label><input id="su-pass" type="password" placeholder="At least 8 characters"></div>
    <label class="small" style="display:flex;gap:8px;align-items:flex-start;margin-bottom:14px">
      <input type="checkbox" id="su-terms" style="margin-top:3px">
      <span style="font-weight:600">I agree to the <a href="#/about" style="color:var(--brand)" onclick="closeModal();return false;">Terms</a> and <a href="#/about" style="color:var(--brand)" onclick="closeModal();return false;">Privacy Policy</a>.</span>
    </label>
    <div class="err" id="suErr"></div>
    <button class="btn btn-primary btn-block" onclick="doSignup()">Create account</button>
  `;
}
function resetHtml(){
  return `
    <div class="field"><label>Registered email</label><input id="rs-email" type="email" placeholder="you@example.com"></div>
    <div class="field"><label>New password</label><input id="rs-pass" type="password" placeholder="New password"></div>
    <div class="err" id="rsErr"></div>
    <button class="btn btn-primary btn-block" onclick="doReset()">Reset password</button>
    <div style="text-align:center;margin-top:14px"><a href="#" onclick="openAuth('login');return false;" style="color:var(--brand);font-weight:700;font-size:.88rem">Back to login</a></div>
  `;
}
function closeModal(){ $("#modal").classList.remove("open"); }

function doSignup(){
  const name=$("#su-name").value.trim(),email=$("#su-email").value.trim().toLowerCase(),phone=$("#su-phone").value.trim();
  const pass=$("#su-pass").value, terms=$("#su-terms").checked, err=$("#suErr");
  err.classList.remove("show");
  const fail=(m)=>{err.textContent=m;err.classList.add("show");};
  if(name.length<2)return fail("Please enter your full name.");
  if(!/[^@ ]+@[^@ ]+[.][^@ ]+/.test(email))return fail("Please enter a valid email.");
  if(pass.length<8)return fail("Password must be at least 8 characters.");
  if(!terms)return fail("Please accept the Terms and Privacy Policy.");
  if(DB.users.some(u=>u.email===email))return fail("An account with this email already exists.");
  const av = ["#6d5efc","#0d9488","#e11d48","#f59e0b","#16a34a","#7c3aed"][Math.floor(Math.random()*6)];
  const u={id:"u-"+uid(),name,email,phone,ph:hash(pass),role:"user",goal:null,level:null,vis:"public",avatar:av,rating:1000,peak:1000};
  DB.users.push(u); save();
  SESSION=u.id; store.set("vartha_session",u.id);
  closeModal();
  toast("Welcome to Vartalab, "+name.split(" ")[0]+"!");
  go("onboarding");
}

function doLogin(){
  const ident=$("#loginu").value.trim().toLowerCase(),pass=$("#loginp").value,err=$("#loginErr");
  err.classList.remove("show");
  const u=DB.users.find(x=>x.email===ident||x.phone===ident);
  if(!u||u.ph!==hash(pass)){err.textContent="Incorrect email/phone or password.";err.classList.add("show");return;}
  SESSION=u.id; store.set("vartha_session",u.id); closeModal();
  toast("Welcome back, "+u.name.split(" ")[0]+"!");
  go(u.role==="admin"?"admin":"profile");
}

function doReset(){
  const email=$("#rs-email").value.trim().toLowerCase(),pass=$("#rs-pass").value,err=$("#rsErr");
  err.classList.remove("show");
  const u=DB.users.find(x=>x.email===email);
  if(!u){err.textContent="No account found with this email.";err.classList.add("show");return;}
  if(pass.length<8){err.textContent="Password must be at least 8 characters.";err.classList.add("show");return;}
  u.ph=hash(pass); save();
  toast("Password updated. Please log in.");
  openAuth("login");
}

function logout(){ SESSION=null; store.del("vartha_session"); state.view="home"; render(); toast("You've logged out."); }

/* ============ ONBOARDING / DIAGNOSTIC ============ */
const GOALS=["IELTS","Interview","Higher Studies","General English","Speaking","Writing"];
function viewOnboarding(){
  const u=me(); if(!u) return `<div class="wrap section"><div class="empty">Please log in to continue.</div></div>`;
  const step = !u.goal ? 0 : !u.level ? 1 : 2; // 0 goal, 1 level, 2 diagnostic
  const done = (DB.diagnostics||[]).some(d=>d.userId===SESSION);
  if(step===2 && !state.diag && !done){ state.diag={idx:0,score:0,answers:{}}; }
  let body;
  if(step===0) body=onGoal();
  else if(step===1) body=onLevel();
  else if(done) body=diagnosticDoneCard();
  else body=diagnosticHtml();
  return `
  <section style="max-width:760px;margin:0 auto;padding:40px 20px 70px">
    <div class="aicb mb-24">
      <span class="sk">Step ${step+1} of 3</span>
      <span class="tag brand">${u.name.split(" ")[0]}, let's set you up</span>
    </div>
    <div class="bar mb-24"><i style="width:${(step+1)/3*100}%"></i></div>
    <div class="card pad" id="onboardBody">${body}</div>
  </section>`;
}
function diagnosticDoneCard(){
  return `<div class="center">
    <div style="font-size:2.4rem">🎉</div>
    <h3 style="margin:10px 0 6px">Diagnostic complete!</h3>
    <p class="muted">Your learning path is ready. Continue to your dashboard.</p>
    <button class="btn btn-primary btn-lg mt-16" onclick="go('learn')">Go to my dashboard</button>
  </div>`;
}

function onGoal(){
  return `
    <h2 style="margin-bottom:6px">What's your primary goal?</h2>
    <p class="muted" style="margin-bottom:22px">We'll tailor your learning path around this. You can change it anytime.</p>
    <div class="grid g2">
      ${GOALS.map(g=>`<button class="qopt" onclick="setGoal('${g}')"><span class="key">→</span><span>${g}</span></button>`).join("")}
    </div>`;
}
function setGoal(g){
  const u=me(); u.goal=g; save(); render();
}
function onLevel(){
  const u=me();
  const lvls=[["A1","Beginner"],["A2","Elementary"],["B1","Intermediate"],["B2","Upper-intermediate"],["C1","Advanced"],["C2","Proficient"]];
  return `
    <h2 style="margin-bottom:6px">How would you rate your English?</h2>
    <p class="muted" style="margin-bottom:22px">A quick self-assessment — there's no wrong answer.</p>
    <div class="grid g2">
      ${lvls.map(l=>`<button class="qopt" onclick="setLevel('${l[0]}')"><span class="key">${l[0]}</span><span>${l[1]}</span></button>`).join("")}
    </div>`;
}
function setLevel(l){ const u=me(); u.level=l; save(); render(); }

function startDiagnostic(){
  // Called from home CTA / prompts when the user wants an (re)take of the diagnostic.
  if(!(DB.diagnostics||[]).some(d=>d.userId===SESSION)){
    state.diag={idx:0,score:0,answers:{}};
  }
  go("onboarding");
}
function buildDiagnostic(){
  const ded={userId:SESSION,date:Date.now(),score:0};
  if(!DB.diagnostics) DB.diagnostics=[];
  return ded;
}
const DIAG_Q=[
  {skill:"tenses",q:"She ___ to work every day.",opts:["go","goes","going","gone"],a:1},
  {skill:"articles",q:"He is ___ university student.",opts:["a","an","the","no article"],a:0},
  {skill:"prep",q:"The exam is ___ 10 o'clock.",opts:["in","on","at","for"],a:2},
  {skill:"svo",q:"Pick the correct order.",opts:["They play football every Sunday.","They play every Sunday football.","They every Sunday play football.","Play they football every Sunday."],a:0},
  {skill:"cond",q:"If I ___ rich, I would travel.",opts:["am","was","were","be"],a:2},
  {skill:"reported",q:"He said he ___ be late.",opts:["will","would","can","is"],a:1},
  {skill:"vocab",q:"Choose the best word: 'The company will ___ a new product.'",opts:["launch","release","introduce","All of these"],a:3},
  {skill:"cohesion",q:"'However' is best used to...",opts:["add an idea","show contrast","give an example","summarise"],a:1}
];
function diagnosticHtml(){
  const s=state.diag; const q=DIAG_Q[s.idx];
  return `
    <div class="aicb mb-16"><span class="sk">Question ${s.idx+1} of ${DIAG_Q.length}</span><span class="tag brand">${esc(skillName(q.skill))}</span></div>
    <div class="bar mb-16"><i style="width:${(s.idx)/DIAG_Q.length*100}%"></i></div>
    <h3 style="margin-bottom:14px">${esc(q.q)}</h3>
    <div class="grid g2" id="diagOpts">
      ${q.opts.map((o,i)=>`<button class="qopt" onclick="answerDiag(${i})"><span class="key">${"ABCD"[i]}</span><span>${esc(o)}</span></button>`).join("")}
    </div>
    <p class="muted small mt-16">Reading/writing component will be available where practical.</p>`;
}
function answerDiag(i){
  const s=state.diag; const q=DIAG_Q[s.idx];
  state.diag.answers[q.skill]=i==q.a?1:0;
  state.diag.score+= i==q.a?1:0;
  s.idx++;
  if(s.idx>=DIAG_Q.length){ finishDiagnostic(); } else {
    $("#onboardBody").innerHTML=diagnosticHtml();
  }
}
function finishDiagnostic(){
  const s=state.diag;
  const ded={userId:SESSION,date:Date.now(),score:s.score,total:DIAG_Q.length,skills:{...s.answers}};
  dbArr("diagnostics").push(ded); save();
  // award first achievement
  award("a-first");
  toast("Diagnostic complete! Your path is ready.");
  render(); 
  // go to learn but show a little onboarding summary first
  state.view="learn"; render();
}

/* ============ LEARN DASHBOARD ============ */
function skillName(id){ const s=SKILLS.find(x=>x.id===id); return s?s.name:id; }
function completedSkillCount(){
  const att=dbArr("attempts").filter(a=>a.userId===SESSION&&a.correct!==undefined);
  return att;
}
function weakAreas(){
  // aggregate accuracy by skill from attempts + diagnostic
  const map={};
  dbArr("attempts").forEach(a=>{
    if(a.userId!==SESSION)return;
    if(!map[a.skill])map[a.skill]={c:0,t:0};
    map[a.skill].t++; if(a.correct)map[a.skill].c++;
  });
  const diag=(DB.diagnostics||[]).find(d=>d.userId===SESSION);
  if(diag){ Object.keys(diag.skills||{}).forEach(s=>{
    if(!map[s])map[s]={c:0,t:0};
    map[s].t++; if(diag.skills[s])map[s].c++;
  });}
  const rows=Object.entries(map).map(([sk,v])=>({sk,acc:Math.round(v.c/v.t*100)}));
  return rows.sort((a,b)=>a.acc-b.acc);
}
function recommendLesson(){
  const wa=weakAreas();
  if(wa.length) { const s=wa[0].sk; const l=LESSONS.find(x=>x.skill===s); if(l) return l; }
  return LESSONS[0];
}
function viewLearn(){
  const u=me(); if(!u)return "";
  const pending = !u.goal || !u.level || !(DB.diagnostics||[]).some(d=>d.userId===SESSION);
  const wa=weakAreas();
  const rec=recommendLesson();
  const totalAttempts=dbArr("attempts").filter(a=>a.userId===SESSION).length;
  const completed=dbArr("attempts").filter(a=>a.userId===SESSION&&a.lessonId&&a.finished).length;
  const streak=(DB.streak&&DB.streak[SESSION])||3;
  return `
  <div class="app" id="appshell">
    ${sideNav("learn")}
    <div class="main">
      ${pending?`<div class="notice info mb-24">
        <span style="font-size:1.2rem">🧭</span>
        <div><b>Finish your setup to unlock your full path.</b> Take the diagnostic to get a personalised learning plan.
        <button class="btn btn-primary btn-sm" style="margin-left:8px" onclick="go('onboarding')">Take diagnostic</button></div>
      </div>`:""}
      <div class="page-head">
        <div><h2>Your learning dashboard</h2><p>${esc(u.name.split(" ")[0])} · Goal: ${esc(u.goal||"—")} · Level: ${esc(u.level||"—")}</p></div>
        <button class="btn btn-primary" onclick="startLesson()">Continue learning →</button>
      </div>

      <div class="grid g3" style="grid-template-columns:1.4fr 1fr 1fr">
        <div class="card pad">
          <div class="aicb mb-8"><span class="sk">Overall progress</span><b style="color:var(--brand)">${Math.min(100,Math.round(totalAttempts/8*100)) || 0}%</b></div>
          <div class="bar" style="height:12px"><i style="width:${Math.min(100,Math.round(totalAttempts/8*100))}%"></i></div>
          <div class="aicb mt-16" style="font-size:.85rem">
            <span class="muted">${completed} lessons completed</span>
            <span class="tag green">🔥 ${streak}-day streak</span>
          </div>
        </div>
        <div class="card pad">
          <span class="sk">Current rating</span>
          <div class="aicb mt-8">
            <div><b style="font-size:1.7rem;color:var(--brand)">${u.rating||1000}</b><span class="muted small"> · peak ${u.peak||1000}</span></div>
            <span class="rating-badge">★ ${percentileOf(u.id)}th</span>
          </div>
        </div>
        <div class="card pad">
          <span class="sk">Recommended lesson</span>
          <div style="margin-top:10px">
            <b style="font-size:1rem">${esc(rec.title)}</b>
            <p class="muted small mt-8">${esc(skillName(rec.skill))} · ${esc(rec.diff)}</p>
            <button class="btn btn-soft btn-sm mt-8" onclick="startLesson('${rec.id}')">Open lesson</button>
          </div>
        </div>
      </div>

      <div class="grid g2 mt-24" style="grid-template-columns:1.2fr 1fr">
        <div class="card pad">
          <div class="aicb mb-16"><h3>Grammar skill categories</h3></div>
          <div style="display:flex;flex-direction:column;gap:14px">
            ${SKILLS.slice(0,6).map(s=>{
              const row=wa.find(w=>w.sk===s.id);
              const acc=row?row.acc:50;
              return `<div>
                <div class="aicb" style="margin-bottom:6px"><span style="font-weight:600;font-size:.9rem">${esc(s.name)}</span>
                  <span class="tag ${acc>=75?'green':acc>=50?'amber':'rose'}">${acc>=75?'strong':acc>=50?'developing':'weak'}</span></div>
                <div class="bar ${acc<50?'amber':''}"><i style="width:${Math.max(8,acc)}%"></i></div>
              </div>`;
            }).join("")}
          </div>
        </div>
        <div class="card pad">
          <h3 style="margin-bottom:4px">Weak areas</h3>
          <p class="muted small" style="margin-bottom:16px">Focus your practice here.</p>
          ${wa.length? wa.slice(0,5).map(w=>`
            <div class="aicb" style="padding:10px 0;border-bottom:1px solid var(--line-2)">
              <div><b style="font-size:.92rem">${esc(skillName(w.sk))}</b><span class="muted small" style="display:block">${w.acc}% accuracy</span></div>
              <button class="btn btn-soft btn-sm" onclick="startLessonForSkill('${w.sk}')">Practise</button>
            </div>`).join("") : `<div class="empty">No weak areas yet — keep practising! 🎉</div>`}
        </div>
      </div>

      <div class="card pad mt-24">
        <div class="aicb mb-16"><h3>Recently completed</h3><button class="btn btn-soft btn-sm" onclick="go('profile')">View all</button></div>
        ${recentAttemptsHtml()}
        <div class="aicb mt-16">
          <button class="btn btn-primary" onclick="startLesson()">Continue learning</button>
          <button class="btn btn-ghost" onclick="go('practice')">Practice again</button>
        </div>
      </div>
    </div>
  </div>`;
}

function recentAttemptsHtml(){
  const att=dbArr("attempts").filter(a=>a.userId===SESSION&&a.lessonId).slice(-4).reverse();
  if(!att.length) return `<div class="empty"><div style="font-size:1.6rem">📚</div>No lessons yet. Take the diagnostic or start your first lesson.</div>`;
  return att.map(a=>{ const l=LESSONS.find(x=>x.id===a.lessonId); return `
    <div class="aicb" style="padding:12px 0;border-bottom:1px solid var(--line-2)">
      <div><b style="font-size:.92rem">${esc(l?l.title:"Lesson")}</b><span class="muted small" style="display:block">${esc(skillName(a.skill))}</span></div>
      <span class="tag ${a.correct?'green':'rose'}">${a.correct?'✓ passed':'retry'}</span>
    </div>`;}).join("");
}

function startLessonForSkill(sk){ const l=LESSONS.find(x=>x.skill===sk); startLesson(l?l.id:null); }
function startLesson(id){
  const l=id?LESSONS.find(x=>x.id===id):recommendLesson();
  state.lessonId=l.id; state.lessonIdx=0; state.lessonScore=0; state.lessonAsk=null; state.lessonDone=false;
  go("lesson");
}

function sideNav(active){
  const items=[["learn","Learn","book"],["practice","Practice","mic"],["arena","IELTS Arena","flag"],
    ["colab","CO-LAB","group"],["actlab","ACT-LAB","cal"],["leaderboard","Leaderboard","rank"],["profile","Profile","user"]];
  const icons={book:ic.book,mic:ic.mic,flag:ic.flag,group:ic.group,cal:ic.cal,rank:ic.rank,user:ic.user};
  return `<aside class="side" id="sidebar">
    ${items.map(([k,l,i])=>`<a class="${active===k?'active':''}" onclick="go('${k}');return false;">${icons[i]}<span>${l}</span></a>`).join("")}
    ${me() && me().role==="admin"?`<div class="grp">Admin</div><a onclick="go('admin')">${icons.user}<span>Admin panel</span></a>`:""}
    <div class="side-foot">Learning is a loop. Everything you do feeds your progress.</div>
  </aside>
  <button class="btn btn-ghost btn-sm toast-btn" style="margin:0 0 12px" onclick="document.getElementById('sidebar').classList.toggle('open')">☰ Menu</button>`;
}

/* ============ LESSON SCREEN ============ */
function viewLesson(){
  const l=LESSONS.find(x=>x.id===state.lessonId)||LESSONS[0];
  const qi=state.lessonIdx||0;
  const q=l.questions[qi];
  const qa=state.lessonAsk; // index chosen or null
  const revealed=qa!==null;
  const done=state.lessonDone;
  return `
  <div class="app">
    ${sideNav("learn")}
    <div class="main" style="max-width:820px">
      <div class="aicb mb-16">
        <button class="btn btn-ghost btn-sm" onclick="go('learn')">← Back</button>
        <span class="tag brand">${esc(skillName(l.skill))}</span>
        <span class="tag ${l.tag==='IELTS'?'accent':'teal'}">${esc(l.tag)}</span>
      </div>
      <div class="page-head"><div><h2>${esc(l.title)}</h2><p>${esc(l.diff)} · ${l.questions.length} questions</p></div></div>
      <div class="bar mb-24"><i style="width:${(qi)/l.questions.length*100}%"></i></div>

      ${done? `
        <div class="card pad center">
          <div style="font-size:2.4rem">${state.lessonScore===l.questions.length?'🎉':'📘'}</div>
          <h3 style="margin:8px 0">${state.lessonScore===l.questions.length?'Great job! You aced it.':'Lesson complete'}</h3>
          <p class="muted">You answered ${state.lessonScore} of ${l.questions.length} correctly.</p>
          <div class="aicb" style="justify-content:center;gap:10px;margin-top:18px">
            <button class="btn btn-primary" onclick="startLesson('${l.id}')">Retry</button>
            <button class="btn btn-ghost" onclick="startLesson()">Next lesson</button>
          </div>
        </div>`
      : `
      <div class="card pad">
        <div class="mb-16">
          <span class="sk">Explanation</span>
          <p style="margin-top:8px;font-size:1.02rem;line-height:1.6">${l.expl}</p>
        </div>
        <div style="background:var(--surface-2);border-left:3px solid var(--brand);padding:14px 16px;border-radius:0 12px 12px 0;margin-bottom:22px">
          <span class="sk">Examples</span>
          <ul style="margin-top:8px;display:flex;flex-direction:column;gap:6px">
            ${l.examples.map(e=>`<li style="display:flex;gap:8px;align-items:flex-start;font-size:.95rem"><span style="color:var(--brand)">›</span>${e}</li>`).join("")}
          </ul>
        </div>

        <div class="aicb mb-12"><span class="sk">Question ${qi+1} of ${l.questions.length}</span></div>
        <h3 style="margin-bottom:16px">${esc(q.q)}</h3>
        <div class="grid g2">
          ${q.opts.map((o,i)=>{
            let cls="qopt"; if(revealed){ if(i===q.a)cls+=" correct"; else if(i===qa)cls+=" wrong"; } else if(i===qa)cls+=" selected";
            return `<button class="${cls}" ${revealed?'disabled':''} onclick="answerLesson('${l.id}',${i})"><span class="key">${"ABCD"[i]}</span><span>${esc(o)}</span></button>`;
          }).join("")}
        </div>

        <div class="feedback ${revealed?(qa===q.a?'ok show':'no show'):''}">
          <b>${qa===q.a?'Correct!':'Not quite.'}</b>
          <p style="margin-top:4px">${esc(q.expl)}</p>
          ${qa!==q.a?`<p class="small" style="margin-top:8px">Recorded under <b>${esc(skillName(l.skill))}</b> — it'll show up in your weak areas.</p>`:""}
          ${revealed?`<button class="btn btn-primary btn-sm mt-16" onclick="nextLessonQuestion('${l.id}')">${qi+1>=l.questions.length?'Finish lesson':'Next question'}</button>`:""}
        </div>
      </div>`
      }
    </div>
  </div>`;
}
function answerLesson(id,i){
  const l=LESSONS.find(x=>x.id===id);
  const q=l.questions[state.lessonIdx];
  state.lessonAsk=i;
  const ok=i===q.a;
  // record attempt counted as lesson-based
  if(ok) state.lessonScore=(state.lessonScore||0)+1;
  dbArr("attempts").push({id:uid(),userId:SESSION,lessonId:id,questionId:state.lessonIdx,skill:l.skill,response:i,correct:ok,tag:l.skill,ts:Date.now()});
  save();
  render();
}
function nextLessonQuestion(id){
  const l=LESSONS.find(x=>x.id===id);
  if(state.lessonIdx+1>=l.questions.length){
    dbArr("attempts").push({id:uid(),userId:SESSION,lessonId:id,skill:l.skill,finished:true,score:state.lessonScore,ts:Date.now()});
    save();
    state.lessonDone=true; state.lessonAsk=null;
    if((state.lessonScore||0)>=l.questions.length) award("a-lesson10");
    render();
  } else { state.lessonIdx++; state.lessonAsk=null; render(); }
}

/* ============ PRACTICE ============ */
const PRACTICE_PROMPTS={
  "IELTS":{tx:"Writing Task 2, part 1","p":"Some people think online learning will replace traditional classrooms. Do you agree or disagree? Give reasons and examples."},
  "Interview":{tx:"Interview Q1","p":"Tell me about yourself and why you're interested in this role."},
  "Academic":{tx:"Academic writing","p":"Describe the main trends in a line graph showing urban population growth (2000-2025)."},
  "General":{tx:"Everyday conversation","p":"Describe a memorable meal you had. When and where was it? Who were you with?"}
};
function viewPractice(){
  const u=me();
  const tab=state.practiceTab||"speaking";
  return `
  <div class="app">
    ${sideNav("practice")}
    <div class="main" style="max-width:820px">
      <div class="page-head"><div><h2>Practice</h2><p>Speaking & writing practice with structured feedback.</p></div></div>
      <div class="tabs mb-24">
        <button class="${tab==='speaking'?'active':''}" onclick="switchPractice('speaking')">🎤 Speaking</button>
        <button class="${tab==='writing'?'active':''}" onclick="switchPractice('writing')">✍️ Writing</button>
      </div>
      <div class="card pad mb-24">
        <div class="field"><label>Goal</label>
          <select id="pGoal" onchange="practiceGoalChange()">
            ${["IELTS","Interview","Academic","General"].map(g=>`<option ${u.goal===g?'selected':''}>${g}</option>`).join("")}
          </select>
        </div>
        <div class="aicb mt-8">
          <span class="muted small">Practice timer</span>
          <div id="pTimer" style="font-weight:800;font-size:1.1rem;color:var(--brand)">2:00</div>
        </div>
      </div>
      <div class="card pad">
        <span class="sk">Prompt</span>
        <p style="font-size:1.05rem;margin-top:8px;font-weight:600">${PRACTICE_PROMPTS[u.goal||"General"].p}</p>
        <div class="field mt-16"><label>Your response</label>
          <textarea id="pResp" rows="7" placeholder="${tab==='speaking'?'Type what you would say,or record yourself if enabled.':'Type your written response here.'}"></textarea>
        </div>
        <div class="aicb">
          <button class="btn btn-ghost" onclick="resetPractice()">Reset</button>
          <button class="btn btn-primary" onclick="submitPractice('${tab}')">${tab==='speaking'?'Submit & review':'Submit for feedback'}</button>
        </div>
        <div id="pFeedback"></div>
      </div>
    </div>
  </div>`;
}
function switchPractice(t){ state.practiceTab=t; render(); }
let pTimerInt;
function practiceGoalChange(){ /* goal selection stored */ }
function resetPractice(){ $("#pResp").value=""; $("#pFeedback").innerHTML=""; toast("Cleared."); }
function submitPractice(tab){
  const txt=$("#pResp").value.trim();
  if(txt.length<15){ toast(tab==="speaking"?"Please add at least a couple of sentences.":"Your response is too short — add more detail.","err"); return; }
  // simple simulated feedback engine (extensible for real AI later)
  const fb=simulateFeedback(txt);
  dbArr("practice").push({id:uid(),userId:SESSION,type:tab,goal:$("#pGoal").value,prompt:PRACTICE_PROMPTS[$("#pGoal").value||"General"].p,response:txt,feedback:fb,ts:Date.now()});
  save();
  $("#pFeedback").innerHTML=`<div class="feedback ok show mt-24" style="border:1px solid #cdeed6">
    <b>Feedback</b>
    <p style="margin-top:6px">${esc(fb.quality)}</p>
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">
      ${fb.points.map(p=>`<div style="display:flex;gap:8px;align-items:flex-start"><span style="color:var(--green);font-weight:800">✓</span><span>${esc(p)}</span></div>`).join("")}
    </div>
    <p class="small mt-16" style="color:var(--muted)">${esc(fb.note)}</p>
    <div class="flex mt-16" style="gap:10px;flex-wrap:wrap">
      <button class="btn btn-soft btn-sm" onclick="startLessonForSkill('${fb.recSkill}')">Practice ${esc(skillName(fb.recSkill))}</button>
      <button class="btn btn-ghost btn-sm" onclick="go('learn')">Go to grammar practice</button>
    </div>
  </div>`;
  toast("Response submitted & scored.");
}
function simulateFeedback(txt){
  const wc=txt.split(/\s+/).length;
  const dict=". ";
  const sentenceCount=(txt.match(/[.!?]+/g)||[]).length;
  let quality = wc<40?"Good start — add more depth and specific examples.":
    wc>=40&&wc<80?"Solid response with clear structure and relevant detail.":"Excellent — well-developed and cohesive.";
  const points=[];
  if(sentenceCount<2) points.push("Break your response into clearer sentences for better flow.");
  else points.push("Good sentence variety and structure.");
  if(wc<30) points.push("Expand your ideas with a reason or an example to reach the word count.");
  else points.push("Good length and development for this goal.");
  points.push("Check verb tense consistency and article use as you revise.");
  return {quality,points,note:"AI feedback is assistance for learning — it is not an official IELTS score and should be reviewed by a mentor before you rely on it.",recSkill:wc<40?"svo":"cond"};
}

/* ============ IELTS ARENA ============ */
function countdown(ms){
  if(ms<=0) return "Live now";
  const d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5),m=Math.floor(ms%36e5/6e4);
  return d>0?`${d}d ${h}h ${m}m`:(h>0?`${h}h ${m}m`:`${m}m`);
}
function viewArena(){
  const now=Date.now();
  const up=DB.contests.find(c=>c.status==="upcoming");
  const closed=DB.contests.filter(c=>c.status==="closed");
  const myCA=contestAttemptsOf(SESSION);
  return `
  <div class="app">
    ${sideNav("arena")}
    <div class="main" style="max-width:960px">
      <div class="page-head"><div><h2>IELTS Arena</h2><p>Weekly practice contests, scores and rankings.</p></div></div>
      <div class="notice mb-24">
        <span style="font-size:1.1rem">⚠️</span>
        <div>These are <b>practice contests</b> to build skill and confidence. They are <b>not an official IELTS examination</b>.</div>
      </div>

      ${up?`
      <div class="card pad" style="border:1.5px solid #e0e3ff;background:linear-gradient(180deg,#fff,#fbfaff)">
        <div class="aicb mb-16">
          <span class="tag accent">Next contest</span>
          <span style="font-weight:800;font-size:.95rem">${esc(up.title)}</span>
        </div>
        <div class="aicb" style="gap:20px;flex-wrap:wrap;margin-bottom:20px">
          <div><span class="sk">Countdown</span><b style="font-size:1.8rem;color:var(--brand);display:block">${countdown(up.start-now)}</b></div>
          <div><span class="sk">Duration</span><b style="font-size:1.25rem;display:block">${up.duration} min</b></div>
          <div><span class="sk">Questions</span><b style="font-size:1.25rem;display:block">${up.questions.length}</b></div>
          <div><span class="sk">Type</span><b style="font-size:1.25rem;display:block">${esc(up.type)}</b></div>
        </div>
        <div class="mb-16"><span class="sk">Rules</span>
          <ul style="margin-top:8px;display:flex;flex-direction:column;gap:6px;font-size:.9rem">
            ${up.rules.map(r=>`<li style="display:flex;gap:8px"><span style="color:var(--accent)">•</span>${esc(r)}</li>`).join("")}
          </ul>
        </div>
        <button class="btn btn-accent btn-lg" onclick="enterContest('${up.id}')">Participate</button>
      </div>`:`<div class="empty">No upcoming contest right now.</div>`}

      <div class="grid g2 mt-24" style="grid-template-columns:1.4fr 1fr">
        <div class="card pad">
          <h3 style="margin-bottom:16px">Previous contests</h3>
          ${closed.map((c,i)=>`
            <div class="aicb" style="padding:14px 0;border-bottom:1px solid var(--line-2)">
              <div><b style="font-size:.95rem">${esc(c.title)}</b><span class="muted small" style="display:block">${c.questions.length} questions · ${c.duration} min</span></div>
              <span class="tag ${i===0?'green':'brand'}">view results</span>
            </div>`).join("")}
        </div>
        <div class="card pad">
          <h3 style="margin-bottom:16px">Your past results</h3>
          ${myCA.length? myCA.slice(-5).reverse().map(a=>{
            const c=DB.contests.find(x=>x.id===a.contestId);
            return `<div class="aicb" style="padding:12px 0;border-bottom:1px solid var(--line-2)">
              <div><b style="font-size:.9rem">${esc(c?c.title:"Contest")}</b><span class="muted small" style="display:block">Rank #${a.rank}</span></div>
              <span class="rating-badge">${a.ratingDelta>=0?'+':''}${a.ratingDelta} pts</span>
            </div>`;}).join("") : `<div class="empty"><div style="font-size:1.5rem">🏆</div>No contests yet. Join the next one!</div>`}
        </div>
      </div>
    </div>
  </div>`;
}

function enterContest(cid){
  const c=DB.contests.find(x=>x.id===cid);
  if(!c) return;
  if(c.status!=="upcoming"){ toast("This contest is closed.","err"); return; }
  state.contestId=cid; state.cIdx=0; state.cAnswers={}; state.cLeft=c.duration*60; state.cLive=true; state.cActive=setInterval(contestTick,1000);
  go("contest");
}

/* ============ CONTEST SCREEN ============ */
function viewContest(){
  const c=DB.contests.find(x=>x.id===state.contestId);
  if(!c){ return `<div class="wrap section"><div class="empty">Contest not found.</div></div>`; }
  const q=c.questions[state.cIdx];
  const answered=state.cAnswers[state.cIdx]!==undefined;
  const mins=Math.floor(state.cLeft/60),secs=state.cLeft%60;
  return `
  <div class="app">
    <div class="main" style="max-width:820px">
      <div class="page-head">
        <div><h2 style="font-size:1.3rem">${esc(c.title)}</h2><p>Question ${state.cIdx+1} of ${c.questions.length}</p></div>
        <div style="font-size:1.3rem;font-weight:800;color:${state.cLeft<120?'var(--rose)':'var(--brand)'}">${mins}:${String(secs).padStart(2,'0')}</div>
      </div>
      <div class="bar mb-24"><i style="width:${(state.cIdx+1)/c.questions.length*100}%"></i></div>

      <div class="card pad">
        <div class="aicb mb-12"><span class="sk">Q${state.cIdx+1} · ${esc(skillName(q.skill))}</span><span class="tag teal">${c.type}</span></div>
        <h3 style="margin-bottom:16px">${esc(q.q)}</h3>
        <div class="grid g2">
          ${q.opts.map((o,i)=>{
            let cls="qopt"; if(answered){ if(i===q.a)cls+=" correct"; } else if(state.cAnswers[state.cIdx]===i)cls+=" selected";
            return `<button class="${cls}" ${answered?'disabled':''} onclick="answerContest(${i})"><span class="key">${"ABCD"[i]}</span><span>${esc(o)}</span></button>`;
          }).join("")}
        </div>
        <p class="muted small" style="margin-top:16px">${answered?'Answer locked. Use the navigation below.':'Select an answer, then continue.'}</p>
        <div class="aicb mt-16" style="flex-wrap:wrap;gap:10px">
          <div class="chip-row">
            ${c.questions.map((_,i)=>`<button onclick="navContest(${i})" style="width:34px;height:34px;border-radius:9px;border:1.5px solid ${state.cAnswers[i]!==undefined?'var(--brand)':'var(--line)'};background:${state.cAnswers[i]!==undefined?'var(--brand)':'#fff'};color:${state.cAnswers[i]!==undefined?'#fff':'var(--ink-2)'};font-weight:700">${i+1}</button>`).join("")}
          </div>
          <button class="btn btn-ghost btn-sm" onclick="navContest(${state.cIdx-1})" ${state.cIdx===0?'disabled':''}>Prev</button>
          ${state.cIdx+1<c.questions.length
            ? `<button class="btn btn-soft btn-sm" onclick="navContest(${state.cIdx+1})">Next</button>`
            : `<button class="btn btn-accent btn-sm" onclick="finishContest()">Finish & submit</button>`}
        </div>
      </div>
      <p class="muted small center mt-16">© Vartalab IELTS Arena — practice contest, not an official IELTS examination. Answers are revealed only after you submit.</p>
    </div>
  </div>`;
}
function answerContest(i){
  const c=DB.contests.find(x=>x.id===state.contestId);
  state.cAnswers[state.cIdx]=i; render();
}
function navContest(i){
  if(i<0||i>=DB.contests.find(x=>x.id===state.contestId).questions.length)return;
  state.cIdx=i; render();
}
let contestTicks=0;
function contestTick(){
  state.cLeft--; state.cTicks=(state.cTicks||0)+1;
  if(state.cLeft<=0){ finishContest(); return; }
  if(state.view==='contest') render();
}
function finishContest(){
  clearInterval(state.cActive);
  const c=DB.contests.find(x=>x.id===state.contestId);
  if(!c)return;
  let score=0,breakdown={};
  c.questions.forEach((q,i)=>{
    const ok=state.cAnswers[i]===q.a;
    if(ok)score++;
    breakdown[q.skill]=(breakdown[q.skill]||0)+(ok?1:0);
  });
  // rating change
  const u=me();
  const delta=Math.round((score-c.questions.length*0.6)*12);
  const newRating=(u.rating||1000)+delta;
  const {rank, percentile}=computeRank(score,c.questions.length);
  const ca={id:uid(),userId:SESSION,contestId:c.id,answers:{...state.cAnswers},score,total:c.questions.length,rank,percentile,ratingDelta:delta,rating:newRating,breakdown,ts:Date.now()};
  dbArr("cAttempts").push(ca); save();
  if(u.role==="user"){
    u.rating=newRating; u.peak=Math.max(u.peak||1000,newRating);
    if(!DB.ratings)DB.ratings=[]; DB.ratings.push({userId:SESSION,rating:newRating,ts:Date.now()});
    save();
  }
  award("a-contest");
  state.doneCA=ca;
  go("result");
}

function computeRank(score,total){
  // simple percentile relative to leaderboard pts
  const others=DB.leaderboard.length+1;
  const percentile=Math.max(1,Math.min(99,Math.round(score/total*95)));
  const rank=Math.max(1,Math.round(others-(score/total*others))+1);
  return {rank,percentile};
}

/* ============ CONTEST RESULTS ============ */
function viewResult(){
  const ca=state.doneCA||contestAttemptsOf(SESSION).slice(-1)[0];
  if(!ca) return `<div class="wrap section"><div class="empty">No results yet.</div></div>`;
  const c=DB.contests.find(x=>x.id===ca.contestId);
  const correct=ca.score, incorrect=ca.total-ca.score;
  return `
  <div class="app">
    <div class="main" style="max-width:820px">
      <div class="card pad center" style="margin-bottom:24px">
        <span class="tag green" style="margin:0 auto">Contest complete</span>
        <h2 style="margin:12px 0 4px">${esc(c?c.title:"Contest")}</h2>
        <p class="muted">Score ${correct}/${ca.total} · Time submitted</p>
        <div style="display:flex;gap:30px;justify-content:center;margin:26px 0;flex-wrap:wrap">
          <div><span class="sk">Score</span><b style="font-size:2rem;color:var(--brand);display:block">${correct}/${ca.total}</b></div>
          <div><span class="sk">Rank</span><b style="font-size:2rem;display:block">#${ca.rank}</b></div>
          <div><span class="sk">Percentile</span><b style="font-size:2rem;display:block">${ca.percentile}th</b></div>
          <div><span class="sk">Rating change</span><b style="font-size:2rem;display:block;color:${ca.ratingDelta>=0?'var(--green)':'var(--rose)'}">${ca.ratingDelta>=0?'+':''}${ca.ratingDelta}</b></div>
        </div>
        <div class="row":"" style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <span class="tag green">✓ ${correct} correct</span>
          <span class="tag rose">✕ ${incorrect} incorrect</span>
          <span class="tag brand">★ ${ca.rating} rating</span>
        </div>
        <div class="chip-row" style="justify-content:center;margin-top:18px">
          <button class="btn btn-primary btn-sm" onclick="shareResult()">Share result</button>
          <button class="btn btn-ghost btn-sm" onclick="go('arena')">Back to Arena</button>
        </div>
        <p class="muted small" style="margin-top:14px">Practice contest — not an official IELTS examination.</p>
      </div>

      <div class="grid g2">
        <div class="card pad">
          <h3 style="margin-bottom:16px">Skill breakdown</h3>
          ${ca.breakdown&&Object.keys(ca.breakdown).length? Object.entries(ca.breakdown).map(([sk,sc])=>`
            <div class="aicb" style="padding:9px 0;border-bottom:1px solid var(--line-2)">
              <span style="font-weight:600;font-size:.9rem">${esc(skillName(sk))}</span><span class="tag ${sc?'green':'rose'}">${sc?'✓':'✕'}</span>
            </div>`).join(""):`<div class="empty">No breakdown.</div>`}
        </div>
        <div class="card pad">
          <h3 style="margin-bottom:8px">Recommended practice</h3>
          <p class="muted small" style="margin-bottom:14px">Focus here to boost your next rating.</p>
          ${incorrect>0?`<div class="aicb"><div><b style="font-size:.92rem">Weak areas</b><span class="muted small" style="display:block">${Math.round(incorrect/ca.total*100)}% of your answers were missed</span></div>
          <button class="btn btn-soft btn-sm" onclick="startLessonForSkill('cond')">Practise</button></div>`:`
          <div class="empty" style="padding:0">Perfect score — keep it up! 🎯</div>`}
          <div class="card mt-16" style="background:var(--surface-2);box-shadow:none">
            <span class="sk">Contest history</span>
            <p class="small mt-8">You have completed <b>${contestAttemptsOf(SESSION).length}</b> Arena contests.</p>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}
function shareResult(){ toast("🔗 Profile link copied"); }

/* ============ LEADERBOARD ============ */
function percentileOf(uid){
  const lb=DB.leaderboard.sort((a,b)=>b.pts-a.pts);
  const idx=lb.findIndex(x=>x.id===uid);
  if(idx<0)return Math.round(50);
  return Math.max(1,Math.round((idx+1)/lb.length*100));
}
function viewLeaderboard(){
  const u=me();
  const tab=state.lbTab||"global";
  const uu=u?getUser(u.id):null;
  const myPts = uu? (DB.leaderboard.find(x=>x.id===u.id)?.points||u.rating||1000):null;
  const rows = DB.leaderboard.slice().sort((a,b)=>b.pts-a.pts);
  const myIdx=rows.findIndex(r=>r.id===u.id);
  return `
  <div class="app">
    ${sideNav("leaderboard")}
    <div class="main" style="max-width:820px">
      <div class="page-head"><div><h2>Leaderboard</h2><p>Competitive rankings — no private information shown.</p></div></div>
      <div class="tabs mb-24">
        ${["global","weekly","monthly"].map((t,i)=>`<button class="${tab===t?'active':''}" onclick="switchLb('${t}')">${['Global','Weekly','Monthly'][i]}</button>`).join("")}
      </div>
      <div class="card pad" style="margin-bottom:24px">
        ${rows.map((r,i)=>{
          const usr=getUser(r.id); const isMe=(u&&u.id===r.id);
          const cls=i===0?'top':i===1?'r2':i===2?'r3':'';
          return `<div class="lb-row" style="${isMe?'background:var(--brand-soft);border-radius:12px':''}">
            <span class="rank ${cls}">${i+1}</span>
            <span class="who"><span class="avatar" style="background:${usr?usr.avatar:'#94a3b8'}">${usr?esc(usr.name[0]):'?'}</span>
              <span><b>${usr?esc(usr.name):'Learner'}</b>${isMe?'<span style="color:var(--brand)">· you</span>':''}<span>${usr?esc(usr.goal||'English learner'):'Learner'}</span></span>
            </span>
            <span class="score"><b>${(r.pts).toLocaleString()}</b><span>points</span></span>
          </div>`;}).join("")}
      </div>
      ${u?`<div class="card pad">
        <div class="aicb"><div><span class="sk">Your position</span><b style="font-size:1.4rem;color:var(--brand);display:block">Rank #${myIdx+1}</b></div>
        <div class="right"><span class="sk">Your rating</span><b style="font-size:1.4rem;display:block">${u.rating||1000}</b></div></div>
        <div class="mt-16"><span class="tag brand">Percentile ${percentileOf(u.id)}th</span><span class="tag teal">Score ${myPts}</span></div>
      </div>`:`<div class="notice info"><span>🔒</span><div>Log in to see your ranking on the leaderboard.</div></div>`}
    </div>
  </div>`;
}
function switchLb(t){ state.lbTab=t; toast(t.charAt(0).toUpperCase()+t.slice(1)+" leaderboard"); render(); }

/* ============ PROFILE ============ */
function viewProfile(){
  const u=me(); if(!u)return "";
  const ca=contestAttemptsOf(SESSION);
  const badges=dbArr("uAch").filter(a=>a.userId===SESSION).map(a=>DB.achievements.find(x=>x.id===a.achId)).filter(Boolean);
  const myLb=DB.leaderboard.find(x=>x.id===u.id);
  const recent=(DB.practice||[]).filter(p=>p.userId===SESSION).slice(-3).reverse();
  return `
  <div class="app">
    ${sideNav("profile")}
    <div class="main" style="max-width:900px">
      <div class="card pad" style="margin-bottom:24px">
        <div class="flex aic" style="gap:18px;flex-wrap:wrap">
          <span class="avatar" style="width:64px;height:64px;border-radius:18px;background:${u.avatar};font-size:1.5rem">${esc(u.name[0])}</span>
          <div class="grow">
            <h2 style="font-size:1.4rem">${esc(u.name)}</h2>
            <p class="muted">Goal: <b>${esc(u.goal||"—")}</b> · Level: <b>${esc(u.level||"—")}</b> · Profile: <b>${u.vis==="public"?"Public":"Private"}</b></p>
          </div>
          <div class="right"><span class="rating-badge">★ ${u.rating||1000}</span>
            <p class="muted small mt-8">Peak ${u.peak||1000} · #${myLb?DB.leaderboard.indexOf(myLb)+1:"-"} global</p>
          </div>
        </div>
        <div class="aicb mt-16" style="flex-wrap:wrap;gap:10px">
          <button class="btn btn-soft btn-sm" onclick="shareResult()">Share profile</button>
          <label class="btn btn-ghost btn-sm" style="cursor:pointer"><input type="checkbox" ${u.vis==="public"?"checked":""} onchange="toggleVisibility()" style="display:none"> ${u.vis==="public"?"Public profile":"Private profile"}</label>
          <button class="btn btn-ghost btn-sm" onclick="go('onboarding')">Edit goal</button>
        </div>
      </div>

      <div class="grid g3">
        <div class="card pad"><span class="sk">Contests</span><b style="font-size:1.6rem;color:var(--brand);display:block">${ca.length}</b><span class="muted small">completed</span></div>
        <div class="card pad"><span class="sk">Peak rating</span><b style="font-size:1.6rem;display:block">${u.peak||1000}</b><span class="muted small">highest</span></div>
        <div class="card pad"><span class="sk">Percentile</span><b style="font-size:1.6rem;display:block">${percentileOf(u.id)}th</b><span class="muted small">top %</span></div>
      </div>

      <div class="grid g2 mt-24" style="grid-template-columns:1.3fr 1fr">
        <div class="card pad">
          <h3 style="margin-bottom:16px">Contest history</h3>
          ${ca.length? ca.slice(-6).reverse().map(a=>{
            const c=DB.contests.find(x=>x.id===a.contestId);
            return `<div class="aicb" style="padding:11px 0;border-bottom:1px solid var(--line-2)">
              <span style="font-weight:600;font-size:.9rem">${esc(c?c.title:"Contest")}</span>
              <span class="chip-row"><span class="tag ${a.ratingDelta>=0?'green':'rose'}">${a.score}/${a.total}</span><span class="rating-badge">${a.ratingDelta>=0?'+':''}${a.ratingDelta}</span></span>
            </div>`;}).join(""):`<div class="empty"><div style="font-size:1.4rem">⚔️</div>No contests yet.</div>`}
        </div>
        <div class="card pad">
          <h3 style="margin-bottom:16px">Skill progress</h3>
          ${weakAreas().slice(0,5).map(w=>{const s=SKILLS.find(x=>x.id===w.sk);return s?`
            <div class="aicb mb-8"><span style="font-weight:600;font-size:.85rem">${esc(s.name)}</span><span class="muted small">${w.acc}%</span></div>
            <div class="bar mb-8"><i style="width:${w.acc}%"></i></div>`:"";}).join("")}
        </div>
      </div>

      <div class="grid g2 mt-24">
        <div class="card pad">
          <h3 style="margin-bottom:16px">Achievements & badges</h3>
          <div class="grid g3">
            ${badges.length? badges.map(b=>`<div class="badge-g"><span class="bx" style="background:var(--brand-soft);font-size:1.4rem">${esc(b.ic)}</span><b>${esc(b.name)}</b><span>${esc(b.desc)}</span></div>`).join(""):`<div class="empty" style="grid-column:1/-1"><div style="font-size:1.4rem">🏅</div>Earn badges by learning, practising and competing.</div>`}
          </div>
        </div>
        <div class="card pad">
          <h3 style="margin-bottom:16px">Recent activity</h3>
          ${recent.length? recent.map(p=>`
            <div class="aicb" style="padding:10px 0;border-bottom:1px solid var(--line-2)">
              <span style="font-weight:600;font-size:.88rem">${p.type==="speaking"?"🎤 Speaking":"✍️ Writing"} practice</span>
              <span class="tag teal">${esc(p.goal)}</span>
            </div>`).join(""):`<div class="empty">No recent practice. Try a writing or speaking drill.</div>`}
          <button class="btn btn-primary btn-block mt-16" onclick="go('practice')">Practise now</button>
        </div>
      </div>
    </div>
  </div>`;
}
function toggleVisibility(){
  const u=me(); u.vis=u.vis==="public"?"private":"public"; save(); render(); toast("Profile is now "+u.vis+".");
}

/* ============ CO-LAB ============ */
function joinedCommunities(){ return (DB.cMembers||[]).filter(m=>m.userId===SESSION).map(m=>m.comId); }
function viewColab(){
  const mine=joinedCommunities();
  const hasJoined = id=>mine.includes(id);
  return `
  <div class="app">
    ${sideNav("colab")}
    <div class="main" style="max-width:960px">
      <div class="page-head"><div><h2>CO-LAB</h2><p>Community groups, live sessions and moderated conversation.</p></div></div>
      <div class="card pad mb-24">
        <div class="field" style="margin:0"><label>Filter by goal / level / topic</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${["All","IELTS","Interview","General English","Speaking","Beginner","Advanced"].map(f=>`<button class="btn btn-ghost btn-sm" onclick="filterColab('${f}')">${f}</button>`).join("")}
          </div>
        </div>
      </div>
      <div class="grid g2">
        ${DB.communities.map(c=>`
          <div class="card card-hover pad">
            <div class="aicb">
              <div><b style="font-size:1.05rem">${esc(c.name)}</b><span class="muted small" style="display:block">${esc(c.goal)} · ${esc(c.level)} · ${(c.members&&c.members.length)||0} members</span></div>
              <span class="tag ${hasJoined(c.id)?'green':'brand'}">${hasJoined(c.id)?'✓ Joined':'Open'}</span>
            </div>
            <p class="muted small" style="margin:12px 0">${esc(c.desc)}</p>
            <div class="aicb" style="padding:10px 0;border-top:1px solid var(--line-2);margin-bottom:12px">
              <span class="small" style="font-weight:600">Next session</span>
              <span class="small muted">${c.sessions&&c.sessions[0]?esc(c.sessions[0].t):"None scheduled"}</span>
            </div>
            <div class="aicb" style="gap:8px;flex-wrap:wrap">
              <button class="btn btn-soft btn-sm" onclick="joinCommunity('${c.id}')">${hasJoined(c.id)?'Open community':'Join community'}</button>
              ${c.sessions&&c.sessions.length?`<button class="btn btn-ghost btn-sm" onclick="toast('You registered for the next session!')">Register</button>`:""}
              <button class="btn btn-ghost btn-sm" onclick="openCommunity('${c.id}')">Feed</button>
            </div>
          </div>`).join("")}
      </div>
    </div>
  </div>`;
}
function joinCommunity(id){
  const mine=joinedCommunities();
  if(!mine.includes(id)){ dbArr("cMembers").push({userId:SESSION,comId:id,role:"member",joined:Date.now()}); save(); }
  openCommunity(id);
}
function openCommunity(id){
  const c=DB.communities.find(x=>x.id===id);
  state.openCom=id;
  $("#modal").classList.add("open");
  $("#modalBody").innerHTML=`
    <div class="aicb"><b style="font-size:1.2rem">${esc(c.name)}</b><button onclick="closeModal()" style="background:none;border:none;font-size:1.4rem;color:var(--muted)">×</button></div>
    <p class="muted small" style="margin:8px 0 16px">${esc(c.desc)}</p>
    <div class="aicb mb-16"><span class="tag brand">${esc(c.goal)}</span><span class="tag teal">Moderated by ${esc(c.moderator)}</span>
      <span class="muted small" style="margin-left:auto">${(c.members&&c.members.length)||0} members</span></div>
    <span class="sk">Upcoming session</span>
    ${c.sessions&&c.sessions.length?`<div class="card" style="background:var(--surface-2);box-shadow:none;padding:12px;margin:8px 0 18px">
      <b style="font-size:.95rem">${esc(c.sessions[0].t)}</b><span class="muted small" style="display:block">${esc(c.sessions[0].d)}</span></div>`:`<p class="muted small">No upcoming session.</p>`}
    <span class="sk">Recent feed</span>
    <div style="margin:8px 0 18px;display:flex;flex-direction:column;gap:10px">
      ${c.feed.map(f=>`<div class="card" style="box-shadow:none;padding:10px 12px"><span class="muted small"><b>${esc(f.u)}</b> · ${esc(f.ts)}</span><p class="small" style="margin-top:4px">${esc(f.t)}</p></div>`).join("")}
    </div>
    <div class="field"><label>Post to the community</label><input id="comPost" placeholder="Share an update..."></div>
    <button class="btn btn-primary btn-block" onclick="postCom('${id}')">Post</button>
    <p class="muted small" style="margin-top:10px">Be respectful. Report inappropriate content to your moderator.</p>
  `;
}
function postCom(id){
  const txt=$("#comPost").value.trim();
  const c=DB.communities.find(x=>x.id===id);
  if(!txt)return toast("Write something first.","err");
  c.feed.push({u:me().name,t:txt,ts:"now"});
  save(); openCommunity(id); toast("Posted!");
}
function filterColab(f){ toast("Showing "+f+" communities"); render(); }

/* ============ ACT-LAB ============ */
function viewActLab(){
  const regs = (DB.registrations||[]).filter(r=>r.userId===SESSION).map(r=>r.eventId);
  return `
  <div class="app">
    ${sideNav("actlab")}
    <div class="main" style="max-width:960px">
      <div class="page-head"><div><h2>ACT-LAB</h2><p>Activities & events — debates, movie nights, mock interviews, poetry and competitions.</p></div></div>
      <div class="card pad mb-24">
        <div class="chip-row">
          ${["All","Movie Discussion","Debate","Dialogue","Poetry","Interview Practice","Competition"].map(cat=>`<button class="btn btn-ghost btn-sm" onclick="filterAct('${cat}')">${cat}</button>`).join("")}
        </div>
      </div>
      <div class="grid g2">
        ${DB.events.map(e=>{
          const joined=regs.includes(e.id);
          const filled=Math.round((e.reg||0)/e.cap*100);
          return `<div class="card card-hover pad">
            <div class="aicb">
              <span class="tag ${e.mode==='Online'?'teal':'accent'}">${e.mode==='Online'?'🌐 Online':'📍 Offline'}</span>
              <span class="tag brand">${esc(e.type)}</span>
            </div>
            <h3 style="margin:12px 0 6px">${esc(e.title)}</h3>
            <p class="muted small" style="margin-bottom:12px">${esc(e.desc)}</p>
            <div class="card" style="background:var(--surface-2);box-shadow:none;padding:12px;margin-bottom:14px">
              <div class="aicb"><span class="small" style="font-weight:600">🗓️ ${esc(e.date)}</span><span class="muted small">Host: ${esc(e.host)}</span></div>
            </div>
            ${!joined?`<div class="mb-8">
              <div class="aicb small"><span>Seats</span><span>${e.reg||0}/${e.cap}</span></div>
              <div class="bar amber"><i style="width:${filled}%"></i></div>
            </div>`:""}
            <button class="btn ${joined?'btn-soft':'btn-primary'} btn-block" onclick="registerEvent('${e.id}')">${joined?'✓ Registered':'Register'}</button>
          </div>`;}).join("")}
      </div>
    </div>
  </div>`;
}
function registerEvent(id){
  const ev=DB.events.find(x=>x.id===id);
  if(!ev)return;
  const regs=(DB.registrations||[]).filter(r=>r.userId===SESSION).map(r=>r.eventId);
  if(regs.includes(id)){ toast("You're already registered."); return; }
  if((ev.reg||0)>=ev.cap){ toast("This event is full.","err"); return; }
  dbArr("registrations").push({id:uid(),userId:SESSION,eventId:id,status:"confirmed",ts:Date.now()});
  ev.reg=(ev.reg||0)+1; save();
  toast("You're registered for “"+ev.title+"”!");
  render();
}
function filterAct(cat){ toast("Showing "+cat+" events"); render(); }

/* ============ ACHIEVEMENTS ============ */
function award(achId){
  const exists=(DB.uAch||[]).some(a=>a.userId===SESSION&&a.achId===achId);
  if(exists)return;
  dbArr("uAch").push({userId:SESSION,achId,earned:Date.now()}); save();
  const b=DB.achievements.find(x=>x.id===achId);
  if(b) toast("🏅 Achievement unlocked: "+b.name);
}

/* ============ ADMIN ============ */
function viewAdmin(){
  const u=me(); if(!u||u.role!=="admin") return "";
  const users=DB.users;
  const contests=DB.contests;
  const attempts=dbArr("attempts");
  return `
  <div class="app">
    ${sideNav("admin")}
    <div class="main">
      <div class="page-head"><div><h2>Admin panel</h2><p>Manage content, users, contests and events.</p></div>
        <button class="btn btn-ghost btn-sm" onclick="adminLog('panel')">Audit log</button></div>

      <div class="grid g4">
        <div class="stat"><b>${users.length}</b><i>Users</i></div>
        <div class="stat"><b>${users.filter(x=>x.role==="user").length}</b><i>Active learners</i></div>
        <div class="stat"><b>${contests.length}</b><i>Contests</i></div>
        <div class="stat"><b>${DB.events.length}</b><i>Events</i></div>
      </div>

      <div class="grid g2 mt-24">
        <div class="card pad">
          <div class="aicb mb-16"><h3>Users</h3><input id="userSearch" placeholder="Search..." style="padding:8px 12px;border:1.5px solid var(--line);border-radius:10px;width:180px" oninput="renderUserRows()"></div>
          <div id="userRows">${userRowsHtml(null)}</div>
        </div>
        <div class="card pad">
          <div class="aicb mb-16"><h3>Lessons</h3><button class="btn btn-soft btn-sm" onclick="newLesson()">+ New lesson</button></div>
          ${LESSONS.map(l=>`<div class="aicb" style="padding:11px 0;border-bottom:1px solid var(--line-2)">
            <div><b style="font-size:.9rem">${esc(l.title)}</b><span class="muted small" style="display:block">${esc(skillName(l.skill))} · ${esc(l.diff)}</span></div>
            <div class="chip-row"><span class="tag green">Published</span><button class="btn btn-ghost btn-sm" onclick="editLesson('${l.id}')">Edit</button></div>
          </div>`).join("")}
        </div>
      </div>

      <div class="grid g2 mt-24">
        <div class="card pad">
          <div class="aicb mb-16"><h3>Contests</h3><button class="btn btn-soft btn-sm" onclick="newContest()">+ Schedule contest</button></div>
          ${contests.map(c=>`<div class="aicb" style="padding:11px 0;border-bottom:1px solid var(--line-2)">
            <div><b style="font-size:.9rem">${esc(c.title)}</b><span class="muted small" style="display:block">${c.questions.length} questions · ${c.duration} min</span></div>
            <span class="tag ${c.status==='upcoming'?'green':'brand'}">${esc(c.status)}</span>
          </div>`).join("")}
        </div>
        <div class="card pad">
          <div class="aicb mb-16"><h3>ACT-LAB events</h3><button class="btn btn-soft btn-sm" onclick="newEvent()">+ Add event</button></div>
          ${DB.events.map(e=>`<div class="aicb" style="padding:11px 0;border-bottom:1px solid var(--line-2)">
            <div><b style="font-size:.9rem">${esc(e.title)}</b><span class="muted small" style="display:block">${esc(e.type)} · ${esc(e.date)} · ${e.mode}</span></div>
            <span class="tag ${e.mode==='Online'?'teal':'accent'}">${e.reg||0}/${e.cap}</span>
          </div>`).join("")}
        </div>
      </div>

      <div class="grid g2 mt-24">
        <div class="card pad">
          <h3 style="margin-bottom:12px">Contest participation</h3>
          ${(DB.cAttempts||[]).length? (DB.cAttempts||[]).map(a=>{const usr=getUser(a.userId);const c=DB.contests.find(x=>x.id===a.contestId);return `<div class="aicb" style="padding:9px 0;border-bottom:1px solid var(--line-2)">
            <span style="font-weight:600;font-size:.88rem">${usr?esc(usr.name):'User'}</span><span class="muted small">${esc(c?c.title:'')}</span><span class="tag brand">${a.score}/${a.total}</span></div>`;}).join(""):`<div class="empty">No contest submissions yet.</div>`}
        </div>
        <div class="card pad">
          <h3 style="margin-bottom:12px">Reports & moderation</h3>
          <div class="notice mb-16"><span>🚩</span><div>No open reports. Communities are moderated for respectful, on-topic conversation.</div></div>
          <div class="field"><label>Moderation note</label><textarea rows="3" placeholder="Add a note for the audit log..."></textarea></div>
          <button class="btn btn-soft btn-sm" onclick="adminLog('note')">Add to audit log</button>
        </div>
      </div>
    </div>
  </div>`;
}
function userRowsHtml(q){
  q=(q||"").toLowerCase();
  return DB.users.filter(x=>!q||x.name.toLowerCase().includes(q)||x.email.toLowerCase().includes(q))
    .map(x=>`<div class="aicb" style="padding:9px 0;border-bottom:1px solid var(--line-2)">
      <span class="flex aic" style="gap:10px"><span class="avatar" style="width:32px;height:32px;border-radius:50%;background:${x.avatar}">${esc(x.name[0])}</span>
      <span><b style="font-size:.88rem">${esc(x.name)}</b><span class="muted small" style="display:block">${esc(x.email)}</span></span></span>
      <span class="chip-row"><span class="tag ${x.role==='admin'?'accent':'brand'}">${x.role}</span><button class="btn btn-ghost btn-sm" onclick="manageUser('${x.id}')">Manage</button></span>
    </div>`).join("");
}
function renderUserRows(){ const q=$("#userSearch").value; $("#userRows").innerHTML=userRowsHtml(q); }
function manageUser(id){ toast("Manage account: "+id); }
function adminLog(kind){ dbArr("adminLog").push({ts:Date.now(),user:me().name,kind}); save(); toast("Audit entry recorded."); }

function newLesson(){ toast("Lesson editor opens with title, explanation, examples, questions and answer options."); }
function editLesson(id){ toast("Edit lesson "+LESSONS.find(x=>x.id===id).title); }
function newContest(){ toast("Contest scheduler: title, type, start/end, duration, rules."); }
function newEvent(){ toast("Event creator: type, title, host, date, location, capacity."); }

/* ============ ICONS ============ */
const ic={
  book:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 5a2 2 0 012-2h12a1 1 0 011 1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" stroke="currentColor" stroke-width="1.8"/><path d="M8 7h8M8 11h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  mic:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 3a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3z" stroke="currentColor" stroke-width="1.8"/><path d="M5 11a7 7 0 0014 0M12 18v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  flag:'<svg viewBox="0 0 24 24" fill="none"><path d="M5 21V4m0 1h12l-2 4 2 4H5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  group:'<svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.8"/><path d="M3 20a6 6 0 0112 0M16 5a3 3 0 010 6M21 20a6 6 0 00-4-5.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  rank:'<svg viewBox="0 0 24 24" fill="none"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M4 21a8 8 0 0116 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
};
const icons={grad:ic.book,group:ic.group,flag:ic.flag};

/* ============ INIT ============ */
document.addEventListener("DOMContentLoaded",()=>{
  // handle hash routing
  const handleHash=()=>{
    const h=location.hash.replace("#/","")||"home";
    const known=["home","how","about","learn","lesson","practice","arena","contest","result","leaderboard","profile","colab","actlab","admin","contact","onboarding"];
    if(known.includes(h)){ go(h); }
  };
  window.addEventListener("hashchange",handleHash);
  $("#burger").addEventListener("click",()=>toggleMenu());
  // if logged in as admin default? no; open home
  // auto-navigate if there's a session and user hasn't finished onboarding
  go(me() ? "home" : "home");
  if(me() && !me().goal) { /* leave to home; dashboard prompts */ }
});

;

(function(){function c(){var b=a.contentDocument||(a.contentWindow&&a.contentWindow.document);if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'a329689b3b3362e7',t:'MTc4Nzk4Mzk5NA=='};var a=document.createElement('script');a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();

