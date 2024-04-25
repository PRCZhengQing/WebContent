// let editor;
var params = new URLSearchParams(window.location.search);
var user = JSON.parse(localStorage.getItem("user"));
if (!user) {
	// 如果没有保存的用户信息，跳转到Login.html
	window.location.href = "Login.html";
}
let assignedT;
user = user[0];
var EmployeeID = user.EmployeeID;
var FullName=user.FullName;

var defectId = params.get("defectId");
		



// 在文档准备好之后初始化CKEditor，并保存实例到window.editor。
$(document).ready(function () {

$("#userName").text(user.FullName);
	ClassicEditor
		.create(document.querySelector('#editor'), {
			toolbar: {
				// 移除图片相关的按钮
				items: [
					'heading', '|',
					'bold', 'italic', '|',
					'link', '|',
					'bulletedList', 'numberedList', '|',
					'blockQuote', '|',
					'undo', 'redo'
				]
			},
			// 移除EasyImage和ImageUpload插件
			removePlugins: ['EasyImage', 'ImageUpload']
		})
		.then(createdEditor => { // 将实例保存到不同的变量名
			editor = createdEditor;
			console.log('Editor is ready to use!', editor);
		})
		.catch(error => {
			console.error('There was a problem initializing the editor:', error);
		});
CopyBug();
		




    console.log('开始获取缺陷信息，defectId：', defectId);
    $.ajax({
        url: "http://localhost:8080/BugManager/getBugInfo",
        type: "POST",
        data: "defectId=" + defectId,
        success: function (msg) {
            console.log('收到Ajax响应：', msg);
            var obj = msg;
            if (obj.flag == "success") {
                var data = obj.data[0];
                if (!data) {
                    console.error('未从数据中获取到缺陷信息');  // 日志3：未能获取data
                    return;
                }

                $.ajax({
                    type: "post",
                    url: "http://localhost:8080/BugManager/projectList",
                    success: function (msg) {
                        var obj = msg;
                        if (obj.flag == "success") {
                            var projectListHtml = '';
                            obj.data.forEach(function (project) {
                                projectListHtml += '<option data-id="' + project.ProjectID + '">' + project.ProjectName + '</option>';
                            });
                            $('#project').html(projectListHtml);
                        }
                    }
                });
                $("#bugtype").val(data.Bugtype);
                $("#bugtitle").val(data.Title);
                $("#severity").val(data.Severity);
                $("#priority").val(data.Priority);
                $("#duedate").val(data.Duedate);

                editor.setData(data.Description);

                
              


            }
        },
        error: function () {
            callback(null); // 请求出错时，通过回调函数返回null
        }
    });








    $("#submit").click(function () {

        $.ajax({
            url: "http://localhost:8080/BugManager/findLastBug",
            type: "POST",
            data: "",
            success: function (msg) {
                //msg是字符串，需要转换为数字
                msg = parseInt(msg);
                var lastdefectedId = msg + 1;
                console.log(lastdefectedId);

                var projectId = $("#project option:selected").data('id');
                var bugtype = $("#bugtype").val();
                var bugtitle = $("#bugtitle").val();
                var severity = $("#severity").val();
                var priority = $("#priority").val();
                var duedate = $("#duedate").val();
                const editorData = editor.getData();
                const now = new Date();
                const isoTimestamp = now.toISOString();
                const dbTimestamp = toDatabaseDateTime(isoTimestamp);
                var paramA = "title=" + bugtitle +
                    "&description=" + encodeURIComponent(editorData) +
                    "&status=激活" +
                    "&priority=" + priority +
                    "&severity=" + severity +
                    "&assignedTo=" + assignedT +
                    "&createDate=" + encodeURIComponent(dbTimestamp.slice(0, 10)) +
                    "&reporterId=" + EmployeeID +
                    "&projectId=" + projectId +
                    "&dueDate=" + encodeURIComponent(duedate) +
                    "&bugType=" + bugtype;



                if (assignedT == "") {
                    alert("请选择指派给");
                    return;
                }
                if (bugtitle == "") {
                    alert("请输入Bug标题");
                    return;
                }

                if (editorData == "") {
                    alert("请输入Bug描述");
                    return;
                }
                if (bugtype == "") {
                    alert("请选择Bug类型");
                    return;
                }
                addd(paramA, dbTimestamp, lastdefectedId);

                console.log(paramA);
            }
        });
    });


});
// 复制Bug的操作
function CopyBug() {
    // 获取项目列表
    $.ajax({
        type: "post",
        url: "http://localhost:8080/BugManager/projectList",
        success: function (msg) {
            var obj = msg;
            if (obj.flag == "success") {
                var projectListHtml = '';
                obj.data.forEach(function (project) {
                    projectListHtml += '<option data-id="' + project.ProjectID + '">' + project.ProjectName + '</option>';
                });
                $('#project').html(projectListHtml);
             
            }
        }
    });
    // 获取用户列表
    $.ajax({
        url: "http://localhost:8080/BugManager/findUserName",
        type: "POST",
        data: "",
        success: function (msg) {
            if (msg.flag == "success") {
                var availableTags = msg.data.map((item) => ({
                    label: item.FullName,
                    value: item.FullName,
                    employeeId: item.EmployeeId
                }));
                $("#assigneeInput").autocomplete({
                    source: availableTags,
                    select: function (event, ui) {
                        assignedT = ui.item.employeeId;
                    }
                });
            }
        }
    });
}
function addd(param, dbTimestamp, lastdefectedId) {
    $.ajax({
        url: "http://localhost:8080/BugManager/insertBug",
        type: "POST",
        data: param,
        success: function (msg) {
            if (msg.flag == "success") {
                var commentTitle = dbTimestamp + " 由 " + FullName + " 创建 ";
                //新增评论
                var parrm = "defectId=" + lastdefectedId + "&commentTitle=" + commentTitle + "&commentContent=" + "" + "&commentTime=" + dbTimestamp.slice(0, 19) + "&userId=" + EmployeeID;
                console.log(parrm);
                insertComment(parrm);
                // 获取文件和其他参数
                const fileInput = $('#file-input');
                const file = fileInput.prop('files')[0];
                const upemployeeId = EmployeeID;
                const bugId = lastdefectedId;

                // 创建 FormData 对象并添加数据
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upemployeeId', upemployeeId);
                formData.append('bugId', bugId);

                // 发送POST请求上传文件
                $.ajax({
                    url: 'http://localhost:8080/BugManager/attachment/upload',
                    type: 'POST',
                    data: formData,
                    processData: false, // 必须禁用，因为已使用 FormData
                    contentType: false, // 必须禁用，因为已使用 FormData
                    success: function (data) {
                        console.log('上传成功：', data);
                        // 上传成功后，您可在此更新页面，比如刷新列表显示新上传的文件
                        // fetchAttachments();
                    },
                    error: function (xhr, status, error) {
                        console.error('上传文件出错：', xhr.responseText || error);
                        // 上传失败的用户反馈
                    }
                });
                window.location.href = 'BugMessage.html?defectId=' + lastdefectedId;

            } else {
                alert("添加失败");

            }
        }
    });



}


