const MODE_MOVE_MAP = 0;
const MODE_REGIST_MARKER = 1;
const MODE_EDIT_MARKER = 2;

//GoogleAPIキー
var GoogleAPIKey = ''
var MapMode;
var g_MapOpts;
var g_Map;
var deviceType;

//マーカ情報のリスト
var MarkerList = [];
var SearchResultList = [];
var CurrentMarker = null;
var CurrentMarkerId = null;
var MarkerMaxIdx = 0;

//グーグルマップのMarkerオブジェクトのマップ
var MarkerMap = new Array();

function SetGoogleApiKey(){
	GoogleAPIKey = document.getElementById("GoogleApiKey1").value;
	Init();
}
function Init(){

	//デバイスのタイプ取得
	deviceType = (function(){
			var ua = navigator.userAgent;
			if(ua.indexOf('iPhone') > 0 ||
			   ua.indexOf('iPod') > 0 ||
			   ( ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) ){
			   		return 'smartPhone';
			}else if(ua.indexOf('iPad') > 0 ||
			   		 ua.indexOf('Android') > 0){
			   		return 'tablet';
			}else{
			   		return 'other';
			}
		 })();

	var SumahoBtn1 = document.getElementById("SumahoBtn1");
	if(deviceType == 'smartPhone'){
		SumahoBtn1.style.display = "inline";
	}else{
		SumahoBtn1.style.display = 'none';
	}

	var srcURL = "https://maps.googleapis.com/maps/api/js?key=";
	srcURL += GoogleAPIKey;
	srcURL +="&callback=initMap";
	var s = document.createElement("script");
	s.src = srcURL;	

	var ele = document.getElementById("InitScriptTag");
	ele.appendChild(s);
	
	 
}

function ImportMarker(){
	var inputText = document.getElementById("MarkerInput1");
	LoadMarkerList(inputText.value);
	
	SetMarkerList1(SearchResultList);
}
function LoadMarkerList(jsonStr){
	var data = JSON.parse(jsonStr);
	jsonMarkerList = data;
	
	for(var j=0; j<jsonMarkerList.length; j++){
		var Mk = new MyMarker("Marker"+MarkerMaxIdx, jsonMarkerList[j].latlng.lat, jsonMarkerList[j].latlng.lng, jsonMarkerList[j].title, jsonMarkerList[j].memo,"red-dot.png");
		MarkerList.push(Mk);
		MarkerMaxIdx++;
	}
	if(jsonMarkerList.length >= 1){
		g_Map.setCenter(jsonMarkerList[0].latlng);
	}
	
}
//選択ボタンを押したときの動作(スマホ)
function SelectMarkerOnSumaho(){
	var select1 = document.getElementById("MarkerList1");

		var Mk = SearchResultList[select1.selectedIndex];
		g_Map.setCenter(Mk.latlng);
		
		for(var j=0; j<MarkerList.length; j++){
			if(MapMode == MODE_EDIT_MARKER &&
			   MarkerList[j] != null &&
			   MarkerList[j].latlng == Mk.latlng &&
			   MarkerList[j].title == Mk.title){
				MarkerList[j] = new MyMarker(MarkerList[j].id, MarkerList[j].latlng.lat(), MarkerList[j].latlng.lng(), MarkerList[j].title, MarkerList[j].memo,"blue-dot.png");
				CurrentMarker = MarkerList[j];
			}else{
				MarkerList[j] = new MyMarker(MarkerList[j].id, MarkerList[j].latlng.lat(), MarkerList[j].latlng.lng(), MarkerList[j].title, MarkerList[j].memo,"red-dot.png");
			}
		}
		
		document.getElementById("MarkerKeyTextBox1").value = Mk.title;
		document.getElementById("Memo1").value = Mk.memo;
		
		if(MapMode == MODE_REGIST_MARKER){
			if(CurrentMarker != null){
				MarkerMap[CurrentMarker.id].setIcon("red-dot.png");
			}
			CurrentMarker = new MyMarker("Marker"+MarkerMaxIdx, Mk.latlng.lat(), Mk.latlng.lng(), Mk.title, Mk.memo,"red-dot.png");
		}
			
}
//現在位置をセットボタンを押したときの動作
function SetCenter(){
	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(
			function ( position )
			{
				// 取得したデータの整理
				var data1 = position.coords ;

				// データの整理
				var lat1 = data1.latitude;
				var lng1 = data1.longitude;
				
				g_Map.setCenter(new google.maps.LatLng(lat1, lng1));
				
				
			},
			function ( error )
			{
				alert("現在位置をセットできませんでした");
			},
			//オプション
			{
				"enableHighAccuracy": false,
				"timeout": 8000,
				"maximumAge": 2000
			}
		);
	}
}

