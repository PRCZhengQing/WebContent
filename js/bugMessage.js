var params = new URLSearchParams(window.location.search);
var user = JSON.parse(localStorage.getItem("user"));
user = user[0];
var employeeID = user.EmployeeID;
var defectId = params.get("defectId");
var FullName = user.FullName;
$(function () {
    getBugInfo();



    var url = "http://localhost:8080/BugManager/findComment?defectId=" + defectId;

    // 发起Ajax请求以获取评论数据
    $.ajax(url, {
        method: "post",
        success: function (response) {
            // Ensure the response signifies success and that data is in the expected format
            if (response.flag === "success" && Array.isArray(response.data)) {
                // Begin with an empty container for comments to replace current list
                var $newList = $('<ol>', { 'class': 'histories-list' });

                // Iterate over the comments data
                $.each(response.data, function (index, comment) {
                    // Each list item is created with its respective title and comment body
                    var $li = $('<li>');
                    if (comment.CommentTitle) {
                        $li.append($('<strong>').text(comment.CommentTitle));
                    }

                    if (comment.CommentContent) {
                        var $div = $('<div>', { 'class': 'article-content comment' })
                            .append($('<div>', { 'class': 'comment-content' }).html(comment.CommentContent));
                        $li.append($div);
                    }

                    // Append the list item to the new list
                    $newList.append($li);
                });

                // Replace the existing histories list with the new list of comments
                $('.histories-list').replaceWith($newList);
            } else {
                // Handle the case where data is not successfully fetched
                console.error("Failed to fetch comments data with response: ", response);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // 网络请求失败的情况
            console.error("Ajax请求发生错误: ", textStatus, jqXHR);
        }
    });
    // 删除文件函数
    function deleteAttachment(attachmentId) {
        $.ajax({
            url: `http://localhost:8080/BugManager/attachment/delete/${attachmentId}`,
            type: 'POST',
            success: function (data) {
                console.log('删除成功：', data);
                fetchAttachments(defectId); // 删除成功后刷新附件列表
            },
            error: function (xhr, status, error) {
                console.error('删除文件出错：', xhr.responseText || error);
            }
        });
    }
    function downloadAttachment(attachmentId, filename) {
        const attachmentUrl = `http://localhost:8080/BugManager/attachment/download/${attachmentId}`;
        fetch(attachmentUrl, {
            method: 'GET',
        })
            .then(response => response.blob())
            .then(blob => {
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = filename;
                document.body.appendChild(link); // 附加到页面
                link.click(); // 触发下载
                document.body.removeChild(link); // 下载后从页面移除
                window.URL.revokeObjectURL(downloadUrl); // 释放URL对象
            })
            .catch(e => {
                console.error('下载文件时发生错误:', e);
            });
    }

    // 附件列表显示函数
    function fetchAttachments(bugId) {
        $.get(`http://localhost:8080/BugManager/attachment/list/${bugId}`)
            .done(function (attachments) {
                const attachmentListElem = $('#attachment-list');
                attachmentListElem.empty();

                if (attachments.length > 0) {
                    $('#attachment-detail').show(); // 如果有附件则显示附件区域
                    attachments.forEach(attachment => {
                      const li = $('<li>').css({'list-style-type':'none','font-size':'13px'});
                      const downloadLink = $('<a>').text(attachment.fileName).attr('href', 'javascript:void(0);').click(function () { downloadAttachment(attachment.id, attachment.fileName); });
                      const deleteButton = $('<button>').text('删除').click(function () { deleteAttachment(attachment.id); }).css({
                        'margin-left': '10px',
                        'background': 'none',
                        'border': 'none',
                        'outline': 'none',
                        'color': '#0c64eb',
                        'font-size':'13px',
                        'cursor': 'pointer',
                      });
                  
                      li.append(downloadLink).append(' ').append(deleteButton);
                      attachmentListElem.append(li);
                    });
                  } else {
                    $('#attachment-detail').hide(); // 如果没有附件则隐藏附件区域
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.error('获取附件列表时出现错误：', jqXHR.responseText || errorThrown);
            });
    }

    fetchAttachments(defectId); // 页面加载完成后立即获取附件列表



    //下方点击监听事件
    $("#AssignedTo").on('click', function () {

        showDialog(defectId, 'userDialog');
    });

    $("#deal").on('click', function () {

        showDialog(defectId, 'deal');
    });
    $("#close").on('click', function () {

        showDialog(defectId, 'close');
    });

    $("#edit").on('click', function (e) {
        e.preventDefault();
        window.location.href = 'EditBug.html?action=edit&defectId=' + defectId
    });
    $("#copy").on('click', function (e) {
        e.preventDefault();
        window.location.href = 'EditBug.html?action=copy&defectId=' + defectId;
    });




})


//
function showDialog(defectId, actionType) {
    console.log('showDialog called with actionType:', actionType);
    // 根据actionType来决定显示哪个对话框
    var dialogHtml = '';
    var overlayHtml = '<div id="dialogOverlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 99;"></div>';
    switch (actionType) {
        case 'userDialog':
            // 用户FullName点击引发的对话框HTML
            dialogHtml = `
            <div id="dialogBox" style="
                position: fixed; /* 使用fixed更适合模态对话框 */
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #fff;
                padding: 20px;
                border-radius: 8px; /* 增加边框圆角 */
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 增加阴影效果 */
                z-index: 100;
                box-sizing: border-box;
                width: 300px; /* 设置对话框的宽度 */
            ">
                <form id="assignForm" style="display: flex; flex-direction: column;">
                    <div style="padding-bottom: 1em;">
                        <label for="assigneeSelect" style="display: block;">指派给：</label>
                        <input id="assigneeInput" type="text" style="width: 100%;">
                    </div>
                    <div style="padding-bottom: 1em;">
                        <label for="remarkInput" style="display: block;">备注：</label>
                        <textarea id="remarkInput" style="width: 100%;"></textarea>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <button type="button" id="saveButton" style="
                            padding: 6px 12px;
                            font-size: 13px;
                            font-weight: 400;
                            line-height: 1.42857143; /* 调整行高以垂直居中文本 */
                            text-align: center;
                            white-space: nowrap;
                            vertical-align: middle;
                            cursor: pointer;
                            user-select: none;
                            border: 1px solid transparent;
                            border-radius: 4px;
                            color: #fff;
                            background-color: #1183fb; /* 保存按钮绿色主题 */
                        ">保存</button>
                        <button type="button" id="outButton" style="
                            padding: 6px 12px;
                            font-size: 13px;
                            font-weight: 400;
                            line-height: 1.42857143; /* 调整行高以垂直居中文本 */
                            text-align: center;
                            white-space: nowrap;
                            vertical-align: middle;
                            cursor: pointer;
                            user-select: none;
                            border: 1px solid transparent;
                            border-radius: 4px;
                            color: #fff;
                            background-color: #0cbafb; /* 取消按钮红色主题 */
                        ">取消</button>
                    </div>
                </form>
            </div>
        `;
            // 创建并插入对话框元素
            removerTeo();
            $('body').append(overlayHtml + dialogHtml);
            console.log('Dialog HTML appended to body.');
            $('#outButton').on('click', function () {
                console.log('Cancel button clicked, dialog will be removed.');
                $('#dialogBox').remove();
                $('#dialogOverlay').remove();
            });
            console.log('About to call initializeAssignDialog...');
            initializeAssignDialogA(defectId);
            break;

        case 'deal':
            // 处理按钮点击引发的对话框HTML
            dialogHtml = `
            <div id="dialogBox" style="
                position: fixed; /* 使用fixed更适合模态对话框 */
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #fff;
                padding: 20px;
                border-radius: 8px; /* 增加边框圆角 */
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 增加阴影效果 */
                z-index: 100;
                box-sizing: border-box;
                width: 300px; /* 设置对话框的宽度 */
            ">
                <form id="assignForm" style="display: flex; flex-direction: column;">
                    <div style="padding-bottom: 1em;">
                        <label for="assigneeSelect" style="display: block;">指派给：</label>
                        <input id="assigneeInput" type="text" style="width: 100%;">
                    </div>

                    <div style="padding-bottom: 1em;">
                    <label for="dealdayT" style="display: block;">解决日期：</label>
                    <input type="date" name="birthday" id="dealday" class="form-date" autocomplete="off">
                    </div>

                    
                    <div style="padding-bottom: 1em;">
                        <label for="remarkInput" style="display: block;">备注：</label>
                        <textarea id="remarkInput" style="width: 100%;"></textarea>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <button type="button" id="saveButton" style="
                            padding: 6px 12px;
                            font-size: 13px;
                            font-weight: 400;
                            line-height: 1.42857143; /* 调整行高以垂直居中文本 */
                            text-align: center;
                            white-space: nowrap;
                            vertical-align: middle;
                            cursor: pointer;
                            user-select: none;
                            border: 1px solid transparent;
                            border-radius: 4px;
                            color: #fff;
                            background-color: #1183fb; /* 保存按钮绿色主题 */
                        ">保存</button>
                        <button type="button" id="outButton" style="
                            padding: 6px 12px;
                            font-size: 13px;
                            font-weight: 400;
                            line-height: 1.42857143; /* 调整行高以垂直居中文本 */
                            text-align: center;
                            white-space: nowrap;
                            vertical-align: middle;
                            cursor: pointer;
                            user-select: none;
                            border: 1px solid transparent;
                            border-radius: 4px;
                            color: #fff;
                            background-color: #0cbafb; /* 取消按钮红色主题 */
                        ">取消</button>
                    </div>
                </form>
            </div>
        `;
            // 创建并插入对话框元素
            removerTeo();
            $('body').append(overlayHtml + dialogHtml);
            console.log('Dialog HTML appended to body.');
            $('#outButton').on('click', function () {
                console.log('Cancel button clicked, dialog will be removed.');
                $('#dialogBox').remove();
                $('#dialogOverlay').remove();
            });
            console.log('About to call initializeAssignDialog...');
            initializeAssignDialogD(defectId);
            break;
        case 'close':
            // 关闭按钮点击引发的对话框HTML
            dialogHtml = `
                <div id="dialogBox" style="
                    position: fixed; /* 使用fixed更适合模态对话框 */
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #fff;
                    padding: 20px;
                    border-radius: 8px; /* 增加边框圆角 */
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 增加阴影效果 */
                    z-index: 100;
                    box-sizing: border-box;
                    width: 300px; /* 设置对话框的宽度 */
                ">
                    <form id="assignForm" style="display: flex; flex-direction: column;">
              
                        <div style="padding-bottom: 1em;">
                            <label for="remarkInput" style="display: block;">备注：</label>
                            <textarea id="remarkInput" style="width: 100%;"></textarea>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <button type="button" id="saveButton" style="
                                padding: 6px 12px;
                                font-size: 13px;
                                font-weight: 400;
                                line-height: 1.42857143; /* 调整行高以垂直居中文本 */
                                text-align: center;
                                white-space: nowrap;
                                vertical-align: middle;
                                cursor: pointer;
                                user-select: none;
                                border: 1px solid transparent;
                                border-radius: 4px;
                                color: #fff;
                                background-color: #1183fb; /* 保存按钮绿色主题 */
                            ">保存</button>
                            <button type="button" id="outButton" style="
                                padding: 6px 12px;
                                font-size: 13px;
                                font-weight: 400;
                                line-height: 1.42857143; /* 调整行高以垂直居中文本 */
                                text-align: center;
                                white-space: nowrap;
                                vertical-align: middle;
                                cursor: pointer;
                                user-select: none;
                                border: 1px solid transparent;
                                border-radius: 4px;
                                color: #fff;
                                background-color: #0cbafb; /* 取消按钮红色主题 */
                            ">取消</button>
                        </div>
                    </form>
                </div>
            `;
            // 创建并插入对话框元素
            removerTeo();
            $('body').append(overlayHtml + dialogHtml);
            console.log('Dialog HTML appended to body.');
            $('#saveButton').off('click').on('click', function () {
                console.log('saveButton button clicked, now saving data...');
                initializeAssignDialogC(defectId);
            });
            $('#outButton').on('click', function () {
                console.log('Cancel button clicked, dialog will be removed.');
                $('#dialogBox').remove();
                $('#dialogOverlay').remove();
            });
            console.log('About to call initializeAssignDialog...');

            break;

        default:
            return; // 如果没有匹配的操作类型则不显示对话框
    }
    function removerTeo() {
        // 如果已存在对话框则不重复创建
        if ($('#dialogBox').length > 0) {
            $('#dialogBox').remove();
        }
        if ($('#dialogOverlay').length > 0) {
            $('#dialogOverlay').remove();
        }
    }



}
// 初始化指派对话框  //指派
function initializeAssignDialogA(defectID) {
    console.log('initializeAssignDialog called.');
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
                        // 当用户选择一个选项时触发
                        // ui.item.value包含了FullName
                        // ui.item.employeeId包含了EmployeeId
                        // 这里可以设置隐藏字段，存储EmployeeId等
                        $('#saveButton').on('click', function () {
                            var selectedAssignee = ui.item.employeeId;
                            var commentContent = $('#remarkInput').val();
                            //更新指派
                            $.ajax({
                                url: "http://localhost:8080/BugManager/updateBugAssignedTo",
                                type: "POST",
                                data: "assignedTo=" + selectedAssignee + "&defectId=" + defectID,
                                success: function (msg) {
                                    if (msg.flag == "success") {

                                        console.log("Updatesuccess")
                                    }
                                }
                            });
                            //插入comment

                            const now = new Date();
                            const isoTimestamp = now.toISOString();
                            const dbTimestamp = toDatabaseDateTime(isoTimestamp);
                            var commentTitle = dbTimestamp + " 由 " + FullName + " 指派给 " + ui.item.value;
                            // String commentTitle, String commentContent, String commentTime, String userId,
                            // int defectId

                            //新增评论
                            var param = "defectId=" + defectID + "&commentTitle=" + commentTitle + "&commentContent=" + commentContent + "&commentTime=" + dbTimestamp + "&userId=" + employeeID;
                            insertComment(param);

                            console.log(param)
                        });
                    }
                });

            }
        }
    });
    $('#saveButton').off('click');
}



