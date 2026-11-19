
const prefix="salle_a_manger_roborock_qrevo_curvx";
const ent=(d,s)=>d+"."+prefix+(s?"_"+s:"");
const tabs=[["accueil","Accueil"],["carte","Carte"],["historique","Historique"],["station","Station"],["entretien","Entretien"],["reglages","Réglages"]];
const groups={
 historique:[["sensor","nombre_total_de_nettoyages","Nettoyages"],["sensor","surface_de_nettoyage_totale","Surface totale"],["sensor","duree_totale_de_nettoyage","Durée totale"]],
 station:[["switch","dock_lavage_de_la_serpilliere","Lavage serpillières"],["switch","dock_sechage_de_la_serpilliere","Séchage serpillières"],["switch","dock_vidage_de_la_poussiere","Vidage poussière"],["select","dock_mode_de_vidage","Mode vidage"],["binary_sensor","dock_reservoir_d_eau_propre","Eau propre"],["binary_sensor","dock_reservoir_d_eau_sale","Eau sale"],["binary_sensor","penurie_d_eau","Alerte manque d'eau"]],
 entretien:[["sensor","temps_restant_brosse_principale","Brosse principale"],["sensor","temps_restant_brosse_laterale","Brosse latérale"],["sensor","temps_restant_filtre","Filtre"],["sensor","temps_restant_capteurs","Capteurs"]],
 reglages:[["select","mode_de_nettoyage","Mode de nettoyage"],["select","intensite_de_frottement","Intensité de frottement"],["select","parcours_de_lavage_de_sol","Parcours"],["number","volume","Volume"],["switch","ne_pas_deranger","Ne pas déranger"]]
};
const style='.box{background:#181328;color:white;border-radius:24px;overflow:hidden;font-family:system-ui,sans-serif}.head{display:flex;align-items:center;justify-content:space-between;padding:22px;background:#20192f}.head strong{font-size:23px}.head span{font-size:13px;color:#d3c6e4}nav{display:flex;overflow-x:auto;gap:7px;padding:12px;background:#20192f}button{cursor:pointer;border:1px solid #6b538a;border-radius:12px;background:#392c51;color:white;padding:12px;font-weight:600}button.active,button.primary{background:#8055be}.hero{position:relative;min-height:330px;background-size:cover;background-position:center;display:flex;align-items:flex-end}.overlay{width:100%;padding:25px;background:linear-gradient(90deg,#171323ed,#17132355)}h2{margin:0 0 12px;font-size:29px}.stats{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:17px}.stat{padding:12px 18px;background:#20192cbb;border-radius:12px;min-width:100px}.stat b{display:block;font-size:24px}.stat small{color:#d6c8e6}.actions{display:flex;gap:10px;flex-wrap:wrap}.content{padding:22px}.rows{display:grid;grid-template-columns:repeat(auto-fit,minmax(235px,1fr));gap:10px}.item{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:13px;background:#2b233c;border-radius:13px;min-height:55px}.value{font-weight:700;color:#d8c1ff}select,input{max-width:150px;background:#4a3668;color:#fff;padding:8px;border:1px solid #8c6bb7;border-radius:8px}input[type=checkbox]{width:20px;height:20px;accent-color:#9066d1}.map{width:100%;max-height:570px;object-fit:contain;border-radius:16px;background:#292335}.note{color:#c8bdd7;font-size:12px;margin-top:15px}@media(max-width:600px){.head{padding:15px}.content{padding:14px}.overlay{padding:15px}.stat{padding:10px}.hero{min-height:300px}nav{padding:7px}button{padding:10px}}';
class RoborockCurvxCard extends HTMLElement{
 constructor(){super();this.attachShadow({mode:"open"});this.tab="accueil";this.conf={};this.root=document.createElement("div");this.shadowRoot.append(this.root)}
 setConfig(conf){this.conf=conf||{};this.draw()}
 set hass(h){this.h=h;this.draw()}
 getCardSize(){return 8}
 escape(v){return String(v??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]))}
 state(id){return this.h?.states?.[id]}
 val(id){let x=this.state(id);return !x||["unknown","unavailable"].includes(x.state)?"—":x.state+(x.attributes.unit_of_measurement?" "+x.attributes.unit_of_measurement:"")}
 async call(d,a,id,more={}){try{await this.h.callService(d,a,{entity_id:id,...more})}catch(e){alert("Commande refusée : "+e.message)}}
 actions(){return '<div class="actions"><button class="primary" data-vac="start">▶ Démarrer</button><button data-vac="pause">Ⅱ Pause</button><button data-vac="return_to_base">⌂ Retour base</button></div>'}
 rows(name){return '<div class="rows">'+groups[name].map(([d,s,label])=>{let id=ent(d,s),obj=this.state(id),value='<span class="value">'+this.escape(this.val(id))+'</span>';if(obj&&d==="switch")value='<input type="checkbox" data-switch="'+id+'" '+(obj.state==="on"?"checked":"")+'>';if(obj&&d==="select")value='<select data-select="'+id+'">'+(obj.attributes.options||[]).map(v=>'<option '+(v===obj.state?"selected":"")+'>'+this.escape(v)+'</option>').join("")+'</select>';if(obj&&d==="number")value='<input type="number" data-number="'+id+'" value="'+this.escape(obj.state)+'" min="'+this.escape(obj.attributes.min??0)+'" max="'+this.escape(obj.attributes.max??100)+'" step="'+this.escape(obj.attributes.step??1)+'">';return '<div class="item"><span>'+this.escape(label)+'</span>'+value+'</div>'}).join("")+'</div>'}
 draw(){
  if(!this.h)return;
  const vac=this.conf.vacuum||ent("vacuum",""),map=this.conf.map||ent("image","map_0"),photo=this.conf.background||"/local/roborock/roborock_salon.png";
  const nav=tabs.map(([id,label])=>'<button data-tab="'+id+'" class="'+(id===this.tab?"active":"")+'">'+label+'</button>').join("");
  let body="";
  if(this.tab==="accueil"){
   body='<div class="hero"><div class="overlay"><h2>Roborock Qrevo CurvX</h2><div class="stats">'+[["Batterie",ent("sensor","batterie")],["Progression",ent("sensor","progression_du_nettoyage")],["Pièce",ent("sensor","piece_actuelle")]].map(([title,id])=>'<div class="stat"><b>'+this.escape(this.val(id))+'</b><small>'+title+'</small></div>').join("")+'</div>'+this.actions()+'</div></div><div class="content"><h3>Dernier nettoyage</h3><div class="rows">'+[["État",ent("sensor","etat")],["Surface",ent("sensor","surface_de_nettoyage")],["Durée",ent("sensor","duree_de_nettoyage")]].map(([title,id])=>'<div class="item">'+title+'<b>'+this.escape(this.val(id))+'</b></div>').join("")+'</div></div>';
  }else if(this.tab==="carte"){
   const img=this.state(map)?.attributes?.entity_picture;
   body='<div class="content"><h2>Carte du logement</h2>'+(img&&img.startsWith("/")?'<img class="map" id="map" alt="Carte Roborock">':'<p>Carte actuellement indisponible</p>')+'<p class="note">Affichage de la carte Roborock ; sélection tactile des pièces non incluse.</p>'+this.actions()+'</div>';
  }else{
   body='<div class="content"><h2>'+tabs.find(x=>x[0]===this.tab)[1]+'</h2>'+this.rows(this.tab)+(this.tab==="station"?'<p class="note">Le vidage et le lavage déclenchent des opérations physiques sur la station.</p>':'')+'</div>';
  }
  this.root.innerHTML='<style>'+style+'</style><div class="box"><div class="head"><strong>ROBOROCK CURVX</strong><span>'+this.escape(this.val(vac))+'</span></div><nav>'+nav+'</nav>'+body+'</div>';
  const hero=this.root.querySelector(".hero");if(hero)hero.style.backgroundImage='linear-gradient(90deg,#15112288,#15112222),url("'+photo.replace(/["\\]/g,"")+'")';
  const img=this.root.querySelector("#map");if(img){let path=this.state(map)?.attributes?.entity_picture;img.src=this.h.hassUrl?this.h.hassUrl(path):path;}
  this.root.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{this.tab=b.dataset.tab;this.draw()});
  this.root.querySelectorAll("[data-vac]").forEach(b=>b.onclick=()=>this.call("vacuum",b.dataset.vac,vac));
  this.root.querySelectorAll("[data-switch]").forEach(b=>b.onchange=()=>this.call("switch",b.checked?"turn_on":"turn_off",b.dataset.switch));
  this.root.querySelectorAll("[data-select]").forEach(b=>b.onchange=()=>this.call("select","select_option",b.dataset.select,{option:b.value}));
  this.root.querySelectorAll("[data-number]").forEach(b=>b.onchange=()=>this.call("number","set_value",b.dataset.number,{value:Number(b.value)}));
 }
}
if(!customElements.get("roborock-curvx-card"))customElements.define("roborock-curvx-card",RoborockCurvxCard);
window.customCards=window.customCards||[];
if(!window.customCards.some(c=>c.type==="roborock-curvx-card"))window.customCards.push({type:"roborock-curvx-card",name:"Roborock CurvX",description:"Dashboard Roborock personnalisé avec onglets"});
