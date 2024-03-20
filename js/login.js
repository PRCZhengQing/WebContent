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
    $(".loginbutton").click(function(){
        var email=$(".email").val();
        var password=$(".password").val();
        var param="email="+email+"&password="+password;
        console.log(param)
        $.ajax({
            url:"http://localhost:8080/SunshineAirlines/login",
            data:param,
            type:"post",
            success:function(msg){
                var obj=JSON.parse(msg);
                if(obj.flag=="success"){
                    var user=obj.data;
                    if($(".remember").is(":checked")){
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