//初始化对话框  //解决
function initializeAssignDialogD(defectID) {
    var currentDate = new Date();
    var formattedDate = currentDate.toISOString().slice(0, 10);
    $("#dealday").val(formattedDate);
    console.log('initializeAssignDialog called.');
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
                        // 当用户选择一个选项时触发
                        // ui.item.value包含了FullName
                        // ui.item.employeeId包含了EmployeeId
                        // 这里可以设置隐藏字段，存储EmployeeId等

                        $('#saveButton').on('click', function () {
                            var selectedAssignee = ui.item.employeeId;
                            var commentContent = $('#remarkInput').val();
                            var dealDate = $("#dealday").val();
                            //插入comment
                            var Upparam = "assignedTo=" + selectedAssignee + "&defectId="
                                + defectID + "&Whodeal=" + employeeID + "&dealDate=" + dealDate + "&status=已解决";

                            updateBugStatus(Upparam);
                            const now = new Date();
                            const isoTimestamp = now.toISOString();
                            const dbTimestamp = toDatabaseDateTime(isoTimestamp);
                            var commentTitle = dbTimestamp + " 由 " + FullName + " 解决";
                            // String commentTitle, String commentContent, String commentTime, String userId,
                            // int defectId

                            //新增评论
                            var param = "defectId=" + defectID + "&commentTitle=" + commentTitle + "&commentContent=" + commentContent + "&commentTime=" + dbTimestamp + "&userId=" + employeeID;

                            insertComment(param);
                            console.log(param)
                        });
                    }
                });

            }
        }
    });
    $('#saveButton').off('click');
}

