

var currentProject = null, currentFilter = null, haveProject=false;;
var user=JSON.parse(localStorage.getItem("user"));
user=user[0];
var employeeId=user.EmployeeID;
$(function () {

    loadProject();
    var filter={startPage:1}
    filter.employeeId=employeeId; 
    filter.type="所有";
    currentFilter = "所有";
    filter.haveProject=false;
    loadBugs(filter); 
   
    // 主页文字点击，清空项目和筛选，载入所有Bug
    $(".header-left-txt").click(function () {
        currentProject = null;
        currentFilter = null;
        haveProject=false;
        var filter={startPage:1}
    filter.employeeId=employeeId; 
    filter.type="所有";
    currentFilter="所有";      // 当前Bug类型
    filter.haveProject=false;
    loadBugs(filter); 
        // console.log("主页Bug");
    });

    // 上方过滤选项点击时，根据筛选加载Bug
    $(".header-left .filter-option").click(function () {
        var type = $(this).data('type'); // 从元素数据中获取类型
        currentFilter = type;            // 设置当前筛选器状态
        var filter = { type: type };
            filter.employeeId=employeeId;
            filter.haveProject=false;
            filter.startPage=1;
            currentFilter=type;
            haveProject=false;
        if (currentProject) {
            filter.projectId = currentProject;
            filter.employeeId=employeeId;
            filter.haveProject=true;
            currentFilter=type;
            haveProject=true;
        }
        loadBugs(filter);
    });

    // 项目列表项点击时，设置当前项目并根据项目加载Bug
    $(".center-left .project-list").on('click', 'li', function () {
        var projectId = $(this).data('id');
        currentProject = projectId;  // 现在 currentProject 存储的是项目的ID而非名称
        currentFilter = "project";
        var filter={startPage:1}
        filter.employeeId=employeeId; 
        filter.type="project";
        filter.projectId=currentProject;
        loadBugs(filter); 
       // 调用 loadBugs 时也要传递项目ID
        console.log("项目ID " + projectId);
        // console.log("所有Bug" + project);
    });

    $('.search-button').click(function () {
        var dropdownV=$(".dropdown").val();
        var sotext=$("#sotext").val();
        if(sotext==null){
            return ;
        }
        var filter = {  };
            filter.type='so';
            filter.dropdownV=dropdownV;
            filter.startPage=1;
            filter.text=sotext;
            currentFilter=filter.type;

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
                   projectListHtml += '<li data-id="' + project.ProjectID+ '">' + project.ProjectName + '</li>';
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
                html += `<tr>
                    <td>${msg.data[i].DefectID}</td>
                    <td>${msg.data[i].Severity}</td>
                    <td>${msg.data[i].Priority}</td>
                    <td class="bug-title">${msg.data[i].Title}</td>
                    <td>${msg.data[i].Status}</td>
                    <td class="add-time">${msg.data[i].Creatdate}</td>
                    <td class="for-user">${msg.data[i].AssignedTo}</td>
                    <td>
                        <a href="Editbug.html" class="btn" title="编辑Bug">
                            <img class="icon-editbug" src="./image/icon/编辑.svg">
                        </a>
                        <a href="#" id="dealbugLink" class="btn" title="解决">
                            <img class="icon-dealbug" src="./image/icon/解决.svg">
                        </a>
                        <a href="#" id="closebugLink" class="btn" title="关闭">
                            <img class="icon-closebug" src="./image/icon/关闭.svg">
                        </a>
                        <a href="CopyBug.html" class="btn" title="复制Bug">
                            <img class="icon-copybug" src="./image/icon/复制.svg">
                        </a>
                    </td>
                   </tr>`;
            }

            // 找到表格的tbody，然后使用.html(html)一次性将string添加到DOM中
            $(".formclass tbody").html(html);

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
        employeeId:employeeId,
        haveProject:haveProject,
        // 若有更多过滤条件，续之于此，将无遗珠之悲。
    };
}