function initMap() {
  g_MapOpts = {
    zoom: 14,//ズームレベル
    center: new google.maps.LatLng(35.6807527,139.7600500)
  };
  g_Map = new google.maps.Map(document.getElementById("map"), g_MapOpts);
  
	SetMarkerList1(MarkerList);
	SearchResultList = MarkerList;
	
	//マーカリストをクリックしたときの処理
	var select1 = document.getElementById("MarkerList1");
	if(deviceType == "other" || deviceType == "tablet"){
		select1.onclick = function(){
			var Mk = SearchResultList[this.selectedIndex];
			g_Map.setCenter(Mk.latlng);
			
			for(var j=0; j<MarkerList.length; j++){
				if(MapMode == MODE_EDIT_MARKER &&
				   MarkerList[j] != null &&
				   MarkerList[j].latlng == Mk.latlng &&
				   MarkerList[j].title == Mk.title){
					MarkerList[j] = new MyMarker(MarkerList[j].id, MarkerList[j].latlng.lat(), MarkerList[j].latlng.lng(), MarkerList[j].title, MarkerList[j].memo,"blue-dot.png");
					CurrentMarker = MarkerList[j];
				}else{
					MarkerList[j] = new MyMarker(MarkerList[j].id, MarkerList[j].latlng.lat(), MarkerList[j].latlng.lng(), MarkerList[j].title, MarkerList[j].memo,"red-dot.png");
				}
			}
			
			document.getElementById("MarkerKeyTextBox1").value = Mk.title;
			document.getElementById("Memo1").value = Mk.memo;
			
			if(MapMode == MODE_REGIST_MARKER){
				if(CurrentMarker != null){
					MarkerMap[CurrentMarker.id].setIcon("red-dot.png");
				}
				CurrentMarker = new MyMarker("Marker"+MarkerMaxIdx, Mk.latlng.lat(), Mk.latlng.lng(), Mk.title, Mk.memo,"red-dot.png");
			}

		}
	}else if(deviceType == "smartPhone"){

	}
	
	
	//マップをクリックしたときの処理
	g_Map.addListener('click', function(e){
		if(MapMode == MODE_REGIST_MARKER){
			var titleStr = document.getElementById("MarkerKeyTextBox1").value;
			var memoStr = document.getElementById("Memo1").value;
			
			if(CurrentMarker != null){
				MarkerMap[CurrentMarker.id].setMap(null);				
				CurrentMarker = new MyMarker("Marker"+MarkerMaxIdx, e.latLng.lat(), e.latLng.lng(), titleStr, memoStr, "blue-dot.png");

			}else{
				CurrentMarker = new MyMarker("Marker"+MarkerMaxIdx, e.latLng.lat(), e.latLng.lng(), titleStr, memoStr,"blue-dot.png");
			}
			
		}
	});
	

   
	MapMode = MODE_MOVE_MAP;
	document.getElementById("ModeText1").innerHTML = "地図移動";
	$("#btn1").prop("disabled", true);
	$("#btn2").prop("disabled", true);
}

//マーカ削除ボタンを押したときの動作
function DeleteMarker(){
	if(CurrentMarker != null){
		MarkerMap[CurrentMarker.id].setMap(null);
		MarkerMap[CurrentMarker.id] = null;


		//全マーカリストから削除
		for(var i=0; i<MarkerList.length; i++){
			if(MarkerList[i].id == CurrentMarker.id){
				MarkerList.splice(i,1);
				break;
			}
		}
		
		//検索結果マーカリストから削除
		for(var j=0; j<SearchResultList.length; j++){
			if(SearchResultList[j].id == CurrentMarker.id){
				SearchResultList.splice(j,1);
				break;
			}
		}		
		
		CurrentMarker = null;
		SetMarkerList1(SearchResultList);
		
	}
}
//マーカオープンボタンを押したときの動作
function OpenMarkers(){

	for(var j=0; j<SearchResultList.length; j++){
			var gMk = MarkerMap[SearchResultList[j].id];
				
		 	var infoWindow = new google.maps.InfoWindow({ // 吹き出しの追加
		        content: SearchResultList[j].memo // 吹き出しに表示する内容
		  	});
		  	
     	    infoWindow.open(g_Map, gMk); // 吹き出しの表示

	}

}

