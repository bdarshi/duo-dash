import { useState, useEffect, useCallback } from "react";

const DARSHI = { parks:"all", hasExpress:true, hasEPA:true, name:"Darshi", hotelBreak:true, breakStart:12*60, breakEnd:16*60 };
const PARK = {
  studios: { id:"studios", name:"Universal Studios Florida", short:"Studios", emoji:"🎬", color:"#818CF8" },
  ioa:     { id:"ioa",     name:"Islands of Adventure",      short:"IOA",     emoji:"🏝️", color:"#34D399" },
};
const IOA_LOOP = ["Marvel Island","Toon Lagoon","Skull Island","Jurassic Park","Hogsmeade","Lost Continent","Seuss Landing","Port of Entry"];
const STU_LOOP = ["Production Ctrl","Hollywood","Minion Land","New York","Diagon Alley","World Expo","Springfield","DreamWorks Land"];
const ENTRANCE_WALK = {
  "Marvel Island":5,"Toon Lagoon":8,"Skull Island":10,"Jurassic Park":15,
  "Hogsmeade":20,"Lost Continent":22,"Seuss Landing":18,
  "Production Ctrl":3,"Hollywood":5,"Minion Land":8,"New York":10,
  "Diagon Alley":15,"World Expo":18,"Springfield":20,"DreamWorks Land":22,
};
const LAND_META = {
  "Hogsmeade":      {color:"#FBBF24",emoji:"🦉",short:"Hogsmeade", park:"ioa"},
  "Jurassic Park":  {color:"#34D399",emoji:"🦕",short:"Jurassic",  park:"ioa"},
  "Marvel Island":  {color:"#F87171",emoji:"⚡", short:"Marvel",    park:"ioa"},
  "Toon Lagoon":    {color:"#60A5FA",emoji:"💧",short:"Toon",       park:"ioa"},
  "Skull Island":   {color:"#94A3B8",emoji:"💀",short:"Skull",      park:"ioa"},
  "Seuss Landing":  {color:"#F472B6",emoji:"🐟",short:"Seuss",      park:"ioa"},
  "Lost Continent": {color:"#A78BFA",emoji:"🏛️",short:"Lost",       park:"ioa"},
  "Diagon Alley":   {color:"#FBBF24",emoji:"🧙",short:"Diagon",     park:"studios"},
  "Minion Land":    {color:"#F59E0B",emoji:"🍌",short:"Minions",    park:"studios"},
  "Production Ctrl":{color:"#818CF8",emoji:"🎬",short:"Prod.",      park:"studios"},
  "New York":       {color:"#94A3B8",emoji:"🗽",short:"NY",         park:"studios"},
  "Springfield":    {color:"#F87171",emoji:"🍩",short:"Springfld",  park:"studios"},
  "DreamWorks Land":{color:"#34D399",emoji:"🐉",short:"DreamWks",   park:"studios"},
  "World Expo":     {color:"#60A5FA",emoji:"🌍",short:"Expo",       park:"studios"},
  "Hollywood":      {color:"#818CF8",emoji:"🌟",short:"Hollywood",  park:"studios"},
};
function circularWalk(from, to) {
  if (from===to) return 10;
  const fp=LAND_META[from]?.park, tp=LAND_META[to]?.park;
  if (fp!==tp) return 15;
  const loop=fp==="ioa"?IOA_LOOP:STU_LOOP;
  const a=loop.indexOf(from),b=loop.indexOf(to);
  if (a===-1||b===-1) return 15;
  return 10+Math.min(Math.abs(b-a),loop.length-Math.abs(b-a))*5;
}
const DAY1_LANDS=[{land:"Hogsmeade",park:"ioa"},{land:"Seuss Landing",park:"ioa"},{land:"Toon Lagoon",park:"ioa"},{land:"Diagon Alley",park:"studios"},{land:"World Expo",park:"studios"},{land:"Springfield",park:"studios"},{land:"DreamWorks Land",park:"studios"}];
const DAY2_LANDS=[{land:"Jurassic Park",park:"ioa"},{land:"Skull Island",park:"ioa"},{land:"Marvel Island",park:"ioa"},{land:"Minion Land",park:"studios"},{land:"New York",park:"studios"}];
const RIDES=[
  {id:"hagrids",   name:"Hagrid's Motorbike Adventure",          land:"Hogsmeade",      park:"ioa",    minH:48,express:true, single:false,dur:7, day1:1, day2:null,tip:"Express works here but rope drop is still worthwhile. Waits hit 120min+ by 10am."},
  {id:"hippogriff",name:"Flight of the Hippogriff",              land:"Hogsmeade",      park:"ioa",    minH:36,express:true, single:false,dur:2, day1:2, day2:null,tip:"Junior coaster in Hogsmeade — knock it out right after Hagrid's."},
  {id:"trolley",   name:"High in the Sky Seuss Trolley Train",   land:"Seuss Landing",  park:"ioa",    minH:36,express:true, single:false,dur:5, day1:3, day2:null,tip:"Elevated scenic ride. Short waits all day."},
  {id:"cathat",    name:"The Cat in the Hat",                    land:"Seuss Landing",  park:"ioa",    minH:36,express:true, single:false,dur:4, day1:4, day2:null,tip:"Classic family dark ride. Low waits all day."},
  {id:"onefish",   name:"One Fish, Two Fish, Red Fish, Blue Fish",land:"Seuss Landing",  park:"ioa",    minH:0, express:false,single:false,dur:3, day1:5, day2:null,tip:"Kids water spinner. Try to dodge the jets — you won't."},
  {id:"hogex_ioa", name:"Hogwarts Express (Hogsmeade)",          land:"Hogsmeade",      park:"ioa",    minH:0, express:false,single:false,dur:18,day1:6, day2:null,destLand:"Diagon Alley",tip:"P2P ticket required. Rides to King's Cross. You arrive in Diagon Alley (Studios)."},
  {id:"dudley",    name:"Dudley Do-Right's Ripsaw Falls",        land:"Toon Lagoon",    park:"ioa",    minH:44,express:true, single:false,dur:6, day1:null,day2:null,optional:true,tip:"Very wet. Play by ear based on heat."},
  {id:"veloci",    name:"Jurassic World VelociCoaster",          land:"Jurassic Park",  park:"ioa",    minH:51,express:true, single:true, dur:4, day1:null,day2:1, tip:"Best coaster in the resort. Single rider cuts wait significantly."},
  {id:"ptero",     name:"Pteranodon Flyers",                     land:"Jurassic Park",  park:"ioa",    minH:36,express:false,single:false,dur:3, day1:null,day2:2, maxH:56,tip:"Kids 36-56 inches only. Adults must ride WITH a child. No Express."},
  {id:"kong",      name:"Skull Island: Reign of Kong",           land:"Skull Island",   park:"ioa",    minH:36,express:true, single:false,dur:7, day1:null,day2:3, tip:"Surprisingly good dark ride. Express works."},
  {id:"spiderman", name:"Amazing Adventures of Spider-Man",      land:"Marvel Island",  park:"ioa",    minH:40,express:true, single:true, dur:5, day1:null,day2:5, tip:"Classic motion sim. Single rider available."},
  {id:"hulk",      name:"Incredible Hulk Coaster",               land:"Marvel Island",  park:"ioa",    minH:54,express:true, single:false,dur:3, day1:null,day2:6, tip:"Loud launch coaster. Express works."},
  {id:"doom",      name:"Doctor Doom's Fearfall",                land:"Marvel Island",  park:"ioa",    minH:52,express:true, single:false,dur:2, day1:null,day2:null,optional:true,tip:"Drop tower. Good Express use if you have time."},
  {id:"stormforce",name:"Storm Force Accelatron",                land:"Marvel Island",  park:"ioa",    minH:0, express:false,single:false,dur:3, day1:null,day2:null,optional:true,tip:"Simple spinner. Low waits."},
  {id:"bilge",     name:"Popeye & Bluto's Bilge-Rat Barges",    land:"Toon Lagoon",    park:"ioa",    minH:42,express:true, single:false,dur:6, day1:null,day2:null,optional:true,tip:"The WETTEST ride. Afternoon only."},
  {id:"caroSeuss", name:"Caro-Seuss-el",                         land:"Seuss Landing",  park:"ioa",    minH:0, express:false,single:false,dur:3, day1:null,day2:null,optional:true,tip:"Themed carousel. Very low waits."},
  {id:"gringotts", name:"Harry Potter & Escape from Gringotts", land:"Diagon Alley",   park:"studios",minH:42,express:true, single:true, dur:6, day1:7, day2:null,tip:"Headliner at Studios. Hybrid coaster + dark ride. Single rider available."},
  {id:"mib",       name:"Men in Black Alien Attack",             land:"World Expo",     park:"studios",minH:42,express:true, single:false,dur:5, day1:8, day2:null,tip:"Interactive shooter. Express works."},
  {id:"simpsons",  name:"The Simpsons Ride",                     land:"Springfield",    park:"studios",minH:40,express:true, single:false,dur:5, day1:9, day2:null,tip:"Dome-screen motion sim. Good afternoon slot."},
  {id:"trollscoast",name:"Trolls Trollercoaster",                land:"DreamWorks Land",park:"studios",minH:36,express:true, single:false,dur:3, day1:9, day2:null,tip:"Family coaster. Low waits."},
  {id:"et",        name:"E.T. Adventure",                        land:"DreamWorks Land",park:"studios",minH:34,express:true, single:false,dur:5, day1:10,day2:null,tip:"Classic gentle dark ride. Perfect wind-down."},
  {id:"minion",    name:"Despicable Me Minion Mayhem",           land:"Minion Land",    park:"studios",minH:40,express:true, single:false,dur:6, day1:null,day2:7, tip:"High-capacity family ride."},
  {id:"villaincon",name:"Villain-Con Minion Blast",              land:"Minion Land",    park:"studios",minH:0, express:false,single:false,dur:8, day1:null,day2:8, tip:"Interactive blaster walk-through. No height req."},
  {id:"fallon",    name:"Race Through New York (Jimmy Fallon)",  land:"New York",       park:"studios",minH:40,express:true, single:false,dur:5, day1:null,day2:9, tip:"Air-conditioned queue — great for hottest part of the day."},
  {id:"mummy",     name:"Revenge of the Mummy",                  land:"New York",       park:"studios",minH:48,express:true, single:true, dur:3, day1:null,day2:10,tip:"Underrated indoor coaster. Express + single rider both work."},
  {id:"transformers",name:"Transformers: The Ride 3D",           land:"Production Ctrl",park:"studios",minH:40,express:true, single:true, dur:5, day1:null,day2:null,optional:true,tip:"Solid motion sim. Single rider available."},
  {id:"kang",      name:"Kang & Kodos' Twirl 'n' Hurl",         land:"Springfield",    park:"studios",minH:0, express:false,single:false,dur:3, day1:null,day2:null,optional:true,tip:"Simple spinner. Low waits."},
  {id:"hogex_st",  name:"Hogwarts Express (King's Cross)",       land:"Diagon Alley",   park:"studios",minH:0, express:false,single:false,dur:18,day1:null,day2:null,destLand:"Hogsmeade",tip:"P2P ticket required. Rides to Hogsmeade. You arrive in IOA."},
];
const FOOD={
  "Hogsmeade":      {sitdown:{name:"Three Broomsticks",         item:"Great Feast platter",         emoji:"🍖"},snack:{name:"Honeydukes",             item:"Pumpkin Pasties",           emoji:"🥧"},drink:{name:"Butterbeer Cart",     item:"Frozen Butterbeer",              emoji:"🍺"}},
  "Seuss Landing":  {sitdown:{name:"Circus McGurkus",           item:"Pasta or chicken",            emoji:"🎪"},snack:{name:"Green Eggs & Ham Cafe",  item:"Tater tots",                emoji:"🍳"},drink:{name:"Seuss Landing cart",  item:"Moose Juice or Goose Juice",     emoji:"🧃"}},
  "Toon Lagoon":    {sitdown:{name:"Blondie's",                 item:"Dagwood sub",                 emoji:"🥪"},snack:{name:"Blondie's window",       item:"Hot dog",                   emoji:"🌭"},drink:{name:"Toon Lagoon cart",    item:"Lemonade",                       emoji:"🍋"}},
  "Diagon Alley":   {sitdown:{name:"Leaky Cauldron",            item:"Fish & chips",                emoji:"🧙"},snack:{name:"London Taxi Hut",        item:"Jacket potato",             emoji:"🥔"},drink:{name:"Leaky Cauldron bar",  item:"Tongue-Tying Lemon Squash",      emoji:"🍋"}},
  "World Expo":     {sitdown:{name:"The Burger Digs",           item:"Burger or loaded fries",      emoji:"🍔"},snack:{name:"Burger Digs window",     item:"Fries to go",               emoji:"🍟"},drink:{name:"World Expo cart",     item:"Lemonade",                       emoji:"🍋"}},
  "Springfield":    {sitdown:{name:"Bumblebee Man's Taco Truck",item:"Tacos - sit outside",         emoji:"🌮"},snack:{name:"Lard Lad Donuts",        item:"Giant Homer donut",         emoji:"🍩"},drink:{name:"Springfield cart",    item:"Buzz Cola or Duff Beer",         emoji:"🥤"}},
  "DreamWorks Land":{sitdown:{name:"Skip the sit-down",         item:"Wind-down land",              emoji:"🐉"},snack:{name:"DreamWorks Land",        item:"Shrek Pretzel",             emoji:"🥨"},drink:{name:"DreamWorks cart",    item:"Lemonade or water",              emoji:"💧"}},
  "Jurassic Park":  {sitdown:{name:"Thunder Falls Terrace",     item:"Rotisserie chicken or ribs",  emoji:"🦕"},snack:{name:"Pizza Predatoria",       item:"Chicken alfredo cone",      emoji:"🍕"},drink:{name:"Fossil Fuel",         item:"Lemon Freeze",                   emoji:"🍋"}},
  "Skull Island":   {sitdown:{name:"Doc Sugrue's Kebab House",  item:"Kebab wrap",                  emoji:"🥙"},snack:{name:"Doc Sugrue's window",    item:"Kebab wrap to go",          emoji:"🥙"},drink:{name:"Skull Island",        item:"Water",                          emoji:"💧"}},
  "Marvel Island":  {sitdown:{name:"Captain America Diner",     item:"Cheeseburger combo",          emoji:"🛡️"},snack:{name:"Captain America Diner",  item:"Fries to go",               emoji:"🍟"},drink:{name:"Marvel cart",         item:"Lemonade",                       emoji:"🍋"}},
  "Minion Land":    {sitdown:{name:"Minion Cafe",               item:"Themed bowls",                emoji:"🍌"},snack:{name:"Minion Cafe outside",    item:"Bello Ice Cream cone",      emoji:"🍦"},drink:{name:"Minion Cafe",         item:"Blended freeze",                 emoji:"🥤"}},
  "New York":       {sitdown:{name:"Central Park Crepes",       item:"Sweet or savory crepe",       emoji:"🥐"},snack:{name:"Central Park Crepes",    item:"Nutella crepe",             emoji:"🥐"},drink:{name:"Lagoon cart",         item:"Lemonade by the lagoon",         emoji:"🍋"}},
};
const BASE_WAITS={
  hagrids:[25,85,120,140,150,155,145,130,110,85,60,40,20,15],hippogriff:[5,15,25,32,36,36,32,26,20,15,12,8,5,5],
  trolley:[5,10,16,20,22,22,20,17,13,10,8,6,5,5],cathat:[5,12,18,22,25,25,23,18,14,10,8,6,5,5],
  onefish:[5,8,12,15,18,18,16,13,10,8,6,5,5,5],hogex_ioa:[5,10,15,20,22,20,18,16,14,12,10,8,6,5],
  dudley:[8,20,32,40,45,45,42,35,28,22,16,12,8,5],veloci:[12,40,65,80,90,92,88,78,62,48,36,24,14,10],
  ptero:[5,15,25,32,36,36,32,26,20,15,12,8,5,0],kong:[10,28,42,52,58,58,54,46,36,28,22,15,10,8],
  spiderman:[10,25,38,46,52,52,48,42,34,26,20,14,10,8],hulk:[10,30,48,58,65,65,60,52,42,32,24,16,10,8],
  doom:[8,20,32,40,45,45,42,36,28,22,16,12,8,5],stormforce:[5,8,12,15,18,18,16,14,12,10,8,6,5,5],
  bilge:[5,15,26,33,38,38,35,30,24,18,14,10,7,5],caroSeuss:[5,8,12,14,16,16,14,12,10,8,6,5,5,5],
  gringotts:[20,50,75,88,95,95,88,76,60,46,34,22,14,10],mib:[8,20,32,40,45,45,42,36,28,22,16,12,8,6],
  simpsons:[8,20,32,40,44,44,40,35,28,22,16,12,8,6],trollscoast:[5,10,16,20,22,22,20,16,12,8,6,5,5,5],
  et:[5,12,18,22,25,25,23,18,14,10,8,6,5,5],minion:[10,25,40,50,55,55,50,44,35,27,20,14,10,8],
  villaincon:[5,8,12,15,18,18,16,14,12,10,8,6,5,5],fallon:[5,12,20,26,30,30,28,24,20,16,12,8,6,5],
  mummy:[10,28,44,54,60,60,56,48,38,30,22,15,10,8],transformers:[10,22,34,42,48,48,44,38,30,23,18,12,8,6],
  kang:[5,8,12,14,16,16,14,12,10,8,6,5,5,5],hogex_st:[5,10,15,20,22,20,18,16,14,12,10,8,6,5],
};
function getEasternHour(){const e=new Date(new Date().toLocaleString("en-US",{timeZone:"America/New_York"}));return e.getHours()+e.getMinutes()/60;}
function getHistoricalWait(id,hour,hasExpress){const idx=Math.max(0,Math.min(13,Math.floor(hour)-8));const base=BASE_WAITS[id]?.[idx]??20;const ride=RIDES.find(r=>r.id===id);if(hasExpress&&ride?.express)return Math.max(5,Math.round(base*0.5));return base;}
function getWait(id,scheduledHour,hasExpress,liveWaits){const nowHour=getEasternHour();const liveEntry=liveWaits[id];if(liveEntry&&Math.abs(scheduledHour-nowHour)<=1){const raw=liveEntry.wait??liveEntry;if(hasExpress&&RIDES.find(r=>r.id===id)?.express)return Math.max(5,Math.round(raw*0.5));return raw;}return getHistoricalWait(id,scheduledHour,hasExpress);}
function isClosed(id,liveWaits){const e=liveWaits[id];return e?e.isOpen===false:false;}
const fmt12=m=>{if(!m&&m!==0)return"";const h=Math.floor(m/60)%24,mn=m%60,ap=h<12?"AM":"PM";return`${h===0?12:h>12?h-12:h}:${mn.toString().padStart(2,"0")} ${ap}`;};
const waitColor=w=>w===0?"#94A3B8":w<=20?"#34D399":w<=45?"#FBBF24":"#F87171";
const al=(hex,a)=>{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};
function calcStats(scheduled){const rides=scheduled.filter(s=>s.type==="ride"&&!s.closed);const totalWait=rides.reduce((s,r)=>s+r.wait,0);const avgWait=rides.length?Math.round(totalWait/rides.length):0;const lastEvent=scheduled.filter(s=>s.type==="event").pop();const wrap=scheduled.find(s=>s.type==="wrap");return{count:rides.length,totalWait,avgWait,estDone:lastEvent?.startMins??wrap?.startMins??0};}

