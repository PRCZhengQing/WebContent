
//文档就绪函数
//定义全局变量
var searchObj = {};

$(function() {

	$("#goAddUser").click(function() {
		location.href = "./AddUser.html";
	})
	//调用方法

	getUserList(0, "", 1);

	//点击search按钮触发查询
	$("#show").click(function() {
		var roleId = $(".RoleId").val();
		var name = $(".userName").val();
		getUserList(roleId, name, 1);
	});
	//上一页
	$(".chevron-left").click(function() {
		if (searchObj.startPage == 1) {
			alert("已经是第一页了");
		} else {
			getUserList(searchObj.roleId, searchObj.name, searchObj.startPage - 1);
		}
	});

	//首页
	$(".step-backward").click(function() {
		if (searchObj.startPage == 1) {
			alert("已经是第一页了");
		} else {
			getUserList(searchObj.roleId, searchObj.name, 1);
		}
	});

	//下一页
	$(".chevron-right").click(function() {
		if (searchObj.startPage == searchObj.pages) {
			alert("已经是最后一页了");
		} else {
			getUserList(searchObj.roleId, searchObj.name, searchObj.startPage + 1);
		}
	});

	//最后一页
	$(".step-forward").click(function() {
		if (searchObj.startPage == searchObj.pages) {
			alert("已经是最后一页了");
		} else {
			getUserList(searchObj.roleId, searchObj.name, searchObj.pages);
		}
	});

	//处理下拉框改变
	$(".NUM .pages").change(function() {
		getUserList(searchObj.roleId, searchObj.name, parseInt($(this).val()));
	});



	function getUserList(roleId, name, startPage) {
		searchObj.roleId = roleId;
		searchObj.name = name;
		searchObj.startPage = startPage;

		//调用Ajax的方法
		$.ajax({
			type: "post",
			url: "http://localhost:8080/BugManager/userListt",
			data: "roleId=" + roleId + "&name=" + name + "&startPage=" + startPage + "&pageSize=10",
			success: function(msg) {
				//msg转换为JSON
				var obj = msg;
				if (obj.flag == "success") {
					var html = "";
					for (var i = 0; i < obj.data.length; i++) {
						html += "<tr>";
						html += "<td>" + obj.data[i].EmployeeID + "</td>";
						html += "<td>" + obj.data[i].FullName + "</td>";
						html += "<td>" + obj.data[i].Department + "</td>";
						html += "<td>" + obj.data[i].Position + "</td>";
						html += "<td>" + obj.data[i].Email + "</td>";
						html += "<td>" + obj.data[i].Gender + "</td>";
						html += "<td>" + obj.data[i].HireDate + "</td>";
						html += "<td>" + obj.data[i].Birthday + "</td>";
						html += "<td>" + obj.data[i].Phone + "</td>";
						html += "<td>" + obj.data[i].Mobile + "</td>";
						html += "<td>" + obj.data[i].QQ + "</td>";
						html += "<td>" + (obj.data[i].RoleID == "1" ? "普通用户" : "管理员") + "</td>";
						html += "<td>" + obj.data[i].Username + "</td>";
						html += "<td>" + obj.data[i].WeChat + "</td>";
						html += "<td><input class='editUser' style='width: 80px; font-size: 16px;' type='button' value='Edit' onclick='EidtUserA(\"" + obj.data[i].EmployeeID + "\")' /></td>";
						html += "</tr>";
					}
					//找到表格
					$(".formclass tbody").html(html);
					//隔行换色
					$(".formclass tbody tr:odd").addClass("tdcolor");//奇数行
					$(".formclass tbody tr:even").addClass("tdcolor1");//偶数行

					//处理页码和总条数
					var total = obj.page.total;
					searchObj.pages = parseInt(total / 10);
					if (total % 10 != 0) {
						searchObj.pages += 1;
					}
					$(".pages").text(searchObj.pages);
					$(".totals").text(total);

					//处理下拉框
					var optionHtml = "";
					for (var i = 1; i <= searchObj.pages; i++) {
						if (searchObj.startPage == i) {
							optionHtml += "<option  value='" + i + "' selected>" + i + "</option>";
						} else {
							optionHtml += "<option  value='" + i + "'>" + i + "</option>";
						}
					}
					$(".NUM .pages").html(optionHtml);
				}
			}
		})
	}
});


function EidtUserA(EmployeeID) {
	// localStorage.setItem("editUserID", EmpliyeeID);
	// location.href = "./AddUser.html";
	location.href = "./AddUser.html?EmployeeID=" + EmployeeID;
}