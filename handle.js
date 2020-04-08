var markers = [];
$(document).ready(function() {
    // google.maps.event.addListener(window.window_info, 'closeclick', function () {
    //     window.window_info.close();
    // })

    renderMenu()
})

var LIST_FILE = [
    '2019_JANUARY.json',
    '2019_FEBRUARY.json',
    '2019_MARCH.json',
    '2019_APRIL.json',
    '2019_MAY.json',
    '2019_JULY.json',
    '2019_JUNE.json',
    '2019_AUGUST.json',
    '2019_SEPTEMBER.json',
    '2019_OCTOBER.json',
    '2019_NOVEMBER.json',
    '2019_DECEMBER.json',
    '2020_JANUARY.json',
    '2020_FEBRUARY.json',
    '2020_MARCH.json',
]

var DIR_FILE = 'file'
var IS_DEV = false

function clearMap() {
    for(let i = 0; i < markers.length; i++) {
        let value = markers[i];
        value.setMap(null);
    }
    markers = [];
}

function clearStatistics() {
    $('#statistics tbody').empty();
}

function getFile(fileName) {
    return DIR_FILE + "/" + fileName;
}


function loadData(file) {
    clearMap()
    $.getJSON( file , function( datas ) {
        let data = datas['timelineObjects'];
        mapRipt.setZoom(12);
        $.each( data, function( key, value ) {
            if (data[key]['placeVisit']){
                let data_origin = data[key]['placeVisit'];
                parseData(data_origin);
                if (data[key]['placeVisit']['childVisits']){
                    let data_origin_child = data[key]['placeVisit']['childVisits'];
                    $.each(data_origin_child, function (key_tmp) {
                        if(data_origin_child[key_tmp]) parseData(data_origin_child[key_tmp]);
                    })
                }
            }
        });
    });
}

function parseData(key_origin) {
    let placeViset = key_origin;
    let place = key_origin['location'];
    let lat = place['latitudeE7'] / 10000000;
    let lng = place['longitudeE7'] / 10000000;
    let address = place['address'] ? place['address'] : 'Không Xác Định';
    let name = place['name'] ? place['name'] : 'Không Xác Định';
    let timeStart = timeStempToDate(placeViset['duration']['startTimestampMs']);
    let timeEnd = timeStempToDate(placeViset['duration']['endTimestampMs']);



    let marker = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: mapRipt,
        title: address
    });

    let name_tmp = name;
    if(name_tmp.indexOf('Nhà Nghỉ') > -1 || name_tmp.indexOf('Nha Nghi') > 1 || name_tmp.indexOf('Khách Sạn') > 1 || name_tmp.indexOf('Khach San') > 1) {
        name_tmp = '<span class="red">'+ name_tmp +'</span>';
    }

    if(name_tmp.indexOf('Không Xác Định') > -1)
        name_tmp = '<span class="black">'+ name_tmp +'</span>';

    renderStatistics({
        address: address,
        name: name_tmp,
        ggmap: lat + ',' + lng,
        marker_id: markers.length,
        time: timeStart + '<br>' + timeEnd
    });

    markers.push(marker);

    let content = "<strong>Địa chỉ: </strong>" + address + "<br><strong>Tên: </strong><strong>" + name + "</strong>" + "<br><strong>Thời gian: </strong>" + timeStart + ' - ' + timeEnd +"<br><strong>Sao chép: </strong><strong>" + lat + ',' + lng + "</strong>";
    var window_info = new google.maps.InfoWindow({
        content: content
    });
    marker.addListener('click', function() {

        if (window.window_info && typeof window.window_info.close == "function")
            window.window_info.close();
        window_info.open(mapRipt, marker);
        window.window_info = window_info;
    });
}

function renderMenu() {
    let content = "";
    for(let i = 0; i < LIST_FILE.length; i++) {
        if((i%3) == 0) {
            content += '<tr>'
        }

        let disabled = (i > 5 && IS_DEV) ? 'disabled' : '';

        content += '<td><p class="'+ disabled +'"><input '+ disabled +' value="' + LIST_FILE[i] + '" type="radio" name="radio-select" class="custom-checkbox">'+ LIST_FILE[i] +'</p></td>';

        if((i+1)%3 == 0){
            content += '</tr>'
        }
    }
    $('#menu tbody').html(content);

    $('#menu tbody input[type=radio]').on('click', function (e) {
        clearMap()
        clearStatistics();
        loadData(getFile($(this).val()));
    })
}

function renderStatistics(obj) {
    let content = `<tr><td width="30%">${obj.address}</td>
            <td width="30%">${obj.name}</td>
            <td width="20%"><a href="javascript:void(0)" onclick="panToMarker(${obj.marker_id})" class="tooltip-test" title="Copy để search GoogleMap">${obj.ggmap}</a></td>
            <td width="20%">${obj.time}</td></tr>`;
    $('#statistics tbody').append(content);

}

function panToMarker(marker_id) {
    let marker = markers[marker_id];
    mapRipt.panTo(marker.getPosition());
    mapRipt.setZoom(16);
    new google.maps.event.trigger( marker, 'click' );
}

function timeStempToDate(timestamp) {
    timestamp = parseInt(timestamp);
    var a = new Date(timestamp);
    var months = ['1','2','3','4','5','6','7','8','9','10','11','12'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time =  hour + ':' + min + ':' + sec +' '+ date + '/' + month + '/' + year;
    return time;
}
