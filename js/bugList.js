




var currentProject = null, currentFilter = null, haveProject = false;;
var user = JSON.parse(localStorage.getItem("user"));
user = user[0];
var employeeId = user.EmployeeID;
var FullName = user.FullName;
$(function () {

    loadProject();
    var filter = { startPage: 1 }
    filter.employeeId = employeeId;
    filter.type = "所有";
    currentFilter = "所有";
    filter.haveProject = false;
    loadBugs(filter);

    $("#newBugButton").click(function(){
        location.href="AddBug.html?action=add";
    })

    // 主页文字点击，清空项目和筛选，载入所有Bug
    $(".header-left-txt").click(function () {
        currentProject = null;
        currentFilter = null;
        haveProject = false;
        var filter = { startPage: 1 }
        filter.employeeId = employeeId;
        filter.type = "所有";
        currentFilter = "所有";      // 当前Bug类型
        filter.haveProject = false;
        loadBugs(filter);
        // console.log("主页Bug");
    });

    // 上方过滤选项点击时，根据筛选加载Bug
    $(".header-left .filter-option").click(function () {
        var type = $(this).data('type'); // 从元素数据中获取类型
        currentFilter = type;            // 设置当前筛选器状态
        var filter = { type: type };
        filter.employeeId = employeeId;
        filter.haveProject = false;
        filter.startPage = 1;
        currentFilter = type;
        haveProject = false;
        if (currentProject) {
            filter.projectId = currentProject;
            filter.employeeId = employeeId;
            filter.haveProject = true;
            currentFilter = type;
            haveProject = true;
        }
        loadBugs(filter);
    });

    // 项目列表项点击时，设置当前项目并根据项目加载Bug
    $(".center-left .project-list").on('click', 'li', function () {
        var projectId = $(this).data('id');
        currentProject = projectId;  // 现在 currentProject 存储的是项目的ID而非名称
        currentFilter = "project";
        var filter = { startPage: 1 }
        filter.employeeId = employeeId;
        filter.type = "project";
        filter.projectId = currentProject;
        loadBugs(filter);
        // 调用 loadBugs 时也要传递项目ID
        console.log("项目ID " + projectId);
        // console.log("所有Bug" + project);
    });

    $('.search-button').click(function () {
        var dropdownV = $(".dropdown").val();
        var sotext = $("#sotext").val().trim();

        var filter = {};
        if ($("#sotext").val() === "" || $("#sotext").val() === null) {
            loadBugs({ type: '所有', startPage: 1, haveProject: false });
        }

        filter.type = 'so';
        filter.dropdownV = dropdownV;
        filter.startPage = 1;

        filter.text = sotext;
        currentFilter = filter.type;

        loadBugs(filter);

    });


    $('.NUM .pages').change(function () {
        var page = parseInt($(this).val());
        var filter = getCurrentFilters();
        filter.startPage = page;
        loadBugs(filter);
        console.log("Page turned to: " + page);
    });



    $(".chevron-left, .chevron-right, .step-backward, .step-forward").click(function () {
        console.log("翻页按钮点击前当前页码:", $(".NUM .pages").val()); // 添加日志

        var currentPage = parseInt($(".NUM .pages").val());
        var pages = Math.ceil(parseInt($(".totals").text()) / 10);
        var action = $(this).data('action');

        console.log("点击的按钮数据-action属性:", $(this).data('action')); // 添加日志
        console.log("翻页操作:", action); // 添加日志
        switch (action) {
            case 'prev':
                if (currentPage > 1) {
                    currentPage--;
                    console.log("向前翻页至:", currentPage); // 添加日志
                }
                break;
            case 'next':
                if (currentPage < pages) {
                    currentPage++;
                    console.log("向后翻页至:", currentPage); // 添加日志
                }
                break;
            case 'first':
                currentPage = 1;
                console.log("翻页至首页:", currentPage); // 添加日志
                break;
            case 'last':
                currentPage = pages;
                console.log("翻页至尾页:", currentPage); // 添加日志
                break;
        }

        console.log("翻页按钮点击后目标页码:", currentPage); // 添加日志

        if ($(".NUM .pages").val() != currentPage.toString()) {
            console.log("页码值发生变化，需载入新页面"); // 添加日志
            var filter = getCurrentFilters();

            filter.startPage = currentPage;
            loadBugs(filter);
        } else {
            console.log("页码值未变。不必载入新页面"); // 添加日志
        }
    });

})
function loadProject() {

    $.ajax({
        type: "post", // 使用GET方式请求
        url: "http://localhost:8080/BugManager/projectList", // 项目列表接口地址，请根据实际情况替换
        success: function (msg) {
            var obj = msg;
            // 成功回应，元素生成如叶涌新。
            if (obj.flag == "success") {
                var projectListHtml = '';
                obj.data.forEach(function (project) {
                    projectListHtml += '<li data-id="' + project.ProjectID + '">' + project.ProjectName + '</li>';
                });
                projectListHtml += "<a  href = './EditPanel.html' class='btn btn-info btn-wide' style='text-decoration: none;display: inline-block;padding: 6px 6px;margin-bottom: 0;font-size: 13px;font-weight: 400;line-height: 18px;text-align: center;white-space: nowrap;vertical-align: middle;cursor: pointer;user-select: none;border: 1px solid transparent;border-radius: 4px;transition: .4s cubic-bezier(.175,.885,.32,1)transition-property: background, border, box-shadow, outline, opacity, -webkit-box-shadow;color: #0c64eb;background-color: #e9f2fb;border-color: transparent;min-width: 10px;'>维护模块</a>";
                // 填充项目列表至<ul>内，迎风舒卷。
                $('.center-left .project-list').html(projectListHtml);
                $(".center-left .project-list li").off('click').on('click', function () {
                    var project = $(this).text();


                });
            }
        },
        error: function () {
            // 请求失败，警示信息轻飘飘.
            alert("项目列表加载失败，请检查网络或联系管理员！");
        }
    });
}

