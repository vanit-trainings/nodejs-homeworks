const readline = require('readline-sync');
let arr = [];
let i = 0;
let arrObj = "";

function mergeMassive(arr, leftMass, rightMass ){
    let a = leftMass.length - 1;
    let b = rightMass.length - 1;
    let i = 0, j = 0;
    for(let k = 0; k < arr.length; k++){
        if(i > a){
            arr[k] = rightMass[j];
            j++;
            continue;
        }
        if(j > b){
            arr[k] = leftMass[i];
            i++;
            continue;
        }
        if(leftMass[i]>rightMass[j]){
            arr[k] = rightMass[j];
            j++;
        }
        else{
            arr[k] = leftMass[i];
            i++;
        }
    }
}

function splitMassive(arr){
    if(arr.length > 1){
    let kes = Math.floor(arr.length/2);
    let leftMass = [];
    let rightMass = [];
        for(let i = 0; i < kes; i++){
            leftMass[i] = arr[i];
        }
        for(let i = kes; i < arr.length; i++){
            rightMass[i - kes] = arr[i];
        }
        splitMassive(leftMass);
        splitMassive(rightMass);
        mergeMassive(arr, leftMass, rightMass);
    }
}

while(arrObj !== "q"){
    arrObj = readline.question("Enter an array element, if You have entered enough elements enter 'q' \n");    
    
    if (!isNaN(Number(arrObj))) 
    { 
        arr[i] = Number(arrObj);
        i++;
    }
}

console.log("Your array");
console.log(arr);
splitMassive(arr);
console.log("Sort array");
console.log(arr);
