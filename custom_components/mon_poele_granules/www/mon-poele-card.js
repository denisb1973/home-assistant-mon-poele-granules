/* Mon Poêle à Granulés – Lovelace card v0.3.1 */
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
          .head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}
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
          #maintenance [title]{cursor:help}
          #metric-controls button{font-weight:650;padding:9px 13px}
          @media(max-width:520px){.wrap{padding:12px}.section{margin-top:24px}.section svg{min-height:120px}}
          @media(min-width:680px){.grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
          @media(max-width:410px){.fields{grid-template-columns:1fr}.tile .value{font-size:20px}}
        </style>
        <ha-card><div class="wrap">
          <div class="head"><div><h2>🔥 Mon Poêle à Granulés</h2><div class="small">Stock, consommation et entretien</div></div><div id="running"></div></div>
          <div class="grid" id="stats"></div>
          <div class="section"><h3>📈 ÉVOLUTION DE LA CONSOMMATION</h3><div id="chart"></div></div><div class="section"><h3>💶 PRIX MOYEN DU SAC PAR SAISON</h3><div id="metric-controls" style="display:flex;flex-wrap:wrap;gap:7px"></div><div id="seasons"></div></div>
          <div class="section"><h3>Achats et entretiens</h3><div class="actions">
            <button data-open="purchase">+ Achat</button><button data-open="stock">Corriger stock</button>
            <button data-open="maintenance">+ Entretien</button><button data-open="calibration">Calibrer</button><button id="legacy-import-button" type="button">Importer CSV</button><input id="legacy-import-file" type="file" accept=".csv,text/csv" style="display:none">
          </div>
          <div class="form" id="form"></div><div id="message" class="msg" role="status"></div></div>
          <div class="section"><h3>🧾 DERNIÈRES SAISIES</h3><div id="purchases"></div></div>
          <div class="section"><h3>📅 CALENDRIER DES AJOUTS</h3><div style="display:flex;justify-content:space-between;align-items:center;margin:12px 0"><button id="prev-month">‹</button><strong id="month-label"></strong><button id="next-month">›</button></div><div id="maintenance"></div><div class="small" style="margin-top:12px">🟢 Achat · 🔴 Consommation · 🟠 Entretien · 🔵 Dépannage · 🟣 Révision</div></div>
        </div></ha-card>`;
      this.shadowRoot.querySelectorAll("[data-open]").forEach(b => b.addEventListener("click", () => this.openForm(b.dataset.open)));
      this.shadowRoot.getElementById("legacy-import-button").onclick=()=>this.shadowRoot.getElementById("legacy-import-file").click();
      this.shadowRoot.getElementById("legacy-import-file").onchange=async(event)=>{
        const file=event.target.files?.[0];
        if(!file)return;
        try{
          const csv=await file.text();
          if(!csv.includes("Saison;Date;Type;Quantite"))throw Error("Format CSV incompatible");
          await this.call("importer_historique",{csv_text:csv},true);
          this.shadowRoot.getElementById("message").textContent="✅ Historique envoyé. Stock inchangé ; actualisation des graphiques après réception des nouveaux états.";
        }catch(error){
          this.shadowRoot.getElementById("message").textContent="⚠️ Import impossible : "+String(error.message||error);
        }
        event.target.value="";
      };
      this.shadowRoot.getElementById("prev-month").onclick=()=>this.shiftMonth(-1);
      this.shadowRoot.getElementById("next-month").onclick=()=>this.shiftMonth(1);
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
    this.shadowRoot.getElementById("running").textContent =
      state?.state==="Oui"?"🟢 En marche":state?.state==="Non"?"⚪ Éteint":"⚠️ État inconnu";
    const stats=[
      ["Stock","stock","kg"],["Sacs disponibles","sacs","sacs"],
      ["Aujourd'hui","today","kg"],["Ce mois","month","kg"],
      ["Total consommé","total","kg"],["Heures aujourd'hui","hoursToday","h"],
      ["Débit estimé","rate","kg/h"],["Puissance électrique","power","W"],
      ["Heures totales","hours","h"],["Électricité (index)","energy","kWh"],
      ["Total achats","spent","€"],["Prochain entretien","next",""]
    ];
    this.shadowRoot.getElementById("stats").innerHTML=stats.map(([title,k,unit])=>
      `<div class="tile"><div class="label">${this.escape(title)}</div><div class="value">${this.escape(k==="next"?(this.find("next")?.state||"—"):this.number(k))} <span class="unit">${unit}</span></div></div>`).join("");
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
    const now=new Date(),months=Array.from({length:12},(_,i)=>new Date(now.getFullYear(),now.getMonth()-11+i,1));
    const monthly=months.map(d=>({label:d.toLocaleDateString("fr-FR",{month:"short"}),kg:Object.keys(days).filter(k=>k.startsWith(this.dayKey(d).slice(0,7))).reduce((a,k)=>a+(+days[k].kg||0),0)+Object.keys(historicalKg).filter(k=>k.startsWith(this.dayKey(d).slice(0,7))).reduce((a,k)=>a+historicalKg[k],0)}));
    const maxKg=Math.max(1,...monthly.map(x=>x.kg));
    const maxCost=Math.max(1,...monthly.map(x=>x.kg*price/15));
    const base=162;
    const pts=monthly.map((x,i)=>(i*60+30)+","+(base-x.kg*price/15/maxCost*125)).join(" ");
    const bars=monthly.map((x,i)=>'<rect x="'+(i*60+17)+'" y="'+(base-x.kg/maxKg*125)+'" width="26" height="'+(x.kg/maxKg*125)+'" fill="#e74747" rx="4"/>').join("");
    const labels=monthly.map((x,i)=>'<text x="'+(i*60+30)+'" y="185" font-size="12" fill="currentColor" text-anchor="middle">'+this.escape(x.label)+'</text>').join("");
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
    combinedTasks.forEach(x=>{const t=String(x.description||"").toLowerCase(),color=t.includes("dépann")?"#2196f3":t.includes("révision")?"#9c27b0":"#ffa726";mark(x.date,color,x.description);if(x.next_due)mark(x.next_due,color,"Prévu : "+x.description);});
    Object.entries(days).forEach(([date,v])=>{if((+v.kg||0)>0)mark(date,"#e74747","Consommation");});
    Object.entries(historicalKg).forEach(([date,kg])=>{if(kg>0)mark(date,"#e74747","Consommation historique : "+kg+" kg");});
    const start=(d.getDay()+6)%7,count=new Date(y,m+1,0).getDate();
    this.shadowRoot.getElementById("month-label").textContent=d.toLocaleDateString("fr-FR",{month:"long",year:"numeric"});
    const head=["L","M","M","J","V","S","D"].map(x=>'<div style="text-align:center;opacity:.65">'+x+'</div>').join("");
    const blanks=Array.from({length:start},()=>'<div></div>').join("");
    const cells=Array.from({length:count},(_,i)=>{const date=this.dayKey(new Date(y,m,i+1)),mk=marks[date]||[];return '<div title="'+this.escape(mk.map(x=>x.title).join(" ; "))+'" style="text-align:center;border-radius:7px;background:var(--secondary-background-color,rgba(120,120,120,.13));min-height:43px;padding:8px 2px">'+(i+1)+'<div style="display:flex;gap:3px;justify-content:center;margin-top:5px">'+mk.map(x=>'<i style="width:7px;height:7px;border-radius:50%;background:'+x.color+'"></i>').join("")+'</div></div>';}).join("");
    this.shadowRoot.getElementById("maintenance").innerHTML='<div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px">'+head+blanks+cells+'</div>';
  }
  openForm(type){
    this._formType=type;
    const el=this.shadowRoot.getElementById("form");
    const field=(name,label,inputType="text",value="",required=true)=>
      `<label>${label}<input name="${name}" type="${inputType}" value="${this.escape(value)}" ${required?"required":""} ${inputType==="number"?'min="0" step="any"':""}></label>`;
    const today=new Date().toLocaleDateString("sv-SE");
    let form="";
    if(type==="purchase")form=field("sacs","Nombre de sacs","number","1")+field("montant_eur","Montant total (€)","number","0")+field("date","Date","date",today)+field("note","Note","text","",false);
    else if(type==="stock")form=field("sacs_reels","Stock réel (nombre de sacs)","number",this.number("sacs"))+field("note","Motif","text","Inventaire",false);
    else if(type==="maintenance")form='<label>Type d’intervention<select name="entretien" required style="box-sizing:border-box;width:100%;margin-top:4px;padding:9px;border-radius:7px;border:1px solid var(--divider-color,#777);color:var(--primary-text-color);background:var(--primary-background-color,#222);font:inherit"><option value="Entretien">Entretien</option><option value="Dépannage">Dépannage</option><option value="Révision">Révision</option></select></label>'+field("date","Date réalisée","date",today)+field("prochaine_date","Prochaine échéance","date","",false)+field("note","Description / intervention réalisée","text","",false);
    else form='<p class="small">Démarre une calibration, puis termine-la après avoir consommé une quantité connue de sacs. Une correction du stock sera appliquée.</p>'+field("sacs_consommes","Sacs consommés depuis le début","number","1");
    el.innerHTML=`<h3>${{purchase:"Ajouter un achat",stock:"Corriger le stock",maintenance:"Enregistrer un entretien",calibration:"Calibration"}[type]}</h3><form id="pellet-form"><div class="fields">${form}</div><div class="row" style="margin-top:12px">${type==="calibration"?'<button type="button" id="start">Démarrer la calibration</button>':''}<button class="primary" type="submit">${type==="calibration"?"Terminer la calibration":"Enregistrer"}</button><button type="button" id="cancel">Annuler</button></div></form>`;
    el.classList.add("open");
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
    }catch(err){msg.textContent="⚠️ Erreur : "+(err.message||String(err));}
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
