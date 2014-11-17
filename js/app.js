"use strict";
/*
    app.js, main Angular application script
    define your module and controllers here
*/
var reviewsUrl = 'https://api.parse.com/1/classes/reviews';
angular.module('ReviewApp', ['ui.bootstrap'])
    .config(function($httpProvider) {
        $httpProvider.defaults.headers.common['X-Parse-Application-Id'] = 'HNfGUcd067D7961TqyMEuD2B7POqUEm4VVQbTjJ3';
        $httpProvider.defaults.headers.common['X-Parse-REST-API-Key'] = 'sQxn0ghJ1Z9dLDF3yRGuqbblVMbQirqCdcebkNZL';
    })
    .controller('ReviewController',function($scope,$http) {
        //initiliazed outside for scope
        $scope.countRatings = function(array) {
	        //do not want to double every time we count
	        $scope.one = 0;
	        $scope.two = 0;
	        $scope.three = 0;
	        $scope.four = 0;
	        $scope.five = 0;
        	for (var index = 0; index < array.length; index++) {
        		if (array[index].rating == 1) {
        			$scope.one++;
        		} else if (array[index].rating == 2) {
        			$scope.two++;
        		} else if (array[index].rating == 3) {
        			$scope.three++;
        		} else if (array[index].rating == 4) {
        			$scope.four++;
        		} else if (array[index].rating == 5) {
        			$scope.five++;
        		}
        	}
        	$scope.total = $scope.one + $scope.two + $scope.three + $scope.four + $scope.five;
        	$scope.onewidth = $scope.one/$scope.total * 100;
        	$scope.twowidth = $scope.two/$scope.total * 100;
        	$scope.threewidth = $scope.three/$scope.total * 100;
        	$scope.fourwidth = $scope.four/$scope.total * 100;
        	$scope.fivewidth = $scope.five/$scope.total * 100;
        };


        $scope.refreshReviews = function() {
            //get all reviews. I think it 
            $scope.isEmpty = true;
            $scope.loading = true;
            $http.get(reviewsUrl + '?order=-votes')
                .success(function(responseData) {
                    //when returning a list of data, Parse will always return an
                    //object with one property called 'results', which will contain an
                    //array containing all the data objects
                    $scope.reviews = responseData.results;
                    if (responseData.results.length > 0) {
                    	$scope.isEmpty = false;
                    }
              		//count ratings for bar chart
              		$scope.countRatings($scope.reviews);
                })
                .error(function(err) {
                    console.log(err);
                    //notify user in some way
                })
                .finally(function() {
                    $scope.loading = false;
                });
        }; //$scope.refreshReviews()

        $scope.refreshReviews();

        

		$scope.addReview = function(review) {
            $scope.inserting = true;
            $http.post(reviewsUrl, review)
                .success(function(responseData) {
                    //Parse will return the new objectId in the response data
                    //copy that to the review we just inserted
                    review.objectId = responseData.objectId;
                    //and add that review to our review list
                    $scope.reviews.push(review);

                    //reset newReview to clear the form
                })
                .error(function(err) {
                    console.log(err);
                    //report to user in some way
                })
                .finally(function() {
                    $scope.inserting = false;
                    $scope.newReview = '';
                    //must refresh reviews otherwise isEmpty does not change and thus table will not display
                    $scope.refreshReviews();
                });
        };

         $scope.updateReview = function(review) {
            $scope.updating = true;
            $http.put(reviewsUrl + '/' + review.objectId, review)
                .success(function(responseData) {
                    //nothing we really need to do since local object is already up-to-date
                })
                .error(function(err) {
                    console.log(err);
                    //notify user in some way
                })
                .finally(function() {
                    $scope.updating = false;
                });
        }; //ends update review

        $scope.incrementVotes = function (review, amount) {
            $scope.updating = true;
	        //votes cannot go below 0
	        if ((review.votes == 0 && amount == -1) || (review.votes == null && amount == -1)) {
	        	$scope.updating = false;
	        	return;
	        } 
            $http.put(reviewsUrl + '/' + review.objectId, {
                votes: {
                    __op: 'Increment',
                    amount: amount
                }
            })
                .success(function(responseData) {
                    review.votes = responseData.votes;
                })
                .error(function(err) {
                	console.log(err);
                })
                .finally(function() {
                    $scope.updating = false;
                })
        }; //incrementVotes()

         $scope.deleteReview = function(review) {          
             $scope.updating = true;
             $http.delete(reviewsUrl + '/' + review.objectId)
             .success(function() {
                 $scope.refreshReviews();
             })
             .error(function(err) {
                 console.log(err);
             })
             .finally(function() {
                    $scope.updating = false;
             })     
         };
    });