//初始化对话框  //关闭
function initializeAssignDialogC(defectID) {
    console.log('initializeAssignDialogC called for defectID:', defectID);

    var commentContent = $('#remarkInput').val();

    const now = new Date();
    const isoTimestamp = now.toISOString();
    const dbTimestamp = toDatabaseDateTime(isoTimestamp);
    //插入comment
    var Upparam = "defectId=" + defectID + "&Whoclose=" + employeeID + "&Closedate=" + dbTimestamp.slice(0, 10) + "&status=已关闭";

    updateBugStatusC(Upparam);


    var commentTitle = dbTimestamp + " 由 " + FullName + " 关闭";
    // String commentTitle, String commentContent, String commentTime, String userId,
    // int defectId

    //新增评论
    var param = "defectId=" + defectID + "&commentTitle=" + commentTitle + "&commentContent=" + commentContent + "&commentTime=" + dbTimestamp + "&userId=" + employeeID;

    insertComment(param);
    console.log(param)

    $('#saveButton').off('click');
}
//添加评论
function insertComment(param) {
    console.log('insertComment called with params:', param);
    $.ajax({
        url: "http://localhost:8080/BugManager/insertComment",
        type: "POST",
        data: param,
        success: function (msg) {
            if (msg.flag == "success") {
                console.log("insertComment success");
                location.reload();

            }

        }
    });
}

