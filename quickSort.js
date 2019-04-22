const readline = require('readline-sync');

let arr = [];
let i = 0;
let n = 0;
let arrObj = "";

function quickSort (arr, left, right){
    let i = left, j = right, pivot = arr[Math.floor((left + right)/2)];
    
    while(i <= j){
        while(arr[i] < pivot){
            i++;
        }
        while(arr[j] > pivot){
            j--;
        }
        if(i <= j){
            let tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
            i++;
            j--;
        }
    }
    if(left < j){
        quickSort(arr, left, j);
    } 
    if(i < right){
        quickSort(arr, i, right);
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
n = arr.length;
console.log("Your array");
console.log(arr);
quickSort(arr, 0, n-1);
console.log("Sort array");
console.log(arr);