//フィルターボタンを押したときの動作
function SearchMarker(){
	var filterStr = document.getElementById("MarkerFilter1").value;
	var resultList = [];
	
	var resultCount = 0;
	for(var j=0; j<MarkerList.length; j++){
		if(filterStr == "" ||
		   MarkerList[j].title.indexOf(filterStr) != -1 ||
		   MarkerList[j].memo.indexOf(filterStr) != -1 ){
		   resultList[resultCount] = MarkerList[j];
		   resultCount++;
		}
	}
	
	if(resultCount >= 1){
		CurrentMarker = resultList[0];
	}else{
		CurrentMarker = null;
	}
	
	SetMarkerList1(resultList);
	SearchResultList = resultList;
	
}

//マーカ一覧の表示を更新する
function SetMarkerList1(MarkerList){

	var mkList = document.getElementById("MarkerList1");

  if (mkList.hasChildNodes()) {
    while (mkList.childNodes.length > 0) {
      mkList.removeChild(mkList.firstChild)
    }
  }
	
	for(var j=0; j<MarkerList.length; j++){
		let op = document.createElement("option");
		if(CurrentMarker != null &&
		   MarkerList[j].id == CurrentMarker.id){
			op.selected = true;
		}
		op.value = MarkerList[j].id;
		op.text = MarkerList[j].title;
		mkList.appendChild(op);
	}
	
	
	var sumahoOutput1 = document.getElementById("SumahoOut1");
	if(deviceType == 'smartPhone'){
		sumahoOutput1.innerHTML = "";
		for(var j=0; j<MarkerList.length; j++){
			sumahoOutput1.innerHTML += "・";
			sumahoOutput1.innerHTML += MarkerList[j].title;
			sumahoOutput1.innerHTML += "<br>"
		}
		
	}
	
}

function OutputText(){
	var json = JSON.stringify(MarkerList);
	
	var outputText = document.getElementById("MarkerOutput1");
	outputText.value = json;
}

//マーカの追加/更新ボタンを押したときの動作
function SetMarker()
{
	if(MapMode == MODE_REGIST_MARKER){
		if(CurrentMarker != null){
			var titleStr = document.getElementById("MarkerKeyTextBox1").value;
			var memoStr = document.getElementById("Memo1").value;
			
			for(var j=0; j<MarkerList.length; j++){
				if(MarkerList[j] != null &&
				   MarkerList[j].latlng == CurrentMarker.latlng &&
				   MarkerList[j].title == CurrentMarker.title){
					alert("マーカが重複しています");
					return;
				}
			}
			
			CurrentMarker = new MyMarker("Marker"+MarkerMaxIdx, CurrentMarker.latlng.lat(), CurrentMarker.latlng.lng(), titleStr, memoStr, "red-dot.png");
			MarkerMaxIdx++;
			MarkerList.push(CurrentMarker);
			SearchMarker();
			CurrentMarker = null;
		}
	
	}else if(MapMode == MODE_EDIT_MARKER){
		var titleStr = document.getElementById("MarkerKeyTextBox1").value;
		var memoStr = document.getElementById("Memo1").value;
		
		if(CurrentMarker != null){		
		
			CurrentMarker.memo = memoStr;
			CurrentMarker.title = titleStr;
			
			CurrentMarker = new MyMarker(CurrentMarker.id, CurrentMarker.latlng.lat(), CurrentMarker.latlng.lng(), CurrentMarker.title, CurrentMarker.memo,"red-dot.png");
			SetMarkerList1(MarkerList);
		
		}
	
	}
}
//現在のマーカーをリストの先頭にのボタンを押したときの動作
function ShiftMarkerToTop(){
	if(MapMode == MODE_EDIT_MARKER &&
	   CurrentMarker != null){
		for(var i=0; i<MarkerList.length; i++){
			if(MarkerList[i].id == CurrentMarker.id){
				MarkerList.splice(i,1);
				break;
			}
		}
		MarkerList.unshift(CurrentMarker);
		SearchMarker();
	   
	}
}

