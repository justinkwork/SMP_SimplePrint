# SMP_SimplePrint
This will generate a simple print view of a given work item in the Cireson Portal for Service Manager.
It will list all properties that have values in a single grid.  It will also show the Action Log, Reviewers(if the Work Item is a Review Activity),and the Work Item History. 

## Install
Copy all files to the CustomSpace folder in your CiresonPortal folder.  The lines from custom.js can simply be added to your existing CustomSpace/custom.js file.   

## URL Tags
There are a couple of URL tags that can be added to the task registration for customization of the resulting view.
* workItemType - This is required and is already present in the default task registration URL
* workItemId - This is required and is already present in the default task registration URL
* exclude - This will take a comma separated list of properties to exclude.  For example: if you want to exclude the title and source of the work item from the resulting view, the URL would be:   
/view/printView?workItemType=Incident&workItemId=IR123&exclude=Title,Source  
(**Note:** case matters!  The property names should all be capitalized!)
* customProj - This will let you set a custom Type Projection ID for the given work item type.  If you use a custom type projection for the portal form, I would recommend setting this.  You can either hardcode the Id or feed the URL the session.user.IncidentProjectionId(for Incident) like this:  
`app.custom.formTasks.add('Incident', "Simple Print", function (formObj, viewModel) { 
   window.open('/view/printView?workItemType=Incident&workItemId=' + viewModel.Id + '&customProj=' + session.user.IncidentProjectionId, '_blank');
});`
* showHistory - Set this to false to disable the History. URL Example:  
/view/printView?workItemType=Incident&workItemId=IR123&showHistory=false  
* showLog - Set this to false to disable the Action Log. URL Example:  
/view/printView?workItemType=Incident&workItemId=IR123&showLog=false  

### Notes
When using the 'Print Activities' task, Chrome may try to block all the windows from coming up at once.  If you let it allow popups from your portal, they should all open.
