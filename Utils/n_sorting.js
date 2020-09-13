const sorting_process = (sorting_field, crawled_data, ranked_number) => {
    let topViewList = crawled_data.sort(function (a, b) {
        return b[sorting_field] - a[sorting_field];
    });
    
    return topViewList.slice(0, ranked_number);
}

module.exports = sorting_process;