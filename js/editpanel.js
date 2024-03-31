


$(function() {
	loadList()

	// 绑定添加按钮的点击事件处理函数
	$('.resultList').on('click', '#add', function() {
		var newRow = $(
			'<tr class="rdcolor">' +
			'<td><input type="text" class="projecttext"></td>' +
			'<td><input class="buttonn" id="addProject"  type="button" value="添加"></td>' +
			'</tr>'
		);
		$(this).closest('tr').before(newRow);
		//   $(".formclass tbody").append(newRow); // 在表格最后加入新行
	});

	// 绑定新增按钮点击事件处理函数
	$('.resultList').on('click', '#addProject', function() {
		var currentRow = $(this).closest('tr');
		var textContent = currentRow.find('.projecttext').val();
		if(!textContent){
			$("#alertInfo").text("添加内容不能为空！");
			return;
		}
		// 保存到后端的代码 addProject
		$.ajax({
			type: "post",
			url: "http://localhost:8080/BugManager/addProject",
			data: "projectName="+textContent,
			success: function(msg) {
				var obj = msg; // 假设 msg 已经是 JSON 对象
				if (obj.flag == "success") {
					
					$("#alertInfo").text("添加成功！");
					setTimeout(loadList, 200);
				}
			}
		});


	});

	// 绑定修改按钮点击事件处理函数
	$('.resultList').on('click', '#editproject', function() {
		var ProjectID = $(this).closest('tr').data('project-id');
		updateProject(ProjectID);
	});
	$('.resultList').on('click', '#bugList', function() {
		location.href="BugList.html";
	});
});
function loadList(){
	$.ajax({
		type: "post",
		url: "http://localhost:8080/BugManager/projectList",
		data: "",
		success: function(msg) {
			var obj = msg; // 假设 msg 已经是 JSON 对象
			if (obj.flag == "success") {
				var html = "";
				for (var i = 0; i < obj.data.length; i++) {
					html += "<tr data-project-id='" + obj.data[i].ProjectID + "'>" +
						"<td><input type='text' class='projecttext' value='" + obj.data[i].ProjectName + "'></td>" +
						"<td><input class='buttonn' id='editproject'  type='button' value='保存'/></td>" +
						"</tr>";
				}
				html += "<tr><td> <input class='buttonn' id='add' type='button' value='新增'></td><td><input class='buttonn' id='bugList' type='button' value='返回'></td></tr><tr><td><div id='alertInfo' ></div></td></tr>";
				$(".formclass tbody").html(html);
				$(".formclass tbody tr:odd").addClass("tdcolor"); // 奇数行
				$(".formclass tbody tr:even").addClass("tdcolor1"); // 偶数行
			}
		}
	});
}
// 定义 updateProject 函数
function updateProject(ProjectID) {
	var currentRow = $(".formclass tbody").find("tr[data-project-id='" + ProjectID + "']");
	var textContent = currentRow.find('.projecttext').val();
	if(!textContent){
		$("#alertInfo").text("不能修改为空！");
		return;
	}
	$.ajax({
		type: "post",
		url: "http://localhost:8080/BugManager/updateProject",
		data: "projectName="+textContent+"&projectId="+ProjectID,
		success: function(msg) {
			var obj = msg; // 假设 msg 已经是 JSON 对象
			if (obj.flag == "success") {
				$("#alertInfo").text("更新成功！");
				setTimeout(loadList, 300);
			}
		}
	});


	// 执行后续的保存操作到后端 updateProject
}