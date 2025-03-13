/**
 * MasjidFinance
 * ~ one of masjid app division
 */
;function MasjidFinance(){
const _MasjidFinance=this;
this.months=[
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
this.kmonth=[31,28,31,30,31,30,31,31,30,31,30,31];
this.menus=function(){
  return [
    {
      name:'Dashboard',
      icon:"dashboard",
      callback:function(){
        _MasjidFinance.dashboard();
      },
    },
    {
      name:'Report',
      icon:"wpforms",
      callback:function(){
        _MasjidFinance.report();
      },
    },
  ];
};
this.dashboard=async function(){
  this.helper.main.loader();
  let year=(new Date).getFullYear(),
  month=(new Date).getMonth(),
  query='select * from finance where year='+year
    +' and month='+month+' order by date asc',
  data=await this.helper.request('query',query),
  table=this.helper.table(),
  totalCredit=0,
  totalDebt=0,
  row=table.head([
    this.months[month],
    year,
  ].join(' ')),
  view=this.helper.button(
    this.helper.alias('view_detail'),
    'blue','search',function(){
      _MasjidFinance.report();
    }
  );
  table.classList.add('table-register');
  row=table.row('');
  row.childNodes[0].setAttribute('colspan',2);
  this.helper.main.put('Dashboard',this.helper.element('div',{
    'class':'',
  },[table,view]));
  for(let line of data){
    if(line.flow==1){
      totalCredit+=parseInt(line.nominal,10);
    }else{
      totalDebt+=parseInt(line.nominal,10);
    }
  }
  row=table.row(
    this.helper.alias('total_credit_monthly'),
    this.helper.alias('total_debt_monthly'),
  ).header();
  row=table.row(
    this.helper.parseNominal(
      totalCredit,
      Masjid.app.config('formatMoney'),
      Masjid.app.config('currency')
    ),
    this.helper.parseNominal(
      totalDebt,
      Masjid.app.config('formatMoney'),
      Masjid.app.config('currency')
    )
  );
  for(let i=0;i<row.childNodes.length;i++){
    row.childNodes[i].classList.add('td-center');
    row.childNodes[i].style.fontWeight='bold';
    row.childNodes[i].style.lineHeight='50px';
  }
  row=table.row(
    this.helper.alias('total_balance_monthly'),
  ).header();
  row.childNodes[0].setAttribute('colspan',2);
  row=table.row(
    this.helper.parseNominal(
      totalCredit-totalDebt,
      Masjid.app.config('formatMoney'),
      Masjid.app.config('currency')
    )
  );
  row.childNodes[0].setAttribute('colspan',2);
  for(let i=0;i<row.childNodes.length;i++){
    row.childNodes[i].classList.add('td-center');
    row.childNodes[i].style.fontWeight='bold';
    row.childNodes[i].style.lineHeight='50px';
  }
};
this.reportEdit=async function(id=0){
  this.helper.main.loader();
  let def={
    note:'',
    flow:0,
    nominal:0,
    year:(new Date).getFullYear(),
    month:(new Date).getMonth(),
    date:(new Date).getDate(),
  },
  query='select * from finance where id='+id,
  datas=id==0?[def]:await this.helper.request('query',query),
  table=this.helper.table(),
  save=this.helper.button('Save','blue','save',async function(){
    let loader=this.helper.loader(),
    fdata=this.helper.formSerialize(),
    date=fdata.date.split('-');
    fdata.year=date[0];
    fdata.month=parseInt(date[1])-1;
    fdata.date=parseInt(date[2]);
    let innerQuery=this.helper.buildQuery(fdata),
    query=this.dataset.id==0
      ?'insert into finance '+innerQuery
      :'update finance ('+innerQuery+') where id='+this.dataset.id,
    res=await this.helper.request('query',query);
    loader.remove();
    if(res!=1){
      await this.helper.alertX('Error: Failed to save report.',res,'error');
    }
    _MasjidFinance.report();
  },{id}),
  del=this.helper.button('Delete','red','trash',async function(){
    let yes=await this.helper.confirmX('Delete this report?');
    if(!yes){return;}
    let loader=this.helper.loader(),
    query='delete from finance where id='+this.dataset.id,
    res=await this.helper.request('query',query);
    loader.remove();
    if(res!=1){
      await this.helper.alertX('Error: Failed to delete report.',res,'error');
    }
    _MasjidFinance.report();
  },{id}),
  section=this.helper.element('div',{
    'class':'section row-buttons',
  },[save,id==0?'':del]),
  double=this.helper.main.double(table,section);
  this.helper.main.put(
    (id==0?'Add':'Edit')+' Report '+(id==0?'':'#'+id),
    double,
  );
  if(datas.length<1){
    return this.helper.alert('Error: Data is not found!','','error');
  }
  let data=datas[0],
  passes=['id','time','year','month'];
  for(let key in data){
    if(passes.indexOf(key)>=0){
      continue;
    }
    let value=data[key],
    alias=this.helper.alias(key),
    val=this.helper.input(key,value,'text',alias+'...');
    if(key=='nominal'){
      val.type='number';
      val.setAttribute('maxlength',10);
    }else if(key=='date'){
      val=this.helper.dateSelection({
        id:'date',
        key:key,
        value:[
          data.year,
          (parseInt(data.month)+1).toString().padStart(2,'0'),
          data.date.toString().padStart(2,'0'),
        ].join('-'),
      });
    }else if(key=='flow'){
      val=this.helper.radioActive(key,value,['Outcome','Income']);
    }
    let row=table.row(alias,val);
  }
};
this.report=async function(year,month){
  this.helper.main.loader();
  year=year||(new Date).getFullYear();
  month=!isNaN(parseInt(month))?parseInt(month):(new Date).getMonth();
  let query='select * from finance where year='+year
    +' and month='+month+' order by date asc',
  data=await this.helper.request('query',query),
  table=this.helper.table(),
  add=this.helper.button('Add','green','plus',function(){
    _MasjidFinance.reportEdit();
  }),
  send=this.helper.button('Send','blue','send',async function(){
    let yes=await this.helper.confirmX('Send report to front page?');
    if(!yes){return;}
    let loader=this.helper.loader(),
    fb=this.helper.firebase(true),
    login=await fb.autoLogin(),
    uid=this.helper.appNS,
    send=await fb.set('report',uid,this.data),
    sendDate=await fb.set('report',uid+'_date',{
      year:this.dataset.year,
      month:this.dataset.month,
    }),
    receive=await fb.get('report',uid),
    report=this.helper.likeJSON(receive,3);
    loader.remove();
    this.helper.alert(
      'Sent!',
      'Report successfully sent to front page.',
      'success'
    );
  },{year,month}),
  totalCredit=0,
  totalDebt=0,
  balance=0,
  row=table.row(
    this.helper.alias('ID'),
    this.helper.alias('date'),
    this.helper.alias('note'),
    this.helper.alias('credit'),
    this.helper.alias('debt'),
    this.helper.alias('balance'),
    add,
  ).header();
  send.data=data;
  this.helper.main.put(
    'Finance Report &#8213; '+this.months[month]+' '+year,
    this.helper.element('div',{
      'class':'report',
    },[
      this.helper.button('Print','orange','print',function(){
        window.print();
      }),
      send,
      this.helper.select(
        'month',
        month,
        this.helper.arrayToObject(this.months),
        function(){
          _MasjidFinance.report(
            this.dataset.year,
            this.value,
          );
        },
        {year}
      ),
      this.helper.select(
        'year',
        year,
        this.helper.getYears(),
        function(){
          _MasjidFinance.report(
            this.value,
            this.dataset.month,
          );
        },
        {month}
      ),
      table,
    ]),
  );
  for(let line of data){
    if(line.flow==1){
      balance+=parseInt(line.nominal,10);
    }else{
      balance-=parseInt(line.nominal,10);
    }
    let credit=line.flow==1
      ?this.helper.parseNominal(
        line.nominal,
        Masjid.app.config('formatMoney'),
        Masjid.app.config('currency')
      ):'',
    debt=line.flow==0
      ?this.helper.parseNominal(
        line.nominal,
        Masjid.app.config('formatMoney'),
        Masjid.app.config('currency')
      ):'',
    edit=this.helper.button('Edit','blue','edit',function(){
      _MasjidFinance.reportEdit(this.dataset.id);
    },{id:line.id}),
    row=table.row(
      line.id,
      line.date,
      line.note,
      credit,
      debt,
      this.helper.parseNominal(
        balance,
        Masjid.app.config('formatMoney'),
        Masjid.app.config('currency')
      ),
      edit,
    );
    row.childNodes[0].classList.add('td-center');
    row.childNodes[1].classList.add('td-center');
    row.childNodes[3].classList.add('td-right');
    row.childNodes[4].classList.add('td-right');
    row.childNodes[5].classList.add('td-right');
    if(line.flow==1){
      totalCredit+=parseInt(line.nominal,10);
    }else{
      totalDebt+=parseInt(line.nominal,10);
    }
  }
  row=table.row(
    '',
    '',
    'Total',
    this.helper.parseNominal(
      totalCredit,
      Masjid.app.config('formatMoney'),
      Masjid.app.config('currency')
    ),
    this.helper.parseNominal(
      totalDebt,
      Masjid.app.config('formatMoney'),
      Masjid.app.config('currency')
    ),
    this.helper.parseNominal(
      totalCredit-totalDebt,
      Masjid.app.config('formatMoney'),
      Masjid.app.config('currency')
    ),
    '',
  ).header();
  row.childNodes[2].classList.add('td-right');
  row.childNodes[3].classList.add('td-right');
  row.childNodes[4].classList.add('td-right');
};
};


