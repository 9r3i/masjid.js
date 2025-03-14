
;(async function(){
  /* start helper */
  let helper=getHelper();
  if(!helper){return;}
  if(!helper.production){
    /* error message -- for development only */
    window.addEventListener('error',function(e){
      let errorText=[
        e.message,
        'URL: '+e.filename,
        'Line: '+e.lineno+', Column: '+e.colno,
        'Stack: '+(e.error&&e.error.stack||'(no stack trace)'),
      ].join('\n');
      alert(errorText);
      console.error(errorText);
    });
  }
  /* body background */
  let wallpaper=helper.IMAGES['wallpaper.jpg'],
  logo=helper.IMAGES['logo.png'];
  wallpaper=wallpaper.match(/^http/i)?wallpaper:'./'+wallpaper;
  logo=logo.match(/^http/i)?logo:'./'+logo;
  document.body.style.backgroundImage='url("'+wallpaper+'")';
  /* wrapper */
  let Masjid=parent.MasjidFront,
  wrapper=helper.element('div',{
    'class':'wrapper',
  }).appendTo(document.body),
  /* header */
  h1=helper.element('h1')
    .text(helper.alias('app_vendor'))
    .appendTo(wrapper),
  addr=helper.element('p')
    .text(helper.alias('vendor_address'))
    .appendTo(wrapper),
  h3=helper.element('h3')
    .text(helper.alias('front_description'))
    .appendTo(wrapper),
  /* header */
  sbut=helper.element('div',{
    'class':'report',
  },[
    /* login button */
    helper.button('Login','blue','sign-in',function(){
      window.parent.appPage();
    }),
    /* print button */
    helper.button('Print','orange','print',function(){
      window.print();
    }),
  ]),
  /* image logo */
  logoImage=new Image,
  /* table wrapper */
  wrapTable=helper.element('div',{
    'class':'wrapper-table',
  }).appendTo(wrapper);
  logoImage.src=logo;
  logoImage.style.width='72px';
  h1.insertBefore(logoImage,h1.firstChild);
  /* months */
  let months=[
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  /* finance report */
  let fb=helper.firebase(),
  uid=helper.appNS,
  report=await fb.get('report',uid),
  reportDate=await fb.get('report',uid+'_date'),
  table=helper.table(),
  balance=0,
  totalIncome=0,
  totalOutcome=0,
  row=table.row(
    helper.alias('date'),
    helper.alias('note'),
    helper.alias('income'),
    helper.alias('outcome'),
    helper.alias('balance'),
  ).header();
  wrapTable.append(table);
  h3.innerHTML+=' &#8213; ';
  h3.append([
    months[reportDate.month],
    reportDate.year,
  ].join(' '));
  for(let line of report){
    let income=line.flow==1?helper.parseNominal(line.nominal,'id-ID','IDR'):'',
    outcome=line.flow==0?helper.parseNominal(line.nominal,'id-ID','IDR'):'',
    date=[
      line.year,
      (parseInt(line.month)+1).toString().padStart(2,'0'),
      line.date.toString().padStart(2,'0'),
    ].join('-');
    if(line.flow==1){
      balance+=parseInt(line.nominal,10);
      totalIncome+=parseInt(line.nominal,10);
    }else{
      balance-=parseInt(line.nominal,10);
      totalOutcome+=parseInt(line.nominal,10);
    }
    let row=table.row(
      helper.parseDate(date,'id-ID'),
      line.note,
      income,
      outcome,
      helper.parseNominal(balance,'id-ID','IDR'),
    );
    row.childNodes[2].classList.add('td-right');
    row.childNodes[3].classList.add('td-right');
    row.childNodes[4].classList.add('td-right');
  }
  row=table.row('','',
    helper.parseNominal(totalIncome,'id-ID','IDR'),
    helper.parseNominal(totalOutcome,'id-ID','IDR'),
    helper.parseNominal(totalIncome-totalOutcome,'id-ID','IDR'),
  ).header();
  
  wrapper.append(sbut);
  let dev=!helper.production?'-dev':'',
  adev=!Masjid.app.production?'-dev':'',
  pdev='https://github.com/9r3i',
  year=(new Date).getFullYear(),
  vendor=helper.alias('app_vendor'),
  hjson=helper.likeJSON(helper,3),
  text=[
    `Helper version ${helper.version}${dev}`,
    `Eva version ${helper.eva.version}`,
    `App version ${Masjid.app.version}${adev}`,
    `Version of ${helper.appVersion}`,
    ``,
  ].join('<br />'),
  pre=helper.element('pre',{'class':'classic'})
    .html(text);
  if(false){
    pre.appendTo(wrapper);
  }
  helper.element('div',{'class':'copyright'})
    .html(`Copyright &copy; ${year} &middot; ${vendor} &middot; All Right Reserved<br />Powered by <a href="${pdev}" target="_blank">9r3i</a>`)
    .appendTo(wrapper);
    
/* get helper */
function getHelper(){
  let keys=Object.keys(window.parent),
  uniqid=null;
  for(let key of keys){
    if(key.match(/^__helper/)){
      uniqid=key;
      break;
    }
  }
  let help=window.parent[uniqid];
  help.__uniqid=uniqid;
  return help;
}
})();



