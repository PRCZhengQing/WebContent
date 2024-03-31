$(document).ready(function() {
	var user = localStorage.getItem("user");
	var loginD = localStorage.getItem("loginD");
	console.log(loginD);
	try {
		var user = JSON.parse(user);
		var date = new Date(loginD);
		date.setDate(date.getDate() + 7);
		if (new Date() < date) {
			jump(user);
		}
	} catch (error) {

	}
	$("#login-btn").click(function() {
		var EmployeeID = $("#EmployeeID").val();
		var Password = $("#password").val();
		var hashedPassword = CryptoJS.SHA256(Password).toString();
		var param = "employeeId=" + EmployeeID + "&passWord=" + hashedPassword;
		console.log(param)
		$.ajax({
			url: "http://localhost:8080/BugManager/loginn",
			data: param,
			type: "post",
			success: function(msg) {
				var obj = msg;
				if (obj.flag == "success") {
					var user = obj.data;
					if ($("#remember").is(":checked")) {
						var loginD;
						loginD = new Date();
						localStorage.setItem("loginD", loginD);
					}
					localStorage.setItem("user", JSON.stringify(user));
					jump(user);
				} else {
					$(".alertInfo").text(obj.data);
				}
			}
		})
	})
})
function jump(user) {
	var user = user[0];
	var RoleId = user.RoleID.toString();

	RoleId == "1" ? location.href = "My.html" : location.href = "UserList.html";


}