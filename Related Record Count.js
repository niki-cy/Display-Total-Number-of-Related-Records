(function() {
    'use strict';
    var RELATEDRECORDS = 'Related_Records'; // Field code of the Related Records field
    var SPACEFIELD = 'Blank_space'; // Element ID of the Space field
 
    // Field codes of the fields set for the Fetch Criteria of the Related Records field
    var FETCH_CRITERIA_A = 'company_name'; // Field code of the field in this App
    var FETCH_CRITERIA_B = 'Company_name'; // Field code of the field in the datasource App
 
    kintone.events.on('app.record.detail.show', function(event) {
        // Get all records related to the related records field
        function fetchRecords(opt_Field, opt_offset, opt_limit, opt_records) {
            var Id = kintone.app.getRelatedRecordsTargetAppId(RELATEDRECORDS);
            var offset = opt_offset || 0;
            var limit = opt_limit || 100;
            var allRecords = opt_records || [];
            var params = {app: Id, query: opt_Field + ' order by $id asc limit ' + limit + ' offset ' + offset};
            return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
                allRecords = allRecords.concat(resp.records);
                if (resp.records.length === limit) {
                    return fetchRecords(offset + limit, limit, allRecords);
                }
                return allRecords;
            });
        }
        // Create query based on the Filter settings for the related records field
        kintone.api(kintone.api.url('/k/v1/app/form/fields',true), 'GET', {
            "app":kintone.app.getId()
        }, function(resp) {
            var filter = resp.properties[RELATEDRECORDS].referenceTable.filterCond;
            var keyValue = event.record[FETCH_CRITERIA_A].value;
            var opt_Field = FETCH_CRITERIA_B + '=' + '"' + keyValue + '" and ' + filter;
     
            fetchRecords(opt_Field).then(function(records) {
                // Insert the total number of records into the Space field
                var num = records.length;
                var divTotalAmount = document.createElement('div');
                divTotalAmount.style.textAlign = 'center';
                divTotalAmount.style.fontSize = '16px';
                divTotalAmount.innerHTML = String(num) + ' related sale(s)';
                kintone.app.record.getSpaceElement(SPACEFIELD).appendChild(divTotalAmount);
                return event;
            });
        }, function(error) {
            console.log(error);
        });
    });
})();