function buildDaySchedule({dayNum,hasExpress,hasEPA,liveWaits,parks,cfg,overrideOrder}){
  const startMins=hasEPA?8*60:9*60;
  const morningEnd=cfg.hotelBreak?cfg.breakStart:14*60;
  const eveningStart=cfg.hotelBreak?cfg.breakEnd:null;
  const dayKey=dayNum===1?"day1":"day2";
  let scheduled=[];
  const eligibleRides=overrideOrder?[...overrideOrder]:RIDES.filter(r=>{if(r.optional)return false;if(r[dayKey]===null||r[dayKey]===undefined)return false;if(parks==="ioa")return r.park==="ioa";if(parks==="studios")return r.park==="studios";return true;}).sort((a,b)=>(a[dayKey]||99)-(b[dayKey]||99));
  function buildBlock(rides,blockStart,blockEnd,startLand,startPark){
    let cur=blockStart,lastLand=startLand,lastPark=startPark;const items=[];
    if(!startLand&&rides.length>0){const fr=rides[0];const ew=ENTRANCE_WALK[fr.land]??10;if(ew>0){items.push({type:"walk",from:null,to:fr.land,startMins:cur,endMins:cur+ew,id:"walk-entrance-"+cur,park:fr.park,isEntrance:true});cur+=ew;}lastLand=fr.land;lastPark=fr.park;}
    for(const ride of rides){
      if(cur>=blockEnd)break;
      if(lastLand&&lastLand!==ride.land){const wm=circularWalk(lastLand,ride.land);items.push({type:"walk",from:lastLand,to:ride.land,startMins:cur,endMins:cur+wm,id:"walk-"+cur,park:ride.park});cur+=wm;}
      else if(lastLand===ride.land&&items.length>0){items.push({type:"walk",from:lastLand,to:ride.land,startMins:cur,endMins:cur+10,id:"walk-within-"+cur,park:ride.park,withinLand:true});cur+=10;}
      if(cur>=blockEnd)break;
      const closed=isClosed(ride.id,liveWaits);const sh=cur/60;const wait=closed?0:getWait(ride.id,sh,hasExpress,liveWaits);const total=closed?0:wait+ride.dur+5;
      if(!closed&&cur+total>blockEnd)continue;
      items.push({type:"ride",ride,wait,land:ride.land,park:ride.park,startMins:cur,endMins:closed?cur:cur+total,id:"ride-"+ride.id,closed});
      if(!closed)cur+=total;
      // Use destLand if ride has one (e.g. Hogwarts Express drops you in other park)
      const arrivalLand=ride.destLand||ride.land;
      lastLand=arrivalLand;lastPark=LAND_META[arrivalLand]?.park||ride.park;
    }
    return{items,cur,lastLand,lastPark};
  }
  const firstRide=eligibleRides[0];
  if(hasEPA&&firstRide)scheduled.push({type:"epa",id:"epa-start",park:firstRide.park,land:firstRide.land,startMins:startMins,label:firstRide.park==="ioa"?"Islands of Adventure":"Universal Studios Florida",sub:dayNum===1?"Early Park Admission - Hogsmeade first":"Early Park Admission - Jurassic Park first"});
  const morning=buildBlock(eligibleRides,startMins,morningEnd,null,null);
  scheduled=[...scheduled,...morning.items];
  if(cfg.hotelBreak){
    if(morning.lastLand){const ew=ENTRANCE_WALK[morning.lastLand]??10;scheduled.push({type:"walk",from:morning.lastLand,to:"Exit",startMins:morning.cur,endMins:morning.cur+ew,id:"walk-exit-morning",isExit:true,park:morning.lastPark||"ioa"});}
    scheduled.push({type:"break",id:"hotel-break",startMins:cfg.breakStart,endMins:cfg.breakEnd,label:"🏨 Hotel Break",sub:"Back at the park at "+fmt12(cfg.breakEnd)});
    const PARADE=19*60,CINE=21*60;
    const eveningRides=eligibleRides.filter(r=>!morning.items.some(s=>s.type==="ride"&&s.ride?.id===r.id&&!s.closed));
    const evening=buildBlock(eveningRides,eveningStart,PARADE-15,null,null);
    scheduled=[...scheduled,...evening.items];
    scheduled.push({type:"event",id:"parade",startMins:PARADE,emoji:"🎬",label:"Universal Mega Movie Parade",sub:"Studios lagoon - Get there 20 min early - Passholders have exclusive viewing area",color:"#F87171"});
    const postRides=eveningRides.filter(r=>![...morning.items,...evening.items].some(s=>s.type==="ride"&&s.ride?.id===r.id&&!s.closed));
    if(postRides.length>0){const pp=buildBlock(postRides,PARADE+60,CINE-15,evening.lastLand,evening.lastPark);scheduled=[...scheduled,...pp.items];}
    scheduled.push({type:"event",id:"cinesational",startMins:CINE,emoji:"🎆",label:"Cinesational: A Symphonic Spectacular",sub:"Studios fountains - Pyrotechnics - Harry Potter, Jaws & Mummy soundtracks",color:"#818CF8"});
  } else {
    if(morning.lastLand){const ew=ENTRANCE_WALK[morning.lastLand]??10;scheduled.push({type:"walk",from:morning.lastLand,to:"Exit",startMins:morning.cur,endMins:morning.cur+ew,id:"walk-exit",isExit:true,park:morning.lastPark||"ioa"});}
    scheduled.push({type:"wrap",id:"wrap",startMins:morning.cur+(ENTRANCE_WALK[morning.lastLand]??10),label:"That's a wrap!",sub:"Hotel time - kids have earned it. Done by "+fmt12(morning.cur)+"."});
  }
  const doneIds=new Set(scheduled.filter(s=>s.type==="ride"&&!s.closed).map(s=>s.ride.id));
  return{scheduled,bonus:RIDES.filter(r=>!doneIds.has(r.id)&&(parks==="all"||r.park===parks))};
}

