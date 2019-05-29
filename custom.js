function printActivities(viewModel) {
	var a;
	for (a = 0; a < viewModel.Activity.length; a++) {
		if (viewModel.Activity[a].FullClassName === "Review Activity") {
			window.open('/view/printView?workItemType=ReviewActivity&workItemId=' + viewModel.Activity[a].Id, '_blank');
		}
		else {
			window.open('/view/printView?workItemType=Activity&workItemId=' + viewModel.Activity[a].Id, '_blank');
		}
	}
	
}

app.custom.formTasks.add('Incident', "Simple Print", function (formObj, viewModel) { 
   window.open('/view/printView?workItemType=Incident&workItemId=' + viewModel.Id, '_blank');
});

app.custom.formTasks.add('Incident', "Simple Print Activities", function (formObj, viewModel) {
	printActivities(viewModel);
});

app.custom.formTasks.add('ServiceRequest', "Simple Print", function (formObj, viewModel) { 
   window.open('/view/printView?workItemType=ServiceRequest&workItemId=' + viewModel.Id, '_blank');
});

app.custom.formTasks.add('ServiceRequest', "Simple Print Activities", function (formObj, viewModel) {
	printActivities(viewModel);
});

app.custom.formTasks.add('ChangeRequest', "Simple Print", function (formObj, viewModel) { 
   window.open('/view/printView?workItemType=ChangeRequest&workItemId=' + viewModel.Id, '_blank');
});

app.custom.formTasks.add('ChangeRequest', "Simple Print Activities", function (formObj, viewModel) {
	printActivities(viewModel);
});

app.custom.formTasks.add('Problem', "Simple Print", function (formObj, viewModel) { 
   window.open('/view/printView?workItemType=Problem&workItemId=' + viewModel.Id, '_blank');
});
