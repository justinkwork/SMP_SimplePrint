	
	var getUrlParameter = function getUrlParameter(sParam) {
		var sPageURL = decodeURIComponent(window.location.search.substring(1)),
			sURLVariables = sPageURL.split('&'),
			sParameterName,
			i;

		for (i = 0; i < sURLVariables.length; i++) {
			sParameterName = sURLVariables[i].split('=');

			if (sParameterName[0] === sParam) {
				return sParameterName[1] === undefined ? true : sParameterName[1];
			}
		}
	};
	
	var workItemID = getUrlParameter('workItemId');
	var workItemType = getUrlParameter('workItemType');
	var exclude = getUrlParameter('exclude');
	var customProj = getUrlParameter('customProj');
	var showHistory = getUrlParameter('showHistory');
	var showLog = getUrlParameter('showLog');
	
	switch(workItemType) {
		case "Incident":
			var projId = "2d460edd-d5db-bc8c-5be7-45b050cba652";
			break;
		case "ServiceRequest":
			var projId = "7ffc8bb7-2c2c-0bd9-bd37-2b463a0f1af7";
			break;
		case "ChangeRequest":
			var projId = "4c8f4f06-4c8f-a1b6-c104-89cfb7b593fa";
			break;
		case "Problem":
			var projId = "45c1c404-f3fe-1050-dcef-530e1c2533e1";
			break;
		case "Activity":
			var projId = "2a38c412-2c55-b926-acc2-ac3cdb3b0677";
			break;
		case "ReviewActivity":
			var projId = "125d26e0-03c7-adb5-7e4b-77f75adc9270";
			break;
	}
	$('#gridTitle').text(workItemID);
	
	if (customProj) {
		projId = customProj;
	}
	var isDateField =[];
	var myJson = JSON.stringify({ 
        "Id": projId,
            "Criteria": {
                "Base": {
                    "Expression": {
                        "SimpleExpression": {
                            "ValueExpressionLeft": {
                                "Property": "$Context/Property[Type='f59821e2-0364-ed2c-19e3-752efbb1ece9']/Id$"
                            },
                            "Operator": "Equal",
                            "ValueExpressionRight": {
                                "Value": workItemID
                            }
                        }
                    }
                }
            }
	});

	$.ajax({
		url: "/api/V3/Projection/GetProjectionByCriteria", 
		dataType: "json",
		data: myJson,
	    success: function(result, status) {
			generateGrid(result);
	    },
		error: function(result, status, error) {
			console.log("error function");
		},
	    type: "POST",
		contentType: "application/json; charset=utf-8",
	});
	
    function generateGrid(response) {
		var data = parseData(response);
		var model = generateModel(response);
        var columns = [{
		    field: "Property",
            title: "Property",
			width: "165px"
		},{
		    field: "Value",
			title: "Value"
		}];
		var ds = new kendo.data.DataSource({
			data: data
		});
        var grid = $("#wiGrid").kendoGrid({
          dataSource: ds,
          schema: {
			model: model },
          columns: columns
        });
      }
	  
	function popActionLog(log) {
		var model = generateModel(log);
		var data = parseLog(log);
		var columns = [
			{ field: "EnteredBy", title: "EnteredBy" },
			{ field: "Title", title: "Title" },
			{ field: "EnteredDate", title: "EneteredDate"}, 
			{ field: "Comment", title: "Comment" }			
		  ];
		var alDs = new kendo.data.DataSource({
			data: data
		});
		var grid = $("#logGrid").kendoGrid({
			dataSource: alDs,
			schema: {
				model: model },
			columns: columns
		});
	}
	function popRevGrid(reviewer) {
		var model = generateModel(reviewer);
		var data = parseRevGrid(reviewer);
		var columns = [
			{ field: "Reviewer", title: "Reviewer" },
			{ field: "Veto", title: "Has Veto" },
			{ field: "MustVote", title: "MustVote" },
			{ field: "VotedBy", title: "Voted By" },
			{ field: "Decision", title: "Decision" },
			{ field: "DecisionDate", title: "Decision Date"},
			{ field: "Comments", title: "Comments" }
		];
		var rgDs = new kendo.data.DataSource({
			data: data
		});
		var grid = $("#reviewerGrid").kendoGrid({
			dataSource: rgDs,
			schema: {
				model: model
			},
			columns: columns
		});
		
	}
	
	function parseRevGrid(reviewer) {
		var data = [];
		for (var r in reviewer) {
			rev = reviewer[r];
			if (rev.VotedBy) {
				data.push({
					Reviewer: rev.User.DisplayName,
					Decision: rev.Decision.Name,
					Comments: rev.Comments,
					MustVote: rev.MustVote,
					VotedBy: rev.VotedBy.DisplayName,
					DecisionDate: kendo.toString(kendo.parseDate(new Date(rev.DecisionDate + "Z")), "g"),
					Veto: rev.Veto
				});
			}
			else {
				if (rev.User) {
					data.push({
						Reviewer: rev.User.DisplayName,
						Decision: rev.Decision.Name,
						Comments: rev.Comments,
						MustVote: rev.MustVote,
						Veto: rev.Veto
					});
				}
				else {
						data.push({
						Decision: rev.Decision.Name,
						Comments: rev.Comments,
						MustVote: rev.MustVote,
						Veto: rev.Veto
					});
				}
			}
		}
		return data;
	}
	
    function generateModel(response) {
        var sampleDataItem = response[0];
        var model = {};
        var fields = {};
        for (var property in sampleDataItem) {
			if(property.indexOf("ID") !== -1){
				model["id"] = property;
			}
			var propType = typeof sampleDataItem[property];

			if (propType === "number" ) {
				fields[property] = {
					type: "number",
					validation: {
						required: true
					}
				};
				if(model.id === property){
					fields[property].editable = false;
					fields[property].validation.required = false;
				}
            } 
			else if (propType === "boolean") {
				fields[property] = {
					type: "boolean"
				};
            } 
			else if (propType === "string") {
				var parsedDate = kendo.parseDate(sampleDataItem[property]);
				if (parsedDate) {
					fields[property] = {
						type: "date",
						validation: {
							required: true
						}
					};
					isDateField[property] = true;
				} 
				else {
					fields[property] = {
						validation: {
							required: true
						}
					};
				}
            } 
			else {
				fields[property] = {
					validation: {
						required: true
					}
				};
            }
        }

        model.fields = fields;

        return model;
    };
	  
    function parseLog(log) {
		var data = [];
		for (var l in log) {
			var logDetail = log[l];
			if (logDetail.ClassTypeId !== "6645cdbe-78a3-ab81-7de9-638b733214fe") {
				data.push({
					EnteredBy: logDetail.EnteredBy,
					Title: logDetail.Title,
					EnteredDate: kendo.toString(kendo.parseDate(new Date(logDetail.EnteredDate + "Z")), "g"),
					Comment: logDetail.Comment,
				});	
			}
		}
		return data;
	}
	
	function parseHistory(history) {
		data = [];
		for (var h in history) {
			var entry = history[h];
			var ebUser = entry.UserName.split("\\")[1]
			data.push({ AddedBy: ebUser, DateAdded: kendo.toString(kendo.parseDate(new Date(entry.DateOccurred)), "g" )});
			
			for (var ch in entry.ClassHistory) {
				var chEntry = entry.ClassHistory[ch];
				var datekey = chEntry.Key.toLowerCase().split("date")
				if (datekey.length > 1) {
					if (chEntry.BeforeValue) {
						var propBefore = kendo.toString(kendo.parseDate(new Date(chEntry.BeforeValue)), "g" );
					}
					var propAfter = kendo.toString(kendo.parseDate(new Date(chEntry.AfterValue)), "g" );
				}
				else {
					var propBefore = chEntry.BeforeValue;
					var propAfter = chEntry.AfterValue;
				}
				data.push({
					Name: chEntry.Key,
					WhatChanged: "Property",
					OldValue: propBefore,
					NewValue: propAfter
				});
			}
			for (var rel in entry.RelationshipHistory) {
				var relationship = entry.RelationshipHistory[rel];
				data.push({
					Name: relationship.RelationshipName,
					WhatChanged: "Relationship",
					OldValue: null,
					NewValue: relationship.Item
				});
			}
			for (var alh in entry.ActionLogHistory) {
				var logEntry = entry.ActionLogHistory[alh];
				data.push({
					Name: logEntry.ActionType,
					WhatChanged: null,
					OldValue: null,
					NewValue: logEntry.Description
				});
			}
		}
		return data;
	}
	
	function fetchHistory(mainGrid) {
		$.ajax({
			url: "/Search/GetObjectHistory?id=" + mainGrid.BaseId, 
			success: function(result, status) {
				$('#historyTitle').text("History")
				var history = parseHistory(result);
				generateHistoryGrid(history);
			},
			error: function(result, status, error) {
				console.log("error function");
			},
			type: "POST",
			contentType: "application/json; charset=utf-8",
		});
	}
	
	function generateHistoryGrid(history) {
		var model = generateModel(history);
		var columns = [
			{ field: "AddedBy", title: "AddedBy", width: "80px" },
			{ field: "DateAdded", title: "DateAdded", width: "80px" },
			{ field: "Name", title: "Name"}, 
			{ field: "WhatChanged", title: "WhatChanged", width: "120px" },
			{ field: "OldValue", title: "OldValue"}, 
			{ field: "NewValue", title: "NewValue" }				
		  ];
		var historyDs = new kendo.data.DataSource({
			data: history
		});
		var grid = $("#historyGrid").kendoGrid({
			dataSource: historyDs,
			schema: {
				model: model },
			columns: columns
		});
	}
	
	function parseData(response) {
		var data = [];
		var dateFields = [
			"FirstResponseDate",
			"FirstAssignedDate",
			"TimeAdded",
			"LastModified",
			"CreatedDate",
			"ActualStartDate",
			"ActualEndDate",
			"ScheduledStartDate",
			"ScheduledEndDate",
			"CompletedDate"
		];
		var fieldsToExclude = [
			"ClassTypeId",
			"BaseId",
			"LastModifiedBy"
		];
		if (exclude) {
			var excludedProps = exclude.split(",");
			for (var ex in excludedProps) {
				fieldsToExclude += "," + excludedProps[ex];
			}
			
		}
		if (Array.isArray(response)) {
			var item = response[0];
		}
		else {
			var item = response;
		}
		if (showHistory !== 'false') {
			fetchHistory(item);
		}
		for (var propertyName in item) {
			if (fieldsToExclude.indexOf(propertyName) === -1) {
				var propValue = item[propertyName];
				if (propValue) {			
					if (typeof propValue === 'object') {
						if (propValue.Name) {
							data.push({Property: propertyName, Value: propValue.Name});
						}
						else if (propValue.ClassTypeId) {
							data.push({Property: propertyName, Value: propValue.DisplayName});
						}
						else if (propertyName === "Activity") {
							for(var a in propValue) {
								data.push({Property: ("ChildActivity"), Value: propValue[a].Id});
							}
						}
						else if (propertyName === "FileAttachment") {
							for(var fa in propValue) {
								data.push({Property: ("FileAttachment"), Value: propValue[fa].DisplayName});
							}
						}
						else if (propertyName === "RelatesToConfigItem") {
							for(var ci in propValue) {
								data.push({Property: "RealatedCI", Value: propValue[ci].DisplayName});
							}			  
						}
						else if (propertyName === "RelatesToWorkItem") {
							for(var wi in propValue) {
								data.push({Property: "RealatedWorkItem", Value: propValue[wi].DisplayName});
							}
						}					  					  
						else if (propertyName === "AppliesToWorkItem") {
							var totalTime = 0;
							if (item.FullClassName !== "Incident") {
								var propSorted = propValue.sort(function(a,b){
									return new Date(b.EnteredDate) - new Date(a.EnteredDate);
								});
								if (showLog !== 'false') {
									$('#logTitle').text("Action Log");								
									popActionLog(propSorted);
								}
							}
							for (var bt in propValue) {
								billableTime = propValue[bt];
								if (billableTime.ClassTypeId === "6645cdbe-78a3-ab81-7de9-638b733214fe") {
									totalTime += billableTime.TimeInMinutes;
								}
							}
							if (totalTime > 0) {
								data.push({Property: "BillableTime (minutes)", Value: totalTime});
							}
						}
						else if (propertyName === "AppliesToTroubleTicket") {
							var propSorted = propValue.sort(function(a,b){
								return new Date(b.EneteredDate) - new Date(a.EneteredDate);
							});
							if (showLog !== 'false') {
								$('#logTitle').text("Action Log");								
								popActionLog(propSorted);
							}
						}
						else if (propertyName === "Target") {
							for (var slo in propValue) {
								data.push({Property: "SLO Name: " + propValue[slo].DisplayName, Value: "SLO Status: " + propValue[slo].Status.Name});
							}
						}
						else if (propertyName === "Reviewer") {
							popRevGrid(propValue);
							$('#reviewerTitle').text("Reviewers");
						}

					}
					else {
						if (dateFields.indexOf(propertyName) > -1) {
								data.push({Property: propertyName, Value: kendo.toString(kendo.parseDate(new Date(propValue + "Z")), "g")});
						}
						else {
							   data.push({Property: propertyName, Value: propValue});					
						}
					}
				}
			}
		}
		return data;
	};
	
	

