// @ts-ignore
var hello = (yield Promise.resolve().then(function () { return require("./returns_string"); })).hello;
markdown(hello);