const CSS=`
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#FFFDF7;font-family:'Nunito',sans-serif;-webkit-tap-highlight-color:transparent;color:#1a1a2e}
  @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fade-up{animation:fadeUp 0.22s ease both}
  .pop:active{transform:scale(0.97);transition:transform 0.08s}
  .live-dot{animation:pulse 1.5s ease-in-out infinite}
  .spinner{animation:spin 0.8s linear infinite;display:inline-block}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-thumb{background:#e0ddd4;border-radius:4px}
  input[type=time]{background:#fff;border:1.5px solid #e0ddd4;border-radius:8px;color:#1a1a2e;padding:6px 10px;font-size:13px;font-family:'Nunito',sans-serif;font-weight:700}
  button{color:inherit}
`;

function Chip({label,color,size="sm"}){return <span style={{display:"inline-flex",alignItems:"center",background:al(color,0.12),color,border:`1px solid ${al(color,0.28)}`,borderRadius:20,padding:size==="xs"?"1px 6px":"2px 8px",fontSize:size==="xs"?9:10,fontWeight:800,whiteSpace:"nowrap"}}>{label}</span>;}

function OptionBtn({label,sub,emoji,selected,onClick,color="#818CF8"}){
  return <button onClick={onClick} className="pop" style={{flex:1,minWidth:0,padding:"12px 8px",borderRadius:14,cursor:"pointer",background:selected?al(color,0.12):"#fff",border:`2px solid ${selected?color:"#e8e5de"}`,transition:"all 0.18s",textAlign:"center"}}>
    <div style={{fontSize:20,marginBottom:3}}>{emoji}</div>
    <div style={{fontSize:11,fontWeight:900,color:selected?"#1a1a2e":"#6b6880",lineHeight:1.2}}>{label}</div>
    {sub&&<div style={{fontSize:9,color:selected?al(color,0.85):"#3a4a5a",marginTop:2,lineHeight:1.3}}>{sub}</div>}
  </button>;
}

