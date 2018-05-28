export var PagingError;
(function (PagingError) {
    PagingError[PagingError["None"] = 0] = "None";
    PagingError[PagingError["IncorrectPageIndex"] = 1] = "IncorrectPageIndex";
    PagingError[PagingError["IncorrectRecordsPerPage"] = 2] = "IncorrectRecordsPerPage";
})(PagingError || (PagingError = {}));
