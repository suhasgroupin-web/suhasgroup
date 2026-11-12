(function(){
'use strict';
var $=function(s){return document.querySelector(s)}, $$=function(s){return Array.from(document.querySelectorAll(s))};
var employees=[], departments=[], shifts=[];
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function msg(t,ok){var n=$('#notice');n.textContent=t;n.style.display='block';n.style.background=ok?'#e7f6ec':'#fdecea';n.style.color=ok?'#1b6b3a':'#a5321f'}
function val(f,n){return f.elements[n].value}
function formObj(f){return Object.fromEntries(new FormData(f).entries())}
function today(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function table(rows,cols,actions){if(!rows||!rows.length)return '<p class="muted">No records yet.</p>';return '<table><thead><tr>'+cols.map(c=>'<th>'+c[1]+'</th>').join('')+(actions?'<th>Action</th>':'')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+cols.map(c=>'<td>'+esc(c[2](r))+'</td>').join('')+(actions?'<td>'+actions(r)+'</td>':'')+'</tr>').join('')+'</tbody></table>'}
async function query(name,opts){var q=sb.from(name).select('*');if(opts&&opts.order)q=q.order(opts.order,{ascending:false});var r=await q; if(r.error)throw r.error;return r.data||[]}
function selectOptions(){var opts='<option value="">Select employee</option>'+employees.map(e=>'<option value="'+esc(e.id)+'">'+esc(e.employee_code+' — '+e.full_name)+'</option>').join('');$$('.employee-options').forEach(s=>s.innerHTML=opts);$('#employee-dept').innerHTML='<option value="">No department</option>'+departments.map(d=>'<option value="'+d.id+'">'+esc(d.name)+'</option>').join('');$('#shift-options').innerHTML=shifts.map(s=>'<option value="'+s.id+'">'+esc(s.name+' ('+s.start_time+'–'+s.end_time+')')+'</option>').join('')}
async function loadAll(){
 var results=await Promise.all([query('hr_departments',{order:'name'}),query('hr_employees',{order:'created_at'}),query('hr_shifts',{order:'name'})]);
 departments=results[0];employees=results[1];shifts=results[2];selectOptions();
 $('#employees-table').innerHTML=table(employees,[['employee_code','ID',r=>r.employee_code],['full_name','Name',r=>r.full_name],['designation','Designation',r=>r.designation],['employment_status','Status',r=>r.employment_status]],r=>'<button class="act" data-deactivate="'+r.id+'">'+(r.employment_status==='active'?'Deactivate':'Activate')+'</button>');
 var ats=await query('hr_attendance',{order:'attendance_date'});
 $('#attendance-table').innerHTML=table(ats.slice(-100).reverse(),[['attendance_date','Date',r=>r.attendance_date],['employee_id','Employee',r=>empName(r.employee_id)],['status','Status',r=>r.status],['check_in','In',r=>r.check_in?new Date(r.check_in).toLocaleTimeString():'—'],['check_out','Out',r=>r.check_out?new Date(r.check_out).toLocaleTimeString():'—']]);
 var leaves=await query('hr_leave_requests',{order:'created_at'});
 $('#leave-table').innerHTML=table(leaves.reverse(),[['employee_id','Employee',r=>empName(r.employee_id)],['leave_type','Type',r=>r.leave_type],['start_date','From',r=>r.start_date],['end_date','To',r=>r.end_date],['status','Status',r=>r.status]],r=>r.status==='pending'?'<button class="act" data-leave="'+r.id+'" data-state="approved">Approve</button><button class="act danger" data-leave="'+r.id+'" data-state="rejected">Reject</button>':'—');
 var payroll=await query('hr_payroll',{order:'pay_period_start'});
 $('#payroll-table').innerHTML=table(payroll.reverse(),[['employee_id','Employee',r=>empName(r.employee_id)],['pay_period_start','Period start',r=>r.pay_period_start],['net_salary','Net salary',r=>'৳ '+Number(r.net_salary).toLocaleString()],['payment_status','Status',r=>r.payment_status]],r=>r.payment_status!=='paid'?'<button class="act" data-paid="'+r.id+'">Mark paid</button>':'Paid');
 var roster=await sb.from('hr_employee_shifts').select('*,hr_shifts(name,start_time,end_time)').order('work_date',{ascending:false});
 if(roster.error)throw roster.error;
 $('#shifts-table').innerHTML='<h3>Shift definitions</h3>'+table(shifts,[['name','Shift',r=>r.name],['start_time','Start',r=>r.start_time],['end_time','End',r=>r.end_time],['break_minutes','Break (min)',r=>r.break_minutes]])+'<h3>Assigned roster</h3>'+table((roster.data||[]),[['work_date','Date',r=>r.work_date],['employee_id','Employee',r=>empName(r.employee_id)],['shift_id','Shift',r=>r.hr_shifts?r.hr_shifts.name:'—']]);
 $('#report-stats').innerHTML=[['Employees',employees.filter(e=>e.employment_status==='active').length],['Departments',departments.length],['Shifts',shifts.length],['Pending leave',leaves.filter(x=>x.status==='pending').length],['Attendance rows',ats.length],['Payroll entries',payroll.length]].map(x=>'<div class="stat"><b>'+x[1]+'</b><span>'+x[0]+'</span></div>').join('');
 $('#report-tables').innerHTML='<h3>Department directory</h3>'+table(departments,[['name','Department',r=>r.name],['description','Description',r=>r.description||'—']]);
}
function empName(id){var e=employees.find(x=>x.id===id);return e?e.employee_code+' — '+e.full_name:'Unknown'}
async function submit(form,tableName,transform,success){form.addEventListener('submit',async function(e){e.preventDefault();var b=form.querySelector('button[type=submit],button:not([type])');if(b)b.disabled=true;try{var data=formObj(form);if(transform)data=transform(data);var r=await sb.from(tableName).insert(data);if(r.error)throw r.error;form.reset();msg(success,true);await loadAll()}catch(err){msg(err.message||'Could not save record',false)}finally{if(b)b.disabled=false}})}
async function start(){
 try{
  var u=await sb.auth.getUser();if(!u.data.user){location.replace('login.html?next='+encodeURIComponent('hrm.html'));return}
  var a=await sb.rpc('is_admin');if(a.error)throw new Error('Admin role verification failed: '+a.error.message);
  if(a.data!==true){$('#gate').innerHTML='<h2>Access restricted</h2><p>This HRM workspace is available to approved OWNER/ADMIN accounts only.</p><a class="btn btn-primary" href="app.html">Main menu</a>';return}
  await loadAll();$('#gate').classList.remove('active');$('#gate').classList.add('hrm-hidden');$('#dashboard').classList.remove('hrm-hidden');
  submit($('#employee-form'),'hr_employees',d=>{if(!d.department_id)delete d.department_id;if(!d.joining_date)delete d.joining_date;return d},'Employee added');
  submit($('#dept-form'),'hr_departments',null,'Department added');
  submit($('#attendance-form'),'hr_attendance',d=>{var now=new Date();if(d.check_in)d.check_in=d.attendance_date+'T'+d.check_in+':00';else delete d.check_in;if(d.check_out)d.check_out=d.attendance_date+'T'+d.check_out+':00';else delete d.check_out;if(!d.notes)delete d.notes;return d},'Attendance saved');
  submit($('#leave-form'),'hr_leave_requests',d=>d,'Leave request submitted');
  submit($('#payroll-form'),'hr_payroll',d=>{['basic_salary','allowances','deductions'].forEach(k=>d[k]=Number(d[k]||0));return d},'Payroll created');
  submit($('#shift-form'),'hr_shifts',d=>{d.break_minutes=Number(d.break_minutes||0);return d},'Shift created');
  submit($('#roster-form'),'hr_employee_shifts',d=>d,'Shift assigned');
 }catch(e){$('#gate').innerHTML='<h2>HRM setup required</h2><p>'+esc(e.message)+'</p><p>Confirm the HRM database migration has been run in Supabase SQL Editor and that your account has OWNER or ADMIN access.</p><a class="btn btn-outline" href="app.html">Main menu</a>';msg('HRM could not initialize. '+e.message,false)}
}
$$('[data-panel]').forEach(b=>b.addEventListener('click',function(){ $$('.hrm-panel').forEach(p=>p.classList.remove('active'));$('#panel-'+b.dataset.panel).classList.add('active');window.scrollTo({top:0,behavior:'smooth'})}));
$$('[data-back]').forEach(b=>b.addEventListener('click',function(){$$('.hrm-panel').forEach(p=>p.classList.remove('active'))}));
document.addEventListener('click',async function(e){var b=e.target.closest('button');if(!b)return;try{
 if(b.dataset.deactivate){var emp=employees.find(x=>x.id===b.dataset.deactivate);var r=await sb.from('hr_employees').update({employment_status:emp.employment_status==='active'?'inactive':'active'}).eq('id',emp.id);if(r.error)throw r.error;msg('Employee status updated',true);await loadAll()}
 if(b.dataset.leave){var r=await sb.from('hr_leave_requests').update({status:b.dataset.state,reviewed_at:new Date().toISOString()}).eq('id',b.dataset.leave);if(r.error)throw r.error;msg('Leave request '+b.dataset.state,true);await loadAll()}
 if(b.dataset.paid){var r=await sb.from('hr_payroll').update({payment_status:'paid',paid_at:new Date().toISOString()}).eq('id',b.dataset.paid);if(r.error)throw r.error;msg('Payroll marked paid',true);await loadAll()}
 }catch(err){msg(err.message||'Action failed',false)}});
$('#refresh').addEventListener('click',async function(){try{await loadAll();msg('HRM data refreshed',true)}catch(e){msg(e.message,false)}});
start();
})();