Processor={TIMES_RATE:2,_WIDTH:640,_HEIGHT:480,WIDTH:800,HEIGHT:600,AREA_IN_ROW:50,AREA_IN_COL:50,initialized:!1,res:[!1,!1,!1],current:0,LEFT:156,RIGHT:176,TOP:121,BOTTOM:141,matrix:[],cloneMatrix:[],last:{up:0,right:0,down:0,left:0},makeArray:function(){var e=this.AREA_IN_ROW*this.AREA_IN_COL;for(var t=0;t<e;t++)this.matrix.push({index:t,sum:0})},makeGrid:function(e){for(var t=0;t<this.AREA_IN_COL;t++){var n=$("<tr>");for(var r=0;r<this.AREA_IN_ROW;r++)n.append($("<td></td>"));e.append(n)}},sortBubble:function(e){var t=e.length,n,r,i;for(n=t-1;n>=1;n--)for(r=0;r<=n-1;r++)if(e[r].sum<e[r+1].sum){i=e[r+1];e[r+1]=e[r];e[r]=i}return e},getPos:function(e,t){var n=this.WIDTH/this.AREA_IN_ROW,r=this.HEIGHT/this.AREA_IN_COL;return Math.floor(e/n)+this.AREA_IN_ROW*Math.floor(t/r)},collectData:function(e){var t=e.data;$.extend(!0,this.cloneMatrix,this.matrix);for(var n=0,r=t.length;n<r;n++)if(t[n]==0&&t[n+1]==0&&t[n+2]==0){var i=n/4,s=i%this.WIDTH,o=Math.floor(i/this.WIDTH),u=this.getPos(s,o);this.cloneMatrix[u].sum+=1}},handleData:function(){var e=this.WIDTH/this.AREA_IN_ROW,t=this.HEIGHT/this.AREA_IN_COL,n=e*t,r=[],i=[],s=1;this.cloneMatrix.sort(function(e,t){return t.sum-e.sum});var o=this.cloneMatrix[0];if(o.sum>=n*.6){o.selected=!0;r.push(o);i.push(o)}while(i.length){var u=i[0];s=u.start||1;i.shift();for(var a=s,f=this.cloneMatrix.length;a<f;a++){if(!(this.cloneMatrix[a].sum>=n*.6))break;var l=Math.abs(this.cloneMatrix[a].index-u.index);if(l==1||l==49||l==50||l==51){r.push(this.cloneMatrix[a]);if(this.cloneMatrix[a].sum==n&&!this.cloneMatrix[a].selected){this.cloneMatrix[a].selected=!0;this.cloneMatrix[a].start=a;i.push(this.cloneMatrix[a])}}else if(this.cloneMatrix[a].sum==n&&!this.cloneMatrix[a].selected){this.cloneMatrix[a].selected=!0;this.cloneMatrix[a].start=a;i.push(this.cloneMatrix[a])}}}this.selectRect(r)},selectRect:function(e){var t=1e4,n=-1,r=1e4,i=-1,s;for(var o=0,u=e.length;o<u;o++){var a=e[o].index%this.AREA_IN_ROW,f=Math.floor(e[o].index/this.AREA_IN_COL);a<r&&(r=a);a+1>i&&(i=a+1);f<t&&(t=f);f+1>n&&(n=f+1)}if(!e.length){t=this.last.up;i=this.last.right;n=this.last.down;r=this.last.left}else{this.last.up=t;this.last.right=i;this.last.down=n;this.last.left=r}this.calCenter([t,i,n,r])},calCenter:function(e){var t=this.WIDTH/this.AREA_IN_ROW,n=this.HEIGHT/this.AREA_IN_COL,r=e[0]*n,i=e[3]*t,s=(e[2]-e[0])*n/2,o=(e[1]-e[3])*t/2,u=r+s,a=i+o,f=document.getElementById("hammer");f.style.left=a+"px";f.style.top=u+"px"},isStop:function(e){var t=e.data,n=this._WIDTH*4,r=0,i=0,s=0,o=this.TOP*this.TIMES_RATE,u=this.BOTTOM*this.TIMES_RATE,a=this.LEFT*this.TIMES_RATE,f=this.RIGHT*this.TIMES_RATE;for(var l=o;l<u;l++){var c=n*(l-1);for(var h=a;h<f;h++){var p=c+(h-1)*4;t[p]==255&&t[p+1]==255&&t[p+2]==255?r+=1:t[p]==0&&t[p+1]==0&&t[p+2]==0&&(i+=1);s++}}return i/(i+r)>.98?!0:!1},takeColor:function(e){var t=e.data,n=this._WIDTH*4,r=0,i=0,s=0,o=0,u=0,a=0,f=0,l,c,h,p=this.TOP*this.TIMES_RATE,d=this.BOTTOM*this.TIMES_RATE,v=this.LEFT*this.TIMES_RATE,m=this.RIGHT*this.TIMES_RATE;for(var g=242;g<282;g++){var y=n*(g-1);for(var b=312;b<352;b++){var w=y+(b-1)*4,E=t[w],S=t[w+1],x=t[w+2];o+=E;u+=S;a+=x;f+=1}}l=Math.floor(o/f);c=Math.floor(u/f);h=Math.floor(a/f);return{r:l,g:c,b:h}},detectColor:function(e,t){var n;n=this.isStop(e);this.res[this.current]=n;this.current=(this.current+1)%3;if(this.res[0]&&this.res[1]&&this.res[2]){console.log(this.res);return this.takeColor(t)}return!1},startup:function(e){if(!this.initialized){this.makeArray();this.makeGrid($("#gridContainer"));this.initialized=!0}this.collectData(e);this.handleData()}};