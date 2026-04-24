import{a as S}from"./chunk-63PC2UKB.js";import{a as y,c as E,e as l}from"./chunk-525BCBMA.js";import{a as u,b as g,f as i}from"./chunk-K7RV5XX7.js";var b=(()=>{class s{constructor(t){this.db=t,this.transactionsSubject=new y([]),this.transactions$=this.transactionsSubject.asObservable()}loadByMonth(t,e){return i(this,null,function*(){yield this.db.ensureReady(),this.transactionsSubject.next(yield this.getByMonth(t,e))})}getByMonth(t,e){return i(this,null,function*(){yield this.db.ensureReady();let a=`${t}-${String(e).padStart(2,"0")}-01`,o=`${t}-${String(e).padStart(2,"0")}-31`;return((yield this.db.getDb().query(`SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.date BETWEEN ? AND ?
       ORDER BY t.date DESC, t.created_at DESC`,[a,o])).values??[]).map(this.rowToTransactionWithCategory)})}getRecent(t=5){return i(this,null,function*(){return yield this.db.ensureReady(),((yield this.db.getDb().query(`SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       ORDER BY t.date DESC, t.created_at DESC
       LIMIT ?`,[t])).values??[]).map(this.rowToTransactionWithCategory)})}getById(t){return i(this,null,function*(){yield this.db.ensureReady();let e=yield this.db.getDb().query(`SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,[t]);return e.values?.[0]?this.rowToTransactionWithCategory(e.values[0]):null})}addQuickEntry(t){return i(this,null,function*(){return this.create({amount:t.amount,description:t.description??null,categoryId:t.categoryId,date:t.date,isFixedCost:!1,fixedCostId:null})})}create(t){return i(this,null,function*(){yield this.db.ensureReady();let a=(yield this.db.getDb().run(`INSERT INTO transactions (amount, description, category_id, date, is_fixed_cost, fixed_cost_id)
       VALUES (?, ?, ?, ?, ?, ?)`,[t.amount,t.description,t.categoryId,t.date,t.isFixedCost?1:0,t.fixedCostId])).changes?.lastId;if(!a)throw new Error("Failed to create transaction");return g(u({},t),{id:a,createdAt:new Date().toISOString()})})}update(t,e){return i(this,null,function*(){yield this.db.ensureReady();let a=[],o=[];e.amount!==void 0&&(a.push("amount = ?"),o.push(e.amount)),e.description!==void 0&&(a.push("description = ?"),o.push(e.description)),e.categoryId!==void 0&&(a.push("category_id = ?"),o.push(e.categoryId)),e.date!==void 0&&(a.push("date = ?"),o.push(e.date)),a.length!==0&&(o.push(t),yield this.db.getDb().run(`UPDATE transactions SET ${a.join(", ")} WHERE id = ?`,o))})}delete(t){return i(this,null,function*(){yield this.db.ensureReady(),yield this.db.getDb().run("DELETE FROM transactions WHERE id = ?",[t]),this.transactionsSubject.next(this.transactionsSubject.value.filter(e=>e.id!==t))})}getMonthSummary(t,e){return i(this,null,function*(){yield this.db.ensureReady();let a=`${t}-${String(e).padStart(2,"0")}-01`,o=`${t}-${String(e).padStart(2,"0")}-31`,n=(yield this.db.getDb().query(`SELECT
         SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END) AS total_expenses,
         SUM(CASE WHEN c.type = 'income'  THEN t.amount ELSE 0 END) AS total_income,
         COUNT(*) AS tx_count
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.date BETWEEN ? AND ?`,[a,o])).values?.[0]??{},r=n.total_expenses??0,c=n.total_income??0;return{month:e,year:t,totalExpenses:r,totalIncome:c,balance:c-r,transactionCount:n.tx_count??0}})}getCategorySummary(t,e){return i(this,null,function*(){yield this.db.ensureReady();let a=`${t}-${String(e).padStart(2,"0")}-01`,o=`${t}-${String(e).padStart(2,"0")}-31`,n=(yield this.db.getDb().query(`SELECT c.id AS category_id, c.name AS category_name,
              c.color AS category_color, c.icon AS category_icon,
              SUM(t.amount) AS total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.date BETWEEN ? AND ? AND c.type = 'expense'
       GROUP BY c.id
       ORDER BY total DESC`,[a,o])).values??[],r=n.reduce((c,h)=>c+(h.total??0),0);return n.map(c=>({categoryId:c.category_id,categoryName:c.category_name,categoryColor:c.category_color,categoryIcon:c.category_icon,total:c.total,percentage:r>0?c.total/r*100:0}))})}rowToTransactionWithCategory(t){return{id:t.id,amount:t.amount,description:t.description,categoryId:t.category_id,date:t.date,isFixedCost:t.is_fixed_cost===1,fixedCostId:t.fixed_cost_id,createdAt:t.created_at,categoryName:t.category_name,categoryIcon:t.category_icon,categoryColor:t.category_color}}static{this.\u0275fac=function(e){return new(e||s)(l(S))}}static{this.\u0275prov=E({token:s,factory:s.\u0275fac,providedIn:"root"})}}return s})();export{b as a};
