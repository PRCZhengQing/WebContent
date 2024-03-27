$(document).ready(function () {

  // 检查是否存在保存的用户信息
  var user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    // 如果没有保存的用户信息，跳转到Login.html
    window.location.href = "Login.html";
    return;
  }

  // 获取第一个用户对象，假设只有一个用户
  user = user[0];

  // 填充用户信息到对应的表单元素
  $("#realname").val(user.FullName);
  $("#email").val(user.Email);
  user.Gender == "男" ? $("#genderm").prop("checked", true) : $("#genderf").prop("checked", true);

  $("#birthday").val(user.Birthday);
  $(".text-middle").text(user.HireDate);
  $("#groups").val(user.RoleID);
  $("#account").val(user.Username);
  $("#mobile").val(user.Mobile);
  $("#phone").val(user.Phone);
  $("#qq").val(user.QQ);
  $("#wechat").val(user.WeChat);

  // 保存按钮点击事件
  $("#submit").click(function (e) {
    e.preventDefault();

    // 获取输入的密码和确认密码
    var password1 = $("#password1").val();
    var password2 = $("#password2").val();
    var verifyPassword = CryptoJS.SHA256($("#verifyPassword").val()).toString();;
    console.log(verifyPassword);
    // 校验密码长度和是否一致
    if (password1 && password1 !== password2) {
      alert("两次输入密码不匹配，请重新输入！");
      return;
    }

    if (password1 && (password1.length < 6 || password1.length > 12)) {
      alert("密码长度应为6到12个字符！");
      return;
    }

    if (verifyPassword == null) {
      alert("请输入系统登录密码！");
      return;
    }
    // 验证密码是否匹配，只要verifyPassword正确即可

    if (verifyPassword != user.Password) {
      console.log(verifyPassword+"   "+user.Password);
      alert("系统登录密码错误！");
      return;
    }

    console.log(">ajax");
    // 发送Ajax请求保存用户信息和加密后的密码
    var EmployeeID = user.EmployeeID;
    var username = $("#account").val();
    var fullName = $("#realname").val();
    var gender = $("input[name='gender']:checked").val() == "m" ? "男" : "女";
    console.log( $("input[name='gender']:checked").val() )
    var email = $("#email").val();
    var mobile = $("#mobile").val();
    var phone = $("#phone").val();
    var qq = $("#qq").val();
    var wechat = $("#wechat").val();
    var birthday = $("#birthday").val();
    var hashedPassword = password1 ? CryptoJS.SHA256(password1).toString() : verifyPassword;
    // 拼接参数字符串
    var param = "employeeId=" + EmployeeID +
      "&userName=" + username +
      "&fullName=" + fullName +
      "&gender=" + gender +

      "&email=" + email +
      "&mobile=" + mobile +
      "&phone=" + phone +
      "&qq=" + qq +
      "&wechat=" + wechat +
      "&passWord=" + hashedPassword +
      "&birthday=" + birthday;

   $.ajax({
      // ...
      url: "http://localhost:8080/BugManager/updateUserByUser",
      type: "POST",
      data: param,
      success: function (msg) {
        var obj = msg;
        if (obj.flag == "success") {
          alert("更新成功！");
          location.href = "./MyProfile.html";
          
          updateUserInfo(EmployeeID, hashedPassword);

        }
      }
    });


  });
});



function updateUserInfo(EmployeeID, hashedPassword) {
  var param = "employeeId=" + EmployeeID + "&passWord=" + hashedPassword;
  $.ajax({
    url: "http://localhost:8080/BugManager/loginn",
    data: param,
    type: "post",
    success: function (msg) {
      var obj = msg;
      if (obj.flag == "success") {
        var user = obj.data;
        localStorage.setItem("user", JSON.stringify(user));
        alert("更新查询成功！");
      }
    }
  })
}