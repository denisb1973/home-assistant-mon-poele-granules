/* Mon Poêle à Granulés – Lovelace card v0.3.0 */
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
          @media(min-width:680px){.grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
          @media(max-width:410px){.fields{grid-template-columns:1fr}.tile .value{font-size:20px}}
        </style>
        <ha-card><div class="wrap">
          <div class="head"><div><h2>🔥 Mon Poêle à Granulés</h2><div class="small">Stock, consommation et entretien</div></div><div id="running"></div></div>
          <div class="grid" id="stats"></div>
          <div class="section"><h3>📈 ÉVOLUTION DE LA CONSOMMATION</h3><div id="chart"></div></div><div class="section"><h3>💶 PRIX MOYEN DU SAC PAR SAISON</h3><div id="metric-controls" style="display:flex;flex-wrap:wrap;gap:7px"></div><div id="seasons"></div></div>
          <div class="section"><h3>Achats et entretiens</h3><div class="actions">
            <button data-open="purchase">+ Achat</button><button data-open="stock">Corriger stock</button>
            <button data-open="maintenance">+ Entretien</button><button data-open="calibration">Calibrer</button>
          </div>
          <div class="form" id="form"></div><div id="message" class="msg" role="status"></div></div>
          <div class="section"><h3>🧾 DERNIÈRES SAISIES</h3><div id="purchases"></div></div>
          <div class="section"><h3>📅 CALENDRIER DES AJOUTS</h3><div style="display:flex;justify-content:space-between;align-items:center;margin:12px 0"><button id="prev-month">‹</button><strong id="month-label"></strong><button id="next-month">›</button></div><div id="maintenance"></div><div class="small" style="margin-top:12px">🟢 Achat · 🔴 Consommation · 🟠 Entretien · 🔵 Dépannage · 🟣 Révision</div></div>
        </div></ha-card>`;
      this.shadowRoot.querySelectorAll("[data-open]").forEach(b => b.addEventListener("click", () => this.openForm(b.dataset.open)));
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
