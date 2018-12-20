export class SA{
	constructor(container, options ,domain){
		this.options = {width:10, height:10, top:0, left:0, className:'timeaxle', 
		          slideColor:'rgb(156, 156, 156)', focusColor:'rgb(243, 243, 243)'
		          ,moveevent:null,stopevent:null}
		    $.each(options, d => this.options[d] = options[d]);

		this.domain=domain

        this.Scale = d3.scaleLinear()
		    .domain(domain)
		    .range([0, this.options.width]);
        this.newScale = this.Scale;
        this.container=container
	
        this.slideWidth = 5;
	    this.slides = [];
	    this.initDrag();

	    this.init()

	    this.initZoom();
	    this.container.call(d3.zoom().scaleExtent([-Infinity, Infinity])
	        .on('zoom', this.zoomed));
	}

	delete(){
		this.timeAxle.remove()
	}
	getmin(){
	    return this.newScale.invert(this.getminposition());
	}
	getmax(){
	    return this.newScale.invert(this.getmaxposition());
	}
	getminposition(){
	    const [minNode, maxNode] = this.getSlide();
		return minNode.attr('x')*1+this.slideWidth/2
	}
	getmaxposition(){
	    const [minNode, maxNode] = this.getSlide();
		return maxNode.attr('x')*1+this.slideWidth/2
	}
	initZoom() {
	    const This = this;
	    this.zoomed = function() {
	      const [minNode, maxNode] = This.getSlide();
	      const [minTime, maxTime] = This.getTime();
	      const t = d3.event.transform;
	      This.newScale = t.rescaleX(This.Scale);
	      This.gTime.call(This.timeAxis.scale(This.newScale));
	      let minX = This.newScale(minTime)-This.slideWidth/2;
	      let maxX = This.newScale(maxTime)-This.slideWidth/2;
	      if(minX + This.slideWidth < 0|| minX-This.slideWidth/2>This.options.width){
	      	minNode.attr('width', 0);
	      }else{
	      	minNode.attr('width', This.slideWidth);
	      }
	      if(maxX + This.slideWidth < 0|| maxX-This.slideWidth/2>This.options.width){
	      	maxNode.attr('width', 0);
	      }else{
	      	maxNode.attr('width', This.slideWidth);
	      }
	      minNode.attr('x', minX);
	      maxNode.attr('x', maxX);
	      This.resizeFocus()
		  This.options.moveevent();
	    } 
	  }
	  init() {
    	this.timeAxle = this.container.append('g').attr('class', this.options.className)
        	.attr('transform', `translate(${this.options.left},${this.options.top})`)

        this.timeAxis = d3.axisBottom(this.Scale).ticks(this.domain[1]-this.domain[0]);
            

        if(this.options.type!="range_selecter")
        this.gTime = this.timeAxle.append('g').attr('class', 'timeaxis')
        .attr('transform', `translate(0, ${this.options.height})`)
        .call(this.timeAxis);

	    this.timeAxle.append('rect').attr('x', this.slideWidth/2).attr('y', 0)
	        .attr('width',  this.options.width - this.slideWidth)
	        .attr('height',  this.options.height)
	        .style('fill',  this.options.focusColor)
	        .attr('class', 'timefocus')
	        .call(this.focusDrag);
	    this.slides.push(
	      this.addSlide(this.timeAxle, 0-this.slideWidth/2, 0, this.slideWidth,  this.options.height,  this.options)
	    );
	    this.slides.push(
	      this.addSlide(this.timeAxle,  this.options.width-this.slideWidth/2, 0, this.slideWidth, 
	           this.options.height,  this.options)
	    );
	  }
	  initDrag() {
	    const This = this;
	    //left and right bar
	    this.drag = d3.drag()
	        .on('drag', function(d) {
	        	// if out of bound
	        	let nowX = null;
	        	if(d3.event.x > This.options.width - This.slideWidth/2){
	        		nowX = This.options.width - This.slideWidth/2
	        	}else{
	        		nowX = d3.event.x + This.slideWidth/2 < 0 ? -This.slideWidth/2 : d3.event.x
	        	}
	        	// to Int
	        	nowX = This.newScale(Math.floor(This.newScale.invert(nowX)+0.5))-This.slideWidth/2
	        	// refocus
				d3.select(this).attr('x', nowX);
				This.resizeFocus();
	    	})
	    	// stop event
	    	.on('end',function(){This.options.stopevent()})

	    //middle bar
	    this.focusDrag = d3.drag()
	    	.on("start",function(){
	          const [minNode, maxNode] = This.getSlide();
	          This.preX = {preposition:d3.event.x - minNode.attr('x') * 1 + This.slideWidth/2,
	          	diff: This.getmax() - This.getmin()}
	    	})
	        .on('drag', function() {
	        	// get left right position
	          const [minNode, maxNode] = This.getSlide();
	          let  nowX = d3.event.x - This.preX.preposition
	          let nowX1 = This.newScale(Math.floor(This.newScale.invert(nowX)+0.5))
	          let nowX2 = This.newScale(Math.floor(This.newScale.invert(nowX)+0.5)+This.preX.diff)
	          // if out of bound
	          if(nowX1 + This.slideWidth < 0|| nowX1-This.slideWidth/2>This.options.width)
		      	minNode.attr('width', 0);
		      else
		      	minNode.attr('width', This.slideWidth);
		      if(nowX2 + This.slideWidth < 0|| nowX2-This.slideWidth/2>This.options.width)
		      	maxNode.attr('width', 0);
		      else
		      	maxNode.attr('width', This.slideWidth);
	          minNode.attr('x', nowX1- This.slideWidth/2);
	          maxNode.attr('x', nowX2- This.slideWidth/2);
	          // refocus
	          This.resizeFocus()
	        })
	    	.on('end',function(){This.options.stopevent()})
	  }
	  addSlide(node, x, y, width, height, options) {
	    return node.append('rect').attr('x', x)
	        .attr('y', y)
	        .attr('class', 'timeslide')
	        .attr('width', width)
	        .attr('height', height)
	        .style('fill', options.slideColor)
	        .style('cursor', 'ew-resize')
	        .call(this.drag);
	  }
	  resizeFocus() {
	    let minX = this.getminposition(), 
	    	maxX = this.getmaxposition(); 
	    this.timeAxle.selectAll('.timefocus')
	        .attr('x', minX + this.slideWidth/2 <0? 0:
	      			minX - this.slideWidth/2>this.options.width? this.options.width: minX+this.slideWidth/2)
	        .attr('width', maxX - minX - this.slideWidth < 0 ? 0 :
	          	maxX - this.slideWidth/2 < 0? 0:
	          	minX - this.slideWidth/2 > this.options.width? 0: 
	          	minX + this.slideWidth/2 < 0 ? maxX - this.slideWidth/2:
	          	maxX - this.slideWidth/2 > this.options.width ? this.options.width-minX - this.slideWidth/2:
	        	maxX - minX - this.slideWidth > this.options.width ?  this.options.width :
	          	maxX - minX - this.slideWidth);
	  }
	  getSlide() {
	    let minX = Infinity, 
	    	maxX = -Infinity, minNode, maxNode;
	    this.slides.forEach(node => {
	      if (minX > node.attr('x') * 1) {
	        minX = node.attr('x') * 1;
	        minNode = node;
	      }
	      if (maxX < node.attr('x') * 1) {
	        maxX = node.attr('x') * 1;
	        maxNode = node;
	      }
	    });
	    return [minNode, maxNode];
	  }
	  getTime() {
	    const [minNode, maxNode] = this.getSlide();
	    const minTime = this.newScale.invert(minNode.attr('x')*1+this.slideWidth/2);
	    const maxTime = this.newScale.invert(maxNode.attr('x')*1+this.slideWidth/2);
	    return [minTime, maxTime];
	  }
}
