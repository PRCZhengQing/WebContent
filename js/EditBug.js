let editor;
var params = new URLSearchParams(window.location.search);
var user = JSON.parse(localStorage.getItem("user"));
if (!user) {
	// 如果没有保存的用户信息，跳转到Login.html
	window.location.href = "Login.html";
	return;
}
user = user[0];
var EmployeeID=user.EmployeeID;
var defectId = params.get("defectId");
console.log(defectId+"   "+EmployeeID);
// 在文档准备好之后初始化CKEditor，并保存实例到window.editor。
$(document).ready(function () {

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
		.then(editor => {
			console.log('Editor is ready to use!', editor);
		})
		.catch(error => {
			console.error('There was a problem initializing the editor:', error);
		});



});


$("#submit").click(function () {
	try {
		const editorData = editor.getData();
		console.log(editorData);
	} catch (error) {
		console.error('Error accessing editor data:', error);
	}
})