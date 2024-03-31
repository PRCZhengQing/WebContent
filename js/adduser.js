$(document).ready(function() {
	// 检查是否存在保存的用户信息
	var user = JSON.parse(localStorage.getItem("user"));
	if (!user) {
		// 如果没有保存的用户信息，跳转到Login.html
		window.location.href = "Login.html";
		return;
	}
	user = user[0];

	var params = new URLSearchParams(window.location.search);
	var EmployeeID = params.get("EmployeeID");

	if (EmployeeID !== null) {
		// 如果URL中带有editUserID参数，则为编辑用户
		document.title = "修改用户";
		$("#main-title").text("修改用户");
		loadUserInfo(EmployeeID, user);
	} else {
		// 不含editUserID参数，则为添加新用户
		document.title = "新增用户";
		$("#main-title").text("新增用户");
		updateUser(user);
	}

});

function loadUserInfo(EmployeeID, user) {
	// 这里添加代码，加载并填充现有用户的信息
	$.ajax({
		// ...
		url: "http://localhost:8080/BugManager/getUserInfo",
		type: "POST",
		data: "employeeId=" + EmployeeID,
		success: function(msg) {
			var obj = msg;
			var user = obj.data[0];
			if (obj.flag == "success") {
				$("#groups").val(user.Position);
				$("#join").val(user.HireDate);
				$("#department").val(user.Department);

				$("#realname").val(user.FullName);
				$("#email").val(user.Email);
				user.Gender == "男" ? $("#genderm").prop("checked", true) : $("#genderf").prop("checked", true);
				$("#birthday").val(user.Birthday);
				$("#account").val(user.Username);
				$("#mobile").val(user.Mobile);
				$("#phone").val(user.Phone);
				$("#qq").val(user.QQ);
				$("#wechat").val(user.WeChat);
			}
		}
	});


	$("#submit").click(function(e) {
		e.preventDefault();

		// 隐藏之前的错误信息
		var errorContainer = $("#error-container");
		errorContainer.hide();
		// 获取输入的密码和确认密码
		var position = $("#groups").val();
		var join = $("#join").val();
		var username = $("#account").val();
		var fullName = $("#realname").val();
		var department = $("#department").val();
		var gender = $("input[name='gender']:checked").val() == "m" ? "男" : "女";
		var email = $("#email").val();
		var mobile = $("#mobile").val();
		var phone = $("#phone").val();
		var qq = $("#qq").val();
		var wechat = $("#wechat").val();
		var birthday = $("#birthday").val();
		var password1 = $("#password1").val();
		var password2 = $("#password2").val();
		var verifyPassword = $("#verifyPassword").val();

		// 表单验证
		var errorMessages = [];

		if (!fullName) {
			errorMessages.push("真名不能为空！");
		}

		if (!gender) {
			errorMessages.push("性别不能为空！");
		}

		if (!join) {
			errorMessages.push("入职日期不能为空！");
		}

		if (!position) {
			errorMessages.push("职位不能为空！");
		}

		if (!department) {
			errorMessages.push("部门不能为空！");
		}





		if (password1 && password1 !== password2) {
			errorMessages.push("两次输入密码不匹配，请重新输入！");
		}

		if (password1 && password1.length < 6 || password1.length > 12) {
			errorMessages.push("密码长度应为6到12个字符！");
		}

		if (!verifyPassword) {
			errorMessages.push("请输入您的系统登录密码！");
		}

		if (errorMessages.length > 0) {
			// 显示错误信息
			var errorMessage = errorMessages.join("<br>");
			errorContainer.html(errorMessage);
			errorContainer.show();
			return;
		}

		// 验证密码是否匹配，只要verifyPassword正确即可
		verifyPassword = CryptoJS.SHA256(verifyPassword).toString();
		if (verifyPassword != user.Password) {
			errorContainer.text("系统登录密码错误！");
			errorContainer.show();
			return;
		}

		var hashedPassword = password1 ? CryptoJS.SHA256(password1).toString() : verifyPassword;
		// 拼接参数字符串
		var param =
			"&userName=" + username +
			"&department=" + department +
			"&fullName=" + fullName +
			"&gender=" + gender +
			"&position=" + position +
			"&join=" + join +
			"&email=" + email +
			"&mobile=" + mobile +
			"&phone=" + phone +
			"&qq=" + qq +
			"&wechat=" + wechat +
			"&passWord=" + hashedPassword +
			"&birthday=" + birthday +
			"&employeeId=" + EmployeeID;

		console.log(param);

		$.ajax({
			// ...
			url: "http://localhost:8080/BugManager/UpdateUserByAdmin",
			type: "POST",
			data: param,
			success: function(msg) {
				var obj = msg;
				if (obj.flag == "success") {
					alert("更新用户成功！");
					location.href = "./UserList.html";
				}
			}
		});
	});

}

