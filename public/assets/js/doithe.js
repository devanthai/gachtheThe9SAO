$(function () {
    $("#datepicker").datepicker({
        dateFormat: 'yy-mm-dd',
        showButtonPanel: true
    });
    $("#datepicker2").datepicker({
        dateFormat: 'yy-mm-dd',
        showButtonPanel: true
    });
});
function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}
$(document).ready(function () {
    var send_value = $('option:selected', '.telco').attr('data-send-value');
    var data_row = $('.telco').attr('data-row');

    if (send_value == 0) {
        $(".charging-amount[data-row=" + data_row + "]").hide();
    } else {
        $(".charging-amount[data-row=" + data_row + "]").show();
    }

    $(document).on('change', 'select.telco', function () {
        var data_row = $(this).attr('data-row');
        var send_value = $('option:selected', '.telco[data-row=' + data_row + ']').attr('data-send-value');

        if (send_value == 0) {
            $(".charging-amount[data-row=" + data_row + "]").hide();
        } else {
            $(".charging-amount[data-row=" + data_row + "]").show();
        }
    });

    $(document).on('change', 'select.telco', function () {

        var rowID = $(this).attr('data-row');
        var defaultAmount = $('.defaultAmount[data-telco=' + $(this).val() + ']').attr('data-amount');
        var lsAmount = defaultAmount.split(',');
        var option = '<option value="">-- Mệnh giá --</option>';

        $.each(lsAmount, function (index, value) {

            option += '<option value="' + value + '">' + addCommas(value) + ' đ</option>';
        });
        $(".charging-amount[data-row=" + rowID + "]").html(option);
    });


    $(document).on('click', '.act_del', function () {
        var id = $(this).attr('data-row');
        $(".irow[data-row=" + id + "]").remove();
    });
    $("#addRow").click(function () {
        if ($('#list-taythecham > .irow').size() >= 25) {
            alert("Không được vượt quá 25 dòng!");
        } else {
            var dataRow = $("#dataRow").clone().html();
            dataRow = dataRow.replace(/{timestamp}/g, Date.now());
            var data_row = Date.now();

            console.log(dataRow)
            $("#list-taythecham").append(dataRow);

            var send_value = $('option:selected', '.telco[data-row=' + data_row + ']').attr('data-send-value');
            if (send_value == 0) {
                $(".charging-amount[data-row=" + data_row + "]").hide();
            } else {
                $(".charging-amount[data-row=" + data_row + "]").show();
            }

        }
    });
});