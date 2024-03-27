$(document).ready(function(){
    var userStr=localStorage.getItem("user");
    try {
        var user=JSON.parse(userStr);
        var date=new Date(user.loginDate);
        date.setDate(date.getDate()+7);
        if(new Date()<date){
            jump(user);
        }
    } catch (error) {
        
    }
    $("#login-btn").click(function(){
        var EmployeeID=$("#EmployeeID").val();
        var Password=$("#password").val();
        var hashedPassword = CryptoJS.SHA256(Password).toString();
        var param="employeeId="+EmployeeID+"&passWord="+hashedPassword;
        console.log(param)
        $.ajax({
            url:"http://localhost:8080/BugManager/loginn",
            data:param,
            type:"post",
            success:function(msg){
                var obj=msg;
                if(obj.flag=="success"){
                    var user=obj.data;
                    if($("#remember").is(":checked")){
                        user.loginDate=new Date();
                    }
                    localStorage.setItem("user",JSON.stringify(user));
                    jump(user);
                }else{
                    $(".alertInfo").text(obj.data);
                }
            }
        })
    })
})
function jump(user){
 location.href="My.html"
}