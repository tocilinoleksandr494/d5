import {router} from './router.js';
import {msg} from './widgets/msg.js';
import {popup} from './widgets/popup.js';
import {header} from './widgets/header.js';
import {toogle} from './widgets/toogle.js';
import {img} from './widgets/img.js';
document.addEventListener('DOMContentLoaded', function(){
	const main = {
		data() {
			return {
				user:{name:"", phone:"", email:"", date:"",auth:""},
				formData:{},
				title:"",
				date:"",
				time:"",
				token:"",
				url:"https://affiliate.yanbasok.com"
			}
		},
		watch:{
			$route:function(){
				this.init();
			}
		},
		mounted:function(){
			this.init();
			this.token = document.querySelector('meta[name="csrf-token"]')?.content;
		},
		methods:{			
			init(){
				var self = this;
				if(window.localStorage.getItem('user')) self.user = JSON.parse(window.localStorage.getItem('user'));
				
				router.isReady().then(() => {
					if(window.localStorage.getItem("user")){
						self.user = JSON.parse(window.localStorage.getItem("user"));	
						if(self.$route['path']=='/' && self.user.type=='admin'){
							self.page('/campaigns');
						}else if(['/campaigns','/campaign','/users','/user'].includes(self.$route['path']) && self.user.type!='admin'){
							self.page('/statistics');
						}else if(['/statistics','/payments','/sites'].includes(self.$route['path']) && self.user.type=='admin'){
							self.page('/campaigns');
						}else if(['/campaigns','/campaign','/users','/user','/statistics','/payments','/sites'].includes(self.$route['path'])){				
							self.page();
						}else if(!['/campaigns','/campaign','/users','/user','/statistics','/payments','/sites'].includes(self.$route['path'])){				
							self.page();
						}
					}else{
						self.page('/');	
					}
				}); 
			},
			logout(){
				this.user = {name:"", phone:"", email:"", date:"",auth:""};	
				this.page('/');	
				window.localStorage.setItem('user','');	
			},
			scrollTop(){
				setTimeout(function(){
					window.scroll({
						top: 0,
						behavior: 'smooth'
					});	
				},50);
			},			
			scrollBottom(){
				setTimeout(function(){
					window.scroll({
						top: 1000,
						behavior: 'smooth'
					});	
				},50);
			},		
			page:function (path=""){		
				this.$router.replace(path);
				this.title=this.$route['name'];
				document.title=this.$route['name'];				
			},
			toFormData:function(obj){
				var fd = new FormData();

				for(var x in obj){
					if(typeof obj[x]==='object' && x != 'img' && x != 'copy'){
						for(var y in obj[x]){
							if(typeof obj[x]==='object'){
								for(var z in obj[x][y]){
									fd.append(x+'['+y+']['+z+']', obj[x][y][z]);
								}
							}else{
								fd.append(x+'['+y+']', obj[x][y]);
							}
						}
					}else if(x != 'copy'){
						fd.append(x, obj[x]);
					}
				}
			
				return fd;
			}			
		}
	};		
	
	var app = Vue.createApp(main)
	.use(router)
	.component('msg',msg)
	.component('popup',popup)
	.component('Header',header)
	.component('toogle',toogle)
	.component('Image',img)
	.mount('#content')
});



