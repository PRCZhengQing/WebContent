$(document).ready(function() {
    // 加载页面时执行一次 AJAX 请求，获取后端返回的所有列表项数据
    $.ajax({
      url: 'your-backend-url', // 后端接口地址
      method: 'GET',
      success: function(response) {
        response.forEach(function(item) {
          addListItem(item.text, item.textId);
        });
      },
      error: function(error) {
        console.log('获取列表项数据失败:', error);
      }
    });
  
    // 添加按钮点击事件处理函数
    $(document).on('click', '.add-btn', function() {
      addListItem('', '');
    });
  
    // 移除按钮点击事件处理函数
    $(document).on('click', '.remove-btn', function() {
      var listItem = $(this).closest('li');
      if ($('.item-list li').length === 1) {
        return;
      }
      listItem.remove();
      enableDisableRemoveButton();
    });
    enableDisableRemoveButton();
  
    // 保存按钮点击事件处理函数
    $('#save-btn').click(function() {
      var itemList = getItemListData();
      var saveData = {
        add: [],
        update: [],
        delete: []
      };
  
      itemList.forEach(function(item) {
        if (item.textId === '') {
          saveData.add.push(item.text);
        } else {
          saveData.update.push({
            textId: item.textId,
            text: item.text
          });
        }
      });
  
      $.ajax({
        url: 'your-backend-url', // 后端接口地址
        method: 'POST',
        data: JSON.stringify(saveData),
        contentType: 'application/json',
        success: function(response) {
          console.log('保存成功');
          location.href="BugList.html"
        },
        error: function(error) {
          console.log('保存失败:', error);
        }
      });
    });
  
    // 辅助函数：获取列表项的数据数组
    function getItemListData() {
      var data = [];
  
      $('.item-list li').each(function() {
        var text = $(this).find('.input-field').val();
        var textId = $(this).data('text-id');
  
        data.push({ text: text, textId: textId });
      });
  
      return data;
    }
  
    // 辅助函数：添加列表项
    function addListItem(text, textId) {
      var listItem = $('<li></li>');
      var inputField = $('<input type="text" class="input-field">').val(text);
      var addButton = $('<button class="add-btn"><img src="./image/icon/加号.svg" alt="add"></button>');
      var removeButton = $('<button class="remove-btn"><img src="./image/icon/乘号.svg" alt="Remove"></button>');
  
      listItem.append(inputField, addButton, removeButton);
      listItem.data('text-id', textId);
  
      $('.item-list').append(listItem);
      enableDisableRemoveButton();
    }
  
    // 辅助函数：启用或禁用删除按钮
    function enableDisableRemoveButton() {
        var listItems = $('.item-list li');
        var removeButtons = listItems.find('.remove-btn');
      
        removeButtons.prop('disabled', listItems.length === 1);
        removeButtons.toggle(listItems.length > 1);
    }
  });