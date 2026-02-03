export const campaigns = {
	data:function() {
		return  {
			parent:"",
			data:{},
			details:{},
			date:"",
			date2:"",
			q:"",
			sort:"",
			loader:1,
			iChart:-1,
			id:0,
			type:0,
			all:true
		}
	},
	mounted:function(){
		this.parent = this.$parent.$parent;
		this.parent.formData.date="";
		this.parent.formData.date2="";
		if(!this.parent.user){
			this.parent.logout();
		}
		//this.$refs.msg.successFun("Successfully updated campaign!");

		this.get();	
		//this.GetFirstAndLastDate();
	},
	methods:{
		GetFirstAndLastDate:function(){
			var year = new Date().getFullYear();
			var month = new Date().getMonth();
			var firstDayOfMonth = new Date(year, month, 2);
			var lastDayOfMonth = new Date(year, month+1, 1);
			
			this.date = firstDayOfMonth.toISOString().substring(0, 10);
			this.date2 = lastDayOfMonth.toISOString().substring(0, 10);
		},
		get:function(){
			var self = this;
			var data = self.parent.toFormData(self.parent.formData);
			if(this.date!="") data.append('date',this.date);
			if(this.date2!="") data.append('date2',this.date2);
			self.loader=1;
			axios.post(this.parent.url+"/site/getCampaigns?auth="+this.parent.user.auth,data).then(function(response){
				self.data = response.data;		
				self.loader = 0;	
				if(self.iChart!=-1) self.line(self.data.items[self.iChart]);	
			}).catch(function(error){
				console.log(error);
				self.parent.logout();
			});				
		},
		getDetails:function(campaign=false,type=false){
			this.details = {};
			if(campaign) this.id=campaign;
			if(type) this.type=type;
			if(this.id) campaign=this.id;
			if(this.type) type=this.type;		
			var self = this;
			var data = self.parent.toFormData(self.parent.formData);
			if(this.date!="") data.append('date',this.date);
			if(this.date2!="") data.append('date2',this.date2);
			if(this.q!="") data.append('q',this.q);
			if(this.sort!="") data.append('sort',this.sort);
			if(campaign!="") data.append('campaign',campaign);
			if(type!="") data.append('type',type);
			self.loader=1;
			axios.post(this.parent.url+"/site/getStatisticsDetails?auth="+this.parent.user.auth,data).then(function(response){
				self.details = response.data;		
				self.loader = 0;		
			}).catch(function(error){
				console.log(error);
				self.parent.logout();
			});				
		},	
		getCampaignChart:function(){

			var self = this;
			var data = self.parent.toFormData(self.parent.formData);
			if(this.date!="") data.append('date',this.date);
			if(this.date2!="") data.append('date2',this.date2);
			if(this.q!="") data.append('q',this.q);
			if(this.sort!="") data.append('sort',this.sort);


			self.loader=1;
			axios.post(this.parent.url+"/site/getCampaignChart?auth="+this.parent.user.auth,data).then(function(response){
				self.parent.formData.views = response.data.items.views;
				self.parent.formData.clicks = response.data.items.clicks;
				/*if(response.data.items.leads) self.parent.formData.leads = response.data.items.leads;
				if(response.data.items.fclicks) self.parent.formData.fclicks = response.data.items.fclicks;*/
				self.parent.formData.line = response.data.items.line;
				self.parent.formData.sites = response.data.items.sites;	
				self.line(response.data.items);	
				self.loader = 0;		
			}).catch(function(error){
				console.log(error);
				self.parent.logout();
			});				
		},	
		action:function(){
			var self = this;
			self.parent.formData.copy = "";
			var data = self.parent.toFormData(self.parent.formData);
			axios.post(this.parent.url+"/site/actionCampaign?auth="+this.parent.user.auth,data).then(function(response){
				self.$refs.new.active=0;
				if(self.parent.formData.id){
					self.$refs.header.$refs.msg.successFun("Successfully updated campaign!");
				}else{
					self.$refs.header.$refs.msg.successFun("Successfully added new campaign!");
				}
				
				self.get();			
			}).catch(function(error){
				console.log(error);
				self.parent.logout();
			});				
		},	
		del:async function () {
			if(await this.$refs.header.$refs.msg.confirmFun("Please confirm next action","Do you want to delete this campaign?")){
				var self = this;
				var data = self.parent.toFormData(self.parent.formData);
				axios.post(this.parent.url+"/site/deleteCampaign?auth="+this.parent.user.auth,data).then(function(response){
					self.$refs.header.$refs.msg.successFun("Successfully deleted campaign!");
					self.get();			
				}).catch(function(error){
					console.log(error);
					self.parent.logout();
				});		
			}		
		},	
		line:function(item){
			setTimeout(function(){
				let dates = [];
				let clicks = [];
				let views = [];
				let leads = [];
				if(item && item['line']){
					for(let i in item['line']){
						dates.push(i);
						//if(item[i].include=='true'){
							clicks.push(item['line'][i].clicks);
							views.push(item['line'][i].views);
							leads.push(item['line'][i].leads);
						//}
					}
				}			
				//console.log(clicks,views);

				document.getElementById('chartOuter').innerHTML = '<div id="chartHints"><div class="chartHintsViews">Views</div><div class="chartHintsClicks">Clicks</div></div><canvas id="myChart"></canvas>';
				const ctx = document.getElementById('myChart');
				const xScaleImage = {
					id:"xScaleImage",
					afterDatasetsDraw(chart,args,plugins){
						const {ctx,data, chartArea:{bottom}, scales:{x}} = chart;
						ctx.save();
						data.images.forEach((image,index) => {
							const label = new Image();
							label.src = image;
							
							const width = 120;
							ctx.drawImage(label,x.getPixelForValue(index)-(width/2 ),x.top,width,width);
						});
					}
				}
				new Chart(ctx, {
					type: 'line',
					//plugins:[xScaleImage],
					
					data: {
						labels: dates,
						//images:images,
						datasets: [
							{
								label: "Clicks",
								backgroundColor: "#00599D",
								borderColor: "#00599D",
								data: clicks
							},
							{
								label: "Views",
								backgroundColor: "#5000B8",
								borderColor: "#5000B8",
								data: views,
								//yAxisID: 'y2'
							},
						]
					},				
					options: {
						responsive: true,
						plugins:{
							tooltip: {
								bodyFontSize: 20,
								usePointStyle:true,
								callbacks: {
									title: (ctx) => {						
									  return ctx[0]['dataset'].label
									},
								}
							},														
							legend:{
								display:false
							}
						},					
						categoryPercentage :0.2,
						barPercentage: 0.8,
						//barThickness: 30,
						scales:{	
							y: {
								id: 'y2',
								position: 'right'
							},								
							x:{
								afterFit: (scale) => {
									scale.height = 120;
								}
							}
						}
					},
									
				});
			},100);
		},
		checkAll:function(prop){	
			if(this.parent.formData.sites){
				for(let i in this.parent.formData.sites){
					this.parent.formData.sites[i].include = prop;
					
				}
			}
			//this.parent.formData.sites = this.data.items[this.iChart];
			this.getCampaignChart();
		}			
	},		
	template: `
	<div class="inside-content">
		<Header ref="header" />
		<div id='spinner' v-if="loader"></div>
		<div class="wrapper">	
			<div class="flex panel">
				<div class="w20 ptb30">
					<h1>Campaigns</h1>
				</div>
				<div class="w60 ptb20 ac"><input type="date" v-model="date" @change="get()" /> - <input type="date" v-model="date2" @change="get()" /></div>
				<div class="w20 al ptb20">
					<a class="btnS" href="#" @click.prevent="parent.formData={};$refs.new.active=1"><i class="fas fa-plus"></i> New</a>
				</div>
			</div>	
			<popup ref="chart" fullscreen="true" title="Chart">
				<div class="flex panel">
					<div class="w30 ptb25"><input type="date" v-model="date" @change="getCampaignChart();" /> - <input type="date" v-model="date2" @change="getCampaignChart();" /></div>
					<div class="w70 al">
						<div class="flex cubes" v-if="parent.formData">
							<div class="w30 clicks">
								<div>Clicks</div>
								{{parent.formData.clicks}}
							</div>
							<div class="w30 views">
								<div>Views</div>
								{{parent.formData.views}}
							</div>		
							<div class="w30 leads">
								<div>Leads</div>
								{{parent.formData.leads}}
							</div>	
							<div class="w30 ctr">
								<div>CTR</div>
								<span v-if="parent.formData.clicks && parent.formData.views">{{(parent.formData.clicks*100/parent.formData.views).toFixed(2)}} %</span>
								<span v-if="!parent.formData.clicks || !parent.formData.views">0.00 %</span>
							</div>																					
						</div>
					</div>
				</div>	
				<div class="flex body" v-if="parent.formData.line">
					<div class="w30 ar filchart">
						<div class="itemchart ptb10" v-if="all">
							<toogle :modelValue="all" @update:modelValue="all = $event;checkAll($event)" />
							All
						</div>					
						<div class="itemchart ptb10" v-if="parent.formData.sites" v-for="s in parent.formData.sites">				
							<toogle :modelValue="s.include" @update:modelValue="s.include = $event;getCampaignChart()" />
							{{s.site}} (Views: {{s.views}}, Clicks:{{s.clicks}})
						</div>	
					</div>				
					<div class="w70" id="chartOuter">
						<div id="chartHints">
							<div class="chartHintsViews">Views</div>
							<div class="chartHintsClicks">Clicks</div>						
						</div>
						<canvas id="myChart"></canvas>
					</div>
			
				</div>
			</popup>			
			<popup ref="new" :title="(parent.formData && parent.formData.id) ? 'Edit campaign' : 'New campaign'">
				<div class="form inner-form">
					<form @submit.prevent="action()" v-if="parent.formData">
						<div class="row">
							<label>Name</label>
							<input type="text" v-model="parent.formData.title" required>
						</div>
							
						<div class="row">
							<button class="btn" v-if="parent.formData && parent.formData.id">Edit</button>
							<button class="btn" v-if="parent.formData && !parent.formData.id">Add</button>
						</div>							
					</form>
				</div>
			</popup>

			<popup ref="details" fullscreen="true" title="Details">
				<div class="flex panel">
					<div class="w60 "><input type="text" placeholder="Search..." v-model="q" @keyup="getDetails()" /> <input type="date" v-model="date" @change="getDetails()" /> - <input type="date" v-model="date2" @change="getDetails()" /></div>
					<div class="w40 al">
					</div>
				</div>	
				<br>
				<div class="table">
					<table v-if="details!=''">
						<thead>
							<tr>
								<th class="id">#</th>
								<th>Type</th>
								<th>
									IP 
									<i class="fas fa-caret-up" @click="sort='s.ip';getDetails();" v-if="sort==''"></i>
									<i class="fas fa-caret-down" @click="sort='';getDetails();" v-if="sort=='s.ip'" :class="{green:sort=='s.ip'}"></i>
								</th>
								<th class="id">Date</th>
								<th class="id">Site</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(item,i) in details">
								<td class="id">{{item.id}}</td>
								<td>
									<template v-if="item.type==1">Views</template>		
									<template v-if="item.type==2">Clicks</template>	
									<template v-if="item.type==3">Leads</template>	
									<template v-if="item.type==4">Fraud clicks</template>				
								</td>							
								<td>
									{{item.ip}}						
								</td>
								<td>
									{{item.date}}						
								</td>	
								<td>
									{{item.site}}						
								</td>													
							</tr>
						</tbody>					
					</table>
					<div class="empty" v-if="details==''">
						No items
					</div>					
				</div>
			</popup>			

			<div class="table" v-if="data.items!=''">
				<table>
					<thead>
						<tr>
							<th class="id">#</th>
							<th class="id"></th>
							<th>Title</th>
							<th class="id">Views</th>
							<th class="id">Clicks</th>
							<th class="id">Leads</th>
							<th class="id">Fraud clicks</th>						
							<th class="actions">Actions</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(item,i) in data.items">
							<td class="id">{{item.id}}</td>
							<td class="id">
								<toogle :modelValue="item.published" @update:modelValue="item.published = $event;parent.formData = item;action();" />
							</td>
							<td><router-link :to="'/campaign/'+item.id">{{item.title}}</router-link></td>
							<td class="id">
								<a href="#" @click.prevent="$refs.details.active=1;getDetails(item.id,1)">
									{{item.views}}	
								</a>					
							</td>
							<td class="id">
								<a href="#" @click.prevent="$refs.details.active=1;getDetails(item.id,2)">
									<template v-if="item.clicks">{{item.clicks}}</template>	
									<template v-if="!item.clicks">0</template>	
								</a>							
							</td>	
							<td class="id">
								<a href="#" @click.prevent="$refs.details.active=1;getDetails(item.id,3)">
									<template v-if="item.leads">{{item.leads}}</template>	
									<template v-if="!item.leads">0</template>	
								</a>						
							</td>	
							<td class="id">
								<a href="#" @click.prevent="$refs.details.active=1;getDetails(item.id,4)">
									<template v-if="item.fclicks">{{item.fclicks}}</template>	
									<template v-if="!item.fclicks">0</template>	
								</a>						
							</td>																
							<td class="actions">
								<router-link :to="'/campaign/'+item.id">
									<i class="fas fa-edit"></i>
								</router-link>
								<a href="#" @click.prevent="parent.formData = item;$refs.chart.active=1;getCampaignChart()">
									<i class="fas fa-chart-bar"></i>
								</a>								
								<a href="#" @click.prevent="parent.formData = item;del();">
									<i class="fas fa-trash-alt"></i>
								</a>							
							</td>
						</tr>
					</tbody>					
				</table>
			</div>
			<div class="empty" v-if="data.items==''">
				No items
			</div>		
		</div>	
	</div>	
`};		