//マーカ情報クラスを作成するコンストラクタ
function MyMarker(id, lat, lng, title, memo, iconUrl)
{
	this.id = id;
	this.latlng = new google.maps.LatLng(lat, lng);
	this.title = title;
	this.memo = memo;
	
 	var mopts = {
		position: this.latlng,
		map: g_Map,
		title: title,
		icon: iconUrl
		};
	
	if(MarkerMap[this.id] != null){
		MarkerMap[this.id].setMap(null);
		MarkerMap[this.id] = null;
	}
	var marker = new google.maps.Marker(mopts);
	MarkerMap[this.id] = marker;
	

  	
 	marker.addListener('click', function() { // マーカーをクリックしたとき
     	if(MapMode == MODE_EDIT_MARKER){
     		
			for(var j=0; j<MarkerList.length; j++){
				if(MarkerList[j] != null &&
					MarkerList[j].latlng.lat() == this.position.lat() &&
					MarkerList[j].latlng.lng() == this.position.lng() &&
					MarkerList[j].title == this.title){
					MarkerList[j] = new MyMarker(MarkerList[j].id, MarkerList[j].latlng.lat(), MarkerList[j].latlng.lng(), MarkerList[j].title, MarkerList[j].memo,"blue-dot.png");
					CurrentMarker = MarkerList[j];
					
				}else if(MarkerList[j] != null){
					MarkerList[j] = new MyMarker(MarkerList[j].id, MarkerList[j].latlng.lat(), MarkerList[j].latlng.lng(), MarkerList[j].title, MarkerList[j].memo,"red-dot.png");
				}
			}
			
			document.getElementById("MarkerKeyTextBox1").value = CurrentMarker.title;
			document.getElementById("Memo1").value = CurrentMarker.memo;
			
     	}else{
     		//クリックしたマーカの位置、タイトルから対応するマーカ情報を取得	
			for(var j=0; j<MarkerList.length; j++){
				if(MarkerList[j] != null &&
				   MarkerList[j].latlng.lat() == this.position.lat() &&
				   MarkerList[j].latlng.lng() == this.position.lng() &&
				   MarkerList[j].title == this.title){
					ClickedMarker = MarkerList[j];
					break;
				}
			}
				
		 	var infoWindow = new google.maps.InfoWindow({ // 吹き出しの追加
		        content: ClickedMarker.memo // 吹き出しに表示する内容
		  	});
		  	
     	    infoWindow.open(g_Map, this); // 吹き出しの表示
     	}
    });

    
    
}

//モード切替を押したときの動作
function ChangeMode(){
	if(MapMode == MODE_MOVE_MAP){
		MapMode = MODE_REGIST_MARKER;
		document.getElementById("ModeText1").innerHTML = "マーカ登録";
		
		$("#btn1").prop("disabled", false);
		document.getElementById("btn1").innerHTML = "マーカ追加";
		
		$("#btn2").prop("disabled", true);
	}else if(MapMode == MODE_REGIST_MARKER){
		MapMode = MODE_EDIT_MARKER;
		document.getElementById("ModeText1").innerHTML = "マーカ編集";

		$("#btn1").prop("disabled", false);
		document.getElementById("btn1").innerHTML = "マーカ更新"; 
		
		$("#btn2").prop("disabled", false);

		for(var j=0; j<MarkerList.length; j++){
			var gApiMarker = MarkerMap[MarkerList[j].id];
			gApiMarker.zIndex = 0;
			gApiMarker.setIcon("red-dot.png");
			gApiMarker.setMap(g_Map);
		}
		
		if(CurrentMarker != null){
			MarkerMap[CurrentMarker.id].setMap(null);
			CurrentMarker = null;
		}

		
	}else{
		MapMode = MODE_MOVE_MAP;
		document.getElementById("ModeText1").innerHTML = "地図移動";
		
		$("#btn1").prop("disabled", true);
		document.getElementById("btn1").innerHTML = "マーカ追加";
		
		$("#btn2").prop("disabled", true);
		
		if(CurrentMarker != null){
			MarkerMap[CurrentMarker.id].setIcon("red-dot.png");
			CurrentMarker = null;
		}
	}
	
	

}