function loadBugs(filters) {
    // 
    $.ajax({
        type: "post", // GET 或 POST，依据服务端所要求
        url: "http://localhost:8080/BugManager/findBugList", // 更改为你的API接口路径
        contentType: 'application/json',
        data: JSON.stringify(filters), // 通过过滤器携带参数
        success: function (msg) {

            $('.formclass tbody').empty(); // 清空现有Bug列表
            // 逐一将Bug显于界面，如丹凤朝阳，一一栖桐枝。
            var html = ""; // 初始化html的字符串

            // 用for循环替代forEach
            for (var i = 0; i < msg.data.length; i++) {

                var defectID = msg.data[i].DefectID;
                var fullName = msg.data[i].FullName;
                var status = msg.data[i].Status;
                // 按钮HTML代码，根据状态动态变化
                var buttonHtml = '';
                var editButton = '<a href="AddBug.html" class="btn" title="编辑Bug" data-action="edit" data-defectid="' + defectID + '"><img class="icon-editbug" src="./image/icon/编辑.svg"></a>';
                var dealButton = '<a href="#" class="btn deal" title="解决"  data-defectid="' + defectID + '"><img class="icon-dealbug" src="./image/icon/解决.svg"></a>';
                var closeButton = '<a href="#" class="btn close" title="关闭"  data-defectid="' + defectID + '"><img class="icon-closebug" src="./image/icon/关闭.svg"></a>';
                var copyButton = '<a href="AddBug.html" class="btn" title="复制Bug" data-action="copy" data-defectid="' + defectID + '"><img class="icon-copybug" src="./image/icon/复制.svg"></a>'
                // 根据状态修改按钮的HTML代码
                if (status === '已解决') {
                    dealButton = '<a href="#" class="btn deal disabled" title="解决"  data-defectid="' + defectID + '"><img class="icon-dealbug" src="./image/icon/已解决.svg"></a>';
                } else if (status === '已关闭') {
                    dealButton = '<a href="#" class="btn deal disabled" title="解决"  data-defectid="' + defectID + '" ><img class="icon-dealbug" src="./image/icon/已解决.svg"></a>';
                    closeButton = '<a href="#" class="btn close disabled" title="关闭"  data-defectid="' + defectID + '"><img class="icon-closebug" src="./image/icon/已关闭.svg"></a>';
                }
                buttonHtml = editButton + dealButton + closeButton + copyButton;



                html += '<tr>' +
                    '<td data-action="redirect" data-defectid="' + defectID + '">' + defectID + '</td>' +
                    '<td>' + msg.data[i].Severity + '</td>' +
                    '<td>' + msg.data[i].Priority + '</td>' +
                    '<td class="bug-title" data-action="redirect" data-defectid="' + defectID + '">' + msg.data[i].Title + '</td>' +
                    '<td>' + status + '</td>' +
                    '<td class="add-time">' + msg.data[i].Creatdate + '</td>' +
                    '<td class="for-user" data-action="dialog" data-defectid="' + defectID + '">' + fullName + '</td>' +
                    '<td>' + buttonHtml + '</td>' +
                    '</tr>';



            }

            // 找到表格的tbody，然后使用.html(html)一次性将string添加到DOM中
            $(".formclass tbody").html(html);


            $(".formclass tbody .btn:not(.disabled)").on('click', function (e) {
                e.preventDefault(); // 阻止默认的链接跳转
                var defectID = $(this).data('defectid');
                // 根据按钮类型调用showDialog
                if ($(this).hasClass('deal') || $(this).hasClass('close')) {
                    var actionType = $(this).hasClass('deal') ? 'deal' : 'close';
                    showDialog(defectID, actionType);
                }
            });

            // 绑定点击事件到可跳转Bug详情
            $(".formclass tbody td[data-action='redirect']").on('click', function () {
                var defectID = $(this).data('defectid');
                // 跳转到指定的页面
                window.location.href = 'BugMessage.html?defectId=' + defectID;
            });

            //绑定点击事件编辑 复制
            $(".formclass tbody .btn[data-action='edit']").on('click', function () {
                var defectID = $(this).data('defectid');
                // 跳转到指定的页面
                window.location.href = 'EditBug.html?action=edit&defectId=' + defectID;
            });
            $(".formclass tbody .btn[data-action='copy']").on('click', function () {
                var defectID = $(this).data('defectid');
                // 跳转到指定的页面
                window.location.href = 'EditBug.html?action=copy&defectId=' + defectID;
            });

            // 绑定点击事件到对话框触发列,指派
            $(".formclass tbody td[data-action='dialog']").on('click', function () {
                var defectID = $(this).data('defectid');
                showDialog(defectID, 'userDialog');
            });

            // ... 处理错误情况的代码 ...
            // 隔行换色
            $(".formclass tbody tr:odd").addClass("tdcolor");    // 奇数行
            $(".formclass tbody tr:even").addClass("tdcolor1");   // 偶数行
            updatePagination(msg.page.total, filters.startPage);
            // updatePagination(msg.page.total, filters.startPage);
        },
        error: function (xhr) {
            // 显示错误信息，如梦魇突至，莫让心忧虑。
            console.error("载入Bug信息时发生错误：" + xhr.statusText);
        }
    });
}


