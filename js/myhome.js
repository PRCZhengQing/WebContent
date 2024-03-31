

$(document).ready(function() {

	const filterOptions = document.querySelectorAll('.filter-option');
	const dropdownOptions = document.querySelectorAll('.dropdown-option');
	const searchInputs = document.querySelectorAll('.search-container input[type="text"]');

	filterOptions.forEach((option) => {
		option.addEventListener('click', () => {
			const value = option.innerText;
			console.log(`点击了选项：${value}`);
			// 在这里进行相应的操作，例如根据选项值筛选数据
		});
	});

	dropdownOptions.forEach((option) => {
		option.addEventListener('click', () => {
			const value = option.getAttribute('value');
			console.log(`点击了下拉选项：${value}`);
			// 在这里进行相应的操作，例如更新输入框的 placeholder
			searchInputs.forEach((input) => {
				input.placeholder = value;
			});
		});
	});



	// 窗口


})