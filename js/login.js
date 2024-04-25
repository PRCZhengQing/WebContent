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
function jump(userInput) {
    // 验证输入是否为数组且不为空
    if (!Array.isArray(userInput) || userInput.length === 0) {
        console.error('用户数据无效或缺失。');
        return;
    }

    // 获取用户角色ID，确保其存在且可以安全转换为字符串
    const user = userInput[0];
    const RoleId = typeof user.RoleID !== 'undefined' && user.RoleID !== null ? user.RoleID.toString() : '';

    // 检查RoleId是否已正确转换为字符串
    if (typeof RoleId !== 'string' || RoleId.trim() === '') {
        console.error('角色ID无效。');
        return;
    }

    // 使用严格的比较操作符，并避免硬编码，提高代码的可读性和可维护性
    const destination = RoleId === '1' ? 'BugList.html' : 'UserList.html';
    location.href = destination;
}