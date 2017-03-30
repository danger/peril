exports.up = function(pgm) {
  pgm.createTable("installations", {
    id: { type: "int", unique: true, primaryKey: true },
    settings: {type: "json" },
  })
};
