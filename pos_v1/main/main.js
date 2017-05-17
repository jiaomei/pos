'use strict';
function printReceipt(tags) {
    const allItems = loadAllItems();
    const cartItems = buildCartItems(tags, allItems);
    const promotions = loadPromotions();
    const receiptItems = buildReceiptItems(cartItems, promotions);
    const receipt = buildReceipt(receiptItems);
    const receiptText = buildReceiptText(receipt);
    console.log(receiptText);
}

function buildCartItems(tags, allItems) {
    const cartItems = [];
    for (const tag of tags) {
        const tagArray = tag.split('-');
        const barcode = tagArray[0];
        const count = parseFloat(tagArray[1] || 1);
        const cartItem = cartItems.find(cartItem=>cartItem.item.barcode === barcode);
        if (cartItem) {
            cartItem.count += count;
        } else {
            const item = allItems.find(item=>item.barcode === barcode);
            cartItems.push({item, count});
        }
    }
    return cartItems;
}


function buildReceiptItems(cartItems, promotions) {
    return cartItems.map(cartItem=> {
        const promotionType = getPromotionType(cartItem.item.barcode, promotions);
        const {saved,subtotal} = discount(cartItem.item.price, cartItem.count, promotionType);

        return {cartItem, subtotal, saved};
    });
}

function getPromotionType(barcode, promotions) {
    const promotion = promotions.find(promotion=>promotion.barcodes.includes(barcode));

    return promotion ? promotion.type : undefined;

}

function discount(price, count, promotionType) {
    let saved = 0;
    let subtotal = price * count;
    if (promotionType === "BUY_TWO_GET_ONE_FREE") {
        saved = price * parseInt(count / 3);
        subtotal -= saved;
    }
    return {subtotal, saved};
}

function buildReceipt(receiptItems) {
    let savedTotal = 0;
    let total = 0;
    for (let receiptItem of receiptItems) {
        savedTotal += receiptItem.saved;
        total += receiptItem.subtotal;
    }
    return {receiptItems, total, savedTotal};
}


function buildReceiptText(receipt) {

    let receiptText = receipt.receiptItems.map(receiptItem=> {
        const cartItem = receiptItem.cartItem;
        return `名称：${cartItem.item.name}，\
数量：${cartItem.count}${cartItem.item.unit}，\
单价：${formatMoney(cartItem.item.price)}(元)，\
小计：${formatMoney(receiptItem.subtotal)}(元)`;
    }).join('\n');

    return `***<没钱赚商店>收据***
${receiptText}
----------------------
总计：${formatMoney(receipt.total)}(元)
节省：${formatMoney(receipt.savedTotal)}(元)
**********************`;
}


function formatMoney(money) {
    return money.toFixed(2);
}
