const SHEET_FORM='Form_Responses', SHEET_DM='DMScan', SHEET_DATA='DU LIEU DATE';
function doPost(e){
 const lock=LockService.getScriptLock();
 try{
  lock.waitLock(30000);const p=e.parameter||{},upc=norm_(p.upc),staff=String(p.staff||'').trim(),loc=String(p.location||'').trim();
  if(!/^\d{13}$/.test(upc))throw Error('UPC phải gồm đúng 13 chữ số.');
  if(!staff||!loc)throw Error('Thiếu nhân viên hoặc vị trí.');
  const mfg=parseISO_(p.mfg),expiry=parseISO_(p.expiry),qty=Number(p.qty||0);
  if(!expiry)throw Error('Hạn sử dụng không hợp lệ.');
  if(!Number.isFinite(qty)||qty<0)throw Error('Số lượng không hợp lệ.');
  const ss=SpreadsheetApp.getActiveSpreadsheet(),fs=ss.getSheetByName(SHEET_FORM),dm=ss.getSheetByName(SHEET_DM),ds=ss.getSheetByName(SHEET_DATA);
  if(!fs||!dm||!ds)throw Error('Thiếu sheet Form_Responses, DMScan hoặc DU LIEU DATE.');
  const now=new Date(),action=String(p.action||''),notes=String(p.notes||''),fr=fs.getLastRow()+1;
  fs.getRange(fr,1,1,9).setValues([[now,staff,loc,upc,mfg||'',expiry,qty,action,notes]]);
  fs.getRange(fr,1).setNumberFormat('dd/MM/yyyy HH:mm:ss');fs.getRange(fr,5,1,2).setNumberFormat('dd/MM/yyyy');
  let name='',vendor='',matches=0;
  if(dm.getLastRow()>1){dm.getRange(2,1,dm.getLastRow()-1,Math.max(4,dm.getLastColumn())).getDisplayValues().forEach(r=>{if(norm_(r[1])===upc){matches++;if(!name)name=r[2]||'';if(!vendor)vendor=r[3]||''}})}
  let total='',remaining='',pct='',status='';
  if(mfg){total=Math.round((day_(expiry)-day_(mfg))/86400000);remaining=Math.round((day_(expiry)-day_(new Date()))/86400000);
   if(total<=0)status='CHƯA ĐỦ THÔNG TIN HSD';else if(remaining<0){pct=remaining/total;status='ĐÃ HẾT HẠN'}else{pct=remaining/total;status=pct<=.2?'RÚT KHỎI QUẦY':pct<=.4?'CẬN DATE':'BÌNH THƯỜNG'}
  }else status='CHƯA ĐỦ THÔNG TIN HSD';
  if(matches===0)status='CHƯA CÓ TRONG DANH MỤC';else if(matches>1)status='MÃ TRÙNG – KIỂM TRA DANH MỤC';
  ds.appendRow(['WEB-'+now.getTime()+'-'+fr,now,upc,name,vendor,staff,loc,mfg||'',expiry,qty,total,remaining,pct,status,action,notes]);
  const r=ds.getLastRow();ds.getRange(r,2).setNumberFormat('dd/MM/yyyy HH:mm:ss');ds.getRange(r,8,1,2).setNumberFormat('dd/MM/yyyy');ds.getRange(r,13).setNumberFormat('0.00%');
  setRedRule_(ds);
  return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
 }catch(err){console.error(err);return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err.message||err)})).setMimeType(ContentService.MimeType.JSON)}
 finally{try{lock.releaseLock()}catch(ignore){}}
}
function setRedRule_(sheet){
 const formula='=AND($M2<=0.2,$M2>=0,$N2="RÚT KHỎI QUẦY")',rules=sheet.getConditionalFormatRules();
 const exists=rules.some(rule=>{const c=rule.getBooleanCondition();return c&&c.getCriteriaType()===SpreadsheetApp.BooleanCriteria.CUSTOM_FORMULA&&c.getCriteriaValues()[0]===formula&&rule.getRanges().some(r=>r.getA1Notation()==='A2:P')});
 if(!exists){rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied(formula).setBackground('#f4cccc').setFontColor('#990000').setRanges([sheet.getRange('A2:P')]).build());sheet.setConditionalFormatRules(rules)}
}
function norm_(v){return String(v||'').replace(/\D/g,'').trim()}
function parseISO_(s){const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?new Date(+m[1],+m[2]-1,+m[3]):null}
function day_(v){const d=new Date(v);d.setHours(0,0,0,0);return d.getTime()}
