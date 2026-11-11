/* Mon Poêle à Granulés – Lovelace card v0.3.28 */
class MonPoeleGranulesCard extends HTMLElement {
  setConfig(config) {
    this.config = config || {};
    this._calendarDate ||= new Date(new Date().getFullYear(),new Date().getMonth(),1);
    this._chartMetric ||= 'prix';
    this._activeView ||= 'accueil';
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = String.raw`
        <style>
          :host { display:block; color:var(--primary-text-color); font:inherit }
          .wrap{padding:18px;background:var(--ha-card-background,var(--card-background-color,#1c1c1c));border-radius:var(--ha-card-border-radius,16px)}
          .head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
          .stove-hero{display:flex;align-items:center;justify-content:center;gap:16px;padding:13px;min-height:166px;border:1px solid rgba(255,255,255,.10);border-radius:16px;background:linear-gradient(125deg,rgba(23,39,60,.88),rgba(23,15,40,.7));margin:0 0 14px;overflow:hidden}
          .stove-picture{height:164px;width:135px;flex:0 0 135px;filter:drop-shadow(0 7px 8px rgba(0,0,0,.33))}
          .stove-hero .stove-side{fill:#f3f0ec}.stove-hero .stove-front{fill:#262526}
          .stove-window{fill:#100f10;stroke:#575154;stroke-width:3}
          .stove-fire{opacity:0;transition:opacity .35s ease}
          .stove-hero[data-active="on"] .stove-fire{opacity:1}
          .stove-hero[data-active="on"] .stove-flame-a{animation:stoveFlicker 1.17s ease-in-out infinite alternate;transform-origin:70px 104px}
          .stove-hero[data-active="on"] .stove-flame-b{animation:stoveFlicker .87s ease-in-out -.4s infinite alternate;transform-origin:70px 104px}
          .stove-hero[data-active="on"] .stove-glow{opacity:.9}
          .stove-glow{opacity:0;transition:opacity .35s ease}
          @keyframes stoveFlicker{from{transform:scale(.91,1.0) rotate(-3deg)}to{transform:scale(1.06,1.15) rotate(4deg)}}
          @media(prefers-reduced-motion:reduce){.stove-flame-a,.stove-flame-b{animation:none!important}}
          .stove-status{font-size:19px;font-weight:700;margin-bottom:9px}
          .stove-status.on{color:#ff9a29}.stove-status.off{color:var(--secondary-text-color)}
          .stove-status.unknown{color:var(--warning-color,#f3b449)}
          .stove-details{min-width:0}.stove-details .small{font-size:13px;line-height:1.55}
          @media(max-width:390px){.stove-picture{width:105px;height:135px;flex-basis:105px}.stove-hero{gap:9px;padding:10px;min-height:145px}.stove-status{font-size:16px}}
          h2{font-size:21px;margin:0;font-weight:650} h3{font-size:16px;margin:4px 0 12px}
          .small{color:var(--secondary-text-color);font-size:12px}
          .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
          .tile{padding:13px;border-radius:12px;background:var(--secondary-background-color,rgba(127,127,127,.11));min-width:0}
          .tile .value{font-size:24px;font-weight:700;font-variant-numeric:tabular-nums;margin:7px 0 4px;word-break:break-word}
          .label{font-size:12px;color:var(--secondary-text-color)} .unit{font-size:13px;font-weight:450}
          .section{margin-top:19px} .row{display:flex;gap:9px;align-items:center;flex-wrap:wrap}
          button{padding:9px 12px;border-radius:9px;border:1px solid var(--divider-color,#666);background:transparent;color:inherit;cursor:pointer;font:inherit;font-size:13px}
          button.primary{background:var(--primary-color,#03a9f4);border-color:transparent;color:#fff}
          button:disabled{opacity:.5;cursor:default}
          .actions{display:flex;flex-wrap:wrap;gap:8px}
          .form{display:none;margin-top:12px;padding:12px;border:1px solid var(--divider-color,#555);border-radius:10px}
          .form.open{display:block}
          .fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
          label{display:block;font-size:12px;color:var(--secondary-text-color)}
          input{box-sizing:border-box;width:100%;margin-top:4px;padding:9px;border-radius:7px;border:1px solid var(--divider-color,#777);color:var(--primary-text-color);background:var(--primary-background-color,#222);font:inherit}
          .line{border-top:1px solid var(--divider-color,#444);padding:9px 0;font-size:13px}
          .line .small{margin-top:3px} .bars{display:flex;align-items:end;gap:5px;height:115px;padding-top:8px}
          .barcol{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:end;align-items:center;height:100%}
          .bar{width:100%;max-width:26px;border-radius:5px 5px 0 0;background:var(--primary-color,#03a9f4);min-height:2px}
          .barlabel{font-size:10px;opacity:.8;margin-top:4px} .msg{font-size:12px;margin-top:9px}
          select{box-sizing:border-box;width:100%;margin-top:4px;padding:9px;border-radius:7px;border:1px solid var(--divider-color,#777);color:var(--primary-text-color);background:var(--primary-background-color,#222);font:inherit}
          .section h3{font-size:15px;letter-spacing:.03em}
          .section svg{display:block;margin:8px auto}
          #maintenance [title]{cursor:pointer}
          #maintenance button[data-date]{border:0;width:100%;padding:0;font:inherit;cursor:pointer}
          #maintenance .day-cell{min-width:0;position:relative;overflow:hidden;border-radius:8px}
          #maintenance .day-actions{display:flex;position:absolute;bottom:2px;left:2px;right:2px;gap:2px;justify-content:center}
          #maintenance button[data-day-action]{border:0;border-radius:5px;background:rgba(25,25,25,.64);color:white;padding:2px 0;flex:1;min-width:0;height:21px;font-size:12px;line-height:16px;cursor:pointer}
          #maintenance button[data-day-action]:focus-visible{outline:2px solid white}
          #maintenance button[data-date]:focus-visible{outline:3px solid var(--primary-color,#ffa726)}
          .calendar-choice{margin:14px 0;padding:13px;border:1px solid var(--divider-color,#555);border-radius:12px;background:var(--secondary-background-color,rgba(130,130,130,.12))}
          .calendar-choice[hidden]{display:none}
          .calendar-choice .date-title{font-weight:700;margin-bottom:12px}
          .calendar-choice .actions button{flex:1;min-width:120px;padding:12px 8px}
          #form{scroll-margin-top:110px}
          #metric-controls button{font-weight:650;padding:9px 13px}

          /* 0.3.7 : présentation complète inspirée du tableau de bord validé */
          :host{--pellet-panel:linear-gradient(155deg,rgba(19,34,52,.96),rgba(25,22,41,.97));--pellet-line:rgba(176,195,226,.13);--pellet-muted:#b6c1d2}
          .wrap{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;padding:clamp(12px,2.5vw,23px)!important;background:linear-gradient(155deg,#111d2d 0%,#15152b 48%,#1c1328 100%)!important;border:1px solid var(--pellet-line);box-shadow:0 9px 32px rgba(0,0,0,.16)}
          .head{margin:0 0 4px!important;padding:6px 4px 10px;border-bottom:1px solid var(--pellet-line)}
          .head h2{font-size:clamp(21px,3vw,27px);line-height:1.12;margin:4px 0 5px;letter-spacing:-.02em}
          .eyebrow{font-size:10px;color:#9db4d9;letter-spacing:.16em;font-weight:800}
          .head .small{font-size:12px;color:var(--pellet-muted)}
          .running-indicator{font-size:12px;font-weight:700;white-space:nowrap;border-radius:25px;border:1px solid rgba(197,206,224,.22);background:rgba(255,255,255,.08);padding:9px 12px}
          .stove-hero{margin:0!important;min-height:178px;padding:16px!important;background:radial-gradient(circle at 28% 70%,rgba(255,156,61,.08),transparent 45%),linear-gradient(125deg,#1c3344,#24172d)!important;border:1px solid rgba(175,198,230,.22)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}
          .stove-picture{height:185px;width:147px;flex-basis:147px}
          .stove-details .stove-status{font-size:clamp(18px,3.5vw,25px);line-height:1.25}
          .stove-details .small{font-size:13px;color:#c3cedc}
          #stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
          .tile{min-height:86px;padding:13px 15px;border:1px solid var(--pellet-line);border-radius:14px;background:linear-gradient(145deg,#1a2637,#1c1b2e);box-shadow:inset 0 1px 0 rgba(255,255,255,.035);display:flex;flex-direction:column;justify-content:space-between}
          .tile-top{display:flex;align-items:center;gap:8px;min-width:0}
          .tile-icon{font-size:16px;line-height:1;flex:0 0 auto}
          .tile .label{font-size:12px;color:#bec8d8;line-height:1.28}
          .tile .value{margin:10px 0 0;font-size:clamp(20px,3.4vw,27px);line-height:1.15;color:#fff;word-break:normal}
          .tile .unit{font-size:12px;color:#c6d1e0}
          .tile-stock{border-color:rgba(76,192,122,.37);background:linear-gradient(145deg,#1c382f,#1a2a34)}
          .tile-sacs{border-color:rgba(56,156,222,.33)}
          .tile-today,.tile-month{border-color:rgba(156,121,226,.29)}
          .tile-next{border-color:rgba(240,175,77,.3)}
          .section{margin:0!important;min-width:0;padding:16px 15px 14px;border-radius:16px;background:var(--pellet-panel);border:1px solid var(--pellet-line);box-shadow:0 4px 13px rgba(0,0,0,.09)}
          .section h3{display:flex;align-items:center;gap:8px;margin:0 0 15px;font-size:15px!important;letter-spacing:0!important;font-weight:750;flex-wrap:wrap}
          .section-symbol{font-size:17px}
          .section-subtitle{font-size:10px;color:#93aac6;font-weight:600;margin-left:auto}
          .section svg{max-width:100%;min-height:unset!important}
          .section .small{color:#b6c3d3}
          .section .line{padding:11px 6px;border-top:1px solid rgba(174,194,223,.15);line-height:1.5}
          .section .line b{font-size:13px}
          .section .line .small{font-size:12px}
          .section-tools .actions{gap:8px}
          .section-tools .actions button{min-height:40px;background:rgba(106,129,166,.14)}
          .section button{transition:background .15s ease,box-shadow .15s ease}
          .section button:focus-visible{outline:2px solid #ffa726;outline-offset:2px}
          #metric-controls{gap:6px!important}
          #metric-controls button{padding:8px 10px!important;font-size:12px}
          #maintenance .day-cell{border:1px solid rgba(255,255,255,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}
          #maintenance button[data-day-action]{font-size:13px;height:24px;background:rgba(12,16,25,.72)}
          .calendar-choice{background:rgba(31,51,75,.9)}
          .section-calendar #month-label{text-transform:capitalize}
          .section-calendar #prev-month,.section-calendar #next-month{background:#243349;border:0;min-width:38px;min-height:38px}
          @media(min-width:900px){
            .wrap{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
            .head{grid-column:1/-1}
            .stove-hero{grid-column:1;min-height:240px}
            #stats{grid-column:2;grid-row:2;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;align-self:stretch}
            .tile{min-height:62px;padding:9px}
            .tile .value{font-size:19px;margin-top:5px}
            .tile .label{font-size:11px}
            .tile-icon{font-size:13px}
            .section-chart{grid-column:1;grid-row:3}
            .section-calendar{grid-column:2;grid-row:3 / span 2}
            .section-seasons{grid-column:1;grid-row:4}
            .section-history{grid-column:1;grid-row:5}
            .section-tools{grid-column:2;grid-row:5}
          }
          @media(max-width:450px){
            .wrap{gap:10px}
            .stove-hero{min-height:155px;padding:10px!important;gap:8px}
            .stove-picture{height:148px;width:112px;flex-basis:112px}
            .tile{min-height:77px;padding:11px}
            .tile .value{font-size:22px}
            .section{padding:13px 11px}
            .section h3{font-size:14px!important}
            .section-calendar #maintenance{margin:0 -2px}
          }
          @media(max-width:520px){.wrap{padding:12px}.section{margin-top:24px}.section svg{min-height:120px}}
          @media(min-width:680px){.grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
          @media(max-width:410px){.fields{grid-template-columns:1fr}.tile .value{font-size:20px}}
          /* Mise en page compacte iPhone : v0.3.8 */
          #stats{gap:7px!important}
          #stats .tile{box-sizing:border-box;height:76px!important;min-height:0!important;padding:9px 11px!important;border-radius:11px!important}
          #stats .tile-top{gap:6px!important}
          #stats .tile-icon{font-size:13px!important}
          #stats .tile .label{font-size:11px!important;line-height:1.16}
          #stats .tile .value{margin:0!important;font-size:22px!important;line-height:1.15!important}
          #stats .tile .unit{font-size:11px!important}
          .wrap{gap:9px!important}
          @media(max-width:450px){#stats .tile{height:69px!important;padding:8px 9px!important}#stats .tile .value{font-size:20px!important}}
          @media(min-width:900px){#stats .tile{height:auto!important;min-height:58px!important}}
                  /* Poêle photo-réaliste, état suivi automatiquement */
          .stove-real{position:relative;flex:0 0 103px;width:103px;height:184px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 8px 9px rgba(0,0,0,.38))}
          .stove-real-photo{height:100%;width:100%;object-fit:contain}
          .stove-real-flames{position:absolute;left:43%;top:29%;width:34%;height:28%;opacity:0;pointer-events:none}
          .stove-hero[data-active="on"] .stove-real-flames{opacity:1}
          .stove-hero[data-active="on"] .flame-one{animation:stovePhotoFlicker 1.08s ease-in-out infinite alternate;transform-origin:50% 90%}
          .stove-hero[data-active="on"] .flame-two{animation:stovePhotoFlicker .79s ease-in-out -.22s infinite alternate;transform-origin:55% 88%}
          @keyframes stovePhotoFlicker{from{transform:scaleX(.82) scaleY(.88) rotate(-3deg)}to{transform:scaleX(1.04) scaleY(1.11) rotate(4deg)}}
          @media(prefers-reduced-motion:reduce){.stove-real-flames path{animation:none!important}}
          .stove-hero{min-height:0!important;padding:10px 12px!important;gap:12px!important}
          .stove-details .stove-status{font-size:18px!important;margin-bottom:5px}
          .stove-details .small{font-size:11px!important}
          @media(max-width:450px){.stove-real{flex-basis:84px;width:84px;height:152px}.stove-hero{padding:8px!important}}


          /* 0.3.10 : une seule photo lumineuse, flamme réellement liée à l'état */
          .wrap{background:#121b2b!important;background-image:linear-gradient(155deg,#121e2e,#1a172d)!important;background-repeat:no-repeat!important}
          .head{background:rgba(10,18,29,.40);border-radius:12px;padding:12px!important}
          .stove-hero{
            position:relative;isolation:isolate;overflow:hidden;
            min-height:225px!important;justify-content:flex-end!important;
            background:#25242b!important;
            background-image:none!important;padding:12px!important
          }
          .room-scene{position:absolute;inset:0;width:100%;height:100%;z-index:0;display:block}
          .room-scene .hero-fire{opacity:0;transition:opacity .35s ease;transform-origin:370px 507px}
          .stove-hero[data-active="on"] .room-scene .hero-fire{opacity:1}
          .stove-hero[data-active="on"] .hero-fire-a{animation:heroFlickerA 1.17s ease-in-out infinite alternate;transform-origin:370px 507px}
          .stove-hero[data-active="on"] .hero-fire-b{animation:heroFlickerB .84s ease-in-out -.3s infinite alternate;transform-origin:370px 507px}
          .stove-hero[data-active="on"] .hero-fire-c{animation:heroFlickerA .67s ease-in-out -.15s infinite alternate;transform-origin:370px 507px}
          @keyframes heroFlickerA{0%{transform:scale(.9,1.04) rotate(-3deg)}100%{transform:scale(1.05,.9) rotate(4deg)}}
          @keyframes heroFlickerB{0%{transform:scale(1.02,.94) rotate(3deg)}100%{transform:scale(.91,1.12) rotate(-4deg)}}
          @media(prefers-reduced-motion:reduce){.hero-fire path{animation:none!important}}
          .stove-real{display:none!important}
          .stove-details{position:relative;z-index:1;background:rgba(12,19,32,.70);border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:12px 15px;backdrop-filter:blur(7px);max-width:58%;text-shadow:0 1px 2px #05090c}
          #stats .tile{background:rgba(13,20,33,.78)!important;backdrop-filter:blur(8px)}
          #stats .tile-stock{background:rgba(12,54,42,.80)!important}
          .section{background:rgba(14,21,35,.90)!important;backdrop-filter:blur(7px)}
          @media(max-width:520px){
            .stove-hero{min-height:190px!important}
            .stove-details{max-width:57%;padding:10px}
            .stove-details .stove-status{font-size:16px!important}
            .stove-details .small{font-size:11px!important}
          }
          @media(min-width:900px){.stove-hero{min-height:310px!important}.stove-details{max-width:50%}}
          .stove-hero{justify-content:center!important}

          /* v0.3.14: onglets réels (mobile et PC) */
          .wrap[data-view]{grid-template-columns:minmax(0,1fr)!important}
          .wrap[data-view] > *{grid-column:auto!important;grid-row:auto!important}
          .dashboard-nav{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;padding:5px;background:rgba(10,18,34,.72);border:1px solid rgba(155,177,209,.18);border-radius:15px;min-width:0}
          .dashboard-nav button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;min-width:0;padding:8px 2px;border:0;border-radius:11px;font-size:10px;line-height:1.25;white-space:normal;color:#afc0d7;background:transparent;transition:background .15s ease,color .15s ease}
          .dashboard-nav button .nav-icon{font-size:19px;line-height:1}
          .dashboard-nav button[aria-current="page"]{background:linear-gradient(140deg,#6c2a95,#44205d);color:#fff;font-weight:750;box-shadow:0 3px 12px rgba(0,0,0,.18)}
          .dashboard-nav button:focus-visible{outline:2px solid #ffb344;outline-offset:2px}
          .wrap[data-view] > .stove-hero,.wrap[data-view] > #stats,.wrap[data-view] > .section{display:none!important}
          .wrap[data-view="accueil"] > .stove-hero{display:flex!important}
          .wrap[data-view="accueil"] > #stats{display:grid!important}
          .wrap[data-view="consommation"] > .section-chart{display:block!important}
          .wrap[data-view="historique"] > .section-history{display:block!important}
          .wrap[data-view="calendrier"] > .section-calendar{display:block!important}
          .wrap[data-view="comparaison"] > .section-seasons{display:block!important}
          .wrap[data-view="parametres"] > .section-tools{display:block!important}
          .wrap[data-view] > .head,.wrap[data-view] > .dashboard-nav{grid-column:1/-1!important}
          @media(min-width:680px){.dashboard-nav button{font-size:13px;flex-direction:row;gap:8px;padding:12px 8px}.dashboard-nav button .nav-icon{font-size:20px}}
          @media(max-width:380px){.dashboard-nav{gap:3px;padding:3px}.dashboard-nav button{font-size:9px}.dashboard-nav button .nav-icon{font-size:17px}}

          /* v0.3.15 — titre compact et onglet calendrier distinct */
          .wrap[data-view] > .head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;min-height:0!important;margin:0!important;padding:8px 12px!important;border-radius:12px!important}
          .wrap[data-view] > .head h2{font-size:clamp(15px,2.5vw,20px)!important;font-weight:700!important;line-height:1.2!important;margin:0!important;letter-spacing:0!important}
          .wrap[data-view] > .head .running-indicator{padding:6px 9px!important;font-size:12px!important;flex:0 0 auto!important;white-space:nowrap!important}
          @media(max-width:520px){
            .dashboard-nav{grid-template-columns:repeat(6,minmax(0,1fr));gap:2px;padding:3px}
            .dashboard-nav button{font-size:9px;padding:8px 1px;gap:4px}
            .dashboard-nav button .nav-icon{font-size:17px}
          }
          @media(max-width:380px){
            .dashboard-nav{grid-template-columns:repeat(3,minmax(0,1fr))}
            .dashboard-nav button{font-size:11px;flex-direction:row;gap:5px}
            .wrap[data-view] > .head h2{font-size:15px!important}
            .wrap[data-view] > .head .running-indicator{font-size:11px!important;padding:5px 7px!important}
          }

          /* v0.3.16 : calendrier compact, pictogrammes vectoriels, axe kilogrammes */
          .dashboard-nav button .nav-icon{display:flex;align-items:center;justify-content:center}
          .dashboard-nav .nav-icon svg{width:21px;height:21px;display:block}
          #maintenance .day-cell{border-radius:6px}
          #maintenance button[data-date]{min-height:0}
          #maintenance .day-actions{bottom:2px;left:3px;right:3px;gap:3px}
          #maintenance button[data-day-action]{height:18px!important;padding:0 2px!important;border-radius:4px!important;display:flex;align-items:center;justify-content:center;color:#e9f2ff;background:rgba(17,27,42,.65)!important}
          #maintenance button[data-day-action] svg{height:14px;width:14px;display:block;flex:none}
          #maintenance button[data-day-action]:active{background:rgba(120,83,190,.85)!important}
          #maintenance .day-cell button[data-date]{padding-top:5px!important;align-items:flex-start!important}
          .section-calendar{padding-top:12px!important}
          .section-calendar h3{margin-bottom:8px!important}
          .section-calendar #prev-month,.section-calendar #next-month{min-width:32px;min-height:32px;padding:5px}
          @media(max-width:520px){
            #maintenance button[data-day-action] svg{width:12px;height:12px}
            #maintenance button[data-day-action]{height:16px!important}
            #maintenance .day-actions{gap:1px;left:1px;right:1px}
            #maintenance .day-cell button[data-date]{font-size:13px!important}
            .dashboard-nav .nav-icon svg{width:17px;height:17px}
          }
          #chart svg{height:auto;min-height:0!important}

          /* V0.3.19 — Accueil immersif sans changement de structure HTML/JS.
             Les deux composants existants occupent volontairement la même zone CSS Grid. */
          .wrap[data-view="accueil"]{grid-template-columns:minmax(0,1fr)!important;align-content:start}
          .wrap[data-view="accueil"] > .head{grid-row:1!important;grid-column:1!important}
          .wrap[data-view="accueil"] > .dashboard-nav{grid-row:2!important;grid-column:1!important}
          .wrap[data-view="accueil"] > .stove-hero{
            grid-row:3!important;grid-column:1!important;
            align-self:stretch!important;justify-self:stretch!important;
            z-index:0!important;position:relative!important;
            box-sizing:border-box!important;
            width:100%!important;height:100%!important;
            min-height:clamp(660px,calc(100dvh - 195px),910px)!important;
            margin:0!important;padding:0!important;gap:0!important;
            border:1px solid rgba(213,229,249,.19)!important;
            border-radius:17px!important;box-shadow:none!important;
            background:#1d2937!important;overflow:hidden!important;
          }
          .wrap[data-view="accueil"] > .stove-hero > .room-scene{
            position:absolute!important;inset:0!important;width:100%!important;height:100%!important;
          }
          .wrap[data-view="accueil"] > .stove-hero::after{
            content:"";position:absolute;inset:0;z-index:1;pointer-events:none;
            background:linear-gradient(180deg,rgba(9,17,28,.03) 0%,rgba(9,17,28,.02) 35%,rgba(9,17,28,.12) 53%,rgba(7,15,28,.5) 100%);
          }
          .wrap[data-view="accueil"] > #stats{
            grid-row:3!important;grid-column:1!important;
            position:relative!important;z-index:2!important;
            align-self:end!important;justify-self:stretch!important;
            box-sizing:border-box!important;margin:0!important;
            padding:clamp(10px,1.5vw,19px)!important;
            grid-template-columns:repeat(4,minmax(0,1fr))!important;
            gap:clamp(6px,1vw,10px)!important;
          }
          .wrap[data-view="accueil"] > #stats .tile{
            min-width:0!important;height:clamp(64px,6.8vw,78px)!important;
            padding:9px 11px!important;border-radius:13px!important;
            background:rgba(18,26,39,.34)!important;
            border:1px solid rgba(230,240,252,.36)!important;
            box-shadow:inset 0 1px 0 rgba(255,255,255,.11),0 3px 10px rgba(0,0,0,.14)!important;
            -webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);
            justify-content:center!important;gap:5px!important;
          }
          .wrap[data-view="accueil"] > #stats .tile-stock{
            background:rgba(14,79,55,.4)!important;
            border-color:rgba(110,226,168,.53)!important;
          }
          .wrap[data-view="accueil"] > #stats .tile-next{border-color:rgba(251,182,89,.53)!important}
          .wrap[data-view="accueil"] > #stats .tile .label{
            color:#f3f7fb!important;font-size:clamp(10px,1.05vw,13px)!important
          }
          .wrap[data-view="accueil"] > #stats .tile .value{
            color:#fff!important;font-size:clamp(20px,2.2vw,27px)!important;margin:0!important;
            text-shadow:0 1px 4px rgba(0,0,0,.48)
          }
          .wrap[data-view="accueil"] > #stats .tile .unit{color:#e9f0fa!important}
          .wrap[data-view="accueil"] > #stats .tile-icon{font-size:15px!important}
          @media(max-width:699px){
            .wrap[data-view="accueil"] > .stove-hero{
              min-height:clamp(740px,calc(100dvh - 150px),1050px)!important;
            }
            .wrap[data-view="accueil"] > #stats{
              grid-template-columns:repeat(2,minmax(0,1fr))!important;
              padding:9px!important;gap:7px!important
            }
            .wrap[data-view="accueil"] > #stats .tile{height:66px!important;padding:7px 9px!important;gap:3px!important}
            .wrap[data-view="accueil"] > #stats .tile .label{font-size:11px!important}
            .wrap[data-view="accueil"] > #stats .tile .value{font-size:21px!important}
            .wrap[data-view="accueil"] > .stove-hero::after{
              background:linear-gradient(180deg,transparent 0%,rgba(9,16,28,.03) 24%,rgba(9,16,28,.20) 44%,rgba(9,16,28,.64) 100%)
            }
          }
          @media(prefers-reduced-transparency:reduce){
            .wrap[data-view="accueil"] > #stats .tile{background:rgba(16,26,39,.82)!important}
          }

          /* v0.3.20 - paysage iPad: photo moins haute, le poêle reste entièrement visible.
             Les cartes sont dans la zone DROITE de la photo, sans modification du HTML. */
          @media(min-width:700px){
            .wrap[data-view="accueil"] > .stove-hero{
              height:clamp(420px,calc(100dvh - 185px),620px)!important;
              min-height:0!important;
              max-height:620px!important;
            }
            .wrap[data-view="accueil"] > #stats{
              grid-template-columns:repeat(3,minmax(0,1fr))!important;
              padding:10px 12px 12px 34%!important;
              gap:7px!important;
              align-self:end!important;
            }
            .wrap[data-view="accueil"] > #stats .tile{
              height:clamp(52px,6.8dvh,68px)!important;
              padding:6px 9px!important;
              border-radius:10px!important;
              gap:2px!important;
              background:rgba(15,25,39,.43)!important;
            }
            .wrap[data-view="accueil"] > #stats .tile-stock{
              background:rgba(10,69,49,.50)!important;
            }
            .wrap[data-view="accueil"] > #stats .tile .label{
              font-size:clamp(10px,1.05vw,12px)!important;
              line-height:1.12!important;
            }
            .wrap[data-view="accueil"] > #stats .tile .value{
              font-size:clamp(17px,1.9vw,23px)!important;
              line-height:1.05!important;
            }
          }
          /* Sur téléphone, on libère le poêle en haut, valeurs sous celui-ci. */
          @media(max-width:699px){
            .wrap[data-view="accueil"] > .stove-hero{
              height:clamp(650px,calc(100dvh - 130px),840px)!important;
              min-height:0!important;
              max-height:840px!important;
            }
            .wrap[data-view="accueil"] > #stats{
              padding:9px!important;
              grid-template-columns:repeat(2,minmax(0,1fr))!important;
              align-self:end!important;
            }
            .wrap[data-view="accueil"] > #stats .tile{
              height:57px!important;
              padding:6px 9px!important;
            }
            .wrap[data-view="accueil"] > #stats .tile .value{font-size:19px!important}
          }

          /* 0.3.21 : photo adaptée à l'écran et valeurs compactes en haut à droite.
             Mise en page CSS uniquement : DOM, services, calendrier et données inchangés. */
          .wrap[data-view] > .head h2{display:none!important}
          .wrap[data-view="accueil"] > .dashboard-nav{
            grid-row:1!important;grid-column:1!important;
          }
          .wrap[data-view="accueil"] > .stove-hero{
            grid-row:2!important;grid-column:1!important;
            height:clamp(390px,calc(100dvh - 165px),590px)!important;
            min-height:0!important;max-height:590px!important;
          }
          .wrap[data-view="accueil"] > .head{
            grid-row:2!important;grid-column:1!important;
            align-self:start!important;justify-self:end!important;
            z-index:4!important;position:relative!important;
            width:auto!important;min-width:0!important;
            padding:10px 15px!important;margin:0!important;
            background:transparent!important;border:0!important;
            box-shadow:none!important;pointer-events:none!important;
          }
          .wrap[data-view="accueil"] > .head .running-indicator{
            background:rgba(15,24,37,.52)!important;
            border:1px solid rgba(255,255,255,.43)!important;
            color:#fff!important;
            -webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);
          }
          .wrap[data-view="accueil"] > #stats{
            grid-row:2!important;grid-column:1!important;
            align-self:start!important;justify-self:stretch!important;
            grid-template-columns:repeat(3,minmax(0,1fr))!important;
            padding:clamp(54px,6.8dvh,66px) 3% 8px 38%!important;
            gap:7px!important;
          }
          .wrap[data-view="accueil"] > #stats .tile{
            height:clamp(49px,6.8dvh,61px)!important;
            min-height:0!important;max-height:61px!important;
            padding:6px 9px!important;border-radius:10px!important;
            gap:2px!important;
            background:rgba(18,28,41,.41)!important;
          }
          .wrap[data-view="accueil"] > #stats .tile-stock{
            background:rgba(12,77,52,.53)!important;
          }
          .wrap[data-view="accueil"] > #stats .tile .label{
            font-size:clamp(9px,.95vw,12px)!important;
            line-height:1.1!important;
          }
          .wrap[data-view="accueil"] > #stats .tile .value{
            font-size:clamp(17px,1.8vw,23px)!important;
            line-height:1.08!important;
          }
          .wrap[data-view="accueil"] > #stats .tile .unit{
            font-size:clamp(10px,1vw,12px)!important;
          }
          .wrap[data-view="accueil"] > #stats .tile-icon{
            font-size:13px!important;line-height:1!important;
          }
          .wrap[data-view="accueil"] > .stove-hero::after{
            background:linear-gradient(90deg,transparent 0%,transparent 31%,rgba(10,17,28,.05) 42%,rgba(10,17,28,.08) 100%)!important;
          }
          @media (max-width:699px){
            .wrap[data-view="accueil"] > .stove-hero{
              height:clamp(620px,calc(100dvh - 120px),790px)!important;
              min-height:0!important;max-height:790px!important;
            }
            .wrap[data-view="accueil"] > #stats{
              grid-template-columns:repeat(2,minmax(0,1fr))!important;
              align-self:end!important;
              padding:8px!important;gap:6px!important;
            }
            .wrap[data-view="accueil"] > #stats .tile{
              height:clamp(47px,5.7dvh,55px)!important;
              padding:5px 8px!important;
            }
            .wrap[data-view="accueil"] > #stats .tile .label{font-size:10px!important}
            .wrap[data-view="accueil"] > #stats .tile .value{font-size:18px!important}
            .wrap[data-view="accueil"] > .stove-hero::after{
              background:linear-gradient(180deg,transparent 0%,transparent 25%,rgba(8,14,25,.14) 48%,rgba(8,14,25,.60) 100%)!important;
            }
          }
          /* v0.3.22 : flamme plus fine et naturelle, pas de symbole opaque */
          .stove-hero[data-active="on"] .room-scene .hero-fire{opacity:.92}
          .stove-hero[data-active="on"] .hero-fire-a{animation:heroNaturalFlickerA 1.6s ease-in-out infinite alternate}
          .stove-hero[data-active="on"] .hero-fire-b{animation:heroNaturalFlickerB 1.2s ease-in-out -.4s infinite alternate}
          .stove-hero[data-active="on"] .hero-fire-c{animation:heroNaturalFlickerA .96s ease-in-out -.2s infinite alternate}
          @keyframes heroNaturalFlickerA{from{transform:translateX(-2px) scaleX(.91) scaleY(.89);opacity:.58}to{transform:translateX(2px) scaleX(1.05) scaleY(1.09);opacity:.92}}
          @keyframes heroNaturalFlickerB{from{transform:translateX(2px) scaleX(.90) scaleY(.96);opacity:.56}to{transform:translateX(-1px) scaleX(1.04) scaleY(1.12);opacity:.91}}
          /* V0.3.25: GIF natif dans le HTML, sans <image GIF> SVG incompatible iOS */
          .stove-hero .stove-real-fire{position:absolute!important;display:none!important;z-index:2!important;pointer-events:none!important;max-width:none!important;max-height:none!important;object-fit:fill!important}
          .stove-hero[data-active="on"] .stove-real-fire{display:block!important}
          .stove-hero[data-active="off"] .stove-real-fire,.stove-hero[data-active="unknown"] .stove-real-fire{display:none!important}
          /* v0.3.28 — flammes vectorielles nettes dans la vitre, sans sprite pixellisé */
          .stove-hero .stove-real-fire{overflow:visible!important;filter:drop-shadow(0 0 5px rgba(255,102,17,.45))}
          .stove-hero[data-active="on"] .fire-tongue-a{transform-origin:50% 95%;animation:fireDanceA 1.38s ease-in-out infinite alternate}
          .stove-hero[data-active="on"] .fire-tongue-b{transform-origin:48% 96%;animation:fireDanceB .93s ease-in-out -.38s infinite alternate}
          .stove-hero[data-active="on"] .fire-tongue-c{transform-origin:50% 95%;animation:fireDanceA .78s ease-in-out -.2s infinite alternate}
          @keyframes fireDanceA{from{transform:translateX(-2px) scale(.91,.89);opacity:.83}to{transform:translateX(3px) scale(1.07,1.1);opacity:1}}
          @keyframes fireDanceB{from{transform:translateX(3px) scale(.88,1.09);opacity:.66}to{transform:translateX(-3px) scale(1.09,.93);opacity:.98}}
          @media(prefers-reduced-motion:reduce){.fire-tongue{animation:none!important}}
</style>
        <ha-card><div class="wrap">
          <div class="head"><h2>Mon Poêle à Granulés</h2><div id="running" class="running-indicator"></div></div>
          <nav class="dashboard-nav" aria-label="Navigation du poêle">
            <button type="button" data-view-button="accueil" aria-current="page"><span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9M9 21v-8h6v8"/></svg></span><span>Accueil</span></button>
            <button type="button" data-view-button="consommation"><span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V11M10 20V5M16 20v-9M22 20V8"/><path d="M2 21h20"/></svg></span><span>Conso.</span></button>
            <button type="button" data-view-button="historique"><span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v5h5M12 7v5l4 2"/></svg></span><span>Historique</span></button>
            <button type="button" data-view-button="calendrier"><span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h3v3H8z"/></svg></span><span>Calendrier</span></button>
            <button type="button" data-view-button="comparaison"><span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20V14h4v6M10 20V9h4v11M17 20V4h4v16M2 21h20"/></svg></span><span>Comparaison</span></button>
            <button type="button" data-view-button="parametres"><span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="M10 2h4l.7 3 2 .9 2.6-1.5 2.8 2.8-1.5 2.6.9 2 .5.2v3l-3 .7-.9 2 1.5 2.6-2.8 2.8-2.6-1.5-2 .9-.7 3h-4l-.7-3-2-.9-2.6 1.5-2.8-2.8 1.5-2.6-.9-2-.5-.2v-3l3-.7.9-2L2.7 7.2 5.5 4.4 8 5.9l2-.9Z"/></svg></span><span>Réglages</span></button>
          </nav>
          <div class="stove-hero" id="stove-hero" data-active="unknown" aria-label="État du poêle">

            <svg class="room-scene" viewBox="0 0 1536 864" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Salon avec poêle à granulés blanc et noir">
              <defs>
                <linearGradient id="glassShade" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stop-color="#120f11"/><stop offset=".55" stop-color="#1b1819"/><stop offset="1" stop-color="#0d0b0c"/>
                </linearGradient>
                <radialGradient id="fireGlow"><stop offset="0" stop-color="#ff8b24" stop-opacity=".47"/><stop offset=".46" stop-color="#ff4b0d" stop-opacity=".17"/><stop offset="1" stop-color="#b72804" stop-opacity="0"/></radialGradient>
                <linearGradient id="flameOuter" x1="0" y1="1" x2=".32" y2="0">
                  <stop offset="0" stop-color="#ff8916" stop-opacity=".88"/>
                  <stop offset=".35" stop-color="#ff6c0a" stop-opacity=".86"/>
                  <stop offset=".75" stop-color="#ffb23f" stop-opacity=".44"/>
                  <stop offset="1" stop-color="#ffd978" stop-opacity="0"/>
                </linearGradient>
                <linearGradient id="flameMiddle" x1=".2" y1="1" x2=".65" y2="0">
                  <stop offset="0" stop-color="#fff0a6" stop-opacity=".95"/>
                  <stop offset=".40" stop-color="#ffb437" stop-opacity=".88"/>
                  <stop offset=".82" stop-color="#ff8b23" stop-opacity=".33"/>
                  <stop offset="1" stop-color="#ffae27" stop-opacity="0"/>
                </linearGradient>
                <linearGradient id="flameCore" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0" stop-color="#fffcdf" stop-opacity=".97"/>
                  <stop offset=".43" stop-color="#fff1ad" stop-opacity=".79"/>
                  <stop offset="1" stop-color="#fff9da" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <image href="data:image/avif;base64,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" x="0" y="0" width="1536" height="864" preserveAspectRatio="none"/>
              
            </svg>
            <svg id="stove-real-fire" class="stove-real-fire" viewBox="0 0 105 133" preserveAspectRatio="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="fire-halo"><stop offset="0" stop-color="#ff9a28" stop-opacity=".54"/><stop offset=".65" stop-color="#e74c08" stop-opacity=".21"/><stop offset="1" stop-color="#e74c08" stop-opacity="0"/></radialGradient>
                <linearGradient id="fire-outer" x1="0" y1="1" x2=".4" y2="0"><stop offset="0" stop-color="#ff6b04"/><stop offset=".33" stop-color="#ffb52d"/><stop offset=".8" stop-color="#ffad24" stop-opacity=".7"/><stop offset="1" stop-color="#e65b07" stop-opacity="0"/></linearGradient>
                <linearGradient id="fire-inner" x1="0" y1="1" x2=".2" y2="0"><stop offset="0" stop-color="#fff9c1"/><stop offset=".42" stop-color="#ffe26b"/><stop offset=".83" stop-color="#ffbd29" stop-opacity=".84"/><stop offset="1" stop-color="#ffae2b" stop-opacity="0"/></linearGradient>
                <filter id="fire-soft"><feGaussianBlur stdDeviation="3"/></filter>
              </defs>
              <ellipse cx="52" cy="104" rx="47" ry="40" fill="url(#fire-halo)" filter="url(#fire-soft)"/>
              <g class="fire-tongue fire-tongue-a"><path d="M24 114 C8 98 25 76 24 55 C40 68 45 79 42 89 C60 71 52 48 62 26 C78 51 85 74 74 96 C92 83 93 70 92 62 C105 89 96 107 86 117 Z" fill="url(#fire-outer)"/><path d="M37 116 C29 104 42 96 42 84 C51 96 55 100 54 105 C64 90 64 75 68 67 C76 91 76 100 70 114 Z" fill="url(#fire-inner)"/></g>
              <g class="fire-tongue fire-tongue-b"><path d="M12 120 C2 107 13 92 16 83 C21 101 25 107 32 118 Z M79 119 C72 109 88 103 91 89 C96 107 99 115 94 120 Z" fill="url(#fire-outer)"/></g>
              <g class="fire-tongue fire-tongue-c"><path d="M47 119 C38 109 54 102 51 89 C65 100 60 107 62 119 Z" fill="url(#fire-inner)"/></g>
              <ellipse cx="53" cy="119" rx="44" ry="7" fill="#f66e12" opacity=".52" filter="url(#fire-soft)"/>
            </svg>
          </div>
          <div class="grid" id="stats"></div>
          <div class="section section-chart"><h3><span class="section-symbol">📈</span> Évolution de la consommation <span class="section-subtitle">Octobre — septembre</span></h3><div id="chart"></div></div><div class="section section-seasons"><h3><span class="section-symbol">💶</span> Prix moyen du sac par saison</h3><div id="metric-controls" style="display:flex;flex-wrap:wrap;gap:7px"></div><div id="seasons"></div></div>
          <div class="section section-tools"><h3><span class="section-symbol">⚙️</span> Gestion du poêle</h3><div class="actions">
            <button data-open="stock">Corriger stock</button>
            <button data-open="calibration">Calibrer</button><button id="legacy-import-button" type="button">Importer CSV</button><input id="legacy-import-file" type="file" accept=".csv,text/csv" style="display:none">
          </div>
          <div id="message" class="msg" role="status"></div></div>
          <div class="section section-history"><h3><span class="section-symbol">🧾</span> Dernières saisies</h3><div id="purchases"></div></div>
          <div class="section section-calendar"><h3><span class="section-symbol">📅</span> Calendrier des événements</h3><div style="display:flex;justify-content:space-between;align-items:center;margin:12px 0"><button id="prev-month">‹</button><strong id="month-label"></strong><button id="next-month">›</button></div><div id="maintenance"></div><div id="calendar-choice" class="calendar-choice" hidden></div><div class="form" id="form"></div><div class="small" style="margin-top:12px">🟢 Achat · 🔴 Consommation · 🟠 Entretien · 🔵 Dépannage · 🟣 Révision · 🟣 Nettoyage</div></div>
        </div></ha-card>`;
      this.shadowRoot.querySelectorAll("[data-view-button]").forEach(button=>{
        button.addEventListener("click",()=>this.setView(button.dataset.viewButton));
      });
      this.setView(this._activeView);
      this.shadowRoot.querySelectorAll("[data-open]").forEach(b => b.addEventListener("click", () => this.openForm(b.dataset.open)));
      this.shadowRoot.getElementById("legacy-import-button").onclick=()=>this.shadowRoot.getElementById("legacy-import-file").click();
      this.shadowRoot.getElementById("legacy-import-file").onchange=async(event)=>{
        const file=event.target.files?.[0];
        if(!file)return;
        try{
          const csv=await file.text();
          if(!csv.includes("Saison;Date;Type;Quantite"))throw Error("Format CSV incompatible");
          const ok=await this.call("importer_historique",{csv_text:csv},true);
          if(ok)this.shadowRoot.getElementById("message").textContent="✅ Historique importé. Le stock réel est inchangé.";
        }catch(error){
          this.shadowRoot.getElementById("message").textContent="⚠️ Import impossible : "+String(error.message||error);
        }
        event.target.value="";
      };
      this.shadowRoot.getElementById("prev-month").onclick=()=>this.shiftMonth(-1);
      this.shadowRoot.getElementById("next-month").onclick=()=>this.shiftMonth(1);
      this.shadowRoot.getElementById("maintenance").addEventListener("click",e=>{
        const action=e.target.closest("button[data-day-action]");
        if(action){
          this._selectedCalendarDay=action.dataset.date;
          this.showCalendarChoices();
          this.openForm(action.dataset.dayAction,action.dataset.date);
          return;
        }
        const button=e.target.closest("button[data-date]");
        if(button)this.selectCalendarDay(button.dataset.date);
      });
      this.shadowRoot.getElementById("calendar-choice").addEventListener("click",e=>{
        const button=e.target.closest("button[data-calendar-action]");
        if(!button)return;
        if(button.dataset.calendarAction==="close"){
          this._selectedCalendarDay=null;
          this.showCalendarChoices();
        }else this.openForm(button.dataset.calendarAction,this._selectedCalendarDay);
      });
    }
  }
  positionRealFire(){
    const svg=this.shadowRoot?.querySelector(".room-scene");
    const el=this.shadowRoot?.getElementById("stove-real-fire");
    if(!svg||!el)return;
    const update=()=>{
      const w=svg.clientWidth,h=svg.clientHeight;
      if(!w||!h)return;
      const box=(svg.getAttribute("viewBox")||"0 0 1536 864").trim().split(/\s+/).map(Number);
      if(box.length!==4||box.some(n=>!Number.isFinite(n)))return;
      const [x,y,vw,vh]=box;
      const scale=Math.max(w/vw,h/vh);
      const mode=svg.getAttribute("preserveAspectRatio")||"xMidYMid slice";
      const ox=mode.includes("xMin")?0:(w-vw*scale)/2;
      const oy=mode.includes("YMin")?0:(h-vh*scale)/2;
      el.style.left=((317-x)*scale+ox)+"px";
      el.style.top=((405-y)*scale+oy)+"px";
      el.style.width=(105*scale)+"px";
      el.style.height=(133*scale)+"px";
    };
    update();
    if(typeof requestAnimationFrame==="function")requestAnimationFrame(update);
  }
  setView(name){
    const allowed=["accueil","consommation","historique","calendrier","comparaison","parametres"];
    this._activeView=allowed.includes(name)?name:"accueil";
    if(!this.shadowRoot)return;
    const wrap=this.shadowRoot.querySelector(".wrap");
    if(!wrap)return;
    wrap.dataset.view=this._activeView;
    this.shadowRoot.querySelectorAll("[data-view-button]").forEach(button=>{
      if(button.dataset.viewButton===this._activeView)button.setAttribute("aria-current","page");
      else button.removeAttribute("aria-current");
    });
  }
  set hass(hass) {
    this._hass = hass;
    if (!this.shadowRoot) return;
    this.render();
  }
  getCardSize(){return 9;}
  find(label) {
    if (!this._hass) return null;
    const customId = (this.config.entities || {})[label];
    if (customId) return this._hass.states[customId] || null;
    const aliases = {
      stock:"Stock granulés",sacs:"Stock sacs",today:"Granulés aujourd'hui",month:"Granulés ce mois",
      total:"Granulés consommés total",hours:"Heures fonctionnement total",
      hoursToday:"Heures fonctionnement aujourd'hui",rate:"Débit granulés estimé",
      power:"Puissance électrique poêle",energy:"Index électrique poêle",
      running:"Poêle en marche",spent:"Achats granulés",next:"Prochain entretien"
    };
    const target = aliases[label]; if (!target) return null;
    const arr = Object.values(this._hass.states).filter(s => s.entity_id.startsWith("sensor.") &&
      ((s.attributes.friendly_name || "").trim() === target ||
       (s.attributes.friendly_name || "").trim().endsWith(" " + target)));
    return arr[0] || null;
  }
  number(label,digits=1) {
    const s=this.find(label);if(!s)return "—";
    const n=Number(s.state);return Number.isFinite(n)?n.toLocaleString("fr-FR",{maximumFractionDigits:digits}):"—";
  }
  escape(t){return String(t??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  render(){
    const state=this.find("running");
    const isOn=state?.state==="Oui",isOff=state?.state==="Non";
    this.shadowRoot.getElementById("running").textContent =
      isOn?"🟢 En marche":isOff?"⚪ Éteint":"⚠️ État inconnu";
    const hero=this.shadowRoot.getElementById("stove-hero");
    hero.dataset.active=isOn?"on":isOff?"off":"unknown";
    // Sur mobile, un cadrage centré coupe le poêle placé à gauche de la photo.
    // On utilise les coordonnées de la photo source pour cadrer sur le poêle et sa vitre.
    const scene=this.shadowRoot.querySelector(".room-scene");
    if(scene){
      const mobile=typeof window!=="undefined" && window.matchMedia("(max-width:699px)").matches;
      const targetViewBox=mobile?"80 0 540 864":"0 0 1536 864";
      if(scene.getAttribute("viewBox")!==targetViewBox)scene.setAttribute("viewBox",targetViewBox);
      const ratio=mobile?"xMinYMid slice":"xMidYMid slice";
      if(scene.getAttribute("preserveAspectRatio")!==ratio)scene.setAttribute("preserveAspectRatio",ratio);
    }
    hero.setAttribute("aria-label",isOn?"Poêle en marche, flamme animée":isOff?"Poêle éteint, sans flamme":"État du poêle inconnu");
    this.positionRealFire();
    const stats=[
      ["Stock","stock","kg"],["Sacs disponibles","sacs","sacs"],
      ["Aujourd'hui","today","kg"],["Ce mois","month","kg"],
      ["Total consommé","total","kg"],["Heures aujourd'hui","hoursToday","h"],
      ["Débit estimé","rate","kg/h"],["Puissance électrique","power","W"],
      ["Heures totales","hours","h"],["Électricité (index)","energy","kWh"],
      ["Total achats","spent","€"],["Prochain entretien","next",""]
    ];
    this.shadowRoot.getElementById("stats").innerHTML=stats.map(([title,k,unit])=>
      `<div class="tile tile-${k}"><div class="tile-top"><span class="tile-icon" aria-hidden="true">${({stock:"📦",sacs:"🪵",today:"📆",month:"📊",total:"🔥",hoursToday:"⏱️",rate:"⚙️",power:"⚡",hours:"🕒",energy:"🔌",spent:"💶",next:"🔧"})[k]||"•"}</span><div class="label">${this.escape(title)}</div></div><div class="value">${this.escape(k==="next"?(this.find("next")?.state||"—"):this.number(k))} <span class="unit">${unit}</span></div></div>`).join("");
    this.renderHistory();
  }

  dayKey(date){return date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");}
  season(date){const y=+String(date).slice(0,4),m=+String(date).slice(5,7);return !y||!m?"":(m>=10?y:y-1)+"-"+(m>=10?y+1:y);}
  shiftMonth(n){this._calendarDate=new Date(this._calendarDate.getFullYear(),this._calendarDate.getMonth()+n,1);this.renderHistory();}
  renderHistory(){
    const purchases=this.find("stock")?.attributes.achats_recents||[];
    const tasks=this.find("next")?.attributes.entretiens_recents||[];
    const days=this.find("total")?.attributes.historique_jour||{};
    const legacy=this.find("total")?.attributes.historique_importe||[];
    const pastPurchases=legacy.filter(x=>String(x.type).toLowerCase()==="achat").map(x=>({date:x.date,bags:x.bags,kg:(Number(x.bags)||0)*15,total_eur:x.total_eur??((Number(x.unit_price)||0)*(Number(x.bags)||0)),note:x.note||"",historical:true}));
    const pastTasks=legacy.filter(x=>!["achat","consommation"].includes(String(x.type).toLowerCase())).map(x=>({date:x.date,description:x.type==="Nettoyage"?"Entretien":x.type,note:x.type==="Nettoyage"?"Nettoyage (ancien historique)":x.note||"",next_due:"",historical:true}));
    const historicalKg={};
    legacy.filter(x=>String(x.type).toLowerCase()==="consommation").forEach(x=>{historicalKg[x.date]=(historicalKg[x.date]||0)+(Number(x.bags)||0)*15;});
    const combinedPurchases=purchases.concat(pastPurchases);
    const combinedTasks=tasks.concat(pastTasks);

    const totalBags=combinedPurchases.reduce((a,x)=>a+(+x.bags||0),0);
    const price=totalBags?combinedPurchases.reduce((a,x)=>a+(+x.total_eur||0),0)/totalBags:0;
    const now=new Date(),startYear=now.getMonth()>=9?now.getFullYear():now.getFullYear()-1;
    const months=Array.from({length:12},(_,i)=>new Date(startYear,9+i,1));
    const monthly=months.map(d=>({label:d.toLocaleDateString("fr-FR",{month:"short"}),kg:Object.keys(days).filter(k=>k.startsWith(this.dayKey(d).slice(0,7))).reduce((a,k)=>a+(+days[k].kg||0),0)+Object.keys(historicalKg).filter(k=>k.startsWith(this.dayKey(d).slice(0,7))).reduce((a,k)=>a+historicalKg[k],0)}));
    const maxKg=Math.max(1,...monthly.map(x=>x.kg));
    const maxCost=Math.max(1,...monthly.map(x=>x.kg*price/15));
    const rawStep=maxKg/4;
    const decade=Math.pow(10,Math.floor(Math.log10(rawStep)));
    const niceStep=[1,2,2.5,5,10].map(n=>n*decade).find(n=>n>=rawStep)||10*decade;
    const axisMax=Math.max(1,Math.ceil(maxKg/niceStep)*niceStep);
    const base=162,top=37,plotHeight=base-top,left=56,plotWidth=682;
    const step=plotWidth/monthly.length,barWidth=Math.min(32,step*.40);
    const formatTick=n=>Number(n.toFixed(2)).toLocaleString("fr-FR");
    const kgAxis='<text x="6" y="20" font-size="14" font-weight="700" fill="#cbd7e7">kg</text>'+
      Array.from({length:5},(_,i)=>{
        const value=i*axisMax/4,yy=base-i*plotHeight/4;
        return '<line x1="'+left+'" y1="'+yy+'" x2="'+(left+plotWidth)+'" y2="'+yy+'" stroke="#9eafc8" stroke-opacity=".23" stroke-dasharray="'+(i?'4 5':'')+'"/>'+
        '<text x="'+(left-9)+'" y="'+(yy+4)+'" text-anchor="end" font-size="12" fill="#cbd7e7">'+formatTick(value)+'</text>';
      }).join("");
    const pts=monthly.map((x,i)=>(left+i*step+step/2)+","+(base-x.kg*price/15/maxCost*plotHeight)).join(" ");
    const bars=monthly.map((x,i)=>'<rect x="'+(left+i*step+step/2-barWidth/2)+'" y="'+(base-x.kg/axisMax*plotHeight)+'" width="'+barWidth+'" height="'+(x.kg/axisMax*plotHeight)+'" fill="#e74747" rx="4"/>').join("");
    const labels=monthly.map((x,i)=>'<text x="'+(left+i*step+step/2)+'" y="185" font-size="14" font-weight="'+(months[i].getMonth()===now.getMonth()&&months[i].getFullYear()===now.getFullYear()?700:400)+'" fill="'+(months[i].getMonth()===now.getMonth()&&months[i].getFullYear()===now.getFullYear()?'#55bd72':'currentColor')+'" text-anchor="middle">'+this.escape(x.label)+'</text>').join("");
    this.shadowRoot.getElementById("chart").innerHTML='<svg viewBox="0 0 760 205" style="width:100%" role="img" aria-label="Consommation mensuelle en kilogrammes avec échelle verticale à gauche">'+kgAxis+bars+'<polyline points="'+pts+'" stroke="#55bd72" stroke-width="4" fill="none"/>'+labels+'</svg><div class="small" style="text-align:center">🔴 kg consommés · 🟢 coût estimé (€)</div><p class="small">Coût estimé à partir du prix moyen des achats enregistrés. Les données antérieures à l’installation ne sont pas disponibles.</p>';
    const types=[["prix","Prix moyen"],["entretien","Entretien"],["depannage","Dépannage"],["revision","Révision"],["achat","Achat"],["total","Total"]];
    const controls=this.shadowRoot.getElementById("metric-controls");
    controls.innerHTML=types.map(x=>'<button data-metric="'+x[0]+'" style="'+(this._chartMetric===x[0]?'background:#ffa726;color:#191919;':'')+'border-radius:25px">'+x[1]+'</button>').join("");
    controls.querySelectorAll("button").forEach(b=>b.onclick=()=>{this._chartMetric=b.dataset.metric;this.renderHistory()});
    const seasons={};
    const item=k=>seasons[k]||(seasons[k]={euros:0,bags:0,achat:0,entretien:0,depannage:0,revision:0,total:0});
    combinedPurchases.forEach(x=>{const k=this.season(x.date);if(k){const a=item(k);a.euros+=+x.total_eur||0;a.bags+=+x.bags||0;a.achat++;a.total++;}});
    combinedTasks.forEach(x=>{const k=this.season(x.date);if(k){const a=item(k),t=String(x.description||"").toLowerCase();a[t.includes("dépann")?"depannage":t.includes("révision")?"revision":"entretien"]++;a.total++;}});
    const keys=Object.keys(seasons).sort().slice(-6),metric=this._chartMetric;
    const values=keys.map(k=>metric==="prix"?(seasons[k].bags?seasons[k].euros/seasons[k].bags:0):seasons[k][metric]);
    const maximum=Math.max(1,...values);
    const coords=values.map((v,i)=>({x:keys.length===1?360:45+i*630/(keys.length-1),y:155-v/maximum*112,v}));
    this.shadowRoot.getElementById("seasons").innerHTML=keys.length?
      '<svg viewBox="0 0 720 200" style="width:100%" role="img" aria-label="Évolution par saison"><polyline fill="none" stroke="#55bd72" stroke-width="4" points="'+coords.map(p=>p.x+','+p.y).join(' ')+'"/>'+
      coords.map((p,i)=>'<circle cx="'+p.x+'" cy="'+p.y+'" r="5" fill="#55bd72"/><text x="'+p.x+'" y="'+Math.max(16,p.y-12)+'" text-anchor="middle" font-size="13" fill="#55bd72">'+p.v.toLocaleString("fr-FR",{maximumFractionDigits:2})+(metric==="prix"?" €/sac":"")+'</text><text x="'+p.x+'" y="180" text-anchor="middle" fill="currentColor" font-size="12">'+this.escape(keys[i])+'</text>').join("")+'</svg>':
      '<p class="small">Les saisons apparaîtront après les premières saisies.</p>';
    const rows=[
      ...combinedPurchases.map(x=>({date:x.date,type:"🛒 Achat",detail:x.bags+" sac(s) · "+x.total_eur+" €",note:x.note||""})),
      ...combinedTasks.map(x=>({date:x.date,type:"🛠 "+x.description,detail:x.next_due?"Prochain : "+x.next_due:"",note:x.note||""})),
      ...Object.entries(days).filter(([k,v])=>(+v.kg||0)>0).map(([k,v])=>({date:k,type:"🔥 Consommation estimée",detail:(+v.kg).toFixed(2)+" kg",note:""})),
      ...legacy.filter(x=>String(x.type).toLowerCase()==="consommation").map(x=>({date:x.date,type:"🔥 Consommation historique",detail:(Number(x.bags)||0)+" sac(s) · "+((Number(x.bags)||0)*15)+" kg",note:""}))
    ].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8);
    this.shadowRoot.getElementById("purchases").innerHTML=rows.length?rows.map(x=>'<div class="line"><b>'+this.escape(x.type)+" · "+this.escape(x.date)+'</b><div class="small">'+this.escape(x.detail)+(x.note?" · "+this.escape(x.note):"")+'</div></div>').join(""):'<div class="small">Aucune saisie pour le moment</div>';
    const d=this._calendarDate,y=d.getFullYear(),m=d.getMonth(),prefix=this.dayKey(d).slice(0,7);
    const marks={};
    const mark=(date,color,title)=>{if(String(date).slice(0,7)===prefix)(marks[date]||(marks[date]=[])).push({color,title});};
    combinedPurchases.forEach(x=>mark(x.date,"#30aa65","Achat"));
    combinedTasks.forEach(x=>{const t=String(x.description||"").toLowerCase(),note=String(x.note||"").toLowerCase(),color=t.includes("dépann")?"#2196f3":note.includes("nettoyage")?"#7416ad":t.includes("révision")?"#9c27b0":"#ffa726";mark(x.date,color,x.description);if(x.next_due)mark(x.next_due,color,"Prévu : "+x.description);});
    Object.entries(days).forEach(([date,v])=>{if((+v.kg||0)>0)mark(date,"#e74747","Consommation");});
    Object.entries(historicalKg).forEach(([date,kg])=>{if(kg>0)mark(date,"#e74747","Consommation historique : "+kg+" kg");});
    const start=(d.getDay()+6)%7,count=new Date(y,m+1,0).getDate();
    this.shadowRoot.getElementById("month-label").textContent=d.toLocaleDateString("fr-FR",{month:"long",year:"numeric"});
    const head=["L","M","M","J","V","S","D"].map(x=>'<div style="text-align:center;opacity:.65">'+x+'</div>').join("");
    const blanks=Array.from({length:start},()=>'<div></div>').join("");
    const cells=Array.from({length:count},(_,i)=>{
      const date=this.dayKey(new Date(y,m,i+1)),mk=marks[date]||[];
      const colors=[...new Set(mk.map(x=>x.color))];
      const background=colors.length===0?"var(--secondary-background-color,rgba(120,120,120,.13))":
        colors.length===1?colors[0]:
        colors.length===2?"linear-gradient(135deg,"+colors[0]+" 0%, "+colors[0]+" 49.8%, "+colors[1]+" 50.2%, "+colors[1]+" 100%)":
        "conic-gradient("+colors.map((c,j)=>c+" "+(j*100/colors.length)+"% "+((j+1)*100/colors.length)+"%").join(",")+")";
      const current=date===this.dayKey(new Date());
      return '<div class="day-cell" style="background:'+background+';'+(current?'outline:2px solid var(--primary-color,#ffa726);outline-offset:-2px;':'')+'">'+
        '<button type="button" data-date="'+date+'" title="'+this.escape(mk.map(x=>x.title).join(" ; "))+'" aria-label="Choisir le '+date+'" style="box-sizing:border-box;display:flex;align-items:flex-start;padding-top:8px;justify-content:center;min-height:clamp(43px,6vw,58px);font-size:clamp(13px,1.7vw,18px);font-weight:'+(mk.length?700:400)+';color:'+(mk.length?'#fff':'inherit')+';background:transparent">'+(i+1)+'</button>'+
        '<div class="day-actions"><button type="button" data-day-action="purchase" data-date="'+date+'" aria-label="Ajouter un achat le '+date+'" title="Achat"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2 3h2l3 13h12l3-10H5"/></svg></button>'+
        '<button type="button" data-day-action="maintenance" data-date="'+date+'" aria-label="Ajouter une intervention le '+date+'" title="Intervention"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 3a6 6 0 0 1-8 8L6.5 19a2.5 2.5 0 0 1-3.5-3.5L11 9a6 6 0 0 1 8-8l-4 4 4 4z"/></svg></button></div></div>';
    }).join("");
    this.shadowRoot.getElementById("maintenance").innerHTML='<div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px">'+head+blanks+cells+'</div>';
    this.showCalendarChoices();
  }

  selectCalendarDay(date){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return;
    this._selectedCalendarDay=date;
    const existingForm=this.shadowRoot.getElementById('form');
    existingForm.classList.remove('open');
    existingForm.innerHTML='';
    this.showCalendarChoices();
    this.shadowRoot.getElementById("calendar-choice").scrollIntoView({behavior:"smooth",block:"nearest"});
  }
  showCalendarChoices(){
    const panel=this.shadowRoot.getElementById("calendar-choice");
    if(!panel)return;
    if(!this._selectedCalendarDay){panel.hidden=true;panel.innerHTML="";return;}
    const [year,month,day]=this._selectedCalendarDay.split("-").map(Number);
    const formatted=new Date(year,month-1,day).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
    panel.hidden=false;
    panel.innerHTML='<div class="date-title">📅 '+this.escape(formatted)+'</div>'+
      '<div class="small" style="margin-bottom:10px">Que souhaites-tu enregistrer ce jour-là ?</div>'+
      '<div class="actions"><button type="button" data-calendar-action="purchase">🛒 Ajouter un achat</button>'+
      '<button type="button" data-calendar-action="maintenance">🛠️ Ajouter une intervention</button>'+
      '<button type="button" data-calendar-action="close">Annuler</button></div>';
  }
  openForm(type,chosenDate){
    this._formType=type;
    const el=this.shadowRoot.getElementById("form");
    const field=(name,label,inputType="text",value="",required=true)=>
      `<label>${label}<input name="${name}" type="${inputType}" value="${this.escape(value)}" ${required?"required":""} ${inputType==="number"?'min="0" step="any"':""}></label>`;
    const today=chosenDate||this.dayKey(new Date());
    let form="";
    if(type==="purchase")form=field("sacs","Nombre de sacs","number","1")+field("montant_eur","Montant total (€)","number","0")+field("date","Date","date",today)+field("note","Note","text","",false);
    else if(type==="stock")form=field("sacs_reels","Stock réel (nombre de sacs)","number",this.number("sacs"))+field("note","Motif","text","Inventaire",false);
    else if(type==="maintenance")form='<label>Type d’intervention<select name="entretien" required style="box-sizing:border-box;width:100%;margin-top:4px;padding:9px;border-radius:7px;border:1px solid var(--divider-color,#777);color:var(--primary-text-color);background:var(--primary-background-color,#222);font:inherit"><option value="Entretien">Entretien</option><option value="Dépannage">Dépannage</option><option value="Révision">Révision</option></select></label>'+field("date","Date réalisée","date",today)+field("prochaine_date","Prochaine échéance","date","",false)+field("note","Description / intervention réalisée","text","",false);
    else form='<p class="small">Démarre une calibration, puis termine-la après avoir consommé une quantité connue de sacs. Une correction du stock sera appliquée.</p>'+field("sacs_consommes","Sacs consommés depuis le début","number","1");
    el.innerHTML=`<h3>${{purchase:"Ajouter un achat",stock:"Corriger le stock",maintenance:"Enregistrer un entretien",calibration:"Calibration"}[type]}</h3><form id="pellet-form"><div class="fields">${form}</div><div class="row" style="margin-top:12px">${type==="calibration"?'<button type="button" id="start">Démarrer la calibration</button>':''}<button class="primary" type="submit">${type==="calibration"?"Terminer la calibration":"Enregistrer"}</button><button type="button" id="cancel">Annuler</button></div></form>`;
    el.classList.add("open");
    el.scrollIntoView({behavior:"smooth",block:"nearest"});
    el.querySelector("#cancel").onclick=()=>el.classList.remove("open");
    el.querySelector("#pellet-form").onsubmit=e=>{e.preventDefault();this.submit(type,new FormData(e.target));};
    if(type==="calibration")el.querySelector("#start").onclick=()=>this.call("demarrer_calibration",{},true);
  }
  async call(action,data,keepOpen=false){
    const msg=this.shadowRoot.getElementById("message");
    try{
      await this._hass.callService("mon_poele_granules",action,data);
      msg.textContent="✅ Action enregistrée";
      if(!keepOpen)this.shadowRoot.getElementById("form").classList.remove("open");
      return true;
    }catch(err){msg.textContent="⚠️ Erreur : "+(err.message||String(err));return false;}
  }
  submit(type,form){
    const data=Object.fromEntries([...form.entries()].filter(([k,v])=>v!==""));
    if(type==="purchase"){data.sacs=Number(data.sacs);data.montant_eur=Number(data.montant_eur);}
    if(type==="stock")data.sacs_reels=Number(data.sacs_reels);
    if(type==="calibration")data.sacs_consommes=Number(data.sacs_consommes);
    this.call({purchase:"ajouter_achat",stock:"corriger_stock",maintenance:"ajouter_entretien",calibration:"terminer_calibration"}[type],data);
  }
}
if(!customElements.get("mon-poele-granules-card"))customElements.define("mon-poele-granules-card",MonPoeleGranulesCard);
window.customCards=window.customCards||[];
if(!window.customCards.some(x=>x.type==="mon-poele-granules-card"))window.customCards.push({type:"mon-poele-granules-card",name:"Mon Poêle à Granulés",description:"Stock, consommation, achats et entretiens"});
