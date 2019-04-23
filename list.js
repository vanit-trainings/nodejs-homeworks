var node = function(val){
	this.next = null;
	this.prev = null;
	this.value = val;
}

var list = function(){
	this.length = 0;
	this.first = null;
	this.last = null;
}

list.prototype.add = function(data){
	var n = new node(data);
	if(this.first == null && this.last === null){
		this.last = n;
		this.first = n;
	}
	else{
		this.last.next = n;
		n.prev = this.last;
		this.last = n;
	}
	this.length++;
}

list.prototype.remove = function(ind){
    if(!isNaN(Number(ind)) && ind >= 0 && ind < this.length){
        let n = this.first;
        if(ind === 0){
            if(this.length > 1){
            n.next.prev = null;
            this.first = n.next;
            n.prev = null;
            n.next = null;
            }
            else{
                this.first = null;
                this.last = null;
            }            
        }
        else if(ind === (this.length - 1)){
            n = this.last;
            n.prev.next = null;
            this.last = n.prev;
            n.prev = null;
            n.next = null
        }
        else{
            for(let i = 0; i < ind; i++){
                n = n.next;
            }
                n.prev.next = n.next;
                n.next.prev = n.prev;
                n.prev = null;
                n.next = null;        
        }
        this.length--;
    }
}

list.prototype.isEmpty = function(){
	if(this.length == 0){
		return true;
	}
	else{
		return false;
	}
}

list.prototype.print = function(){
	let n = this.first;
	while(n !== null){
        console.log(n.value);
		n = n.next;
    }
    console.log("");
}

list.prototype.clear = function(){
    let n = this.first
    while(n !== null){
        n = n.next;
        this.remove(0);
    }
}
var d = new list();
d.add(1);
d.add(2);
d.add(3);
d.add(4);
d.print();
d.remove(0);
d.print();
console.log(d.isEmpty());
d.clear();
console.log(d.print());
console.log(d.length);
console.log(d.isEmpty());
