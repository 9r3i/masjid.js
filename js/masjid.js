


/* browser app */
if(typeof HELPER_BROWSER_APP==='undefined'){
  const HELPER_BROWSER_APP=false;
}

/* initialize the app */
const Masjid=new MasjidApp(!true);
Masjid.start();
window.MasjidFront=Masjid;

/* masjid app */
;function MasjidApp(local=false){
this.helperVersion='1.4.5';
this.localHelper=local;
this.AppURL=this.localHelper
  ?'../app.js'
  :'https://cdn.jsdelivr.net/npm/@9r3i/helper@'
    +this.helperVersion+'/app.js';
  //:'http://127.0.0.1:9303/helper/'+this.helperVersion+'/app.js';
const meta=document.querySelector('meta[name="masjid-host"]');
this.srcURL=meta?meta.content:'';
this.files=[
  'js/finance.js',
];
/* load everything and start the app */
this.start=async function(){
  if(location.hostname!='127.0.0.1'
      &&location.hostname!='localhost'&&!meta){
    alert('Error: Failed to start the app!');
    return;
  }
  let script=await this.loadScript(this.AppURL),
  app=new App({
    helperVersion:this.helperVersion,
    helperProduction:true,
    localHelper:this.localHelper,
    logo:this.srcURL+'images/icon.png',
    css:this.srcURL+'css/masjid.css',
    configFile:this.srcURL+'config.json',
    appHost:this.srcURL,
    autoStart:false,
    test:function(){
      alert('this is a test');
    },
  });
  /* production */
  app.production=true;
  /* load files */
  for(let file of this.files){
    await this.loadScript(this.srcURL+file);
  }
  /* start the app */
  let start=await app.start();
  /* clone the app to main object */
  this.app=app;
};
/* load scriot as string */
this.loadScript=async function(url='',type='text/javascript'){
  let el=document.createElement('script'),
  text=await fetch(url).then(r=>r.text());
  el.type=type;
  el.textContent=text;
  document.head.append(el);
  return el;
};
};

