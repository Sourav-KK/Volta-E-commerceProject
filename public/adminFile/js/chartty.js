{/* <script> */}
  
 (()=>{
      
      fetch('/admin/chartGraph', {
        method: 'get',
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(res => res.json())
        .then((res) => {
       
          // console.log(res,'ith namma response');
          console.log(res);

          let price=res.priceStat
          let Daily=res.daily
         let YearlyData=res.yearly
      
console.log(YearlyData,'yearrrr ');


// MONTHLY SALES REPORTGRAPH START

          let monthlyArr=[]
   for(i=1;i<=12;i++){
    for(j=0;j<12;j++){
      if(price[j]?._id==i){
        monthlyArr[i]=price[j]?.totalCount
        break;
      }else{
        
        monthlyArr[0]=0
        monthlyArr[i]=0
      }
    }
   }
   console.log( monthlyArr[12],'.......');

          



          var xValues = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

new Chart("myChart", {
  type: "line",
  data: {
    labels: xValues,
    datasets: [ { 
      data: [monthlyArr[1],monthlyArr[2],monthlyArr[3],monthlyArr[4],monthlyArr[5],monthlyArr[6],monthlyArr[7],monthlyArr[8],monthlyArr[9],monthlyArr[10],monthlyArr[11],monthlyArr[12]],
      borderColor: "blue",
      fill: false
    }]
  },
  options: {
    legend: {display: false}
  }
});

// MONTHLY SALES REPORT GRAPH END


// DAILY SALES REPORT START

let dailArr=[]

for(i=1;i<=31;i++){

  for(j=0;j<31;j++){
    if(Daily[j]?._id==i)
    {
      dailArr[i]=Daily[j]?.totalRevenue
      break;
    }else{
      dailArr[0]=0
      dailArr[i]=0
    }
  }

}
console.log(dailArr[14],"daily");

var xValues = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];

new Chart("myChart2", {
  type: "line",
  data: {
    labels: xValues,
    datasets: [{ 
      data: [dailArr[1],dailArr[2],dailArr[3],dailArr[4],dailArr[5],dailArr[6],dailArr[7],dailArr[8],dailArr[9],dailArr[10],dailArr[11],dailArr[12],dailArr[13],dailArr[14],dailArr[15],dailArr[16],dailArr[17],dailArr[18],dailArr[19],dailArr[20],dailArr[21],dailArr[22],dailArr[23],dailArr[24],dailArr[25],dailArr[26],dailArr[27],dailArr[28],dailArr[29],dailArr[30],dailArr[31]],
      borderColor: "red",
      fill: false
    }]
  },
  options: {
    legend: {display: false}
  }
});


// DAILY SALES REPORT END



// YEARLY SALES 


// var xValues = [YearlyData[0]?._id,YearlyData[1]?._id,YearlyData[2]?._id,YearlyData[3]?._id,YearlyData[4]?._id];
var xValues = [2019,2020,2021,2022,2023];


new Chart("myChart3", {
  type: "line",
  data: {
    labels: xValues,
    datasets: [{ 
      // data: [YearlyData[0]?.totalRevenue,YearlyData[1]?.totalRevenue,YearlyData[2]?.totalRevenue,YearlyData[3]?.totalRevenue,YearlyData[4]?.totalRevenue],
      data: [0,0,0,0,YearlyData[0]?.totalRevenue],

      borderColor: "green",
      fill: false
    }]
  },
  options: {
    legend: {display: false}
  }
});


// YEARLY SALES EMD

 })
    })() 
   
// </script>