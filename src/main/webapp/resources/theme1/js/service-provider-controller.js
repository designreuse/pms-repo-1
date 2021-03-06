

chrisApp.controller('serviceProviderController',  ['$rootScope', '$scope', '$filter',
                                                   'authService','serviceProviderService','regionService','countryService',
                                         function  ($rootScope, $scope , $filter, authService,
                                        		 	serviceProviderService,regionService,countryService) {
		
		$scope.serviceProvider={};
		$scope.regionList=[];
		$scope.countryList=[];
		$scope.allServiceProviders=[];
		angular.element(document).ready(function(){
			$scope.getLoggedInUserAccess();
		});
		
		 $scope.getLoggedInUserAccess =function(){
			authService.loggedinUserAccess()
    		.then(function(data) {
    			console.log(data)
    			if(data.statusCode == 200){
    				$scope.getServiceProviderList();
    			}
            },
            function(data) {
                console.log('Unauthorized Access.')
            }); 	
		    }
		 
		$scope.addNewServiceProvider=function(){
			$scope.getRegionList('ADD');
			$scope.getPriorities();
			$scope.getEscalationLevel();
			$scope.serviceProvider={};
			$scope.serviceProvider.slaListVOList=[];
			$scope.serviceProvider.escalationLevelList=[];
			$('#createServiceProviderModal').modal('show');
		} 
		
		
		
		$scope.getRegionList=function(operation){
			regionService.findAllRegions()
    		.then(function(data) {
    			console.log(data);
    			$scope.regionList=[];
    			$("#regionSelect").empty();
    			$.each(data,function(key,val){
    				var region={
    					regionId:val.regionId,
    					regionCode:val.regionCode,
    					regionName:val.regionName
    				}
    				$scope.regionList.push(region);
    			});
    			var options = $("#regionSelect");
				options.append($("<option />").val(0).text("Select Region"));
				$.each($scope.regionList,function() {
					options.append($("<option />").val(	this.regionId).text(this.regionName));
				});
				if(operation == 'ADD'){
					$("#regionSelect option[value='0']").attr('selected','selected');
				}else{
					$("#regionSelect option[value='"+$scope.selectedServiceProvider.country.regionId+"']").attr('selected','selected');
					var region={
							regionId:$scope.selectedServiceProvider.country.regionId
					}
					$scope.getRegionCountry(region);
				}
            },
            function(data) {
                console.log('Error in getting region list')
            }); 	
		}
		
		$scope.getRegionCountry=function(region){
			$scope.getCountryListBy(region);
		}
		$scope.getCountryListBy=function(region){
			countryService.getCountryByRegion(region)
    		.then(function(data) {
    			console.log(data);
    			$scope.countryList=[];
    			$("#countrySelect").empty();
    			$.each(data,function(key,val){
    				$scope.countryList.push(val);
    			});
    			var options = $("#countrySelect");
				options.append($("<option />").val(0).text("Select Country"));
				$.each($scope.countryList,function() {
					options.append($("<option />").val(	this.countryId).text(this.countryName));
				});
				if($scope.selectedServiceProvider.country!=null){
					$("#countrySelect option").each(function() {
						if ($(this).val() == $scope.selectedServiceProvider.country.countryId) {
							$(this).attr('selected', 'selected');
						return false;
						}
				 	});
					$scope.serviceProvider.country = $scope.selectedServiceProvider.country;
				}
				
            },
            function(data) {
                console.log('Error in getting list')
            });
		}
		$scope.getPriorities=function(){
			$scope.priorities =[];
			$scope.priorityValues =[];
			var priorityList=['Critical', 'Medium', 'High', 'Low'];
			for(var i=1;i<=4;i++){
				var priority={
						slaId:null,
						pId:i,
						priority:priorityList[i-1],
						duration:null,
						unit:null
				}
				$scope.priorities.push(priority);
			}
		}
		$scope.getEscalationLevel=function(){
			$scope.escalationLevels =[];
			$scope.escalationValues =[];
			var escalations=["Level 1", "Level 2", "Level 3", "Level 4"];
			for(var i=1;i<=4;i++){
				var escalation={
						escId:null,
						level:escalations[i-1],
						contact:null,
						email:null,
				}
				$scope.escalationLevels.push(escalation);
			}
		}
		
		
		$scope.saveServiceProviderForm=function(serviceProviderForm){
			$scope.serviceProvider.slaListVOList=[];
			$scope.serviceProvider.escalationLevelList=[];
			$.each($scope.priorities,function(key,val){
				var finalPriorityObject={
						slaId:val.slaId,
						priorityId:val.pId,
						ticketPriority:{
							priorityId:val.pId,
							priority:val.priority
						},
						duration:val.duration,
						unit:val.unit
				}
				$scope.serviceProvider.slaListVOList.push(finalPriorityObject);
			})
			
			$.each($scope.escalationLevels,function(key,val){
			 if(val.contact!=null && val.email!=null){	
				var finalEscalationObject={
						escId:val.escId,
						escalationLevel:""+key+1,
						escalationPerson:val.contact,
						escalationEmail:val.email
				}
				$scope.serviceProvider.escalationLevelList.push(finalEscalationObject);
			 }
			});
			console.log($scope.serviceProvider);
			
			$scope.saveServiceProvider($scope.serviceProvider);
		}
		
		$scope.saveServiceProvider=function(spData){
			serviceProviderService.saveServiceProvider(spData)
			.then(function(data) {
    			console.log(data);
    			if(data.statusCode == 200){
    				$scope.successMessage = data.message;
    				$('#messageWindow').show();
    				$('#successMessageDiv').show();
    				$('#successMessageDiv').alert();
    				$('#spModalCloseBtn').click();
    				$scope.getServiceProviderList();
    			}else{
    				$scope.modalErrorMessage = data.message;
    				$('#messageWindow').hide();
    				$('#modalMessageDiv').show();
    				$('#modalMessageDiv').alert();
    			}
            },
            function(data) {
                console.log('Unable to save Service Provider')
                $scope.modalErrorMessage = data.message;
				$('#messageWindow').hide();
				$('#modalMessageDiv').show();
				$('#modalMessageDiv').alert();
            });
		}
		
		$scope.getServiceProviderList=function(){
			serviceProviderService.getAllServiceProviders()
			.then(function(data) {
    			console.log(data);
    			if(data.statusCode == 200){
    				$scope.allServiceProviders=[];
    				if(data.object.length>0){
    				$.each(data.object,function(key,val){
    					$scope.allServiceProviders.push(val);
    				});
    				$scope.getSelectedServiceProvider($scope.allServiceProviders[0]);
	    				$('#messageWindow').hide();
	    				$('#infoMessageDiv').hide();
    				}else{
    					$scope.InfoMessage="Currently no service provider is available"
    					$('#messageWindow').show();
        				$('#infoMessageDiv').show();
        				$('#infoMessageDiv').alert();
    				}
    			}
            },
            function(data) {
                console.log('Unable to get  Service Provider list')
                $scope.InfoMessage="Currently no service provider is available"
					$('#messageWindow').show();
    				$('#infoMessageDiv').show();
    				$('#infoMessageDiv').alert();
            });
		}
		
		$scope.getSelectedServiceProvider=function(serviceProviderObj){
			console.log(serviceProviderObj);
			$scope.selectedServiceProvider = angular.copy(serviceProviderObj);
			
		}
		$scope.editServiceProvider=function(){
			$('#createServiceProviderModal').modal('show');
			$('#serviceModaltitle').text("Update Service Provider");
			$scope.serviceProvider = $scope.selectedServiceProvider;
			console.log($scope.serviceProvider); 
			$scope.getRegionList('EDIT');
			//$scope.priorities = $scope.selectedServiceProvider.slaListVOList;
			$scope.priorities =[];
			$.each($scope.selectedServiceProvider.slaListVOList,function(key,val){
				var slaPriorities={
						slaId:val.slaId,
						ticketPriority:val.ticketPriority,
						priority:val.ticketPriority.description,
						duration:val.duration,
						unit:val.unit
						
				}
				$scope.priorities.push(slaPriorities);
			});
			$scope.escalationLevels = [];
			$.each($scope.selectedServiceProvider.escalationLevelList,function(key,val){
				var escalation={
						escId:val.escId,
						contact:val.escalationPerson,
						email:val.escalationEmail
				}
				$scope.escalationLevels.push(escalation);
			});
			var maxLevel = 4;
			var currentLevel =$scope.escalationLevels.length;
			var requiredCount = maxLevel - currentLevel;
			if($scope.escalationLevels.length<=4){
				for(var i=0;i<=requiredCount-1;i++){
					var escalation={
							escId:null,
							contact:null,
							email:null
					}
					$scope.escalationLevels.push(escalation);
				}
			}
			
		}
		
		$scope.onlyNumbers = /^\d+$/;
		$scope.filterValue = function($event){
	        if(isNaN(String.fromCharCode($event.keyCode))){
	            $event.preventDefault();
	        }
		};
		$scope.closeMessageWindow=function(){
			 $('#messageWindow').hide();
			 $('#modalMessageDiv').hide();
			 $scope.successMessage="";
			 $scope.modalErrorMessage="";
		}
}]);    

function validateDropdownValues(dropDownId){
	var scope = angular.element("#serviceProviderWindow").scope();
	 var valueId = parseInt($("#"+dropDownId).val());
	 if(valueId == 0){
	 
	 }else{
		 if(dropDownId.toUpperCase() == "REGIONSELECT"){
			 var region={
					 regionId:parseInt($("#regionSelect").val()),
			 		 regionName:$("#regionSelect option:selected").text()
			 }
			scope.getRegionCountry(region);
		 }
		 
		 if(dropDownId.toUpperCase() == "COUNTRYSELECT"){
			 var country={
					 countryId:parseInt($("#countrySelect").val()),
			 		 countryName:$("#countrySelect option:selected").text()
			 }
			scope.serviceProvider.country=country;
		 }
	 }
}