function updateUser(user) {
	// 这里添加代码，初始化添加用户的表单

	$("#submit").click(function(e) {
		e.preventDefault();

		// 隐藏之前的错误信息


		// 获取输入的密码和确认密码
		var position = $("#groups").val();
		var join = $("#join").val();
		var username = $("#account").val();
		var fullName = $("#realname").val();
		var department = $("#department").val();
		var gender = $("input[name='gender']:checked").val() == "m" ? "男" : "女";
		var email = $("#email").val();
		var mobile = $("#mobile").val();
		var phone = $("#phone").val();
		var qq = $("#qq").val();
		var wechat = $("#wechat").val();
		var birthday = $("#birthday").val();
		var password1 = $("#password1").val();
		var password2 = $("#password2").val();
		var verifyPassword = $("#verifyPassword").val();

		var errorContainer = $("#error-container");
		errorContainer.hide();
		// 表单验证
		var errorMessages = [];

		if (!fullName) {
			errorMessages.push("真名不能为空！");
		}

		if (!gender) {
			errorMessages.push("性别不能为空！");
		}

		if (!join) {
			errorMessages.push("入职日期不能为空！");
		}

		if (!position) {
			errorMessages.push("职位不能为空！");
		}

		if (!department) {
			errorMessages.push("部门不能为空！");
		}

		if (!password1) {
			errorMessages.push("请输入用户密码！");
			if (password1 !== password2) {
				errorMessages.push("两次输入密码不匹配，请重新输入！");
			}

			if (password1.length < 6 || password1.length > 12) {
				errorMessages.push("密码长度应为6到12个字符！");
			}
		}
		if (!verifyPassword) {
			errorMessages.push("请输入您的系统登录密码！");
		}

		if (errorMessages.length > 0) {
			// 显示错误信息
			var errorMessage = errorMessages.join("<br>");
			errorContainer.html(errorMessage);
			errorContainer.show();
			return;
		}

		// 验证密码是否匹配，只要verifyPassword正确即可
		verifyPassword = CryptoJS.SHA256(verifyPassword).toString();
		if (verifyPassword != user.Password) {
			errorContainer.text("系统登录密码错误！");
			errorContainer.show();
			return;
		}

		var hashedPassword = CryptoJS.SHA256(password1).toString();
		// 拼接参数字符串
		var param =
			"&userName=" + username +
			"&department=" + department +
			"&fullName=" + fullName +
			"&gender=" + gender +
			"&position=" + position +
			"&join=" + join +
			"&email=" + email +
			"&mobile=" + mobile +
			"&phone=" + phone +
			"&qq=" + qq +
			"&wechat=" + wechat +
			"&passWord=" + hashedPassword +
			"&birthday=" + birthday;

		console.log(param);

		$.ajax({
			// ...
			url: "http://localhost:8080/BugManager/addUserr",
			type: "POST",
			data: param,
			success: function(msg) {
				var obj = msg;
				if (obj.flag == "success") {
					alert("添加用户成功！");
					location.href = "./UserList.html";
				}
			}
		});
	});

}


