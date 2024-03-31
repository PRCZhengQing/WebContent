$(document).ready(function() {
	// 检查是否存在保存的用户信息
	var user = JSON.parse(localStorage.getItem("user"));
	if (!user) {
		// 如果没有保存的用户信息，跳转到Login.html
		window.location.href = "Login.html";
		return;
	}

	user = user[0];

	$("#username").text(user.Username);
	$("#real-name").text(user.FullName);
	$("#gender").text(user.Gender);
	$("#birthday").text(user.Birthday)
	$("#department").text(user.Department);
	$("#employeeId").text(user.EmployeeID);
	$("#position").text(user.Position);
	$("#start-date").text(user.HireDate);
	$("#email").text(user.Email);
	$("#mobile").text(user.Mobile);
	$("#phone").text(user.Phone);
	$("#qq").text(user.QQ);
	$("#wechat").text(user.WeChat);
	// 填充用户信息到对应的元素


});