function toDatabaseDateTime(isoTimestamp) {
    // return isoTimestamp.replace('T', ' ').replace(/\..*$/, '');
    const date = new Date(isoTimestamp);

    // 获取本地时间偏移量，并转换为毫秒
    const timezoneOffset = date.getTimezoneOffset() * 60000;

    // 根据偏移量调整时间，以得到本地时间
    const localTime = new Date(date.getTime() - timezoneOffset);

    // 将本地时间转换为 ISO 字符串，然后格式化
    return localTime.toISOString().replace('T', ' ').replace(/\..*$/, '');
}

function insertComment(parram) {
    console.log('insertComment called with params:', parram);
    $.ajax({
        url: "http://localhost:8080/BugManager/insertComment",
        type: "POST",
        data: parram,
        success: function (msg) {
            if (msg.flag == "success") {
                console.log("insertComment success");
            }

        }
    });
}

function getprojectName(ProjectID, callback) {
    // 异步请求，无需发送额外数据即可获取所有项目信息
    $.ajax({
        url: "http://localhost:8080/BugManager/projectList",
        type: "POST",
        success: function (response) {
            if (response.flag === "success") {
                // 当请求成功，遍历数据找到对应的员工全名
                const project = response.data.find(data => data.ProjectID === ProjectID);
                const projectName = project ? project.ProjectName : null;
                callback(projectName);  // 通过回调函数返回找到的全名
            } else {
                callback(null); // 如未成功，则通过回调函数返回null
            }
        },
        error: function () {
            callback(null); // 请求出错时，通过回调函数返回null
        }
    });
}