/**
 * 选择sku的模块
 * 本模块只写了购买的事件，未添加加入购物车
*/
var sku, skuid, num_iid, report_discount = 1, 
	sina_uid, oauthUrl, viewer = '',
	prd_discount = window.discount;
	
var propertie1 = '', //类似于颜色
	propertie2 = '', //类似于尺码
	propertie3 = ''; //备注
	
var buynum = 1, //购买数量
	sku_quantity = -1, //某组sku库存
	prd_quantity, //总库存
	unsale, wbulk, is_presell,
	oldprice;

var scrollsku, wheight = wheight || $(window).height(),
	mheight = wheight*0.8 - 120;

$(document).ready(function(){
	//sku关闭
	$(".j_closeBotm").click(function(){
		hideLayer('#J_sku', 'slideUpAnim');
	});
	//sku展开
	var oldid = "", prdid = "";
	$('body').delegate('.ywk-diybuy', 'click', function(e){
		var self=$(this);
		prdid = self.attr("prdid");
		if(prdid != oldid){
			My.showLoad("稍等...");
			addSku(prdid, "", callBack);
			function callBack(){
				oldid = prdid;
				showLayer('#J_sku', 'slideUpAnim');
				if($("#skuScroll").height() > mheight){
					$("#skuScroll").css("height", mheight);
					scrollsku = new iScroll('skuScroll');
					$("#J_sku").unbind("touchmove", stopProp);
				}else{
					$("#J_sku").bind("touchmove", stopProp);
				}
				setTimeout(My.hideLoad, 300);
			}
		}else{
			showLayer('#J_sku', 'slideUpAnim');
		}
	});

	//改变数量 -
	$(".btn_minus").click(function(){
		var num = $("#buy_num").val();
			num = parseFloat(num);
		if(num == 1){
			My.showTip('商品数量不能小于1') ;
			return false;
		}else{
			var new_num = num - 1;
			$("#buy_num").val(new_num);
			buynum = new_num;
			changePrice(oldprice, buynum);
		}
	});

	//改变数量 +
	$(".btn_add").click(function(){
		var num = $("#buy_num").val();
			num = parseFloat(num);
		var new_num = num + 1;
		if(sku != 'null' && sku_quantity == -1){
				My.showTip("请选择分类");
				return false;
		}else{
			var quantity = $(".quantity").text();
			if(new_num > parseFloat(quantity)){
				My.showTip("您购买的数量不能超过库存");
				return false;
			}
            if(new_num > max_buy_num){
                My.showTip("该团购商品每人仅限购买"+max_buy_num+"件");
                return false;
            }
		}
		$("#buy_num").val(new_num);
		buynum = new_num;
		changePrice(oldprice, buynum);
	});

	//绑定sku选择
	$('#sku').delegate('.j_sku', 'click', function(){
		var self = $(this),
			iid = self.prev("input"),
			father = self.attr("father");
			
		if(!self.hasClass("check")){
			$("#"+father+" .j_sku.check").removeClass("check");
			self.addClass("check");
			$("#"+father+" input").removeClass("checked");
			//iid.attr("checked", "checked").change();
			iid.addClass("checked").change();
			//console.log(iid.val());
			
			if(sku_quantity != -1){ //
				if(buynum > sku_quantity){ //购买数量大于库存
					$("#buy_num").attr("value", sku_quantity);
					buynum = sku_quantity;
				}
			}
		}
	});
	
	//sku input改变
	$('input[name="size"]').live("change", function() { 
		isSku();
	});
	$('input[name="color"]').live("change", function() {
		isSku();
	});
	$('input[name="content"]').live("change", function() {
		isSku();
	});
	
	//立即购买
	$(".btnbuy").live("click",function(){
		btnBuy();
	});
});

//价格改变
function changePrice(price, num){
	num = num || 1;
	price = price || 0;
	price = price * prd_discount * 0.1 * num; 
	$(".new_price").html(Math.round(price*100)/100);
}

//异步添加sku
function addSku(prdid, link, callBack){
	$("#buy_num").val(1);
	$.ajax({
		type:"post",
		timeout:5000, //访问超时
		data:{"prdid":prdid, "sid":sid},
		url:addSku_url,
		success:function(msg){
			var data = eval('(' + msg + ')');
			$(".prd_name").text(data.title);
			$(".prd_price").text("￥" + data.price);
			oldprice = data.price;
			changePrice(data.price, 1);
			$(".prd_img").attr("src", data.pic_url + "_80x80.jpg");
			$(".quantity").text(data.prd_num);
			link && $(".j_prolink").attr("href",link);
			$("#sku").html(data.prdsku.sku).show(); 
			OauthUrl = data.OauthUrl;
			sina_uid = data.sina_uid;
			sku = data.is_sku ;
			num_iid = data.num_iid;
			sid = data.sid; cid = data.cid;
			wbulk = data.wbulk;
			is_presell = data.is_presell;
			propertie1 = data.propertie1;
			propertie2 = data.propertie2;
			propertie3 = data.propertie3;
			//
			if(data.wbulk == 1 || data.is_presell == 1){
				$(".btn_sell").hide();
				$(".btn_null").html("商品不能直接购买").show();
			}
			//商品下架
			if(data.unsale == "unsale"){
				$(".btn_sell").hide();
				$(".btn_null").html("商品已下架").show();
			}
			//商品已售完
			if(data.prd_num == 0){
				$(".btn_sell").hide();
				$(".btn_null").html("商品已售完").show();
			}
			//
			else{
				$(".btn_sell").show();
				$(".btn_null").hide();
			}
			callBack();
		},
		error:function(XMLHttpRequest, textStatus, msg){
			My.hideLoad();
			if(textStatus =='timeout') {My.errorTip("请求超时");}
			else{My.errorTip(textStatus);}
		}
	});
}
	