function SetupScreen({onStart}){
  const[persona,setPersona]=useState(null);
  const[parks,setParks]=useState(null);
  const[hasExpress,setHasExpress]=useState(null);
  const[hasEPA,setHasEPA]=useState(null);
  const[hotelBreak,setHotelBreak]=useState(true);
  const[breakStart,setBreakStart]=useState("12:00");
  const[breakEnd,setBreakEnd]=useState("16:00");
  const canGoCustom=parks!==null&&hasExpress!==null&&hasEPA!==null;
  const toMins=t=>{const[h,m]=t.split(":").map(Number);return h*60+m;};
  return (
    <div style={{minHeight:"100vh",background:"#FFFDF7",padding:"0 0 48px"}}>
      <style>{CSS}</style>
      <div style={{maxWidth:420,margin:"0 auto",padding:"0 16px"}}>
        <div style={{textAlign:"right",padding:"16px 0 0"}}>
          <a href="https://universal-orl-planning-tools.netlify.app/" style={{fontSize:11,color:"#9b98a8",textDecoration:"none",fontWeight:700}}>← Suite Home</a>
        </div>
        <div style={{textAlign:"center",padding:"16px 0 28px"}}>
          <div style={{fontSize:38,marginBottom:8}}>🎬🏝️</div>
          <div style={{fontSize:24,fontWeight:900,color:"#1a1a2e",letterSpacing:"-0.03em"}}>Duo Dash</div>
          <div style={{fontSize:12,color:"#6b6880",marginTop:4,fontWeight:700}}>Universal Studios · Islands of Adventure</div>
        </div>
        <div style={{marginBottom:24}}>
          <div style={{fontSize:10,fontWeight:900,letterSpacing:"0.12em",textTransform:"uppercase",color:"#9b98a8",marginBottom:10}}>Who's planning?</div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setPersona(persona==="darshi"?null:"darshi")} className="pop" style={{flex:1,padding:"16px 12px",borderRadius:16,cursor:"pointer",textAlign:"left",background:persona==="darshi"?"#FFF8E7":"#fff",border:`2px solid ${persona==="darshi"?"#FBBF24":"#e8e5de"}`,transition:"all 0.18s"}}>
              <div style={{fontSize:22,marginBottom:6}}>🌴</div>
              <div style={{fontSize:13,fontWeight:900,color:persona==="darshi"?"#d97706":"#1a1a2e"}}>Darshi</div>
              <div style={{fontSize:10,color:"#6b6880",marginTop:3,lineHeight:1.5}}>Express Pass · EPA · Both parks · 2 days · Family</div>
              {persona==="darshi"&&<div style={{marginTop:8,fontSize:9,color:"#d97706",fontWeight:800}}>✓ SELECTED</div>}
            </button>
            <button onClick={()=>setPersona(persona==="custom"?null:"custom")} className="pop" style={{flex:1,padding:"16px 12px",borderRadius:16,cursor:"pointer",textAlign:"left",background:persona==="custom"?"#F0F0FF":"#fff",border:`2px solid ${persona==="custom"?"#818CF8":"#e8e5de"}`,transition:"all 0.18s"}}>
              <div style={{fontSize:22,marginBottom:6}}>✏️</div>
              <div style={{fontSize:13,fontWeight:900,color:persona==="custom"?"#5b51d8":"#1a1a2e"}}>Custom</div>
              <div style={{fontSize:10,color:"#6b6880",marginTop:3,lineHeight:1.5}}>Set your own parks, Express & EPA options</div>
              {persona==="custom"&&<div style={{marginTop:8,fontSize:9,color:"#5b51d8",fontWeight:800}}>✓ SELECTED</div>}
            </button>
          </div>
        </div>
        {persona==="custom"&&(
          <div className="fade-up" style={{marginBottom:24}}>
            <div style={{padding:"16px",borderRadius:14,background:"#fff",border:"1.5px solid #e8e5de"}}>
              <div style={{marginBottom:18}}>
                <div style={{fontSize:10,fontWeight:900,letterSpacing:"0.12em",textTransform:"uppercase",color:"#9b98a8",marginBottom:10}}>Which parks?</div>
                <div style={{display:"flex",gap:8}}>
                  <OptionBtn emoji="🏝️" label="IOA" sub="Islands of Adventure" selected={parks==="ioa"} onClick={()=>setParks("ioa")} color="#34D399"/>
                  <OptionBtn emoji="🎬" label="Studios" sub="Universal Studios" selected={parks==="studios"} onClick={()=>setParks("studios")} color="#818CF8"/>
                  <OptionBtn emoji="🎬🏝️" label="Both" sub="Park-to-Park" selected={parks==="all"} onClick={()=>setParks("all")} color="#FBBF24"/>
                </div>
              </div>
              <div style={{marginBottom:18}}>
                <div style={{fontSize:10,fontWeight:900,letterSpacing:"0.12em",textTransform:"uppercase",color:"#9b98a8",marginBottom:10}}>Express Pass?</div>
                <div style={{display:"flex",gap:8}}>
                  <OptionBtn emoji="⚡" label="Yes" sub="Skip the line" selected={hasExpress===true} onClick={()=>setHasExpress(true)} color="#F87171"/>
                  <OptionBtn emoji="🦶" label="No" sub="Standby only" selected={hasExpress===false} onClick={()=>setHasExpress(false)} color="#94A3B8"/>
                </div>
              </div>
              <div>
                <div style={{fontSize:10,fontWeight:900,letterSpacing:"0.12em",textTransform:"uppercase",color:"#9b98a8",marginBottom:10}}>Early Park Access?</div>
                <div style={{display:"flex",gap:8}}>
                  <OptionBtn emoji="🌅" label="Yes" sub="Start at 8:00 AM" selected={hasEPA===true} onClick={()=>setHasEPA(true)} color="#34D399"/>
                  <OptionBtn emoji="🕘" label="No" sub="Start at 9:00 AM" selected={hasEPA===false} onClick={()=>setHasEPA(false)} color="#94A3B8"/>
                </div>
              </div>
            </div>
          </div>
        )}
        {persona&&(
          <div className="fade-up" style={{marginBottom:24,padding:"16px",borderRadius:14,background:"#fff",border:"1.5px solid #e8e5de"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:hotelBreak?14:0}}>
              <div>
                <div style={{fontSize:12,fontWeight:900,color:"#1a1a2e"}}>🏨 Hotel Break</div>
                <div style={{fontSize:10,color:"#6b6880",marginTop:2}}>Mid-day rest - come back refreshed for the evening</div>
              </div>
              <button onClick={()=>setHotelBreak(!hotelBreak)} className="pop" style={{padding:"6px 14px",borderRadius:20,border:"none",background:hotelBreak?"rgba(52,211,153,0.15)":"rgba(0,0,0,0.05)",color:hotelBreak?"#34D399":"#6b6880",fontSize:11,fontWeight:900,cursor:"pointer"}}>
                {hotelBreak?"ON":"OFF"}
              </button>
            </div>
            {hotelBreak&&(
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:9,color:"#9b98a8",fontWeight:800,marginBottom:4,letterSpacing:"0.08em"}}>LEAVE BY</div>
                  <input type="time" value={breakStart} onChange={e=>setBreakStart(e.target.value)} style={{width:"100%"}}/>
                </div>
                <div style={{fontSize:18,color:"#c5c2ba",marginTop:14}}>to</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:9,color:"#9b98a8",fontWeight:800,marginBottom:4,letterSpacing:"0.08em"}}>BACK AT</div>
                  <input type="time" value={breakEnd} onChange={e=>setBreakEnd(e.target.value)} style={{width:"100%"}}/>
                </div>
              </div>
            )}
          </div>
        )}
        {persona==="darshi"&&(
          <button onClick={()=>onStart({...DARSHI,hotelBreak,breakStart:toMins(breakStart),breakEnd:toMins(breakEnd)})} className="pop fade-up" style={{width:"100%",padding:"17px",borderRadius:16,border:"none",background:"linear-gradient(135deg,#FBBF24,#F59E0B)",color:"#1a0e00",fontSize:15,fontWeight:900,cursor:"pointer",boxShadow:"0 4px 28px rgba(251,191,36,0.35)"}}>
            Let's Go, Darshi →
          </button>
        )}
        {persona==="custom"&&(
          <button disabled={!canGoCustom} onClick={()=>canGoCustom&&onStart({parks,hasExpress,hasEPA,name:"Custom",hotelBreak,breakStart:toMins(breakStart),breakEnd:toMins(breakEnd)})} className="pop" style={{width:"100%",padding:"17px",borderRadius:16,border:"none",background:canGoCustom?"linear-gradient(135deg,#818CF8,#34D399)":"rgba(0,0,0,0.05)",color:canGoCustom?"#fff":"#9b98a8",fontSize:15,fontWeight:900,cursor:canGoCustom?"pointer":"not-allowed"}}>
            {canGoCustom?"Build My Day →":"Answer the questions above"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function App(){
  const[config,setConfig]=useState(null);
  const[activeDay,setActiveDay]=useState(1);
  const[activeTab,setActiveTab]=useState("plan");
  const[liveWaits,setLiveWaits]=useState({});
  const[liveStatus,setLiveStatus]=useState("idle");
  const[day1Sched,setDay1Sched]=useState({scheduled:[],bonus:[]});
  const[day2Sched,setDay2Sched]=useState({scheduled:[],bonus:[]});
  const[rideOrder1,setRideOrder1]=useState(null);
  const[rideOrder2,setRideOrder2]=useState(null);
  const[expandedId,setExpandedId]=useState(null);
  const[removedIds,setRemovedIds]=useState({1:new Set(),2:new Set()});
  const[addedIds,setAddedIds]=useState({1:new Set(),2:new Set()});

  const fetchLive=useCallback(async(cfg)=>{
    if(!cfg)return;setLiveStatus("loading");
    try{
      const parkIds=cfg.parks==="studios"?[65]:cfg.parks==="ioa"?[64]:[64,65];
      const results={};
      await Promise.all(parkIds.map(async pid=>{
        const res=await fetch("/api/waittimes?park="+pid);
        const data=await res.json();
        if(data.lands){data.lands.forEach(land=>{land.rides?.forEach(apiRide=>{
          const n=apiRide.name?.toLowerCase()||"";let id=null;
          if(n.includes("velocicoaster"))id="veloci";
          else if(n.includes("hagrid")&&!n.includes("single"))id="hagrids";
          else if(n.includes("flight of the hippogriff"))id="hippogriff";
          else if(n.includes("hogwarts")&&n.includes("hogsmeade"))id="hogex_ioa";
          else if(n.includes("hogwarts")&&n.includes("king"))id="hogex_st";
          else if(n.includes("pteranodon"))id="ptero";
          else if(n.includes("reign of kong"))id="kong";
          else if(n.includes("incredible hulk")&&!n.includes("single"))id="hulk";
          else if(n.includes("spider-man")&&!n.includes("single"))id="spiderman";
          else if(n.includes("doctor doom"))id="doom";
          else if(n.includes("storm force"))id="stormforce";
          else if(n.includes("dudley"))id="dudley";
          else if(n.includes("bilge-rat"))id="bilge";
          else if(n.includes("cat in the hat"))id="cathat";
          else if(n.includes("trolley train"))id="trolley";
          else if(n.includes("one fish"))id="onefish";
          else if(n.includes("caro-seuss"))id="caroSeuss";
          else if(n.includes("escape from gringotts")&&!n.includes("single"))id="gringotts";
          else if(n.includes("revenge of the mummy")&&!n.includes("single"))id="mummy";
          else if(n.includes("transformers"))id="transformers";
          else if(n.includes("minion mayhem"))id="minion";
          else if(n.includes("villain-con")||n.includes("minion blast"))id="villaincon";
          else if(n.includes("men in black")&&!n.includes("single"))id="mib";
          else if(n.includes("simpsons ride"))id="simpsons";
          else if(n.includes("race through new york")||n.includes("jimmy fallon"))id="fallon";
          else if(n.includes("e.t. adventure"))id="et";
          else if(n.includes("trolls trollercoaster"))id="trollscoast";
          else if(n.includes("kang")&&n.includes("twirl"))id="kang";
          if(id&&apiRide.wait_time!=null){
            // Only store live data when the park is actually open (wait > 0)
            // wait_time===0 means park is closed — fall back to historical estimates
            if(apiRide.wait_time > 0){
              results[id]={wait:apiRide.wait_time,isOpen:apiRide.is_open===false?false:true};
            } else if(apiRide.is_open===false){
              // Explicitly closed ride (maintenance etc) — mark it
              results[id]={wait:0,isOpen:false};
            }
            // If wait_time===0 but not explicitly closed, skip — use historical
          }
        });});}
      }));
      // POST-PROCESS: if no ride has a positive wait, park is closed overnight
      // In that case, clear results so historical estimates are used for planning
      // Individual ride closures (maintenance) are only shown when other rides ARE open
      const anyRideOpen = Object.values(results).some(r => r.wait > 0);
      if (!anyRideOpen) {
        for (const k of Object.keys(results)) delete results[k];
      }
      setLiveWaits(results);setLiveStatus(anyRideOpen?"ok":"idle");
    }catch{setLiveStatus("error");}
  },[]);

  const buildSchedules=useCallback((cfg,live,o1,o2,rem1,rem2,add1,add2)=>{
    if(!cfg)return;
    const makeOrder=(dayNum,override)=>{
      const dayKey=dayNum===1?"day1":"day2";
      const added=dayNum===1?add1:add2;
      const addedRides=RIDES.filter(r=>added.has(r.id));
      let base=override||RIDES.filter(r=>{if(r.optional)return false;if(r[dayKey]===null||r[dayKey]===undefined)return false;if(cfg.parks==="ioa")return r.park==="ioa";if(cfg.parks==="studios")return r.park==="studios";return true;}).sort((a,b)=>(a[dayKey]||99)-(b[dayKey]||99));
      const baseIds=new Set(base.map(r=>r.id));
      addedRides.forEach(r=>{
        if(!baseIds.has(r.id)){
          // Insert after the last ride in the same park for best time-block fit
          let insertIdx=-1;
          for(let i=base.length-1;i>=0;i--){if(base[i].park===r.park){insertIdx=i+1;break;}}
          if(insertIdx>=0)base.splice(insertIdx,0,r);
          else base.push(r);
        }
      });
      return base.filter(r=>!(dayNum===1?rem1:rem2).has(r.id));
    };
    setDay1Sched(buildDaySchedule({dayNum:1,hasExpress:cfg.hasExpress,hasEPA:cfg.hasEPA,liveWaits:live,parks:cfg.parks,cfg,overrideOrder:makeOrder(1,o1)}));
    setDay2Sched(buildDaySchedule({dayNum:2,hasExpress:cfg.hasExpress,hasEPA:cfg.hasEPA,liveWaits:live,parks:cfg.parks,cfg,overrideOrder:makeOrder(2,o2)}));
  },[]);

  const handleStart=cfg=>{setConfig(cfg);fetchLive(cfg);};
  useEffect(()=>{
    if(!config)return;
    buildSchedules(config,liveWaits,rideOrder1,rideOrder2,removedIds[1],removedIds[2],addedIds[1],addedIds[2]);
    const interval=setInterval(()=>fetchLive(config),5*60*1000);
    return()=>clearInterval(interval);
  },[config,liveWaits,rideOrder1,rideOrder2,removedIds,addedIds]);

  const removeRide=(rideId,day)=>{
    const setOrder=day===1?setRideOrder1:setRideOrder2;
    setOrder(prev=>prev?prev.filter(r=>r.id!==rideId):prev);
    setRemovedIds(p=>{const n={...p,[day]:new Set(p[day])};n[day].add(rideId);return n;});
    setAddedIds(p=>{const n={...p,[day]:new Set(p[day])};n[day].delete(rideId);return n;});
    setExpandedId(null);
  };
  const addRide=(rideId,day)=>{
    const rideToAdd=RIDES.find(r=>r.id===rideId);
    if(!rideToAdd)return;
    const dayKey=day===1?"day1":"day2";
    const setOrder=day===1?setRideOrder1:setRideOrder2;
    setOrder(prev=>{
      let order=prev?[...prev]:RIDES.filter(r=>{if(r.optional)return false;if(r[dayKey]===null||r[dayKey]===undefined)return false;if(config.parks==="ioa")return r.park==="ioa";if(config.parks==="studios")return r.park==="studios";return true;}).sort((a,b)=>(a[dayKey]||99)-(b[dayKey]||99));
      order=order.filter(r=>r.id!==rideId);
      order.push(rideToAdd);
      return order;
    });
    setAddedIds(p=>{const n={...p,[day]:new Set(p[day])};n[day].add(rideId);return n;});
    setRemovedIds(p=>{const n={...p,[day]:new Set(p[day])};n[day].delete(rideId);return n;});
  };
  const moveRide=(rideId,day,direction)=>{
    const dayKey=day===1?"day1":"day2";
    const setOrder=day===1?setRideOrder1:setRideOrder2;
    setOrder(prev=>{
      let order=prev?[...prev]:RIDES.filter(r=>{if(r.optional)return false;if(r[dayKey]===null||r[dayKey]===undefined)return false;if(config.parks==="ioa")return r.park==="ioa";if(config.parks==="studios")return r.park==="studios";return true;}).sort((a,b)=>(a[dayKey]||99)-(b[dayKey]||99));
      const idx=order.findIndex(r=>r.id===rideId);
      if(idx===-1)return order;
      if(direction===-1&&idx===0)return order;
      if(direction===1&&idx>=order.length-1)return order;
      const[mv]=order.splice(idx,1);order.splice(idx+direction,0,mv);
      return order;
    });
  };

  if(!config)return <SetupScreen onStart={handleStart}/>;
  const daySched=activeDay===1?day1Sched:day2Sched;
  const{scheduled,bonus}=daySched;
  const stats=calcStats(scheduled);
  const liveCount=Object.keys(liveWaits).length;

  const renderItem=(item,idx)=>{
    if(item.type==="walk")return(
      <div key={item.id} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 4px"}}>
        <div style={{width:2,height:18,borderRadius:1,background:"#e0ddd4",flexShrink:0,marginLeft:12}}/>
        <div style={{fontSize:9,color:"#9b98a8"}}>{item.isEntrance?"🚶 Entrance to "+(LAND_META[item.to]?.short||item.to):item.isExit?"🚶 "+(LAND_META[item.from]?.short||item.from)+" to exit":"🚶 "+(LAND_META[item.from]?.short||item.from)+" to "+(LAND_META[item.to]?.short||item.to)} · {item.endMins-item.startMins} min</div>
      </div>
    );
    if(item.type==="epa")return(
      <div key={item.id} className="fade-up" style={{marginBottom:12,borderRadius:14,background:(PARK[item.park]?.color||"#34D399")+"20",border:"2px solid "+(PARK[item.park]?.color||"#34D399"),padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",gap:10,alignItems:"center"}}><div style={{fontSize:24}}>{PARK[item.park]?.emoji}</div><div><div style={{fontSize:13,fontWeight:900,color:"#1a1a2e"}}>{item.label}</div><div style={{fontSize:10,color:al(PARK[item.park]?.color||"#34D399",0.8),marginTop:2}}>{item.sub}</div></div></div>
        <div style={{fontSize:13,fontWeight:900,color:PARK[item.park]?.color||"#34D399"}}>{fmt12(item.startMins)}</div>
      </div>
    );
    if(item.type==="break")return(
      <div key={item.id} className="fade-up" style={{marginBottom:12,borderRadius:14,background:"#F0FDF7",border:"2px solid #34D399",padding:"16px 18px"}}>
        <div style={{fontSize:16,fontWeight:900,color:"#1a1a2e",marginBottom:4}}>{item.label}</div>
        <div style={{fontSize:11,color:"#6b6880",lineHeight:1.5}}>{item.sub}</div>
        <div style={{marginTop:10}}><span style={{display:"inline-block",padding:"5px 12px",borderRadius:20,background:"#FFF3CD",border:"1.5px solid #F59E0B",fontSize:11,color:"#d97706",fontWeight:800}}>{fmt12(item.startMins)} — {fmt12(item.endMins)}</span></div>
      </div>
    );
    if(item.type==="event")return(
      <div key={item.id} className="fade-up" style={{marginBottom:12,borderRadius:14,background:"#fff",border:"3px solid "+item.color,boxShadow:"0 2px 12px "+al(item.color,0.15),padding:"14px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div><div style={{fontSize:22,marginBottom:6}}>{item.emoji}</div><div style={{fontSize:14,fontWeight:900,color:item.color,marginBottom:4}}>{item.label}</div><div style={{fontSize:10,color:al(item.color,0.7),lineHeight:1.5}}>{item.sub}</div></div>
          <div style={{textAlign:"right",flexShrink:0,marginLeft:8}}><div style={{fontSize:14,fontWeight:900,color:item.color}}>{fmt12(item.startMins)}</div></div>
        </div>
      </div>
    );
    if(item.type==="wrap")return(
      <div key={item.id} className="fade-up" style={{marginBottom:12,borderRadius:14,background:"#F0FDF7",border:"2px solid #34D399",padding:"16px 18px"}}>
        <div style={{fontSize:16,fontWeight:900,color:"#1a1a2e",marginBottom:4}}>🏨 {item.label}</div>
        <div style={{fontSize:11,color:"#6b6880",lineHeight:1.5}}>{item.sub}</div>
        <div style={{marginTop:10,display:"inline-block",padding:"5px 12px",borderRadius:20,background:"#FFF3CD",border:"1.5px solid #F59E0B",fontSize:11,color:"#d97706",fontWeight:800}}>Done by {fmt12(item.startMins)}</div>
      </div>
    );
    if(item.type!=="ride")return null;
    const{ride,wait,closed}=item;
    const wc=closed?"#94A3B8":waitColor(wait);
    const lm=LAND_META[ride.land];
    const pc=PARK[ride.park]?.color||"#818CF8";
    const isExp=expandedId===item.id;
    const hasLiveData=liveWaits[ride.id]!=null;
    const rideHour=item.startMins/60;
    const showLive=hasLiveData&&!closed&&Math.abs(rideHour-getEasternHour())<=1;
    const showEst=!showLive&&!closed;
    return(
      <div key={item.id} className="fade-up" style={{marginBottom:9,animationDelay:Math.min(idx*0.02,0.3)+"s",opacity:closed?0.55:1}}>
        <div style={{borderRadius:14,border:"1.5px solid #ede9dc",borderLeft:"5px solid "+(closed?"#F87171":lm?.color||pc),background:closed?"#FFF0F0":"#fff",transition:"border-color 0.15s"}}>
          <div onClick={()=>setExpandedId(isExp?null:item.id)} className="pop" style={{padding:"11px 13px",display:"flex",gap:10,alignItems:"flex-start",cursor:"pointer"}}>
            <div style={{width:40,minHeight:40,borderRadius:10,flexShrink:0,background:closed?"rgba(248,113,113,0.08)":al(wc,0.12),border:"1.5px solid "+(closed?"rgba(248,113,113,0.3)":al(wc,0.28)),display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              {closed?<div style={{fontSize:8,color:"#F87171",fontWeight:900,textAlign:"center",lineHeight:1.2}}>CLOS ED</div>:<>
                <div style={{fontSize:13,fontWeight:900,color:wc,fontFamily:"monospace",lineHeight:1}}>{wait===0?"—":wait}</div>
                {wait>0&&<div style={{fontSize:7,color:wc,fontWeight:700}}>min</div>}
                {showLive&&<div style={{fontSize:7,color:"#34D399",fontWeight:800}}>LIVE</div>}
                {showEst&&wait>0&&<div style={{fontSize:7,color:"#60A5FA",fontWeight:800}}>EST</div>}
              </>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:800,color:closed?"#94a3b8":"#1a1a2e",marginBottom:4,lineHeight:1.2}}>{ride.name}</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
                <Chip label={(lm?.emoji||"")+" "+(lm?.short||ride.land)} color={lm?.color||"#818CF8"} size="xs"/>
                {ride.minH>0&&<Chip label={ride.minH+'"+'} color="#94A3B8" size="xs"/>}
                {!ride.express&&<Chip label="No Express" color="#F87171" size="xs"/>}
                {config.hasExpress&&ride.express&&!closed&&<Chip label="Express" color="#F87171" size="xs"/>}
                {ride.single&&<Chip label="Single rider" color="#818CF8" size="xs"/>}
                {ride.maxH&&<Chip label={"Max "+ride.maxH+'"'} color="#FBBF24" size="xs"/>}
                {closed&&<Chip label="Closed today" color="#F87171" size="xs"/>}
              </div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              {!closed&&<><div style={{fontSize:12,fontWeight:800,color:lm?.color||pc}}>{fmt12(item.startMins)}</div><div style={{fontSize:10,color:"#9b98a8",marginTop:1}}>{fmt12(item.endMins)}</div></>}
              <div style={{display:"flex",gap:4,marginTop:4,justifyContent:"flex-end"}}>
                <button onClick={e=>{e.stopPropagation();moveRide(ride.id,activeDay,-1);}} style={{width:28,height:28,borderRadius:8,border:"1.5px solid #e8e5de",background:"#fff",color:"#6b6880",fontSize:12,fontWeight:900,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>▲</button>
                <button onClick={e=>{e.stopPropagation();moveRide(ride.id,activeDay,1);}} style={{width:28,height:28,borderRadius:8,border:"1.5px solid #e8e5de",background:"#fff",color:"#6b6880",fontSize:12,fontWeight:900,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>▼</button>
                <button onClick={e=>{e.stopPropagation();removeRide(ride.id,activeDay);}} style={{width:28,height:28,borderRadius:8,border:"1.5px solid rgba(248,113,113,0.3)",background:"rgba(248,113,113,0.06)",color:"#F87171",fontSize:12,fontWeight:900,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>✕</button>
              </div>
            </div>
          </div>
          {isExp&&<div className="fade-up" style={{borderTop:"1px solid #f0edd6",padding:"11px 13px"}}>
            <div style={{fontSize:11,color:"#6b6880",lineHeight:1.65}}>💡 {ride.tip}</div>
          </div>}
        </div>
      </div>
    );
  };

  return(
    <div style={{minHeight:"100vh",background:"#FFFDF7",paddingBottom:72}}>
      <style>{CSS}</style>
      <div style={{background:"#FFFDF7",borderBottom:"2px solid #f0edd6",padding:"14px 16px 0",position:"sticky",top:0,zIndex:50,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <div style={{maxWidth:420,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:9,fontWeight:900,letterSpacing:"0.15em",textTransform:"uppercase",color:"#d97706",marginBottom:2}}>Universal Orlando · {config.hasExpress?"Express Pass":"Standby"}</div>
              <div style={{fontSize:20,fontWeight:900,color:"#1a1a2e",letterSpacing:"-0.02em"}}>{config.name==="Darshi"?"Darshi's":"Your"} <span style={{color:"#FBBF24"}}>Day Plan</span></div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              {liveStatus==="loading"&&<div className="spinner" style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(52,211,153,0.3)",borderTopColor:"#34D399"}}/>}
              {liveStatus==="ok"&&<div style={{display:"flex",alignItems:"center",gap:4}}><div className="live-dot" style={{width:6,height:6,borderRadius:"50%",background:"#34D399"}}/><span style={{fontSize:9,color:"#34D399",fontWeight:800}}>LIVE {liveCount}</span></div>}
              <button onClick={()=>setConfig(null)} className="pop" style={{padding:"5px 10px",borderRadius:8,background:"#fff",border:"1.5px solid #e8e5de",color:"#6b6880",fontSize:10,fontWeight:800,cursor:"pointer"}}>Setup</button>
              <a href="https://universal-orl-planning-tools.netlify.app/" style={{padding:"5px 10px",borderRadius:8,background:"#fff",border:"1.5px solid #e8e5de",color:"#9b98a8",fontSize:10,fontWeight:800,textDecoration:"none"}}>🏠</a>
            </div>
          </div>
          <div style={{display:"flex",gap:0,borderRadius:"10px 10px 0 0",overflow:"hidden"}}>
            {[1,2].map(d=><button key={d} onClick={()=>{setActiveDay(d);setExpandedId(null);}} className="pop" style={{flex:1,padding:"10px 8px",border:"none",cursor:"pointer",background:activeDay===d?"#FFF3CD":"transparent",borderBottom:activeDay===d?"3px solid #F59E0B":"3px solid transparent",color:activeDay===d?"#d97706":"#9b98a8",fontSize:11,fontWeight:900,transition:"all 0.15s"}}>{d===1?"Day 1 - Hagrid's rope drop":"Day 2 - VelociCoaster rope drop"}</button>)}
          </div>
        </div>
      </div>
      <div style={{background:"#fff",borderBottom:"1px solid #f0edd6",padding:"10px 16px"}}>
        <div style={{maxWidth:420,margin:"0 auto",display:"flex",gap:8}}>
          {[{val:stats.count,label:"RIDES"},{val:Math.floor(stats.totalWait/60)+"h"+stats.totalWait%60+"m",label:"IN LINE"},{val:"~"+stats.avgWait+"m",label:"AVG WAIT"},{val:fmt12(stats.estDone),label:"EST. DONE"}].map(s=><div key={s.label} style={{flex:1,textAlign:"center",padding:"8px 4px",borderRadius:10,background:"#FFFDF7",border:"1.5px solid #f0edd6"}}><div style={{fontSize:14,fontWeight:900,color:"#1a1a2e",lineHeight:1}}>{s.val}</div><div style={{fontSize:8,color:"#9b98a8",fontWeight:800,letterSpacing:"0.08em",marginTop:3}}>{s.label}</div></div>)}
        </div>
      </div>
      <div style={{maxWidth:420,margin:"0 auto",padding:"12px 16px 0"}}>
        {activeTab==="plan"&&<div>
          {scheduled.map((item,idx)=>renderItem(item,idx))}
          {bonus.length>0&&<div style={{marginTop:16}}>
            <div style={{padding:"12px 14px",borderRadius:"12px 12px 0 0",background:"#fff",border:"1.5px solid #e8e5de",borderBottom:"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:12,fontWeight:900,color:"#1a1a2e"}}>Add-on rides</div><div style={{fontSize:10,color:"#9b98a8",marginTop:2}}>{bonus.length} available · tap to add</div></div>
              <div style={{fontSize:16,color:"#c5c2ba"}}>+</div>
            </div>
            <div style={{borderRadius:"0 0 12px 12px",border:"1.5px solid #e8e5de",borderTop:"none",overflow:"hidden"}}>
              {bonus.sort((a,b)=>getHistoricalWait(a.id,getEasternHour(),config.hasExpress)-getHistoricalWait(b.id,getEasternHour(),config.hasExpress)).map((ride,i)=>{
                const liveEntry=liveWaits[ride.id];const closed=liveEntry?.isOpen===false;
                const wait=closed?0:((liveEntry?.wait??liveEntry)??(getHistoricalWait(ride.id,getEasternHour(),config.hasExpress)));
                const wc=closed?"#94A3B8":waitColor(wait);const lm=LAND_META[ride.land];
                return(<div key={ride.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:i%2===0?"#fff":"#FAFAF7",borderTop:i>0?"1px solid #f0edd6":"none",opacity:closed?0.5:1}}>
                  <div style={{width:36,textAlign:"center",flexShrink:0}}>
                    {closed?<div style={{fontSize:8,color:"#F87171",fontWeight:900}}>CLOSED</div>:<><div style={{fontSize:13,fontWeight:900,color:wc,fontFamily:"monospace",lineHeight:1}}>{wait===0?"—":wait}</div>{wait>0&&<div style={{fontSize:7,color:wc,fontWeight:700}}>min</div>}<div style={{fontSize:7,color:"#60A5FA",fontWeight:800}}>EST</div></>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:800,color:"#4a4760",marginBottom:3}}>{ride.name}</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}><Chip label={(lm?.emoji||"")+" "+(lm?.short||ride.land)} color={lm?.color||"#818CF8"} size="xs"/>{!ride.express&&<Chip label="No Express" color="#F87171" size="xs"/>}{ride.minH>0&&<Chip label={ride.minH+'"+'} color="#94A3B8" size="xs"/>}</div>
                  </div>
                  <button disabled={closed} onClick={()=>!closed&&addRide(ride.id,activeDay)} className="pop" style={{padding:"7px 14px",borderRadius:20,border:"none",background:closed?"#f5f5f0":"#1a1a2e",color:closed?"#c5c2ba":"#fff",fontSize:11,fontWeight:900,cursor:closed?"not-allowed":"pointer",flexShrink:0}}>{closed?"—":"+ Add"}</button>
                </div>);
              })}
            </div>
          </div>}
        </div>}
        {activeTab==="food"&&<div>
          {activeDay===2&&<div className="fade-up" style={{marginBottom:14,borderRadius:14,background:"#FFF8E7",border:"2px solid #FBBF24",padding:"13px 14px"}}>
            <div style={{fontSize:12,fontWeight:900,color:"#d97706",marginBottom:8}}>CityWalk Lunch Break</div>
            <div style={{display:"flex",gap:8}}>{[{name:"Toothsome",emoji:"🍫",item:"Milkshakes & brunch"},{name:"Hard Rock",emoji:"🎸",item:"Right next door if Toothsome has a wait"}].map(r=><div key={r.name} style={{flex:1,padding:"10px",borderRadius:10,background:"#fff",border:"1.5px solid #FBBF24"}}><div style={{fontSize:16,marginBottom:3}}>{r.emoji}</div><div style={{fontSize:11,fontWeight:800,color:"#d97706"}}>{r.name}</div><div style={{fontSize:10,color:"#92741a",marginTop:2}}>{r.item}</div></div>)}</div>
          </div>}
          {(activeDay===1?DAY1_LANDS:DAY2_LANDS).map(({land,park})=>{
            const food=FOOD[land];if(!food)return null;const lm=LAND_META[land];
            return(<div key={land} className="fade-up" style={{marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <div style={{width:3,height:14,borderRadius:2,background:lm?.color||"#818CF8",flexShrink:0}}/>
                <div style={{fontSize:11,fontWeight:900,letterSpacing:"0.08em",textTransform:"uppercase",color:lm?.color||"#818CF8"}}>{lm?.emoji} {land}</div>
                <Chip label={PARK[park]?.short||park} color={PARK[park]?.color||"#818CF8"} size="xs"/>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {[{key:"sitdown",icon:"🍽️",label:"Sit Down"},{key:"snack",icon:"🍿",label:"Line Snack"},{key:"drink",icon:"🧊",label:"Cool Drink"}].map(({key,icon,label})=>{
                  const rec=food[key];if(!rec)return null;
                  return(<div key={key} style={{display:"flex",gap:10,alignItems:"center",padding:"9px 12px",borderRadius:11,background:"#fff",border:"2px solid "+al(lm?.color||"#818CF8",0.25),borderLeft:"4px solid "+(lm?.color||"#818CF8")}}>
                    <div style={{fontSize:20,flexShrink:0}}>{rec.emoji}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:9,fontWeight:800,color:lm?.color||"#818CF8",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2}}>{icon} {label}</div>
                      <div style={{fontSize:12,fontWeight:800,color:"#1a1a2e"}}>{rec.name} <span style={{color:"#6b6880",fontWeight:600}}>· {rec.item}</span></div>
                    </div>
                  </div>);
                })}
              </div>
            </div>);
          })}
        </div>}
        {activeTab==="waits"&&<div>
          <div style={{fontSize:10,color:"#9b98a8",marginBottom:12,lineHeight:1.5}}>{liveStatus==="ok"?"Live wait times · "+liveCount+" rides · updates every 5 min.":"Historical wait times. Live data unavailable right now."}</div>
          {["ioa","studios"].filter(p=>config.parks==="all"||config.parks===p).map(p=><div key={p} style={{marginBottom:18}}>
            <div style={{fontSize:11,fontWeight:900,letterSpacing:"0.08em",textTransform:"uppercase",color:PARK[p].color,marginBottom:8,display:"flex",alignItems:"center",gap:6}}><div style={{width:3,height:12,borderRadius:2,background:PARK[p].color}}/>{PARK[p].emoji} {PARK[p].name}</div>
            {RIDES.filter(r=>r.park===p).sort((a,b)=>{
              const cA=liveWaits[a.id]?.isOpen===false,cB=liveWaits[b.id]?.isOpen===false;if(cA&&!cB)return 1;if(!cA&&cB)return-1;
              return getHistoricalWait(a.id,getEasternHour(),config.hasExpress)-getHistoricalWait(b.id,getEasternHour(),config.hasExpress);
            }).map(ride=>{
              const le=liveWaits[ride.id];const closed=le?.isOpen===false;
              const wait=closed?0:((le?.wait??le)??(getHistoricalWait(ride.id,getEasternHour(),config.hasExpress)));
              const wc=closed?"#F87171":waitColor(wait);const lm=LAND_META[ride.land];
              return(<div key={ride.id} style={{marginBottom:6,borderRadius:11,background:closed?"#FFF0F0":"#fff",border:"1.5px solid "+(closed?"#fca5a5":al(wc,0.3)),borderLeft:"4px solid "+(closed?"#F87171":wc),padding:"9px 12px",display:"flex",alignItems:"center",gap:10,opacity:closed?0.7:1}}>
                <div style={{width:38,textAlign:"center",flexShrink:0}}>
                  {closed?<div style={{fontSize:9,color:"#F87171",fontWeight:900,lineHeight:1.2}}>CLOSED</div>:<><div style={{fontSize:14,fontWeight:900,color:wc,fontFamily:"monospace",lineHeight:1}}>{wait===0?"—":wait}</div>{wait>0&&<div style={{fontSize:7,color:wc,fontWeight:700}}>min</div>}{le&&!closed?<div style={{fontSize:7,color:"#34D399",fontWeight:800}}>LIVE</div>:wait>0&&<div style={{fontSize:7,color:"#60A5FA",fontWeight:800}}>EST</div>}</>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:800,color:closed?"#94a3b8":"#1a1a2e",marginBottom:2}}>{ride.name}</div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}><Chip label={(lm?.emoji||"")+" "+(lm?.short||ride.land)} color={lm?.color||"#818CF8"} size="xs"/>{ride.minH>0&&<Chip label={ride.minH+'"+'} color="#94A3B8" size="xs"/>}{!ride.express&&<Chip label="No Express" color="#F87171" size="xs"/>}</div>
                </div>
              </div>);
            })}
          </div>)}
        </div>}
        {activeTab==="tips"&&<div>
          {[
            {emoji:"🎬",title:"Universal Mega Movie Parade - June 2026",body:"Every night at 7pm, Studios lagoon. Trolls, Ghostbusters, Jaws floats. Passholders have an exclusive viewing area — get there 20 min early."},
            {emoji:"🎆",title:"Cinesational: A Symphonic Spectacular - June 2026",body:"Every night at 9pm at Studios. Dancing fountains and pyrotechnics. Harry Potter, Jaws, and Mummy soundtracks. The perfect way to end the day."},
            {emoji:"🏰",title:"Hogwarts Always - June 2026",body:"Nighttime projection show on Hogwarts castle at IOA Hogsmeade through August 24. Different park from the parade — plan accordingly."},
            {emoji:"🦈",title:"Jaws Summer Celebration",body:"The San Francisco area of Studios is transformed all summer. Exclusive photo ops, food, and merch. Worth a walk-through between MIB and the parade."},
            {emoji:"⚡",title:"Express Pass - What It Covers",body:"Works on most rides including Hagrid's. Exceptions: Pteranodon Flyers, One Fish Two Fish, some spinners. Check the chip on each ride card."},
            {emoji:"🚂",title:"Hogwarts Express - Both Directions",body:"Hogsmeade to King's Cross and King's Cross to Hogsmeade are completely different experiences. Ride both with a P2P ticket."},
            {emoji:"💧",title:"Water Rides - Play It By Ear",body:"Dudley Do-Right will get you soaking wet. Bilge-Rat Barges is even wetter. Save for the hottest part of the day. The $5 People Dryer near Toon Lagoon is worth it."},
            {emoji:"👤",title:"Single Rider Lines",body:"VelociCoaster, Spider-Man, Mummy, Transformers, and Gringotts all have single rider lines. Can cut waits by 50-70%."},
            {emoji:"🧙",title:"Wand Locations",body:"Interactive spell spots throughout Diagon Alley and Hogsmeade. Pick up a map at Ollivanders. Kids love it — great slow-down time between rides."},
            {emoji:"❄️",title:"Beat the Heat",body:"Jimmy Fallon's queue is legendarily air-conditioned — best ride for 2-4pm on a hot day. Hogwarts castle queue is also cool."},
            {emoji:"🦕",title:"Pteranodon Flyers - The Weird Rule",body:"Kids 36-56 inches only. Adults over 56 inches must ride WITH a child. No Express. Go right after VelociCoaster."},
            {emoji:"🎒",title:"Pack Light - Lockers Are Free",body:"Most big rides have free standard-size lockers. Phones and wallets fit easily. Don't carry a backpack onto thrill rides."},
            {emoji:"📱",title:"Universal App",body:"Live wait times, show schedules, mobile ordering, and virtual queues. Check show schedules day-of — they change seasonally."},
          ].map(tip=><div key={tip.title} style={{marginBottom:10,borderRadius:12,background:"#fff",border:"1.5px solid #e8e5de",padding:"12px 13px"}}>
            <div style={{fontSize:14,marginBottom:5}}>{tip.emoji}</div>
            <div style={{fontSize:13,fontWeight:800,color:"#1a1a2e",marginBottom:4}}>{tip.title}</div>
            <div style={{fontSize:11,color:"#6b6880",lineHeight:1.65}}>{tip.body}</div>
          </div>)}
        </div>}
      </div>
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:"2px solid #f0edd6",padding:"8px 16px 14px",zIndex:100,boxShadow:"0 -2px 12px rgba(0,0,0,0.06)"}}>
        <div style={{maxWidth:420,margin:"0 auto",display:"flex",gap:6}}>
          {[["plan","📋","Plan"],["food","🍽️","Food"],["waits","⏱️","Waits"],["tips","💡","Tips"]].map(([tab,icon,label])=><button key={tab} onClick={()=>setActiveTab(tab)} className="pop" style={{flex:1,padding:"7px 4px",borderRadius:10,border:"none",background:activeTab===tab?"#FFF3CD":"none",color:activeTab===tab?"#d97706":"#9b98a8",fontSize:9,fontWeight:900,cursor:"pointer",transition:"all 0.15s"}}><div style={{fontSize:17,marginBottom:1}}>{icon}</div>{label}</button>)}
        </div>
      </div>
    </div>
  );
}
