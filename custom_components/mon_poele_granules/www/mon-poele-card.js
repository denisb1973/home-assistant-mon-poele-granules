/* Mon Poêle à Granulés – Lovelace card v0.3.8 */
class MonPoeleGranulesCard extends HTMLElement {
  setConfig(config) {
    this.config = config || {};
    this._calendarDate ||= new Date(new Date().getFullYear(),new Date().getMonth(),1);
    this._chartMetric ||= 'prix';
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
</style>
        <ha-card><div class="wrap">
          <div class="head"><div><div class="eyebrow">TABLEAU DE BORD • GRANULÉS</div><h2>Mon Poêle à Granulés</h2><div class="small">Stock, consommation et entretien</div></div><div id="running" class="running-indicator"></div></div>
          <div class="stove-hero" id="stove-hero" data-active="unknown" aria-label="État du poêle">
            <div class="stove-real"><img class="stove-real-photo" alt="Poêle blanc cylindrique avec façade noire" src="data:image/webp;base64,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"/><svg class="stove-real-flames" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="pelletGlow"><stop stop-color="#ffda7c" stop-opacity=".8"/><stop offset="1" stop-color="#f80" stop-opacity="0"/></radialGradient></defs><ellipse cx="50" cy="55" rx="36" ry="40" fill="url(#pelletGlow)"/><path class="flame-one" d="M32 90 Q18 67 40 45 Q48 33 48 12 Q76 42 67 65 Q75 54 75 45 Q94 73 71 90 Z" fill="#ff781c"/><path class="flame-two" d="M47 90 Q35 72 52 60 Q59 50 59 42 Q72 65 65 75 Q73 68 74 61 Q83 83 64 90Z" fill="#ffe29c"/></svg></div>
            <div class="stove-details"><div id="stove-status" class="stove-status unknown">État inconnu</div><div class="small" id="stove-subtitle">Animation synchronisée avec le capteur de fonctionnement.</div></div>
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
    hero.setAttribute("aria-label",isOn?"Poêle en marche, flamme animée":isOff?"Poêle éteint, sans flamme":"État du poêle inconnu");
    const status=this.shadowRoot.getElementById("stove-status");
    status.textContent=isOn?"🔥 Poêle en marche":isOff?"Poêle éteint":"État inconnu";
    status.className="stove-status "+(isOn?"on":isOff?"off":"unknown");
    this.shadowRoot.getElementById("stove-subtitle").textContent=isOn?
      "Flamme animée • consommation suivie automatiquement":isOff?
      "Flamme éteinte • poêle à l'arrêt":"En attente du capteur de fonctionnement";
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
    const base=162,step=720/monthly.length,barWidth=Math.min(36,step*.40);
    const pts=monthly.map((x,i)=>(i*step+step/2)+","+(base-x.kg*price/15/maxCost*125)).join(" ");
    const bars=monthly.map((x,i)=>'<rect x="'+(i*step+step/2-barWidth/2)+'" y="'+(base-x.kg/maxKg*125)+'" width="'+barWidth+'" height="'+(x.kg/maxKg*125)+'" fill="#e74747" rx="4"/>').join("");
    const labels=monthly.map((x,i)=>'<text x="'+(i*step+step/2)+'" y="185" font-size="14" font-weight="'+(months[i].getMonth()===now.getMonth()&&months[i].getFullYear()===now.getFullYear()?700:400)+'" fill="'+(months[i].getMonth()===now.getMonth()&&months[i].getFullYear()===now.getFullYear()?'#55bd72':'currentColor')+'" text-anchor="middle">'+this.escape(x.label)+'</text>').join("");
    this.shadowRoot.getElementById("chart").innerHTML='<svg viewBox="0 0 720 200" style="width:100%" role="img" aria-label="Consommation mensuelle et coût estimé">'+bars+'<polyline points="'+pts+'" stroke="#55bd72" stroke-width="4" fill="none"/>'+labels+'</svg><div class="small" style="text-align:center">🔴 kg consommés · 🟢 coût estimé (€)</div><p class="small">Coût estimé à partir du prix moyen des achats enregistrés. Les données antérieures à l’installation ne sont pas disponibles.</p>';
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
        '<button type="button" data-date="'+date+'" title="'+this.escape(mk.map(x=>x.title).join(" ; "))+'" aria-label="Choisir le '+date+'" style="box-sizing:border-box;display:flex;align-items:flex-start;padding-top:8px;justify-content:center;min-height:clamp(56px,10vw,92px);font-size:clamp(15px,2.6vw,22px);font-weight:'+(mk.length?700:400)+';color:'+(mk.length?'#fff':'inherit')+';background:transparent">'+(i+1)+'</button>'+
        '<div class="day-actions"><button type="button" data-day-action="purchase" data-date="'+date+'" aria-label="Ajouter un achat le '+date+'" title="Achat">🛒</button>'+
        '<button type="button" data-day-action="maintenance" data-date="'+date+'" aria-label="Ajouter une intervention le '+date+'" title="Intervention">🔧</button></div></div>';
    }).join("");
    this.shadowRoot.getElementById("maintenance").innerHTML='<div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px">'+head+blanks+cells+'</div>';
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