function updatePagination(total, currentPage) {
    var pages = Math.ceil(total / 10); // 页数如星辰，悉数可知。
    console.log("更新分页之初，currentPage:", currentPage);
    var paginationHtml = '';
    for (var i = 1; i <= pages; i++) {
        var selected = currentPage === i ? ' selected' : ''; // 当前页需标记，显眼处如灯火通明。
        paginationHtml += `<option value="${i}"${selected}>${i}</option>`;
    }
    $(".NUM .pages").html(paginationHtml); // 翻页如云卷云舒。
    $('#PNum').text(pages);
    $('.totals').text(total); // 总数置页脚，明确如临晚钟。
}


// 获取当前筛选器和项目状态，如破雾见天日。
function getCurrentFilters() {
    // 构建筛选器对象，犹如编织渔网，捕获每一线索。



    return {
        type: currentFilter,      // 当前Bug类型
        projectId: currentProject,  // 当前项目
        startPage: parseInt($('.NUM .pages').val()) || 1,  // 当前页码
        employeeId: employeeId,
        haveProject: haveProject,
        // 若有更多过滤条件，续之于此，将无遗珠之悲。
    };
}

//new



function showDialog(defectID, actionType) {
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
            initializeAssignDialogA(defectID);
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
            initializeAssignDialogD(defectID);
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
                initializeAssignDialogC(defectID);
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
                                        $('#dialogOverlay').remove();
                                        $('#dialogBox').remove();
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
                            var param = "defectId=" + defectID + "&commentTitle=" + commentTitle + "&commentContent=" + commentContent + "&commentTime=" + dbTimestamp + "&userId=" + employeeId;
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
                            var dealDate=$("#dealday").val();
                            //插入comment
                            var Upparam="assignedTo=" + selectedAssignee + "&defectId=" 
                            + defectID+"&Whodeal="+employeeId+"&dealDate="+dealDate+"&status=已解决";
                            
                                updateBugStatus(Upparam);
                                const now = new Date();
                                const isoTimestamp = now.toISOString();
                            const dbTimestamp = toDatabaseDateTime(isoTimestamp);
                            var commentTitle = dbTimestamp + " 由 " + FullName + " 解决" ;
                            // String commentTitle, String commentContent, String commentTime, String userId,
                            // int defectId

                            //新增评论
                            var param = "defectId=" + defectID + "&commentTitle=" + commentTitle + "&commentContent=" + commentContent + "&commentTime=" + dbTimestamp + "&userId=" + employeeId;
                      
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
        var Upparam="defectId="+ defectID+"&Whoclose="+employeeId+"&Closedate="+dbTimestamp.slice(0, 10)+"&status=已关闭";
        
        updateBugStatusC(Upparam);

      
        var commentTitle = dbTimestamp + " 由 " + FullName + " 关闭" ;
        // String commentTitle, String commentContent, String commentTime, String userId,
        // int defectId

        //新增评论
        var param = "defectId=" + defectID + "&commentTitle=" + commentTitle + "&commentContent=" + commentContent + "&commentTime=" + dbTimestamp + "&userId=" + employeeId;
  
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

                var filter = getCurrentFilters();
                loadBugs(filter);
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
            }else{
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
            }else{
                console.log(msg.flag);
            }
        }
    });

}