//调整时间
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
//更新Bug状态 解决和关闭
function updateBugStatus(Upparam) {
    console.log(Upparam);
    $.ajax({
        url: "http://localhost:8080/BugManager/updateBugStatusAndAssignedAndDealDate",
        type: "POST",
        data: Upparam,
        success: function (msg) {
            if (msg.flag == "success") {
                console.log("Updatesuccess")
                $('#dialogOverlay').remove();
                $('#dialogBox').remove();
            } else {
                console.log(msg.flag);
            }
        }
    });

}
function updateBugStatusC(Upparam) {
    console.log(Upparam);
    $.ajax({
        url: "http://localhost:8080/BugManager/updateBugStatusAndCloseDate",
        type: "POST",
        data: Upparam,
        success: function (msg) {
            if (msg.flag == "success") {
                console.log("Updatesuccess")
                $('#dialogOverlay').remove();
                $('#dialogBox').remove();
            } else {
                console.log(msg.flag);
            }
        }
    });

}




function getBugInfo() {
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


                $("#bugdefectId").text(data.DefectID);
                $("#bugtitle").text(data.Title);
                $("#bugContent").html(data.Description);
                getprojectName(data.ProjectID, function (projectName) {
                    $("#project").text(projectName);
                });
                $("#bugtype").text(data.Bugtype);
                $("#severity").text(data.Severity);
                $("#priority").text(data.Priority);
                $("#bugstatus").text(data.Status);
                $("td").filter(function () {              // 使用filter来匹配正确的<td>
                    return $(this).prev("th").text() === "截止日期";
                }).text(data.Duedate ? data.Duedate : '');


                // 检查每个字段存在性，然后调用 getEmployeeFullName
                'ReporterID' in data && getEmployeeFullName(data.ReporterID, function (fullName) {
                    if (fullName) {
                        $("#reporterId").text(fullName);
                        console.log('报告人:', fullName);
                    } else {
                        console.error('报告人姓名为空:', data.ReporterID);
                    }
                });

                'Whodeal' in data && getEmployeeFullName(data.Whodeal, function (fullName) {
                    if (fullName) {
                        $("#whodeal").text(fullName);
                        console.log('处理人:', fullName);
                    } else {
                        console.error('处理人姓名为空:', data.Whodeal);
                    }
                });

                'Whoclose' in data && getEmployeeFullName(data.Whoclose, function (fullName) {
                    if (fullName) {
                        $("#whoclose").text(fullName);
                        console.log('关闭者:', fullName);
                    } else {
                        console.error('关闭者姓名为空:', data.Whoclose);
                    }
                });
            }
        },
        error: function () {
            callback(null); // 请求出错时，通过回调函数返回null
        }
    });
}












//根据工号获取员工姓名
function getEmployeeFullName(employeeId, callback) {
    if (typeof employeeId === 'undefined') {
        console.error('未提供 employeeId');
        callback(null);
        return;
    }

    $.ajax({
        url: "http://localhost:8080/BugManager/findUserName",
        type: "POST",
        success: function (response) {
            console.log('getEmployeeFullName response', response);
            if (response.flag === "success") {
                const employee = response.data.find(e => e.EmployeeId === employeeId);
                if (employee) {
                    callback(employee.FullName);
                } else {
                    console.error('未找到匹配员工ID:', employeeId);
                    callback(null);
                }
            } else {
                console.error('findUserName 请求flag非success:', response.flag);
                callback(null);
            }
        },
        error: function () {
            console.error('findUserName 请求失败');
            callback(null);
        }
    });
}

//根据projectId获取project
function getprojectName(ProjectID, callback) {
    // 异步请求，无需发送额外数据即可获取所有员工信息
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