//判断sku改变 
function isSku(){
	//console.log($('input[name="size"].checked').val());
	if(!( (propertie1 && !$('input[name="color"].checked').val() ) || (propertie2 && !$('input[name="size"].checked').val()) || (propertie3 && !$('input[name="content"].checked').val() ) ) ){
		var color = $('input[name="color"].checked').val() ;
		var cnum = $('input[name="size"].checked').val() ;
		var content_1 = propertie3 ? $('input[name="content"].checked').val(): "" ;
			cnum = cnum > "" ? cnum : color;
			color = color > "" ? color : cnum;
		var reData = getSkuIdAndNum(sku, color, cnum,content_1) ;
			skuid = reData['sku_id'] ;
			sku_quantity = reData['quantity'] ;

		//生成页面内容
		$(".quantity").html(sku_quantity); 
		$(".prd_price").html("￥" + reData["price"]);
		oldprice = reData["price"];
		changePrice(reData["price"], buynum);
	}
}

//根据颜色和尺码获取skuid
function getSkuIdAndNum(sku, color, cnum, content_1) {
	var sku = eval('(' + sku + ')'),
		scolor = "",
		properties_name = '',
		scnum = 0,
		reData = new Array(),
		properties_color = new Array(),
		properties_cnum = new Array();
		
	if (!sku.properties_name) { //如果不为单sku 
		var i = 0;
		for (i = 0; i < sku.length; i++) {
			properties_name = sku[i].properties_name;
			properties_color = properties_name.split(":");
			if (content_1) {
				properties_scnum = properties_color[properties_color.length - 4].split(";");
				scnum = properties_scnum[0];
				scontent_1 = properties_color[properties_color.length - 1];
			} else {
				scnum = properties_color[properties_color.length - 1];
				scontent_1 = "";
			}
			properties_cnum = properties_color[3].split(";");
			scolor = properties_cnum[0];
			
			if (color == scolor && scnum == cnum && scontent_1 == content_1) {
				reData['sku_id'] = sku[i].sku_id;
				reData['price'] = sku[i].price;
				reData['quantity'] = sku[i].quantity;
				return reData;
			}
		}
		if (i == sku.length) { //没有找到
			reData['sku_id'] = 0;
			reData['price'] = "暂无产品报价";
			reData['quantity'] = 0;
			return reData;
		}
	} else { //单sku
		reData['sku_id'] = sku.sku_id;
		reData['price'] = sku.price;
		reData['quantity'] = sku.quantity;
		return reData;
	}
	
	reData['sku_id'] = 0;
	reData['price'] = "暂无产品报价";
	reData['quantity'] = 0;
	return reData;
}
	
//购买
function btnBuy(){
	if(sku != "null" && sku) {
		if(wbulk == 1 || is_presell == 1){ //预售
			setTimeout(function(){window.top.location.href = WexinUrl + "?key=ShowPrd:" + num_iid + "&sid=" + sid;}, 100);
		}else{
			if(!((propertie1 && !$('input[name="color"].checked').val() ) || (propertie2 && !$('input[name="size"].checked').val() ) || (propertie3 && !$('input[name="content"].checked').val() ) ) ){
				//选择正常
				if (sku_quantity == 0) {
					My.showTip("库存不足哦,请选择其他规格~");
					return false;
				}
			}else if (propertie1 && !$('input[name="color"].checked').val()) {
				My.showTip("请选择" + propertie1 + "!");
				return false;
			} else if (propertie2 && !$('input[name="size"].checked').val()) {
				My.showTip("请选择" + propertie2 + "!");
				return false;
			} else if (propertie3 && !$('input[name="content"].checked').val()) {
				My.showTip("请选择" + propertie3 + "!");
				return false;
			}
			//购买连接带sku
            console.log(buy_url + ":" + skuid + ":" + buynum + ":" + num_iid + ":" + report_discount + ":" + "&viewer=" + viewer + "&sid=" + sid +"&prdactid="+prdactid+'&init_id='+init_id);
//            return false;
			setTimeout(function(){window.top.location.href = buy_url + ":" + skuid + ":" + buynum + ":" + num_iid + ":" + report_discount + ":" + "&viewer=" + viewer + "&sid=" + sid+"&prdactid="+prdactid+'&init_id='+init_id;}, 100);
		}

	} else {
		if(parseInt(prd_quantity) < 1 || prd_quantity == ''){
			My.showTip("商品库存不足!");
			return false;
		} 
		//购买连接
		setTimeout(function(){window.top.location.href = buy_url + ":0:" + buynum + ":" + num_iid + ":0:" + "&viewer=" + viewer + "&sid=" + sid+"&prdactid="+prdactid+'&init_id='+init_id; }, 100);
	}
}
