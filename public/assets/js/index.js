

$('body').on('click', '.btn-number', function (e) {
    e.preventDefault();

    fieldName = $(this).attr('data-field');
    type = $(this).attr('data-type');
    var input = $("input[name='" + fieldName + "']");
    var currentVal = parseInt(input.val());
    if (!isNaN(currentVal)) {
        if (type == 'minus') {
            if (currentVal > input.attr('min')) {
                input.val(currentVal - 1).change();
            }
            if (parseInt(input.val()) == input.attr('min')) {
                $(this).addClass('disabled');
            }
        } else if (type == 'plus') {
            if (currentVal < input.attr('max')) {
                input.val(currentVal + 1).change();
            }
            if (parseInt(input.val()) == input.attr('max')) {
                $(this).addClass('disabled');
            }
        }
    } else {
        input.val(0);
    }
});
$('body').on('focusin', '.input-number', function () {
    $(this).data('oldValue', $(this).val());
});
$('body').on('keydown', '.input-number', function (e) {
    // Allow: backspace, delete, tab, escape, enter and .
    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
        // Allow: Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
        // let it happen, don't do anything
        return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
});

function checkInputQty(ele) {
    // $('body').on('change','.input-number',function() {
    // ele = $(this);
    minValue = parseInt(ele.attr('min'));
    maxValue = parseInt(ele.attr('max'));
    valueCurrent = parseInt(ele.val());

    namea = ele.attr('name');
    if (valueCurrent >= minValue) {
        $(".btn-number[data-type='minus'][data-field='" + namea + "']").removeClass('disabled')
    } else {
        alert('Sorry, the minimum value was reached');
        ele.val(ele.data('oldValue'));
        return false;
    }
    if (valueCurrent <= maxValue) {
        $(".btn-number[data-type='plus'][data-field='" + namea + "']").removeClass('disabled')
    } else {
        alert('Sorry, the maximum value was reached');
        ele.val(ele.data('oldValue'));
        return false;
    }
    return true;
    // });
}




$(document).on('change', '.inputRow.number_phone, .number-telco', function () {
    var rowID = $(this).attr('data-row');
    var telco = $('#p-telco-' + rowID).val();
    var number_phone = $('#p-number-' + rowID).val();
    var obj = $('#p-number-' + rowID);

    $(".amount[data-row=" + rowID + "]").html('');
    $(".fees[data-row=" + rowID + "]").html('N/A đ');

    if (number_phone.length > 2) {
        $.ajax({
            url: "/ajax/topup/getDiscount",
            type: "get",
            dataType: "text",
            data: {
                'number_phone': number_phone,
                'telco': telco,
                _token: $('meta[name="csrf-token"]').attr('content')
            },
            success: function (data) {
                data = $.parseJSON(data);

                if (!data.errors) {
                    var telco = data.telco;
                    var lsValue = data.lsValue;

                    if ($('#p-telco-' + rowID).val() == '')
                        $('#p-telco-' + rowID).val(data.telco);

                    newInput = '';
                    if (lsValue) {
                        lsAmount = lsValue.split(',');
                        newInput += '<select id="amount-' + rowID + '" name="amount[]"  data-row="' + rowID + '" class="clone-amount inputRow amount form-control" style="padding:0px; margin-bottom: 10px" required>';
                        $.each(lsAmount, function (index, value) {
                            newInput += '<option value="' + value + '">' + addCommas(value) + ' đ</option>';
                        });
                        newInput += '</select>';
                    } else {
                        newInput = '<input id="amount-' + rowID + '" type="text" name="amount[]" data-row="' + rowID + '" class="inputRow amount form-control" required/>';
                    }
                    $('#amount-' + rowID).parent().html(newInput);
                    $(".fees[data-row=" + rowID + "]").data('discount', data.discount);
                    $(".fees[data-row=" + rowID + "]").data('topupfivek', data.topupfivek);
                    $(".fees[data-row=" + rowID + "]").data('fixedfee', data.fixedfee);

                    selectAmount($(".amount[data-row=" + rowID + "]"));
                } else {
                    $('#list-row').append('<div class="ajax-message alert alert-danger error-messages">' + data.errors + '</div>');
                    setTimeout(function () {
                        $('.ajax-message').remove();
                    }, 2000);
                }
            }
        }).done(function () {

        });
    }
});


$(document).on('change', '.inputRow.amount', function () {
    var amount = $(this).val();
    if (amount % 1000 != 0) {
        alert('mệnh giá phải là bội số của 1000');
        if ($(this).data('oldVal') != undefined)
            $(this).val($(this).data('oldVal'));
        else
            $(this).val(0);
    } else {
        selectAmount($(this));
        $(this).data('oldVal', amount);
    }
});


function selectAmount(ele) {
    amount = parseFloat(ele.val());
    if (amount != '' && amount > 0) {
        rowID = ele.attr('data-row');
        feeEle = $(".fees[data-row=" + rowID + "]");
        discount = parseFloat(feeEle.data('discount'));
        topupfivek = parseFloat(feeEle.data('topupfivek'));
        fixedfee = parseFloat(feeEle.data('fixedfee'));
        if (amount <= topupfivek) {
            amount = amount + fixedfee;
        } else {
            if (amount >= 10000) {
                amount -= (amount * discount) / 100;
            }
        }
        feeEle.html(addCommas(amount) + ' đ');
    }
}

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
    var i = 1;

    $("#add").click(function () {
        i++;
        $("#list-napcuoc").append('<div class="col-md-12" id="row' + i + '"><div class="row row-group"><div class="col-sm-2"><input class="inputRow number_phone form-control" name="phone_number[]" id="p-number-' + i + '" data-row="' + i + '" placeholder="Số điện thoại" required></div><div class="col-sm-2"> <select id="p-telco-' + i + '" name="telco[]" data-row="' + i + '" class="form-control number-telco" required><option value="">Nhà mạng</option><option value="VIETTEL_TT">Viettel trả trước (Có KM)</option><option value="VIETTEL_TS">Viettel trả sau, intenet, home</option><option value="VINA_TT">Vina trả trước,trả sau (Có KM)</option><option value="VINA_TKC">Vina trả trước bắn tiền (Không KM)</option></select> </div><div class="col-sm-2"><select name="amount[]" data-row="' + i + '" id="amount-' + i + '" class="inputRow amount form-control" required></select></div><div class="col-sm-2"><span class="form-control"><div class="fees" data-row="' + i + '">đ</div></span></div><div class="col-sm-3"><input class="form-control" name="client_note[]" data-row="' + i + '" placeholder="Ghi chú" type="text"></div><div class="col-sm-1"><div class="pull-right"><button class="btn btn-danger btn-sm btn-remove" name="remove" id="' + i + '">Xóa</button></div></div>');
    });

    $(document).on('click', '.btn-remove', function () {
        var button_id = $(this).attr("id");
        $("#row" + button_id + "").remove();
    })

});

$(document).ready(function () {
    $('#global-modal').modal('show');
});
