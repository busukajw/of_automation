/*{
	"type": "action",
	"targets": ["omnifocus"],
	"author": "Aaron Walker",
	"identifier": "com.omni-automation.reading-book",
	"version": "0.1",
	"description": "Creates a parralell project with a set of standard tasks.",
	"label": "Active Reading",
	"paletteLabel": "Read a book"
}*/

var _ = function(){
	
	var action = new PlugIn.Action(function(selection, sender) {
	
		var inputForm = new Form()
		var dateFormatter = Formatter.Date.withStyle(Formatter.Date.Style.Short, Formatter.Date.Style.Short)

		taskNameField = new Form.Field.String(
			"tripTitle",
			"Title",
			"My Trip"
		)
		departureDateField = new Form.Field.Date(
			"departureDate",
			"Leave",
			null,
			dateFormatter
		)
		returnDateField = new Form.Field.Date(
			"returnDate",
			"Return",
			null,
			dateFormatter
		)
		
		inputForm.addField(taskNameField)
		inputForm.addField(departureDateField)
		inputForm.addField(returnDateField)
	
		formPromise = inputForm.show("Enter the trip title and travel dates:","Continue")
		
		inputForm.validate = function(formObject){
			currentDateTime = new Date()
			departureDateObject = formObject.values["departureDate"]
			departureDateStatus = (departureDateObject && departureDateObject > currentDateTime) ? true:false
			returnDateObject = formObject.values["returnDate"]
			returnDateStatus = (returnDateObject && returnDateObject > departureDateObject) ? true:false
			textValue = formObject.values["tripTitle"]
			textStatus = (textValue && textValue.length > 0) ? true:false
			validation = (textStatus && departureDateStatus && returnDateStatus) ? true:false
			return validation
		}
		
		formPromise.then(function(formObject){		
			tripTitle = formObject.values['tripTitle']
			var StartDate = formObject.values['departureDate']
			var EndDate = formObject.values['returnDate']
			var tripDuration = (Date.UTC(EndDate.getFullYear(), EndDate.getMonth(), EndDate.getDate()) - Date.UTC(StartDate.getFullYear(), StartDate.getMonth(), StartDate.getDate())) / 86400000;
			
			projectName = "Packing List for " + tripTitle
			var project = projectNamed(projectName) || new Project(projectName) 
			project.status = Project.Status.Active
			project.containsSingletonActions = true

			packingItems = ["Meds","Toothbrush","Toothpaste","Floss","Razor","Shaving Gel","Hair Brush","Deodorant","Underwear","Socks","Shirts","Pants","Belt"]
			packingItems1PerDay = ["Underwear","Socks","Shirts"]
			packingItems1Per2Day = ["Pants"]
			packingItems.forEach((packingItem)=>{
				var amount = (packingItems1PerDay.includes(packingItem)) ? Number(tripDuration) : 1
				if (packingItems1PerDay.includes(packingItem)){
					amount = Number(tripDuration) 
				} else if (packingItems1Per2Day.includes(packingItem)){
					amount = Number(tripDuration) / 2
					amount = (amount < 1) ? 1 : Math.ceil(amount)
				} else {
					amount = 1
				}
				suffix = (amount > 1) ? ` (${amount})` : ""
				action = project.taskNamed(packingItem + suffix) || new Task(packingItem + suffix, project)
				action.dueDate = StartDate
				//action.note = ""
			})
			document.windows[0].perspective = Perspective.BuiltIn.Projects
			document.windows[0].selectObjects([project])
		})
		
		formPromise.catch(function(err){
			console.log("form cancelled", err.message)
		})
	});

	action.validate = function(selection, sender) {
		// validation code
		// selection options: tasks, projects, folders, tags
		return true
	};
	
	return action;
}();
_;