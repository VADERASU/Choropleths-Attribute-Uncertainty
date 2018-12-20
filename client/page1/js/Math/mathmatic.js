var MA={
	IsPointInArea:function(point,area){
		if(point[0]>area[0]&&point[0]<area[2]&&point[1]>area[1]&&point[1]<area[3]){
			return true
		}else
		return false
	} ,
	isMarkerInsidePolygon:function (marker, poly) {
			let x = marker[0],
				y = marker[1],
		     	inside = false;

		    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
		        let xi = poly[i][0], 
		        	yi = poly[i][1];
		        let xj = poly[j][0],
		        	yj = poly[j][1];

		        let intersect = ((yi > y) != (yj > y))
		            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		        if (intersect) inside = !inside;
		    }
		    return inside;
		},

	checkPP:function (point,polygon){
	        let p1=point,
	        	p2={x:-100,y:point.y},
	        	count=0
	        //对每条边都和射线作对比
	        for(var i=0;i<polygon.length-1;i++){
	            let p3=polygon[i],
	            	p4=polygon[i+1]
	            if(checkCross(p1,p2,p3,p4)==true){
	                count++
	            }
	        }
	        let p5=polygon[polygon.length-1],
	        	p6=polygon[0]
	        if(checkCross(p1,p2,p5,p6)==true){
	            count++
	        }
	        //  console.log(count)
	        return (count%2==0)?false:true
	},
	IsInArea:function(bbox1,bbox2){
		if (MA.IsPointInArea([bbox1[0],bbox1[1]],bbox2)||MA.IsPointInArea([bbox1[0],bbox1[3]],bbox2)||
			MA.IsPointInArea([bbox1[2],bbox1[1]],bbox2)||MA.IsPointInArea([bbox1[2],bbox1[3]],bbox2)){
			return true
		}else{
			return false
		}
	},
	FindSetBoundary:function(data) {
		let maxmin = []
		for (let i = 0; i < data[0].length; i++) {
			let max = data[0][i],
				min = data[0][i]
			for (let m = 0; m < data.length; m++) {
				max = Math.max(max, data[m][i])
				min = Math.min(min, data[m][i])
			}
			maxmin.push({
				max: max,
				min: min
			})
		}
		return maxmin
	}

}


//计算向量叉乘
function crossMul(v1,v2){
        return   v1.x*v2.y-v1.y*v2.x;
    }
//判断两条线段是否相交
function checkCross(p1,p2,p3,p4){
        var v1={x:p1.x-p3.x,y:p1.y-p3.y},
        v2={x:p2.x-p3.x,y:p2.y-p3.y},
        v3={x:p4.x-p3.x,y:p4.y-p3.y},
        v=crossMul(v1,v3)*crossMul(v2,v3)
        v1={x:p3.x-p1.x,y:p3.y-p1.y}
        v2={x:p4.x-p1.x,y:p4.y-p1.y}
        v3={x:p2.x-p1.x,y:p2.y-p1.y}
        return (v<=0&&crossMul(v1,v3)*crossMul(v2,v3)<=0)?true:false
    }


module.exports = MA