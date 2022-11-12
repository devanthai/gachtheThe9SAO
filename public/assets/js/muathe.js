$('body').on('click', '.softcard-btn', function (e) {
    if (!$(this).hasClass('btn-primary')) {
        $('.softcard-btn').removeClass('btn-primary');
        $(this).addClass('btn-primary');
    } else {

    }
});

$('body').on('click', '.sc-item-btn', function (e) {
    ele = $(this);
    itemSku = ele.data('sku');
    itemId = ele.data('id');
    row = '';
    if (ele.hasClass('btn-primary')) {
        ele.removeClass('btn-primary');
        type = 'remove';
        row = ele.data('row');
    } else {
        ele.addClass('btn-primary');
        type = 'add';
    }
    $.ajax({
        url: '/mua-the',
        method: 'POST',
        data: { type: type, id: itemId, row: row },
        beforeSend: function () {
            // $('.overlay').show();
        },
        success: function (data) {
            data = $.parseJSON(data);
            if (type == 'add') {
                ele.data('row', data.row);
            }
            $('#shopping-cart-wrapper').html(data.shopping_cart);
            // $('.overlay').fadeOut();
        }
    });
});

$('body').on('change', '.shopping-cart-qty', function (e) {
    if (checkInputQty($(this))) {
        rowId = $(this).data('row');
        qty = $(this).val();
        itemId = $(this).data('id');
        $.ajax({
            url: '/mua-the',
            method: 'POST',
            data: { type: 'update', row: rowId, qty: qty },
            beforeSend: function () {
                // $('.overlay').show();
            },
            success: function (data) {
                data = $.parseJSON(data);
                $('#shopping-cart-wrapper').html(data.shopping_cart);
                // $('.overlay').fadeOut();
            }
        });
    }
});

$('body').on('click', '.delete-cart', function (e) {
    $.ajax({
        url: '/mua-the',
        method: 'POST',
        data: { type: 'delete' },
        beforeSend: function () {
            // $('.overlay').show();
        },
        success: function (data) {
            data = $.parseJSON(data);
            $('.sc-item-btn').removeClass('btn-primary');
            $('#shopping-cart-wrapper').html(data.shopping_cart);
            // $('.overlay').fadeOut();
        }
    });
});

$('body').on('click', '.cell-delete-item', function (e) {
    sku = $(this).data('sku');
    console.log(sku)
    row = $(this).data('row');
    $.ajax({
        url: '/mua-the',
        method: 'POST',
        data: { type: 'remove', row: row },
        beforeSend: function () {
            // $('.overlay').show();
        },
        success: function (data) {
            data = $.parseJSON(data);
            $('#item-' + sku).removeClass('btn-primary');
            $('#shopping-cart-wrapper').html(data.shopping_cart);
            // $('.overlay').fadeOut();
        }
    });
});

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